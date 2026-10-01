const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { validateEmail, validatePassword, validateOtp } = require("../utils/validators");
const { generateMfaSecret, generateQrDataUrl, verifyTotpToken } = require("../utils/totp");

const SALT_ROUNDS = 12;
const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCK_MINUTES = 10;

function normalizeIp(ip) {
  return ip === "::1" ? "127.0.0.1" : ip;
}

async function register(req, res) {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (name.length < 2) {
      return res.status(400).json({ ok: false, message: "Name must be at least 2 characters." });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ ok: false, message: "Invalid email format." });
    }

    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ ok: false, message: "Password must be at least 8 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ ok: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const mfa = generateMfaSecret(email);
    const qrCodeDataURL = await generateQrDataUrl(mfa.otpauthUrl);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mfaEnabled: true,
      mfaSecret: mfa.base32,
    });

    return res.status(201).json({
      message: "User registered successfully. Scan QR in authenticator app.",
      qrCodeDataURL,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("[REGISTER]", error);
    return res.status(500).json({ ok: false, message: "Registration failed." });
  }
}

async function login(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const requestIp = normalizeIp(req.ip);

    if (!validateEmail(email) || !validatePassword(password)) {
      return res.status(400).json({ ok: false, message: "Invalid email or password format." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ ok: false, message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ ok: false, message: "Invalid credentials." });
    }

    let suspicious = false;
    if (user.lastLoginIp && user.lastLoginIp !== requestIp) {
      suspicious = true;
      user.suspiciousActivity.push({
        ip: requestIp,
        reason: `IP changed from ${user.lastLoginIp} to ${requestIp}`,
        detectedAt: new Date(),
      });
      await user.save();
      console.warn(`[SECURITY] Suspicious login for ${email} from ${requestIp}`);
    }

    return res.status(200).json({
      message: "MFA_REQUIRED",
      email: user.email,
      suspiciousActivity: suspicious,
    });
  } catch (error) {
    console.error("[LOGIN]", error);
    return res.status(500).json({ ok: false, message: "Login failed." });
  }
}

async function verifyOtp(req, res) {
  try {
    const otp = String(req.body.otp || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!validateOtp(otp)) {
      return res.status(400).json({ ok: false, message: "OTP must be a 6-digit code." });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ ok: false, message: "Valid email is required." });
    }

    const user = await User.findOne({ email }).select("+mfaSecret");
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found." });
    }

    // Block repeated OTP guesses for a short cooldown period.
    if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
      const retryAfterSeconds = Math.ceil((user.otpBlockedUntil.getTime() - Date.now()) / 1000);
      return res.status(429).json({
        ok: false,
        message: `Too many invalid OTP attempts. Retry in ${retryAfterSeconds}s.`,
      });
    }

    // Automatically clear stale lock state once cooldown has passed.
    if (user.otpBlockedUntil && user.otpBlockedUntil <= new Date()) {
      user.otpAttempts = 0;
      user.otpBlockedUntil = null;
    }

    const isValidOtp = verifyTotpToken(user.mfaSecret, otp);
    if (!isValidOtp) {
      user.otpAttempts += 1;

      if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
        user.otpBlockedUntil = new Date(Date.now() + OTP_LOCK_MINUTES * 60 * 1000);
        await user.save();
        return res.status(429).json({
          ok: false,
          message: `Too many invalid OTP attempts. Account locked for ${OTP_LOCK_MINUTES} minutes.`,
        });
      }

      await user.save();
      return res.status(401).json({ ok: false, message: "Invalid or expired OTP." });
    }

    const requestIp = normalizeIp(req.ip);
    user.lastLoginIp = requestIp;
    user.otpAttempts = 0;
    user.otpBlockedUntil = null;
    await user.save();

    const token = generateToken({
      userId: String(user._id),
      email: user.email,
      name: user.name,
    });

    return res.status(200).json({
      message: "MFA verification successful.",
      token,
    });
  } catch (error) {
    console.error("[VERIFY_OTP]", error);
    return res.status(500).json({ ok: false, message: "OTP verification failed." });
  }
}

async function socialLogin(req, res) {
  try {
    const provider = String(req.body.provider || "").trim().toLowerCase();
    const email = String(req.body.email || "").trim().toLowerCase();
    const name = String(req.body.name || "").trim();

    if (!["google", "facebook"].includes(provider)) {
      return res.status(400).json({ ok: false, message: "Provider must be google or facebook." });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ ok: false, message: "Valid email is required." });
    }

    if (name.length < 2) {
      return res.status(400).json({ ok: false, message: "Name must be at least 2 characters." });
    }

    let user = await User.findOne({ email });
    if (!user) {
      const mfa = generateMfaSecret(email);
      const randomPassword = crypto.randomBytes(24).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, SALT_ROUNDS);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        mfaEnabled: false,
        mfaSecret: mfa.base32,
      });
    }

    const token = generateToken({
      userId: String(user._id),
      email: user.email,
      name: user.name,
    });

    return res.status(200).json({
      ok: true,
      message: `${provider.toUpperCase()} login successful.`,
      token,
      data: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[SOCIAL_LOGIN]", error);
    return res.status(500).json({ ok: false, message: "Social login failed." });
  }
}

async function forgotPassword(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!validateEmail(email)) {
      return res.status(400).json({ ok: false, message: "Valid email is required." });
    }

    const user = await User.findOne({ email }).select("+resetPasswordTokenHash +resetPasswordExpires");
    if (!user) {
      return res.status(200).json({
        ok: true,
        message: "If the account exists, a password reset token has been generated.",
      });
    }

    const rawResetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(rawResetToken).digest("hex");

    user.resetPasswordTokenHash = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    return res.status(200).json({
      ok: true,
      message: "Password reset token generated. Use it on reset password screen.",
      resetToken: rawResetToken,
    });
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return res.status(500).json({ ok: false, message: "Failed to start password reset." });
  }
}

async function resetPassword(req, res) {
  try {
    const token = String(req.body.token || "").trim();
    const newPassword = String(req.body.newPassword || "");

    if (!token) {
      return res.status(400).json({ ok: false, message: "Reset token is required." });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ ok: false, message: "Password must be at least 8 characters." });
    }

    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordTokenHash: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password +resetPasswordTokenHash +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ ok: false, message: "Invalid or expired reset token." });
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    user.otpAttempts = 0;
    user.otpBlockedUntil = null;
    await user.save();

    return res.status(200).json({ ok: true, message: "Password reset successful." });
  } catch (error) {
    console.error("[RESET_PASSWORD]", error);
    return res.status(500).json({ ok: false, message: "Password reset failed." });
  }
}

async function dashboard(req, res) {
  try {
    const user = await User.findById(req.user.userId).select(
      "name email mfaEnabled createdAt lastLoginIp suspiciousActivity"
    );

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found." });
    }

    return res.status(200).json({
      ok: true,
      message: "Dashboard data retrieved.",
      data: {
        name: user.name,
        email: user.email,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
        lastLoginIp: user.lastLoginIp,
        suspiciousActivity: user.suspiciousActivity.slice(-5),
      },
    });
  } catch (error) {
    console.error("[DASHBOARD]", error);
    return res.status(500).json({ ok: false, message: "Failed to fetch dashboard." });
  }
}

module.exports = {
  register,
  login,
  verifyOtp,
  socialLogin,
  forgotPassword,
  resetPassword,
  dashboard,
};

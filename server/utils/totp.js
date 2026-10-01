const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

function generateMfaSecret(email) {
  const secret = speakeasy.generateSecret({
    length: 20,
    name: `SecureAuth (${email})`,
    issuer: "SecureAuth",
  });

  return {
    base32: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
}

async function generateQrDataUrl(otpauthUrl) {
  return QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
  });
}

function verifyTotpToken(base32Secret, otp) {
  return speakeasy.totp.verify({
    secret: base32Secret,
    encoding: "base32",
    token: String(otp),
    window: 1,
  });
}

module.exports = {
  generateMfaSecret,
  generateQrDataUrl,
  verifyTotpToken,
};

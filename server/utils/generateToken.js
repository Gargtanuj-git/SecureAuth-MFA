const jwt = require("jsonwebtoken");

function generateToken(payload) {
  const secret = String(process.env.JWT_SECRET || "");
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long.");
  }

  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

module.exports = generateToken;

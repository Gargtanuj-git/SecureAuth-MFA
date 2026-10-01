const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  return EMAIL_REGEX.test(String(email || "").trim());
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 8;
}

function validateOtp(otp) {
  return /^\d{6}$/.test(String(otp || ""));
}

module.exports = {
  validateEmail,
  validatePassword,
  validateOtp,
};

const express = require("express");
const rateLimiter = require("../middleware/rateLimiter");
const {
	register,
	login,
	verifyOtp,
	socialLogin,
	forgotPassword,
	resetPassword,
	dashboard,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public auth endpoints.
router.post("/register", rateLimiter({ windowMs: 60 * 1000, limit: 10 }), register);
router.post("/login", rateLimiter({ windowMs: 60 * 1000, limit: 15 }), login);
router.post("/social-login", rateLimiter({ windowMs: 60 * 1000, limit: 20 }), socialLogin);
router.post("/verify-otp", rateLimiter({ windowMs: 60 * 1000, limit: 20 }), verifyOtp);
router.post("/forgot-password", rateLimiter({ windowMs: 60 * 1000, limit: 10 }), forgotPassword);
router.post("/reset-password", rateLimiter({ windowMs: 60 * 1000, limit: 10 }), resetPassword);
router.get("/dashboard", authMiddleware, dashboard);

module.exports = router;

# Setup Summary

This repository currently runs a streamlined MFA implementation.

## Current Backend Files

### Core
- `server.js`
- `config/db.js`
- `routes/authRoutes.js`
- `controllers/authController.js`
- `middleware/authMiddleware.js`
- `middleware/rateLimiter.js`

### Models
- `models/User.js`
- `models/Test.js`

### Utilities
- `utils/generateToken.js`
- `utils/totp.js`
- `utils/validators.js`

## Current Flow

1. Register user with email and password.
2. Generate TOTP secret and QR code.
3. Login validates password and returns `MFA_REQUIRED`.
4. Verify OTP returns JWT token.
5. Dashboard requires `Authorization: Bearer <token>`.

## MongoDB

- Connection: `mongodb://127.0.0.1:27017/mfa_app`
- Main collection: `users`

## Notes

Legacy helper files for sessions, audit logs, backup codes, and sample scripts were removed to keep the codebase focused on the active MFA flow.

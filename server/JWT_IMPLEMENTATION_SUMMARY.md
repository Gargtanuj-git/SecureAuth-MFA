# JWT Implementation Summary

## Current Implementation

JWT is implemented with a single access-token flow for the active MFA app.

### Token Issuance
- JWT is issued only after successful OTP verification.
- Expiration: `1h`.
- Payload: `userId`, `email`.

### Token Validation
- Middleware validates Bearer token from `Authorization` header.
- Invalid or expired tokens return `401`.
- JWT secret configuration is validated for minimum length.

### Files In Use
- `utils/generateToken.js`
- `middleware/authMiddleware.js`
- `controllers/authController.js`

### Route Usage
- `POST /api/auth/verify-otp` issues token.
- `GET /api/auth/dashboard` requires valid token.

## Security

- `JWT_SECRET` must be present and at least 32 characters.
- Access to protected routes is blocked without valid Bearer token.

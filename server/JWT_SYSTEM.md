# JWT Authentication System - Production Guide

This document explains the complete JWT authentication system implementation for the MFA application.

## Overview

The JWT system uses industry-standard practices with three token types:

1. **Access Token** - Short-lived (1 hour), grants access to protected resources
2. **Pre-Auth Token** - Very short-lived (5 minutes), used during OTP verification
3. **Refresh Token** - Long-lived (7 days), used to obtain new access tokens without re-authentication

## Token Structure

### Access Token

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Expiration**: 1 hour  
**Usage**: Protected route access (Authorization: Bearer {token})  
**Security**: Discarded after expiration, user must login again

### Pre-Auth Token

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "type": "preauth",
  "forceMfa": false,
  "iat": 1234567890,
  "exp": 1234567900
}
```

**Expiration**: 5 minutes  
**Usage**: OTP verification endpoint only  
**Security**: Narrowly scoped, cannot access any other endpoints

### Refresh Token

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1234826290
}
```

**Expiration**: 7 days  
**Usage**: Obtain new access tokens  
**Security**: Long-lived, should be stored securely (httpOnly cookie recommended)

## Secret Management

### Requirements

- **Minimum Length**: 32 characters (256 bits minimum)
- **Algorithm**: HS256 (HMAC SHA-256)
- **Storage**: Environment variable `JWT_SECRET`
- **Rotation**: Change in production on a monthly basis (requires token refresh)

### Generation

Generate a strong secret with:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Non-Production Secrets

Only for development:
```env
JWT_SECRET=replace_with_a_strong_random_secret_at_least_32_chars
```

## Authentication Flow

### 1. User Registration

```
POST /auth/register
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response: QR code for authenticator app setup
```

### 2. User Login

```
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "ok": true,
  "message": "MFA required",
  "mfaRequired": true,
  "preAuthToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Token Type**: Pre-auth token (5-minute expiration)  
**Next Step**: Verify OTP with pre-auth token

### 3. OTP Verification

```
POST /auth/verify-otp
{
  "otp": "123456",
  "token": "preAuthToken..."
}

Response:
{
  "ok": true,
  "message": "MFA verification successful.",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**Returns**: Both access and refresh tokens

### 4. Access Protected Routes

```
GET /auth/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
  "ok": true,
  "message": "Dashboard data retrieved.",
  "data": {
    "email": "user@example.com",
    "mfaEnabled": true,
    ...
  }
}
```

### 5. Refresh Access Token

```
POST /auth/refresh-token
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "ok": true,
  "message": "Access token renewed.",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**Use When**: Access token has expired but refresh token is still valid

## Token Validation

### Middleware Error Responses

The `authMiddleware` provides specific error codes for different failure scenarios:

#### 401 Unauthorized

```json
{
  "ok": false,
  "message": "Access token has expired. Please login again.",
  "code": "TOKEN_EXPIRED"
}
```

When access token has passed expiration time.

```json
{
  "ok": false,
  "message": "Authorization header must use Bearer scheme.",
  "code": "MISSING_BEARER_SCHEME"
}
```

When Authorization header is malformed.

#### 403 Forbidden

```json
{
  "ok": false,
  "message": "Invalid token type. Access token required.",
  "code": "WRONG_TOKEN_TYPE"
}
```

When pre-auth or refresh token is used on protected route.

```json
{
  "ok": false,
  "message": "Token signature is invalid.",
  "code": "INVALID_SIGNATURE"
}
```

When JWT signature verification fails (secret mismatch or tampering).

### Token Verification Process

1. **Extract** - Remove "Bearer " prefix from Authorization header
2. **Verify Signature** - Validate against JWT_SECRET using HS256
3. **Check Expiration** - Ensure token.exp > current_timestamp
4. **Validate Type** - Ensure token.type matches endpoint requirements
5. **Attach to Request** - Decoded payload available as `req.user`

## Implementation Files

### Core JWT Utility
**File**: `/server/utils/generateToken.js`

```javascript
// Token generation
signAccessToken(payload)      // 1 hour expiration
signPreAuthToken(payload)     // 5 minute expiration
signRefreshToken(payload)     // 7 day expiration

// Token verification
verifyToken(token, expectedType)  // Verify and decode
decodeTokenWithoutVerification(token)  // Unsafe decode (diagnostic only)
```

### Authentication Middleware
**File**: `/server/middleware/authMiddleware.js`

Used on protected routes:

```javascript
router.get('/protected', authMiddleware, controller)
```

Optional pre-auth middleware:

```javascript
const { preAuthMiddleware } = require('../middleware/authMiddleware')
router.post('/verify-otp', preAuthMiddleware, controller)
```

### Auth Routes
**File**: `/server/routes/authRoutes.js`

```
POST /register        - Create user, returns QR code
POST /login          - Auth with email/password, returns pre-auth token
POST /verify-otp     - Validate OTP, returns access + refresh tokens
POST /refresh-token  - Renew access token using refresh token
GET  /dashboard      - Protected route (requires access token)
```

### Rate Limiting

All auth endpoints have rate limiting:

```
POST /register        - 10 requests per 60 seconds per IP
POST /login          - 15 requests per 60 seconds per IP
POST /verify-otp     - 20 requests per 60 seconds per IP
POST /refresh-token  - 30 requests per 60 seconds per IP
```

## Security Best Practices

### ✅ Implemented

- [x] **Secure Secret** - 32+ character random secret in environment
- [x] **Algorithm** - HS256 (HMAC SHA-256) cryptographic signing
- [x] **Expiration** - Short-lived access tokens (1 hour)
- [x] **Type Checking** - Token type validation prevents token misuse
- [x] **Rate Limiting** - Prevents brute-force attacks
- [x] **No Sensitive Data** - Payload never contains passwords or secrets
- [x] **Stateless** - No server storage required (except refresh token optional)

### ⏳ Production Recommendations

1. **HTTPS Only** - Always use HTTPS in production
   ```javascript
   // In browser client
   const token = localStorage.getItem('accessToken');
   fetch('/api/endpoint', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   })
   ```

2. **Secure Cookie Storage** (Alternative to localStorage)
   ```javascript
   // Server sets refreshToken as httpOnly cookie
   res.setHeader('Set-Cookie', 'refreshToken=...; HttpOnly; Secure; SameSite=Strict');
   
   // Client sends automatically with requests
   ```

3. **Token Refresh Strategy**
   - Issue access tokens with 1-hour expiration
   - Refresh silently when near expiration (optional)
   - Force re-login when refresh token expires

4. **Security Headers** (in Express)
   ```javascript
   app.use(helmet()); // Adds security headers
   app.set('trust proxy', 1); // For IP address behind proxies
   ```

5. **CORS Configuration**
   ```javascript
   app.use(cors({
     origin: process.env.CLIENT_URL,
     credentials: true,
     methods: ['GET', 'POST'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

6. **Logout/Token Revocation**
   - Optional: Maintain token blacklist for logout
   - Optional: Store issued refresh tokens in database
   - Can check against blacklist in authMiddleware

## Testing Guide

### Using cURL

#### 1. Register User

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'
```

#### 2. Login

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'
```

**Store the `preAuthToken` from response**

#### 3. Generate OTP

Scan the QR code with authenticator app, or use:

```bash
# Using Node.js to generate valid OTP
node -e "
const speakeasy = require('speakeasy');
const secret = 'YOUR_BASE32_SECRET_FROM_REGISTRATION';
const token = speakeasy.totp({ secret });
console.log('OTP:', token);
"
```

#### 4. Verify OTP and Get Tokens

```bash
curl -X POST http://localhost:5000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456",
    "token": "PRE_AUTH_TOKEN_FROM_LOGIN"
  }'
```

**Store both `accessToken` and `refreshToken` from response**

#### 5. Access Protected Route

```bash
curl http://localhost:5000/auth/dashboard \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

#### 6. Refresh Access Token

```bash
curl -X POST http://localhost:5000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "REFRESH_TOKEN"
  }'
```

### Using JavaScript Fetch API

```javascript
// 1. Register
const registerRes = await fetch('http://localhost:5000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'SecurePassword123'
  })
});
const { qrCodeDataURL } = await registerRes.json();

// 2. Login
const loginRes = await fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'SecurePassword123'
  })
});
const { preAuthToken } = await loginRes.json();

// 3. Verify OTP
const verifyRes = await fetch('http://localhost:5000/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    otp: '123456',
    token: preAuthToken
  })
});
const { accessToken, refreshToken } = await verifyRes.json();

// 4. Access Protected Route
const dashboardRes = await fetch('http://localhost:5000/auth/dashboard', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
const userData = await dashboardRes.json();

// 5. Refresh Token
const refreshRes = await fetch('http://localhost:5000/auth/refresh-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});
const { accessToken: newAccessToken } = await refreshRes.json();
```

### Testing Token Expiration

#### Access Token Expiration

1. Get a valid access token
2. Wait for token or manually set past expiration in testing
3. Call protected route:

```bash
curl http://localhost:5000/auth/dashboard \
  -H "Authorization: Bearer EXPIRED_TOKEN"

# Response: 401 with code: TOKEN_EXPIRED
```

#### Refresh Token Expiration

```bash
curl -X POST http://localhost:5000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "EXPIRED_REFRESH_TOKEN"
  }'

# Response: 401 with code: REFRESH_TOKEN_EXPIRED
```

#### Invalid Token Type

```bash
# Try to use pre-auth token on protected route
curl http://localhost:5000/auth/dashboard \
  -H "Authorization: Bearer PRE_AUTH_TOKEN"

# Response: 403 with code: WRONG_TOKEN_TYPE
```

#### Tampered Token

```bash
# Modify token payload or signature
TAMPERED_TOKEN="eyJhbGciOiJIUzI1NiIs...MODIFIED..."

curl http://localhost:5000/auth/dashboard \
  -H "Authorization: Bearer $TAMPERED_TOKEN"

# Response: 403 with code: INVALID_SIGNATURE
```

### Testing Rate Limiting

```bash
# Exceed refresh-token endpoint limit (30 per 60s)
for i in {1..35}; do
  curl -X POST http://localhost:5000/auth/refresh-token \
    -H "Content-Type: application/json" \
    -d '{"refreshToken":"token"}'
  echo "Request $i"
done

# Requests after limit: 429 Too Many Requests
```

## Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `MISSING_BEARER_SCHEME` | 401 | Authorization header missing or invalid format |
| `EMPTY_TOKEN` | 401 | Bearer token is empty |
| `TOKEN_EXPIRED` | 401 | Token has passed expiration time |
| `INVALID_TOKEN` | 401 | Token is malformed or invalid |
| `INVALID_SIGNATURE` | 403 | Token signature verification failed |
| `WRONG_TOKEN_TYPE` | 403 | Token type doesn't match endpoint requirement |
| `MISSING_REFRESH_TOKEN` | 400 | Refresh token not provided in request body |
| `REFRESH_TOKEN_EXPIRED` | 401 | Refresh token has expired |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token is invalid |
| `USER_NOT_FOUND` | 404 | User associated with token doesn't exist |

## Troubleshooting

### "Invalid token signature"

**Cause**: JWT_SECRET doesn't match between server instances or has changed  
**Fix**: Ensure all servers use same JWT_SECRET from environment

### "Token has expired"

**Cause**: Access token older than 1 hour  
**Fix**: Use refresh token endpoint to get new access token

### "Wrong token type"

**Cause**: Using pre-auth token on protected route  
**Fix**: Complete OTP verification to get access token

### "Authorization header must use Bearer scheme"

**Cause**: Missing or malformed Authorization header  
**Fix**: Use format: `Authorization: Bearer {token}`

### "Rate limit exceeded"

**Cause**: Too many requests in 60-second window  
**Fix**: Implement exponential backoff for client retries

## Production Deployment Checklist

- [ ] JWT_SECRET is 32+ random characters (not placeholder)
- [ ] HTTPS enabled for all endpoints
- [ ] CORS properly configured for client domains
- [ ] Rate limiting configured appropriately
- [ ] error responses don't leak sensitive information
- [ ] Access tokens expired appropriately (1 hour)
- [ ] Refresh tokens stored securely (httpOnly cookies)
- [ ] Logging captures token validation failures
- [ ] Database backups include user data
- [ ] Token secret rotation plan documented
- [ ] Monitoring alerts for unusual auth patterns

## References

- [JWT.io](https://jwt.io) - JWT debugging and specification
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JSON Web Token standard
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

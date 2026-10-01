# API Reference Guide

Complete documentation of all backend endpoints with request/response formats.

---

## Base URL

```
http://localhost:5000
```

---

## Health Check

### GET /health

Check server and database connectivity status.

**Request**:
```bash
curl http://localhost:5000/health
```

**Response (Success 200)**:
```json
{
  "ok": true,
  "message": "Server is healthy."
}
```

**Response (Database Error 503)**:
```json
{
  "ok": false,
  "message": "Database connection lost."
}
```

---

## Authentication Endpoints

### POST /register

Create a new user account with MFA setup.

**Request**:
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Request Body**:
```json
{
  "email": "string (required, valid email format)",
  "password": "string (required, min 8 characters)"
}
```

**Response (Success 201)**:
```json
{
  "ok": true,
  "message": "User registered. Scan QR with your authenticator app.",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "mfaEnabled": true,
    "createdAt": "2026-04-10T12:34:56.789Z"
  },
  "mfaSetup": {
    "qrCodeDataURL": "data:image/png;base64,iVBORw0KGgoAAAAN...",
    "manualKey": "JBSWY3DPEBLW64TMMQ======"
  }
}
```

**Error Responses**:

400 - Bad Request:
```json
{
  "ok": false,
  "message": "Invalid email format."
}
```

400 - Password too short:
```json
{
  "ok": false,
  "message": "Password must be at least 8 characters."
}
```

409 - User exists:
```json
{
  "ok": false,
  "message": "User already exists."
}
```

---

### POST /login

Authenticate with email and password (step 1 of 2).

**Important**: This endpoint does NOT grant access. It returns a pre-auth token for OTP verification.

**Request**:
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Request Body**:
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)"
}
```

**Response (Success 200)**:
```json
{
  "ok": true,
  "message": "MFA required",
  "mfaRequired": true,
  "preAuthToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "suspiciousActivity": false
}
```

**Response (Suspicious Login 200)**:
```json
{
  "ok": true,
  "message": "MFA required",
  "mfaRequired": true,
  "preAuthToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "suspiciousActivity": true
}
```

**Error Responses**:

400 - Invalid format:
```json
{
  "ok": false,
  "message": "Invalid email or password format."
}
```

401 - Bad credentials:
```json
{
  "ok": false,
  "message": "Invalid credentials."
}
```

**Flow**:
1. User enters email and password
2. Server verifies credentials
3. If valid, returns preAuthToken (expires in 5 minutes)
4. Frontend stores preAuthToken
5. Frontend prompts for OTP
6. User enters OTP from authenticator app
7. Frontend calls /verify-otp with preAuthToken + OTP

---

### POST /verify-otp

Verify TOTP from authenticator app (step 2 of 2).

**Request**:
```bash
curl -X POST http://localhost:5000/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Request Body**:
```json
{
  "otp": "string (required, 6-digit code from authenticator)",
  "token": "string (required, preAuthToken from /login)"
}
```

**Response (Success 200)**:
```json
{
  "ok": true,
  "message": "MFA verification successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzEyNzQ3Njk2LCJleHAiOjE3MTI3NTEyOTZ9.abcdef..."
}
```

**Error Responses**:

400 - Invalid OTP format:
```json
{
  "ok": false,
  "message": "OTP must be a 6-digit code."
}
```

401 - Wrong OTP (not locked):
```json
{
  "ok": false,
  "message": "Invalid or expired OTP."
}
```

401 - Invalid pre-auth token:
```json
{
  "ok": false,
  "message": "Pre-auth token is invalid or expired."
}
```

429 - OTP locked (too many attempts):
```json
{
  "ok": false,
  "message": "Too many invalid OTP attempts. Account locked for 10 minutes."
}
```

429 - Account locked (retry interval):
```json
{
  "ok": false,
  "message": "Too many invalid OTP attempts. Retry in 485s."
}
```

**Brute-Force Protection**:
- Max 5 failed OTP attempts before lockout
- 10-minute cooldown after hitting limit
- Counter resets on successful verification

**Flow**:
1. User receives preAuthToken from /login
2. User opens authenticator app (Google Authenticator, Authy, etc.)
3. User enters 6-digit code
4. Frontend sends OTP + preAuthToken to /verify-otp
5. Server verifies TOTP against user's secret
6. If valid: returns JWT access token (expires in 1 hour)
7. Frontend stores JWT and uses it for authenticated requests

---

## Protected Endpoints

### GET /dashboard

Retrieve authenticated user's dashboard data.

**Requires**: Valid JWT access token from /verify-otp

**Request**:
```bash
curl -X GET http://localhost:5000/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Request Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (Success 200)**:
```json
{
  "ok": true,
  "message": "Dashboard data retrieved.",
  "data": {
    "email": "user@example.com",
    "mfaEnabled": true,
    "createdAt": "2026-04-10T12:34:56.789Z",
    "lastLoginIp": "203.0.113.24",
    "suspiciousActivity": [
      {
        "ip": "192.0.2.50",
        "reason": "IP changed from 203.0.113.24 to 192.0.2.50",
        "detectedAt": "2026-04-10T10:20:00.000Z"
      }
    ]
  }
}
```

**Error Responses**:

401 - Missing token:
```json
{
  "ok": false,
  "message": "Authorization token is missing."
}
```

401 - Invalid token:
```json
{
  "ok": false,
  "message": "Invalid or expired token."
}
```

401 - Pre-auth token (not access token):
```json
{
  "ok": false,
  "message": "Access token is required for this route."
}
```

404 - User not found:
```json
{
  "ok": false,
  "message": "User not found."
}
```

**Security Notes**:
- Token expires in 1 hour
- Only access tokens (type: "access") are accepted
- Pre-auth tokens cannot access protected routes
- Token must be sent in Authorization header as Bearer token

---

## Complete Authentication Flow

### Step-by-Step Example

**Step 1: Register**
```bash
POST /register
{
  "email": "john@example.com",
  "password": "MyPassword123!"
}

Response:
{
  "qrCodeDataURL": "data:image/png;base64,...",
  "manualKey": "JBSWY3DPEBLW64TMMQ======"
}

→ User scans QR code with authenticator app
→ App generates 6-digit TOTP codes
```

**Step 2: Login**
```bash
POST /login
{
  "email": "john@example.com",
  "password": "MyPassword123!"
}

Response:
{
  "mfaRequired": true,
  "preAuthToken": "eyJ..."
}

→ Server responds "MFA Required"
→ Frontend shows OTP input field
```

**Step 3: Verify OTP**
```bash
POST /verify-otp
{
  "otp": "123456",
  "token": "eyJ..."
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

→ Server returns JWT access token
→ Frontend stores token in localStorage
→ User is now authenticated
```

**Step 4: Access Protected Route**
```bash
GET /dashboard
Headers: Authorization: Bearer eyJ...

Response:
{
  "data": {
    "email": "john@example.com",
    "mfaEnabled": true,
    ...
  }
}

→ User can access dashboard and other protected resources
```

---

## Rate Limiting

API endpoints have rate limiting:

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /register | 10 req | 60 seconds |
| POST /login | 15 req | 60 seconds |
| POST /verify-otp | 20 req | 60 seconds |
| GET /dashboard | (no specific limit) | - |

**Response when rate limited (429)**:
```json
{
  "ok": false,
  "message": "Too many requests. Please try again shortly."
}
```

Limits are per-IP address.

---

## Error Handling

All endpoints follow consistent error format:

**Error Response Structure**:
```json
{
  "ok": false,
  "message": "Human-readable error message"
}
```

**HTTP Status Codes**:
- `200` - Success
- `201` - Resource created
- `400` - Bad request (validation failed)
- `401` - Unauthorized (authentication failed)
- `404` - Not found
- `409` - Conflict (duplicate user)
- `429` - Rate limited or account locked
- `500` - Server error

---

## Token Details

### Pre-Auth Token (from /login)

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "type": "preauth",
  "forceMfa": false,
  "iat": 1712747696,
  "exp": 1712747996
}
```

- Valid for 5 minutes
- Used only for /verify-otp
- Cannot access protected routes
- Type must be "preauth"

### Access Token (from /verify-otp)

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "type": "access",
  "iat": 1712747696,
  "exp": 1712751296
}
```

- Valid for 1 hour
- Used for /dashboard and protected routes
- Type must be "access"
- Must be sent as Bearer token

---

## Request/Response Examples

### cURL Examples

**Register**:
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'
```

**Login**:
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'
```

**Verify OTP**:
```bash
curl -X POST http://localhost:5000/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"otp":"123456","token":"eyJ..."}'
```

**Dashboard**:
```bash
curl -X GET http://localhost:5000/dashboard \
  -H "Authorization: Bearer eyJ..."
```

### JavaScript/Fetch Examples

```javascript
// Register
const registerResponse = await fetch('http://localhost:5000/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
});
const registerData = await registerResponse.json();

// Login
const loginResponse = await fetch('http://localhost:5000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
});
const loginData = await loginResponse.json();

// Verify OTP
const otpResponse = await fetch('http://localhost:5000/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    otp: '123456',
    token: loginData.preAuthToken
  })
});
const otpData = await otpResponse.json();

// Store token
localStorage.setItem('mfa_jwt', otpData.token);

// Access dashboard
const dashResponse = await fetch('http://localhost:5000/dashboard', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${otpData.token}`
  }
});
const dashData = await dashResponse.json();
```

---

## Frontend Integration Notes

1. **After /register**: Show QR code and manual key. Ask user to scan.
2. **After /login**: Show OTP input field, wait 5 minutes for user to enter code.
3. **After /verify-otp**: Store JWT token, redirect to dashboard.
4. **For Dashboard**: Include Authorization header with JWT token.
5. **Token Refresh**: Token expires in 1 hour. Implement refresh or re-login when expired.

---

## Development vs Production

### Development (.env)
```
MONGO_URI=mongodb://127.0.0.1:27017/mfa_app
JWT_SECRET=dev_secret_key
PORT=5000
```

### Production (.env)
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/mfa_app
JWT_SECRET=<strong-random-32-char-key>
PORT=5000
```

Use strong JWT_SECRET in production (32+ characters of random characters).

---

This API reference provides everything needed to integrate the backend with your frontend application.

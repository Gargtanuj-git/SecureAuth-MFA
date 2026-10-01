# MongoDB Database Architecture for MFA System

This document describes the complete MongoDB schema design for the SecureAuth MFA system.

## Overview

The database consists of 4 main collections:
1. **users** - User accounts with authentication and MFA data
2. **login_attempts** - Track login attempts for brute-force detection
3. **sessions** - Active user sessions
4. **audit_logs** - Security event tracking and compliance

---

## 1. Users Collection

Stores user account information with secure password and MFA setup.

### Schema

```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed with bcrypt),
  mfaEnabled: Boolean (default: true),
  secret: String (base32 TOTP seed),
  backupCodes: [String] (hashed, hidden by default),
  backupCodesShown: Boolean,
  lastLoginIp: String,
  otpAttempts: Number (default: 0),
  otpBlockedUntil: Date,
  suspiciousActivity: [{
    ip: String,
    reason: String,
    detectedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

- **email** - Unique index for fast lookups
- **createdAt** - For sorting and range queries
- **compound** - email + createdAt for log queries

### Security Rules

- ❌ **Never expose**: password, secret, backupCodes fields
- ✅ **Always hash**: password, backup codes
- ✅ **Always validate**: email format, password strength
- ✅ **Track**: OTP attempts, last login IP

### Example Document

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "user@example.com",
  "password": "$2b$12$encrypted_password_hash",
  "mfaEnabled": true,
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "backupCodesShown": true,
  "lastLoginIp": "203.0.113.24",
  "otpAttempts": 0,
  "otpBlockedUntil": null,
  "suspiciousActivity": [
    {
      "ip": "192.0.2.50",
      "reason": "IP changed from 203.0.113.24 to 192.0.2.50",
      "detectedAt": "2026-04-10T12:34:56.789Z"
    }
  ],
  "createdAt": "2026-01-15T08:20:30.000Z",
  "updatedAt": "2026-04-10T12:34:56.789Z"
}
```

---

## 2. Login Attempts Collection

Tracks all login attempts for security monitoring and brute-force detection.

### Schema

```javascript
{
  _id: ObjectId,
  email: String (indexed),
  ipAddress: String (indexed),
  success: Boolean,
  reason: String (e.g., "wrong_password", "wrong_otp", "account_locked"),
  userAgent: String,
  createdAt: Date (TTL: 30 days)
}
```

### Indexes

- **email + createdAt** - Find recent attempts for a user
- **ipAddress + createdAt** - Find suspicious IP patterns
- **createdAt** - TTL index (auto-delete after 30 days)

### TTL Expiration

Login attempts are automatically deleted after 30 days to prevent collection bloat. This is managed by MongoDB's TTL index.

### Example Documents

**Successful login:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "email": "user@example.com",
  "ipAddress": "203.0.113.24",
  "success": true,
  "reason": null,
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "createdAt": "2026-04-10T12:34:56.789Z"
}
```

**Failed login (wrong password):**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "email": "user@example.com",
  "ipAddress": "203.0.113.24",
  "success": false,
  "reason": "wrong_password",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "createdAt": "2026-04-10T12:33:00.000Z"
}
```

**Failed OTP verification:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "email": "user@example.com",
  "ipAddress": "203.0.113.24",
  "success": false,
  "reason": "wrong_otp",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "createdAt": "2026-04-10T12:33:30.000Z"
}
```

---

## 3. Sessions Collection

Tracks active user sessions for device management and multi-device support.

### Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  tokenHash: String (SHA256 hash of JWT, unique, hidden),
  ipAddress: String,
  userAgent: String,
  deviceName: String,
  isActive: Boolean (default: true),
  expiresAt: Date (TTL index),
  createdAt: Date
}
```

### Indexes

- **userId** - Find all sessions for a user
- **expiresAt** - TTL index (auto-delete expired sessions)
- **tokenHash** - Unique, find session by token hash
- **createdAt** - Sort sessions by creation time

### TTL Expiration

Sessions are automatically deleted when they expire (expiresAt timestamp).

### Example Document

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439015"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "ipAddress": "203.0.113.24",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "deviceName": "Chrome on Windows",
  "isActive": true,
  "expiresAt": "2026-04-11T12:34:56.789Z",
  "createdAt": "2026-04-10T12:34:56.789Z"
}
```

**Note**: tokenHash is not shown in queries by default for security. It's only used internally for verification.

---

## 4. Audit Logs Collection

Immutable security event log for compliance and forensics.

### Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, nullable),
  email: String,
  action: String (enum: login, logout, mfa_enabled, password_changed, etc.),
  status: String (enum: success, failure),
  ipAddress: String,
  userAgent: String,
  metadata: Object,
  createdAt: Date (TTL: 90 days)
}
```

### Indexes

- **userId + createdAt** - User activity history
- **action + createdAt** - Activity by type
- **email + createdAt** - Track events by email
- **createdAt** - General timeline queries, TTL index (90 days)

### Enum Values for Action

Valid actions are:
- `login` - User logged in successfully
- `login_failed` - Login attempt failed
- `logout` - User logged out
- `mfa_enabled` - User enabled MFA
- `mfa_disabled` - User disabled MFA
- `password_changed` - User changed password
- `otp_verified` - User verified OTP
- `otp_failed` - OTP verification failed
- `backup_codes_generated` - Backup codes created
- `suspicious_login_detected` - Risk detection triggered
- `account_locked` - Account locked due to attempts
- `session_revoked` - Session was revoked

### Example Documents

**Successful login:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439016"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "email": "user@example.com",
  "action": "login",
  "status": "success",
  "ipAddress": "203.0.113.24",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "metadata": { "mfaVerified": true },
  "createdAt": "2026-04-10T12:34:56.789Z"
}
```

**Failed OTP attempt:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439017"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "email": "user@example.com",
  "action": "otp_failed",
  "status": "failure",
  "ipAddress": "203.0.113.24",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "metadata": { "attempt": 2, "maxAttempts": 5 },
  "createdAt": "2026-04-10T12:33:30.000Z"
}
```

**MFA enabled:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439018"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "email": "user@example.com",
  "action": "mfa_enabled",
  "status": "success",
  "ipAddress": "203.0.113.24",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "metadata": { "method": "totp", "backupCodesGenerated": 10 },
  "createdAt": "2026-04-01T10:15:00.000Z"
}
```

**Suspicious login detected:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439019"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "email": "user@example.com",
  "action": "suspicious_login_detected",
  "status": "success",
  "ipAddress": "192.0.2.50",
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)",
  "metadata": { "reason": "IP changed", "previousIp": "203.0.113.24" },
  "createdAt": "2026-04-10T08:20:00.000Z"
}
```

---

## Security Considerations

### What to NEVER Store

❌ Plain passwords - Always use bcrypt  
❌ OTP codes - Verify in real-time, don't persist  
❌ JWT tokens - Use token hash only  
❌ API keys or secrets - Use environment variables  

### What to Always Hash

✅ Passwords - bcrypt with salt rounds ≥ 12  
✅ Backup codes - bcrypt  
✅ JWT tokens - SHA256 (for session storage)  

### What to Encrypt

✅ TOTP secret - Can use AES-256 (optional, for extra security)  
✅ Sensitive metadata - PII data if stored  

---

## Performance Optimization

### Query Examples

**Find active sessions for a user:**
```javascript
db.sessions.find({ userId: userId, isActive: true }).lean();
```

**Count failed logins in last hour:**
```javascript
db.loginattempts.countDocuments({
  email: email,
  success: false,
  createdAt: { $gte: new Date(Date.now() - 3600000) }
});
```

**Get user activity (last 10 actions):**
```javascript
db.auditlogs.find({ userId: userId }).sort({createdAt: -1}).limit(10);
```

**Find suspicious IPs:**
```javascript
db.loginattempts.aggregate([
  { $match: { success: false, createdAt: { $gte: oneHourAgo } } },
  { $group: { _id: "$ipAddress", failedAttempts: { $sum: 1 } } },
  { $match: { failedAttempts: { $gt: 5 } } }
]);
```

### Index Usage

- **Single field indexes** are used for fast lookups
- **Compound indexes** are used for multi-field queries
- **TTL indexes** automatically delete old records
- Query planner will choose most selective index

---

## Maintenance

### Backup Strategy

```bash
# Backup entire database
mongodump --uri="mongodb://..." --out=/backup/mfa_backup

# Restore database
mongorestore --uri="mongodb://..." /backup/mfa_backup
```

### Monitoring Metrics

- Monitor collection sizes
- Track index performance
- Monitor OTP attempt spike (brute-force detection)
- Track session TTL cleanup efficiency

### Data Retention

- **login_attempts**: 30 days (TTL)
- **sessions**: Based on JWT expiry (TTL)
- **audit_logs**: 90 days (TTL)
- **users**: Never expire (manual deletion only)

---

## Connection Configuration

Connection is handled by `config/db.js` with:
- Environment-based URI configuration
- Health check support
- Proper error handling
- Graceful shutdown

Set these environment variables:
```
MONGO_URI=mongodb://127.0.0.1:27017/mfa_app
JWT_SECRET=your_secret_key_here
PORT=5000
```

---

## Usage Examples in Code

### Creating a User

```javascript
const { hashBackupCodes } = require("../utils/backupCodes");
const User = require("../models/User");

const user = new User({
  email: "user@example.com",
  password: hashedPassword,
  mfaEnabled: true,
  secret: base32Secret,
  backupCodes: await hashBackupCodes(plainCodes),
});

await user.save();
```

### Recording a Login Attempt

```javascript
const LoginAttempt = require("../models/LoginAttempt");

await LoginAttempt.create({
  email: "user@example.com",
  ipAddress: req.ip,
  success: true,
  reason: null,
  userAgent: req.headers["user-agent"],
});
```

### Logging Audit Event

```javascript
const AuditLog = require("../models/AuditLog");

await AuditLog.create({
  userId: user._id,
  email: user.email,
  action: "mfa_enabled",
  status: "success",
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
  metadata: { method: "totp", backupCodesGenerated: 10 },
});
```

### Creating a Session

```javascript
const Session = require("../models/Session");
const { hashToken } = require("../utils/sessionTokens");

const tokenHash = hashToken(jwtToken);
const session = await Session.create({
  userId: user._id,
  tokenHash,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
  deviceName: "Chrome on Windows",
  isActive: true,
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
});
```

---

## Conclusion

This database architecture provides:
- ✅ Secure storage of authentication data
- ✅ Comprehensive audit trail for compliance
- ✅ Efficient query performance with proper indexing
- ✅ Automatic cleanup of old data with TTL indexes
- ✅ Support for multi-device sessions
- ✅ Brute-force and risk detection

The design follows MongoDB best practices and is ready for production deployment.

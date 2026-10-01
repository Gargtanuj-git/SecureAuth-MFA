# JWT Complete Integration Guide

This guide provides step-by-step instructions for integrating the JWT authentication system with your frontend and backend applications.

## Table of Contents

1. [Frontend Integration](#frontend-integration)
2. [Backend Integration](#backend-integration)
3. [Token Management](#token-management)
4. [Error Handling](#error-handling)
5. [Security Checklist](#security-checklist)
6. [Deployment Guide](#deployment-guide)

## Frontend Integration

### Step 1: Token Storage

Choose a storage method based on your security requirements:

#### Option A: localStorage (Simpler, Less Secure)

```javascript
// Store tokens after successful login
function handleLoginSuccess(response) {
  localStorage.setItem('accessToken', response.accessToken);
  localStorage.setItem('refreshToken', response.refreshToken);
  localStorage.setItem('tokenExpiry', Date.now() + (response.expiresIn * 1000));
}

// Retrieve token for requests
function getAccessToken() {
  return localStorage.getItem('accessToken');
}

// Clear tokens on logout
function handleLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
}
```

#### Option B: Memory + HttpOnly Cookies (Recommended)

```javascript
// Backend sets httpOnly cookie
res.setHeader('Set-Cookie', [
  `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/`,
  `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/`
]);

// Frontend automatically sends cookies with requests
// No manual token management needed
```

### Step 2: API Client Setup

#### Using Fetch with Token in Header

```javascript
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          return this.request(endpoint, options);
        } else {
          // Refresh failed, redirect to login
          this.redirectToLogin();
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false; // Refresh failed
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('tokenExpiry', Date.now() + (data.expiresIn * 1000));
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  redirectToLogin() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }

  // Convenience methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Usage
const api = new ApiClient('http://localhost:5000/auth');

// Login
async function login(email, password) {
  const response = await api.post('/login', { email, password });
  // Redirect to OTP verification
}
```

#### Using Axios

```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/auth',
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          'http://localhost:5000/auth/refresh-token',
          { refreshToken }
        );

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### Step 3: Protected Route HOC (React Example)

```javascript
import React, { useEffect, useState } from 'react';

function withAuth(Component) {
  return function ProtectedRoute(props) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
      } else {
        setIsAuthenticated(true);
        setLoading(false);
      }
    }, []);

    if (loading) {
      return <div>Loading...</div>;
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
}

// Usage
const Dashboard = () => <h1>Dashboard</h1>;
export default withAuth(Dashboard);
```

## Backend Integration

### Step 1: Use Protected Routes

```javascript
const authMiddleware = require('./middleware/authMiddleware');

// Protected endpoint
router.get('/protected', authMiddleware, (req, res) => {
  // req.user contains decoded token
  console.log('User:', req.user.email);
  res.json({ message: 'Protected data' });
});

// Multiple protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/settings', authMiddleware, updateSettings);
router.delete('/account', authMiddleware, deleteAccount);
```

### Step 2: Create New Protected Routes

```javascript
// File: routes/userRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware applied to all routes in this file
router.use(authMiddleware);

router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select('-password -secret');
    res.json({ ok: true, data: user });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Failed to fetch profile' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { ...req.body },
      { new: true }
    ).select('-password -secret');
    res.json({ ok: true, data: user });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Failed to update profile' });
  }
});

module.exports = router;
```

### Step 3: Optional Pre-Auth Protected Routes

```javascript
const { preAuthMiddleware } = require('./middleware/authMiddleware');

// Only accessible with pre-auth token (after login, before OTP)
router.post('/verify-otp', preAuthMiddleware, verifyOtp);

// Usage in controller:
function somePreAuthRoute(req, res) {
  // req.user contains pre-auth token payload
  console.log('Pre-auth user:', req.user.email);
}
```

## Token Management

### Token Refresh Strategy

#### Approach 1: Manual Refresh When Needed

```javascript
// User initiates refresh
async function manualRefresh() {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await api.post('/refresh-token', { refreshToken });
  localStorage.setItem('accessToken', response.accessToken);
  console.log('Token refreshed');
}
```

#### Approach 2: Automatic Refresh Before Expiry

```javascript
class TokenManager {
  constructor() {
    this.refreshTimer = null;
  }

  startAutoRefresh() {
    // Refresh token 5 minutes before expiration
    const expiryTime = parseInt(localStorage.getItem('tokenExpiry'));
    const now = Date.now();
    const timeUntilRefresh = expiryTime - now - (5 * 60 * 1000);

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refresh();
      }, timeUntilRefresh);
    }
  }

  async refresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      const response = await fetch('http://localhost:5000/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('tokenExpiry', Date.now() + (data.expiresIn * 1000));
        this.startAutoRefresh(); // Reschedule next refresh
      } else {
        // Refresh failed, redirect to login
        this.logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
    }
  }

  logout() {
    clearTimeout(this.refreshTimer);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
}

// Usage
const tokenManager = new TokenManager();
tokenManager.startAutoRefresh();
```

### Logout Implementation

```javascript
// Frontend
function handleLogout() {
  // Clear tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Optional: Notify backend to invalidate tokens
  fetch('/auth/logout', { method: 'POST' });
  
  // Redirect to login
  window.location.href = '/login';
}

// Backend (optional)
router.post('/logout', authMiddleware, (req, res) => {
  // Optional: Add token to blacklist or update database
  // For now, just return success (token expires on its own)
  res.json({ ok: true, message: 'Logged out' });
});
```

## Error Handling

### Parse Error Response

```javascript
async function handleApiError(error) {
  if (error.response?.status === 401) {
    const { code } = error.response.data;
    
    switch(code) {
      case 'TOKEN_EXPIRED':
        console.log('Token expired, refreshing...');
        // Trigger token refresh
        break;
      case 'INVALID_TOKEN':
        console.log('Token invalid, redirecting to login...');
        window.location.href = '/login';
        break;
      case 'WRONG_TOKEN_TYPE':
        console.log('Wrong token type, redirecting to login...');
        window.location.href = '/login';
        break;
    }
  }
  
  if (error.response?.status === 403) {
    console.log('Access forbidden:', error.response.data.message);
  }
  
  if (error.response?.status === 429) {
    console.log('Too many requests, wait before retrying');
  }
}
```

### Display User-Friendly Messages

```javascript
const ERROR_MESSAGES = {
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_TOKEN: 'Authentication failed. Please log in again.',
  WRONG_TOKEN_TYPE: 'Authentication invalid. Please log in again.',
  INVALID_SIGNATURE: 'Your authentication is not valid.',
  MISSING_BEARER_SCHEME: 'Authentication is required.',
  EMPTY_TOKEN: 'No authentication token provided.',
};

function getUserMessage(errorCode) {
  return ERROR_MESSAGES[errorCode] || 'An authentication error occurred.';
}
```

## Security Checklist

### Development

- [ ] Set unique JWT_SECRET (32+ characters)
- [ ] Test token expiration handling
- [ ] Test token refresh flow
- [ ] Verify protected routes block unauthenticated access
- [ ] Test error responses with error codes

### Staging/Production

- [ ] Use HTTPS for all endpoints
- [ ] Set secure cookie flags (HttpOnly, Secure, SameSite)
- [ ] Configure CORS for your domain only
- [ ] Implement rate limiting on auth endpoints
- [ ] Monitor for suspicious authentication patterns
- [ ] Set up logging for auth failures
- [ ] Regular JWT_SECRET rotation (optional)
- [ ] Test token refresh with multiple clients
- [ ] Implement token revocation/blacklist (optional)

### Monitoring

```javascript
// Track failed auth attempts
app.use((req, res, next) => {
  if (res.statusCode === 401) {
    console.warn(`[AUTH_FAILURE] ${req.path} from ${req.ip}`);
  }
  next();
});

// Alert on repeated failures
const failureMap = new Map();
app.use((req, res, next) => {
  if (res.statusCode === 401) {
    const key = `${req.ip}:${req.path}`;
    const count = (failureMap.get(key) || 0) + 1;
    failureMap.set(key, count);
    
    if (count > 5) {
      console.error(`[SUSPICIOUS] Multiple auth failures from ${req.ip}`);
    }
  }
  next();
});
```

## Deployment Guide

### Environment Setup

```bash
# Generate secure JWT_SECRET
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET=$JWT_SECRET" >> .env

# Or use Node.js
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### Secret Rotation

1. Deploy new secret in environment
2. Old tokens remain valid until expiration
3. New tokens use new secret
4. Monitor for any auth failures
5. Old secret can be removed after all users reauthenticate

### Server Configuration

```javascript
// Ensure HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Security headers
const helmet = require('helmet');
app.use(helmet());

// CORS
const cors = require('cors');
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Docker Example

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# JWT_SECRET should be provided at runtime
ENV JWT_SECRET=${JWT_SECRET}
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
```

Run with:

```bash
docker run \
  -e JWT_SECRET=$(openssl rand -hex 32) \
  -e MONGO_URI=mongodb://mongo:27017/mfa_app \
  -e NODE_ENV=production \
  myapp:latest
```

## Summary

You now have a complete, production-ready JWT authentication system with:

✅ Token generation (access, pre-auth, refresh)  
✅ Secure verification middleware  
✅ Proper error handling with specific codes  
✅ Frontend integration examples  
✅ Backend integration patterns  
✅ Token refresh capability  
✅ Comprehensive testing  
✅ Security best practices  
✅ Deployment guidance  

For complete API documentation, see [JWT_SYSTEM.md](JWT_SYSTEM.md).

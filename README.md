# 🔐 SecureAuth MFA

A secure **Multi-Factor Authentication (MFA)** web application built using **React + Vite**, **Node.js**, **Express.js**, **MongoDB**, **JWT**, **bcrypt**, and **TOTP**.

SecureAuth MFA implements a password + Time-based One-Time Password authentication flow where a JWT is issued **only after successful MFA verification**.

---

## 📌 Project Overview

SecureAuth MFA is designed to demonstrate a modern authentication architecture with multiple security layers.

The application provides:

- User registration
- Email and password authentication
- Password hashing with bcrypt
- TOTP-based Multi-Factor Authentication
- QR code generation for authenticator setup
- OTP verification
- JWT-based authentication
- Protected dashboard access
- Authentication rate limiting
- OTP retry/lockout protection
- MongoDB-based user storage

### Authentication Architecture

```text
                         USER
                           │
                           ▼
                ┌───────────────────┐
                │ React + Vite      │
                │ Frontend          │
                │ Port 5173         │
                └─────────┬─────────┘
                          │
                          │ REST API
                          ▼
                ┌───────────────────┐
                │ Node.js + Express │
                │ Backend           │
                │ Port 5001         │
                └─────────┬─────────┘
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
        Password        TOTP          JWT
        bcrypt        Verification   Authentication
             │            │            │
             └────────────┼────────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ MongoDB           │
                │ mfa_app            │
                │ users collection   │
                └───────────────────┘
```

---

# ✨ Features

## 🔐 Authentication

- Email and password registration
- Secure password hashing using bcrypt
- Password validation
- Login authentication
- MFA-enforced authentication flow

## 📱 Multi-Factor Authentication

- TOTP-based MFA
- TOTP secret generation
- QR code generation
- 6-digit OTP verification
- Authenticator application support
- OTP retry protection
- OTP lockout mechanism

## 🎫 JWT Authentication

- JWT generated after successful OTP verification
- Bearer token authentication
- Protected dashboard route
- Server-side token validation

## 🛡️ Security

- Passwords are never stored in plain text
- JWT secret stored in environment variables
- Authentication endpoint rate limiting
- OTP retry protection
- Sensitive `.env` file excluded from Git
- Protected API routes

## 🗄️ Database

- MongoDB
- Mongoose
- `users` collection
- Local MongoDB development environment

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Frontend development/build tool |
| JavaScript | Application logic |
| HTML5 | Structure |
| CSS3 | Styling |
| ESLint | Code quality |

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Server runtime |
| Express.js | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| bcrypt | Password hashing |
| JWT | Authentication tokens |
| TOTP | MFA authentication |
| QR Code | TOTP setup |
| Express Rate Limit | Rate limiting |
| Nodemon | Development server |

---

# 📂 Project Structure

```text
Crypto/
│
├── client/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── index.html
│
├── server/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   └── authController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── rateLimiter.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Test.js
│   │
│   ├── routes/
│   │   └── authRoutes.js
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── totp.js
│   │   └── validators.js
│   │
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env
│   └── .env.example
│
├── .gitignore
├── README.md
└── package-lock.json
```

> **Note:** The actual contents of `client/src` may vary depending on the current frontend implementation.

---

# 💻 System Requirements

Before running SecureAuth MFA, install:

- Windows 10/11 or another supported operating system
- Node.js
- npm
- MongoDB Community Server
- MongoDB Shell (`mongosh`)
- Git
- Visual Studio Code
- A TOTP authenticator application

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

Check Git:

```bash
git --version
```

Check MongoDB Shell:

```bash
mongosh --version
```

---

# 📥 Installation

## 1. Clone the Repository

Clone the GitHub repository:

```bash
git clone https://github.com/YOUR_USERNAME/SecureAuth-MFA.git
```

Enter the project:

```bash
cd SecureAuth-MFA
```

---

# 🍃 MongoDB Setup

SecureAuth MFA uses a local MongoDB database.

Default connection:

```text
mongodb://127.0.0.1:27017/mfa_app
```

Database:

```text
mfa_app
```

Main collection:

```text
users
```

The application creates the required collection through Mongoose when data is first stored.

---

# ▶️ Start MongoDB on Windows

If MongoDB was installed as a Windows service:

```powershell
net start MongoDB
```

You can also test the MongoDB installation:

```powershell
mongosh
```

If the MongoDB shell opens successfully, MongoDB is available.

Exit:

```text
exit
```

---

# ⚙️ Backend Configuration

Go to the server directory:

```powershell
cd server
```

Create:

```text
.env
```

Add:

```env
MONGO_URI=mongodb://127.0.0.1:27017/mfa_app
JWT_SECRET=replace_with_your_own_long_random_secret
PORT=5001
```

---

# 🔑 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/mfa_app` |
| `JWT_SECRET` | Secret used for JWT signing | Long random secret |
| `PORT` | Backend server port | `5001` |

### Security Warning

Never upload the real `.env` file to GitHub.

The repository should contain:

```text
server/.env.example
```

instead of:

```text
server/.env
```

---

# 📄 `.env.example`

Create:

```text
server/.env.example
```

with:

```env
MONGO_URI=mongodb://127.0.0.1:27017/mfa_app
JWT_SECRET=replace_with_your_own_long_random_secret
PORT=5001
```

---

# 📦 Install Backend Dependencies

From the `server` directory:

```powershell
npm install
```

---

# 🚀 Start Backend

Run:

```powershell
npm run dev
```

Expected output:

```text
[nodemon] starting `node server.js`

MongoDB Connected

[SERVER] Running on port 5001
```

The backend is available at:

```text
http://localhost:5001
```

---

# ⚛️ Frontend Setup

Open a **second terminal**.

Go to the client directory:

```powershell
cd client
```

Install dependencies:

```powershell
npm install
```

Start the React development server:

```powershell
npm run dev
```

Vite should display:

```text
VITE ready

➜ Local: http://localhost:5173/
```

Open:

```text
http://localhost:5173/
```

---

# 🖥️ Running the Complete Application

Two terminals are required during development.

## Terminal 1 — Backend

```powershell
cd server
npm install
npm run dev
```

Backend:

```text
http://localhost:5001
```

## Terminal 2 — Frontend

```powershell
cd client
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔄 Complete Application Flow

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ React Frontend  │
                  │ localhost:5173 │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Express API     │
                  │ localhost:5001  │
                  └────────┬────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          Password        TOTP         JWT
          Validation    Validation   Generation
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │    MongoDB      │
                  │    mfa_app      │
                  └─────────────────┘
```

---

# 👤 User Registration

The registration endpoint is:

```http
POST /api/auth/register
```

Full URL:

```text
http://localhost:5001/api/auth/register
```

Example request:

```json
{
  "email": "user@example.com",
  "password": "Test@123456"
}
```

The registration process:

```text
Email + Password
       │
       ▼
Validation
       │
       ▼
Password Hashing
       │
       ▼
TOTP Secret Generation
       │
       ▼
QR Code Generation
       │
       ▼
MongoDB User Creation
```

---

# 🔑 Login

Endpoint:

```http
POST /api/auth/login
```

Full URL:

```text
http://localhost:5001/api/auth/login
```

Example:

```json
{
  "email": "user@example.com",
  "password": "Test@123456"
}
```

The login process validates the email and password.

If the password is correct, the application requires MFA verification.

Conceptually:

```json
{
  "message": "MFA_REQUIRED"
}
```

The final JWT is not issued until OTP verification succeeds.

---

# 📱 TOTP MFA

After registration, the application generates a TOTP secret and QR code.

The QR code can be scanned using a compatible authenticator application.

The authenticator application generates a time-based 6-digit code.

Example:

```text
482913
```

The user enters the current code during MFA verification.

---

# 🔢 OTP Verification

Endpoint:

```http
POST /api/auth/verify-otp
```

Full URL:

```text
http://localhost:5001/api/auth/verify-otp
```

The backend validates the submitted OTP.

Successful verification results in JWT authentication.

```text
Password Verified
       │
       ▼
MFA Required
       │
       ▼
OTP Submitted
       │
       ▼
OTP Valid
       │
       ▼
JWT Issued
```

---

# 🎫 JWT Authentication

After successful MFA verification, the backend generates a JWT.

Protected requests must contain:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Example:

```text
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

# 🛡️ Protected Dashboard

Endpoint:

```http
GET /api/auth/dashboard
```

Full URL:

```text
http://localhost:5001/api/auth/dashboard
```

Required header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The authentication middleware verifies the token before allowing access.

---

# 🌐 API Documentation

## Authentication API

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register user |
| `POST` | `/api/auth/login` | No | Login using email/password |
| `POST` | `/api/auth/verify-otp` | No | Verify TOTP and issue JWT |
| `GET` | `/api/auth/dashboard` | JWT | Access protected dashboard |

## System API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Server information |
| `GET` | `/health` | Health check |
| `GET` | `/check-db` | MongoDB connection check |

---

# 🧪 Testing the Backend

## 1. Root endpoint

Open:

```text
http://localhost:5001/
```

## 2. Health endpoint

Open:

```text
http://localhost:5001/health
```

## 3. Database endpoint

Open:

```text
http://localhost:5001/check-db
```

## 4. Registration

Use Postman, Thunder Client, Insomnia, or the frontend.

```http
POST http://localhost:5001/api/auth/register
```

## 5. Login

```http
POST http://localhost:5001/api/auth/login
```

## 6. OTP verification

```http
POST http://localhost:5001/api/auth/verify-otp
```

## 7. Dashboard

```http
GET http://localhost:5001/api/auth/dashboard
```

with:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# 🔒 Security Implementation

## Password Security

Passwords are hashed using bcrypt before storage.

Plain-text passwords should never be stored in the database.

---

## TOTP Security

TOTP provides a second authentication factor based on a shared secret and time-based OTP generation.

The authentication sequence is:

```text
Password
   +
TOTP
   =
Authenticated User
```

---

## JWT Security

JWT is issued after successful MFA verification.

The JWT secret should be stored in the environment configuration.

Never hard-code the production JWT secret into source code.

---

## Rate Limiting

Authentication endpoints use rate limiting to reduce excessive requests and help protect against repeated authentication attempts.

---

## OTP Retry Protection

OTP verification is protected against excessive failed attempts.

Repeated invalid OTP submissions can trigger retry restrictions or lockout behavior according to the implementation.

---

# 🗃️ Database

MongoDB connection:

```text
mongodb://127.0.0.1:27017/mfa_app
```

Database:

```text
mfa_app
```

Primary collection:

```text
users
```

Optional collection/model:

```text
tests
```

---

# 🧩 Backend Modules

## `server.js`

Main Express application entry point.

Responsible for:

- Starting the server
- Loading environment variables
- Connecting middleware
- Registering routes
- Starting the HTTP server

---

## `config/db.js`

Responsible for MongoDB connection.

---

## `controllers/authController.js`

Contains authentication logic such as:

- Registration
- Login
- OTP verification
- Authentication flow

---

## `middleware/authMiddleware.js`

Protects routes requiring JWT authentication.

---

## `middleware/rateLimiter.js`

Provides rate limiting for authentication-related requests.

---

## `models/User.js`

Defines the MongoDB user model.

---

## `models/Test.js`

Optional test/database verification model.

---

## `routes/authRoutes.js`

Defines authentication API routes.

---

## `utils/generateToken.js`

Responsible for JWT token generation.

---

## `utils/totp.js`

Contains TOTP-related functionality.

---

## `utils/validators.js`

Contains input validation logic.

---

# 📁 Frontend Architecture

The React application is located in:

```text
client/
```

The frontend communicates with the backend through REST API requests.

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5001
```

---

# 🔌 Frontend → Backend Connection

The frontend should use the backend URL:

```text
http://localhost:5001
```

Example:

```javascript
const API_URL = "http://localhost:5001";
```

Example registration request:

```javascript
fetch(`${API_URL}/api/auth/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email,
    password
  })
});
```

---

# 🧰 Useful Commands

## Backend

Install:

```bash
cd server
npm install
```

Development:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

---

## Frontend

Install:

```bash
cd client
npm install
```

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

---

# 🐛 Troubleshooting

## `npm` is not recognized

Install Node.js and restart VS Code.

Check:

```bash
node --version
npm --version
```

---

## `git` is not recognized

Install Git for Windows and restart VS Code.

Check:

```bash
git --version
```

---

## `package.json` not found

Make sure you are in the correct directory.

Backend:

```powershell
cd server
```

Frontend:

```powershell
cd client
```

Then run:

```powershell
npm install
```

---

## MongoDB connection error

If you receive:

```text
ECONNREFUSED 127.0.0.1:27017
```

make sure MongoDB is running:

```powershell
net start MongoDB
```

Then restart the backend.

---

## Backend is running on the wrong port

The current backend configuration uses:

```text
PORT=5001
```

Therefore the API is:

```text
http://localhost:5001
```

Do not use port `5000` unless you intentionally change the backend configuration.

---

## Frontend cannot connect to backend

Verify that:

```text
Backend:
http://localhost:5001
```

is running.

Then verify that frontend API requests point to:

```text
http://localhost:5001
```

---

# 🐙 GitHub Setup

## `.gitignore`

The repository should ignore:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
*.log
.vscode/
.idea/
```

---

# 📤 Upload Project to GitHub

From the project root:

```powershell
cd "C:\Users\gargt\Downloads\Project\Crypto"
```

Initialize Git:

```powershell
git init
```

Set the main branch:

```powershell
git branch -M main
```

Add files:

```powershell
git add .
```

Create the first commit:

```powershell
git commit -m "Initial commit - SecureAuth MFA"
```

Connect GitHub:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/SecureAuth-MFA.git
```

Push:

```powershell
git push -u origin main
```

---

# 🔄 Updating the GitHub Repository

After making changes:

```powershell
git add .
git commit -m "Update SecureAuth MFA"
git push
```

Example:

```powershell
git add .
git commit -m "Fix OTP verification flow"
git push
```

---

# ⚠️ GitHub Security Checklist

Before pushing the project:

- [ ] `.env` is in `.gitignore`
- [ ] Real JWT secret is not committed
- [ ] Database passwords are not committed
- [ ] API keys are not committed
- [ ] `node_modules` is ignored
- [ ] `.env.example` is included
- [ ] No personal credentials are included

---

# 🚀 Production Considerations

This project is primarily intended for learning, development, and demonstration.

Before deploying to production, consider implementing:

- HTTPS
- Secure secret management
- Production MongoDB configuration
- Strong JWT secret management
- Secure cookie/token strategy
- CORS restrictions
- Strong password policy
- Account lockout policies
- Security logging
- Monitoring
- Input sanitization
- Dependency auditing
- Production database access controls

---

# 🎯 Project Objective

The main objective of SecureAuth MFA is to demonstrate how a modern authentication system can combine multiple security mechanisms.

```text
             SecureAuth MFA

        ┌────────────────────┐
        │     Password       │
        │   Authentication   │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │       TOTP         │
        │   MFA Verification │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │        JWT         │
        │ Authentication     │
        └─────────┬──────────┘
                  │
                  ▼
        ┌────────────────────┐
        │ Protected Dashboard│
        └────────────────────┘
```

---

# 📊 Security Flow

```text
Registration
     │
     ├── Email
     ├── Password
     │
     ▼
bcrypt Password Hash
     │
     ▼
TOTP Secret
     │
     ▼
QR Code
     │
     ▼
Authenticator App
     │
     ▼
Login
     │
     ├── Email
     └── Password
           │
           ▼
      MFA_REQUIRED
           │
           ▼
       Enter OTP
           │
           ▼
      Verify TOTP
           │
       ┌───┴───┐
       │       │
      FAIL   SUCCESS
       │       │
       ▼       ▼
   Retry/    Generate
   Lockout     JWT
                │
                ▼
        Protected Dashboard
```

---

# 📌 Quick Start

For a new machine:

```powershell
git clone https://github.com/YOUR_USERNAME/SecureAuth-MFA.git

cd SecureAuth-MFA
```

Start MongoDB.

Then open Terminal 1:

```powershell
cd server
npm install
npm run dev
```

Open Terminal 2:

```powershell
cd client
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5001
```

MongoDB:

```text
mongodb://127.0.0.1:27017/mfa_app
```

---

# 👨‍💻 Project Information

**Project Name:** SecureAuth MFA

**Frontend:** React + Vite

**Backend:** Node.js + Express.js

**Database:** MongoDB

**Authentication:** Password + TOTP + JWT

**Development Backend Port:** 5001

**Development Frontend Port:** 5173

---

# 📄 License

This project can be released under the license selected by the project owner.

Example:

```text
MIT License
```

---

# ⭐ SecureAuth MFA

**Secure authentication through Password + TOTP + JWT**

Built with:

```text
React
+
Vite
+
Node.js
+
Express
+
MongoDB
+
bcrypt
+
TOTP
+
JWT
```

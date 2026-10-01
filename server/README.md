# SecureAuth MFA Backend

Node.js and Express backend for password plus TOTP MFA authentication with JWT and local MongoDB.

## Features

- Email and password registration
- TOTP setup with QR code generation
- MFA-enforced login flow
- JWT issued only after OTP verification
- Protected dashboard route
- Rate limiting on auth endpoints
- OTP retry lockout protection

## Active Collections

- users
- tests (optional DB check route)

## API Routes

Base path: `/api/auth`

- `POST /register`
- `POST /login`
- `POST /verify-otp`
- `GET /dashboard` (Bearer token required)

System routes:

- `GET /`
- `GET /health`
- `GET /check-db`

## Project Structure

```text
server/
  config/
    db.js
  controllers/
    authController.js
  middleware/
    authMiddleware.js
    rateLimiter.js
  models/
    User.js
    Test.js
  routes/
    authRoutes.js
  utils/
    generateToken.js
    totp.js
    validators.js
  server.js
  .env
```

## Environment Variables

```env
MONGO_URI=mongodb://127.0.0.1:27017/mfa_app
JWT_SECRET=replace_with_a_32_plus_char_secret
PORT=5000
```

## Run

```bash
npm.cmd install
npm.cmd run dev
```

## Security Notes

- Password is hashed using bcrypt.
- TOTP secret is stored and hidden from default query selection.
- JWT secret must be 32 or more characters.
- OTP is validated as 6 digits and rate-limited.



# 🔐 SecureAuth MFA

A secure Multi-Factor Authentication (MFA) web application built with **React + Vite**, **Node.js + Express**, **MongoDB**, **JWT**, and **TOTP-based authentication**.

The application provides password-based authentication followed by a second authentication factor using a time-based one-time password (TOTP).

---

## 📌 Project Overview

**SecureAuth MFA** implements a two-step authentication system:

```text
User
 │
 ▼
React + Vite Frontend
 │
 │ HTTP REST API
 ▼
Node.js + Express Backend
 │
 ├── Password Authentication
 ├── TOTP MFA
 ├── JWT Authentication
 ├── Rate Limiting
 └── OTP Retry Protection
 │
 ▼
MongoDB
```

The system does **not issue the final JWT authentication token until the MFA OTP has been successfully verified**.

---

# ✨ Features

- 🔐 Email and password registration
- 🔑 Password authentication using bcrypt
- 📱 TOTP-based Multi-Factor Authentication
- 📷 QR code generation for TOTP setup
- 🔢 6-digit OTP verification
- 🎫 JWT authentication
- 🛡️ Protected dashboard route
- 🚦 Authentication endpoint rate limiting
- 🔒 OTP retry/lockout protection
- 🍃 Local MongoDB database
- ⚡ React + Vite frontend
- 🚀 Node.js + Express backend
- 🔄 Nodemon development server
- 🧩 Modular backend architecture

---

# 🛠️ Technologies Used

## Frontend

- React
- Vite
- JavaScript
- HTML5
- CSS3
- ESLint

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- TOTP
- QR Code generation
- Express Rate Limit
- Nodemon

## Development Tools

- Visual Studio Code
- Git
- GitHub
- MongoDB
- MongoDB Shell

---

# 📂 Project Structure

```text
Crypto/
│
├── client/
│   │
│   ├── public/
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
│   └── .env
│
├── .gitignore
└── README.md
```

---

# 💻 System Requirements

Before running the project, install:

1. Node.js
2. npm
3. MongoDB Community Server
4. MongoDB Shell (`mongosh`)
5. Git
6. Visual Studio Code

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

# 📥 1. Clone the GitHub Repository

After the project has been uploaded to GitHub, clone it using:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Example:

```bash
git clone https://github.com/YOUR_USERNAME/SecureAuth-MFA.git
```

Enter the project:

```bash
cd SecureAuth-MFA
```

---

# 📁 2. Open the Project

Open the project in Visual Studio Code:

```bash
code .
```

The project should contain:

```text
client
server
README.md
.gitignore
```

---

# 🍃 3. Configure MongoDB

SecureAuth MFA uses a local MongoDB database.

The default database connection is:

```text
mongodb://127.0.0.1:27017/mfa_app
```

The database name is:

```text
mfa_app
```

The main collection is:

```text
users
```

You do not need to manually create the `users` collection.

Mongoose creates the collection when the application stores the first user.

---

# ▶️ 4. Start MongoDB

Make sure MongoDB is running before starting the backend.

On Windows, try:

```powershell
net start MongoDB
```

If MongoDB is already running, Windows may report that the service is already started.

You can also test MongoDB:

```bash
mongosh
```

If the MongoDB shell opens successfully:

```text
test>
```

MongoDB is available.

Exit the shell:

```bash
exit
```

---

# ⚙️ 5. Configure Backend Environment Variables

Go to:

```text
server/
```

Create a file named:

```text
.env
```

Add:

```env
MONGO_URI=mongodb://127.0.0.1:27017/mfa_app
JWT_SECRET=SecureAuthMFA_ChangeThisToYourOwnLongRandomSecret
PORT=5001
```

## Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB database connection |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `PORT` | Backend server port |

### Important

Never upload `.env` to GitHub.

Your `.gitignore` must contain:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
coverage/
*.log
```

---

# 🔑 6. Create `.env.example`

For GitHub, create:

```text
server/.env.example
```

Use:

```env
MONGO_URI=mongodb://127.0.0.1:27017/mfa_app
JWT_SECRET=replace_with_your_own_long_random_secret
PORT=5001
```

Do **not** put your real JWT secret in `.env.example`.

---

# 📦 7. Install Backend Dependencies

Open a terminal.

Go to the server:

```powershell
cd server
```

Install dependencies:

```powershell
npm install
```

---

# 🚀 8. Start the Backend

Run:

```powershell
npm run dev
```

The development server should display something similar to:

```text
[nodemon] starting `node server.js`

MongoDB Connected

[SERVER] Running on port 5001
```

The backend is now running at:

```text
http://localhost:5001
```

---

# 🧪 9. Test the Backend

Open your browser.

## Root Route

```text
http://localhost:5001/
```

## Health Check

```text
http://localhost:5001/health
```

## Database Check

```text
http://localhost:5001/check-db
```

If these routes respond correctly, the backend is running.

---

# ⚛️ 10. Install Frontend Dependencies

Open a **second terminal**.

Keep the backend terminal running.

Go to:

```powershell
cd client
```

Install dependencies:

```powershell
npm install
```

---

# 🌐 11. Start the React Frontend

Run:

```powershell
npm run dev
```

Vite should display something similar to:

```text
VITE ready

➜ Local: http://localhost:5173/
```

Open:

```text
http://localhost:5173/
```

The SecureAuth MFA frontend should now load.

---

# 🖥️ 12. Running the Complete Application

You need **two terminals**.

## Terminal 1 — Backend

```powershell
cd server
npm run dev
```

Expected:

```text
MongoDB Connected
[SERVER] Running on port 5001
```

## Terminal 2 — Frontend

```powershell
cd client
npm run dev
```

Expected:

```text
VITE ready
Local: http://localhost:5173/
```

Application:

```text
Frontend
http://localhost:5173

        ↓

Backend
http://localhost:5001

        ↓

MongoDB
mongodb://127.0.0.1:27017/mfa_app
```

---

# 🔐 Authentication Flow

SecureAuth MFA uses the following authentication flow:

```text
                 START
                   │
                   ▼
             Registration
                   │
                   ▼
          Email + Password
                   │
                   ▼
          Password Hashing
              (bcrypt)
                   │
                   ▼
          TOTP Secret Setup
                   │
                   ▼
             QR Code
                   │
                   ▼
          Authenticator App
                   │
                   ▼
               LOGIN
                   │
                   ▼
          Email + Password
                   │
                   ▼
        Password Verification
                   │
                   ▼
            MFA_REQUIRED
                   │
                   ▼
            Enter 6-Digit OTP
                   │
                   ▼
            Verify TOTP
              /       \
            FAIL      SUCCESS
             │          │
             ▼          ▼
        Retry/Lock     JWT
                        │
                        ▼
                 Protected Dashboard
```

---

# 👤 Registration

The frontend sends a request to:

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

The backend:

1. Validates the email.
2. Validates the password.
3. Checks whether the user already exists.
4. Hashes the password using bcrypt.
5. Generates a TOTP secret.
6. Creates the user.
7. Generates the TOTP QR setup information.
8. Stores the user in MongoDB.

---

# 🔑 Login

Endpoint:

```http
POST /api/auth/login
```

Example:

```json
{
  "email": "user@example.com",
  "password": "Test@123456"
}
```

Successful password verification does **not** immediately provide the final JWT.

Instead, the backend returns an MFA-required response.

Example concept:

```json
{
  "message": "MFA_REQUIRED"
}
```

The user must continue to OTP verification.

---

# 📱 OTP Verification

Endpoint:

```http
POST /api/auth/verify-otp
```

The user enters the 6-digit TOTP generated by their authenticator application.

Example:

```text
482913
```

The backend validates the OTP against the user's TOTP secret.

If the OTP is valid, a JWT is issued.

---

# 🎫 JWT Authentication

After successful MFA verification, the server generates a JWT.

The protected dashboard requires:

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

This route requires a valid JWT.

Request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Without a valid token, access is denied.

---

# 🌐 API Routes

## Authentication Routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate email/password |
| POST | `/api/auth/verify-otp` | Verify TOTP and issue JWT |
| GET | `/api/auth/dashboard` | Access protected dashboard |

## System Routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Server information |
| GET | `/health` | Server health check |
| GET | `/check-db` | MongoDB connection check |

---

# 📊 Database

Database:

```text
mfa_app
```

MongoDB URL:

```text
mongodb://127.0.0.1:27017/mfa_app
```

Main collection:

```text
users
```

The application uses Mongoose to communicate with MongoDB.

---

# 🔒 Security Features

## Password Hashing

Passwords are not stored as plain text.

They are hashed using:

```text
bcrypt
```

---

## TOTP MFA

The application uses TOTP-based MFA.

A compatible authenticator application can generate the 6-digit authentication code.

---

## JWT

JWT tokens are generated only after successful MFA verification.

The authentication sequence is therefore:

```text
Password
   ↓
MFA
   ↓
OTP Verification
   ↓
JWT
```

---

## Rate Limiting

Authentication endpoints are protected with rate limiting to reduce excessive authentication attempts.

---

## OTP Retry Protection

Invalid OTP attempts are restricted to help protect against repeated guessing.

---

# 🧪 Testing the Application

Recommended testing sequence:

### Test 1 — Server

Open:

```text
http://localhost:5001/
```

### Test 2 — Health

```text
http://localhost:5001/health
```

### Test 3 — Database

```text
http://localhost:5001/check-db
```

### Test 4 — Registration

Create a new account.

### Test 5 — TOTP Setup

Scan the generated QR code using an authenticator application.

### Test 6 — Login

Enter:

```text
Email
+
Password
```

The server should require MFA.

### Test 7 — OTP

Enter the current 6-digit TOTP.

### Test 8 — JWT

After successful OTP verification, the server returns the JWT.

### Test 9 — Dashboard

Use the JWT as:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

to access the protected dashboard.

---

# 🧰 Useful Development Commands

## Backend

```powershell
cd server
npm install
npm run dev
```

Production-style start:

```powershell
npm start
```

## Frontend

```powershell
cd client
npm install
npm run dev
```

Create production build:

```powershell
npm run build
```

Preview production build:

```powershell
npm run preview
```

---

# 🐛 Common Problems

## Problem 1 — `package.json` not found

Make sure you are inside the correct folder.

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

## Problem 2 — MongoDB connection error

If you see:

```text
ECONNREFUSED 127.0.0.1:27017
```

MongoDB is probably not running.

Try:

```powershell
net start MongoDB
```

Then restart the backend.

---

## Problem 3 — Frontend cannot connect to backend

Check that the backend is running:

```text
http://localhost:5001
```

The frontend must use:

```text
http://localhost:5001
```

not:

```text
http://localhost:5000
```

---

## Problem 4 — Port 5001 already in use

Find the process:

```powershell
netstat -ano | findstr :5001
```

Stop the relevant process if necessary:

```powershell
taskkill /PID PROCESS_ID /F
```

Then restart:

```powershell
npm run dev
```

---

# 🔄 Development Workflow

Whenever you download or clone the project on another computer:

```powershell
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

Start MongoDB.

Then:

```powershell
cd server
npm install
npm run dev
```

Open a second terminal:

```powershell
cd client
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

# 🐙 GitHub Setup

Before pushing the project, make sure sensitive files are excluded.

Your `.gitignore` should include:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
coverage/
*.log
```

Check Git status:

```powershell
git status
```

Initialize Git if required:

```powershell
git init
```

Add files:

```powershell
git add .
```

Create the first commit:

```powershell
git commit -m "Initial commit - SecureAuth MFA"
```

Connect your GitHub repository:

```powershell
git remote add origin YOUR_GITHUB_REPOSITORY_URL
```

Rename the branch:

```powershell
git branch -M main
```

Push:

```powershell
git push -u origin main
```

---

# ⚠️ Security Before Publishing

Do **not** upload:

```text
.env
node_modules/
JWT secrets
database passwords
private API keys
personal credentials
```

The GitHub repository should contain:

```text
.env.example
```

but not:

```text
.env
```

---

# 📌 Quick Start

For experienced users, the complete setup is:

```powershell
git clone YOUR_GITHUB_REPOSITORY_URL

cd YOUR_PROJECT_FOLDER

# Start MongoDB

cd server
npm install
npm run dev
```

Open another terminal:

```powershell
cd client
npm install
npm run dev
```

Then open:

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

# 📚 Project Components

### Frontend

```text
client/
```

Responsible for:

- User interface
- Registration
- Login
- MFA/OTP interface
- Dashboard
- API communication

### Backend

```text
server/
```

Responsible for:

- Authentication
- Password hashing
- TOTP
- QR generation
- JWT
- API routes
- Rate limiting
- OTP protection
- MongoDB communication

### Database

```text
MongoDB
```

Responsible for persistent user data.

---

# 🔐 Authentication Architecture

```text
┌─────────────────────────────┐
│       React Frontend        │
│        Port 5173            │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│      Express Backend        │
│        Port 5001            │
├─────────────────────────────┤
│ Authentication Controller   │
│ JWT Middleware              │
│ Rate Limiter                │
│ TOTP Utilities              │
│ Validators                  │
└──────────────┬──────────────┘
               │
               │ Mongoose
               ▼
┌─────────────────────────────┐
│          MongoDB            │
│         mfa_app              │
│                             │
│          users              │
└─────────────────────────────┘
```

---

# 🎯 Project Objective

The objective of SecureAuth MFA is to demonstrate a secure authentication architecture that combines:

```text
Something the user knows
        ↓
Password

        +

Something the user has
        ↓
TOTP Authenticator

        ↓

JWT Authentication
        ↓
Protected Resources
```

This architecture provides an additional authentication layer beyond password-only login.

---

# 👨‍💻 Development

This project is intended for educational, development, and demonstration purposes.

For production deployment, additional security controls should be reviewed, including HTTPS, secure cookie/token handling, secret management, database access controls, logging, monitoring, and production-grade infrastructure.

---

# 📄 License

Add your preferred license here.

Example:

```text
MIT License
```

---

# ⭐ SecureAuth MFA

**React + Vite | Node.js | Express | MongoDB | JWT | TOTP**

A complete password + Multi-Factor Authentication demonstration project.
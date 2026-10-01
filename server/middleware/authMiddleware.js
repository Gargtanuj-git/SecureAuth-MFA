const jwt = require("jsonwebtoken");

/**
 * JWT Authentication Middleware
 * Extracts and validates Bearer token from Authorization header.
 * Attaches decoded user data to req.user on success.
 * 
 * Usage:
 *   router.get('/protected-route', authMiddleware, controller);
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const secret = String(process.env.JWT_SECRET || "");

    if (!secret || secret.length < 32) {
      return res.status(500).json({
        ok: false,
        message: "Server JWT configuration is invalid.",
        code: "INVALID_JWT_CONFIG",
      });
    }
    
    // Extract token from "Bearer <token>" format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        message: "Authorization header must use Bearer scheme.",
        code: "MISSING_BEARER_SCHEME",
      });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({
        ok: false,
        message: "Authorization token is missing.",
        code: "EMPTY_TOKEN",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (tokenError) {
      return res.status(401).json({
        ok: false,
        message: "Invalid or expired token.",
      });
    }

    // Attach decoded user info to request
    req.user = decoded;
    req.token = token;

    return next();
  } catch (error) {
    console.error("[AUTH_MIDDLEWARE] Unexpected error:", error.message);
    return res.status(500).json({
      ok: false,
      message: "Authentication failed.",
      code: "AUTH_ERROR",
    });
  }
}

module.exports = authMiddleware;

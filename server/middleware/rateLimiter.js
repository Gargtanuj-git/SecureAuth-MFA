// Basic in-memory limiter per IP and route.
const bucket = new Map();

function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000;
  const limit = options.limit || 20;

  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const entry = bucket.get(key);

    if (!entry || now > entry.resetAt) {
      bucket.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      return res.status(429).json({
        ok: false,
        message: "Too many requests. Please try again shortly.",
      });
    }

    entry.count += 1;
    bucket.set(key, entry);
    return next();
  };
}

module.exports = rateLimiter;

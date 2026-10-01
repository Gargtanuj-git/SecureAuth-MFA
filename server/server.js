const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB, closeDB, checkHealth } = require("./config/db");
const Test = require("./models/Test");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

function validateCriticalEnv() {
  const jwtSecret = String(process.env.JWT_SECRET || "");
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long.");
  }
}

// Enable accurate req.ip when deployed behind a trusted proxy/load balancer.
app.set("trust proxy", 1);

// Core middleware.
app.use(
  cors({
    origin: true,
    credentials: false,
  })
);
app.use(express.json({ limit: "1mb" }));

// Health endpoint.
app.get("/", (req, res) => {
  res.send("Server Running");
});

app.get("/health", async (req, res) => {
  const isHealthy = await checkHealth();
  const status = isHealthy ? 200 : 503;
  res.status(status).json({
    ok: isHealthy,
    message: isHealthy ? "Server is healthy." : "Database connection lost.",
  });
});

app.get("/check-db", async (req, res) => {
  try {
    const inserted = await Test.create({ name: "MongoDB Working" });
    const retrieved = await Test.findById(inserted._id);

    if (!retrieved) {
      return res.status(500).json({
        ok: false,
        message: "Document was saved but could not be retrieved.",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "MongoDB insert and retrieval successful.",
      inserted,
      retrieved,
    });
  } catch (error) {
    console.error("[CHECK_DB]", error);
    return res.status(500).json({
      ok: false,
      message: "Database test failed.",
    });
  }
});

// API routes.
app.use("/api/auth", authRoutes);

// Unknown route handler.
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Route not found." });
});

// Central error handler.
app.use((error, req, res, next) => {
  console.error("[UNHANDLED]", error);
  res.status(500).json({ ok: false, message: "Internal server error." });
});

async function startServer() {
  try {
    validateCriticalEnv();
    await connectDB();
    app.listen(port, () => {
      console.log(`[SERVER] Running on port ${port}`);
    });
  } catch (error) {
    console.error("[STARTUP ERROR]", error.message);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown handler.
process.on("SIGTERM", async () => {
  console.log("[SERVER] SIGTERM received, shutting down...");
  await closeDB();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[SERVER] SIGINT received, shutting down...");
  await closeDB();
  process.exit(0);
});

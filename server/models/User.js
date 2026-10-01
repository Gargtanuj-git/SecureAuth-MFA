const mongoose = require("mongoose");

const suspiciousActivitySchema = new mongoose.Schema(
  {
    ip: { type: String, required: true },
    reason: { type: String, required: true },
    detectedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    mfaEnabled: {
      type: Boolean,
      default: true,
    },
    mfaSecret: {
      type: String,
      required: true,
      select: false,
    },
    // Used for risk-based checks.
    lastLoginIp: {
      type: String,
      default: null,
    },
    suspiciousActivity: {
      type: [suspiciousActivitySchema],
      default: [],
    },
    // Tracks OTP retry throttling state.
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpBlockedUntil: {
      type: Date,
      default: null,
    },
    resetPasswordTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  }
);

// Indexes for query performance (email index already defined in schema).
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);

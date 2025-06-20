const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["employer", "candidate"],
      required: true,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    companyId: {
      // only if the role is employer
      type: String,
      default: null,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["basic", "pro"],
        default: "basic",
      },
      capabilities: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

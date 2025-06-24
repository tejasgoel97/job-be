const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      default:""
    },
    lastName: {
      type: String,
      required: true,
      default:""
    },
    phoneNumber: {
      type: String,
      required: true,
      default:""
    },
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
      type: [String], // now an array of strings
      enum: ["employer", "candidate", "contractor"], // allowed values
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
    companyVerifiedToUser:{
      type: Boolean,
      default: false,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["basic", "pro"],
        default: "basic",
      },
      capabilities: [String],
    },
    authComplete: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

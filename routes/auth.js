const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const EmailService = require("../services/emailService");
const SUBSCRIPTION_PLANS = require("../config/subscriptions");
require("dotenv").config();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      role: user.role,
    },
  };
  return jwt.sign(payload, process.env.JWT_SECRET);
};

router.post(
  "/register",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be 6 or more characters").isLength({
      min: 6,
    }),
    check("role", "Role is required").isIn(["recruiter", "candidate"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        // If user exists but isn't verified, resend OTP
        if (!user.isVerified) {
          const otp = generateOTP();
          user.otp = {
            code: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
          };
          await user.save();
          await EmailService.sendOTP(email, otp);
          return res.status(200).json({
            message:
              "User registration incomplete. OTP resent. Please verify to complete registration.",
          });
        }
        // If user is verified, return error
        return res.status(400).json({
          message: "User already exists and is fully registered. Please login.",
        });
      }

      // New user registration
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const otp = generateOTP();
      const basicPlan = SUBSCRIPTION_PLANS[role].basic;

      user = new User({
        email,
        password: hashedPassword,
        role,
        otp: {
          code: otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
        subscription: {
          plan: "basic",
          capabilities: basicPlan.capabilities,
        },
      });

      await user.save();
      await EmailService.sendOTP(email, otp);

      res.status(201).json({ message: "User registered. Please verify OTP" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user);
    res.json({
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    console.log("in Login API");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      console.log("User Not Found");
      if (!user) {
        return res.status(400).json({ message: "User Not Found" });
      }

      if (!user.isVerified) {
        return res
          .status(400)
          .json({ message: "Please verify your email first" });
      }

      // const isMatch = await bcrypt.compare(password, user.password);
      // if (!isMatch) {
      //   return res.status(400).json({ message: "Invalid credentials" });
      // }
      const userData = {
        userId: user._id,
        role: user.role,
        capabilities: user.subscription.capabilities,
        email: user.email,
      };
      const token = generateToken(user);
      res.json({ token, ...userData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;

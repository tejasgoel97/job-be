const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const User = require("../models/User");
const SUBSCRIPTION_PLANS = require("../config/subscriptions");

router.get("/capabilities", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      plan: user.subscription.plan,
      capabilities: user.subscription.capabilities,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/upgrade", authMiddleware, async (req, res) => {
  const { plan } = req.body;

  if (!["basic", "pro"].includes(plan)) {
    return res.status(400).json({ message: "Invalid subscription plan" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.subscription.plan === plan) {
      return res.status(400).json({ message: "You already have this plan" });
    }

    // Combine capabilities from the target plan of all user roles
    let combinedCapabilities = [];
    for (const r of user.role) {
      if (SUBSCRIPTION_PLANS[r] && SUBSCRIPTION_PLANS[r][plan]) {
        combinedCapabilities.push(...SUBSCRIPTION_PLANS[r][plan].capabilities);
      }
    }
    const uniqueCapabilities = [...new Set(combinedCapabilities)];

    user.subscription = {
      plan,
      capabilities: uniqueCapabilities,
    };

    await user.save();
    res.json({
      message: "Subscription updated successfully",
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

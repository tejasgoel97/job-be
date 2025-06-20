const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  console.log("in middleware");
  console.log(req.header("Authorization"));
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user || null;
    console.log("Decoded Data => ", decoded);
    next();
  } catch (error) {
    console.log("Invalid Token");
    res.status(401).json({ message: "Invalid token" });
  }
};

const hasCapability = (capability) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user.subscription.capabilities.includes(capability)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = { authMiddleware, hasCapability };

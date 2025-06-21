const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth");
const Contract = require("../../models/Contract");

// GET route to fetch user's contracts
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { timeFilter } = req.query; // Optional: to filter by time period
    let dateFilter = {};

    // Apply time filter if provided
    if (timeFilter) {
      const months = {
        "Last 6 Months": 6,
        "Last 12 Months": 12,
        "Last 16 Months": 16,
        "Last 24 Months": 24,
        "Last 5 Years": 60,
      }[timeFilter];

      if (months) {
        dateFilter = {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - months)),
          },
        };
      }
    }

    const contracts = await Contract.find({
      createdBy: req.user.id,
      ...dateFilter,
    }).sort({ createdAt: -1 }); // Sort by most recent first

    res.status(200).json({
      success: true,
      message: "Contracts retrieved successfully",
      data: contracts,
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching contracts",
      error: error.message,
    });
  }
});

module.exports = router;
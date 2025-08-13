const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth");
const Job = require("../../models/Job");
const mongoose = require("mongoose");

// GET route to fetch user's jobs
router.get("/", authMiddleware, async (req, res) => {
  console.log("in Job Router");
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

    const jobs = await Job.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.user.id),
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: "jobapplications", // the collection name for JobApplication model
          localField: "_id",
          foreignField: "jobId",
          as: "applications",
        },
      },
      {
        $addFields: {
          applicationCount: { $size: "$applications" },
        },
      },
      {
        $project: {
          applications: 0, // Exclude the applications array from the final output
        },
      },
      { $sort: { createdAt: -1 } }, // Sort by most recent first
    ]);

    res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully",
      data: jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching jobs",
      error: error.message,
    });
  }
});

// ... existing routes ...

module.exports = router;

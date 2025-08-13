const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const CandidateAlert = require("../models/CandidateAlert");

// Get all alerts for the logged-in candidate
router.get("/my-alerts", authMiddleware, async (req, res) => {
    try {
        const alerts = await CandidateAlert.find({ 
            candidateId: req.user._id 
        })
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching alerts",
            error: error.message
        });
    }
});

router.get("/job-alerts", authMiddleware, async (req, res) => {
    try {
        // 2 months ago from now
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        console.log("Fetching job alerts for candidate:", req.user.id, "from:", twoMonthsAgo);
        const alerts = await CandidateAlert.find({ 
            candidateId: req.user.id,
            createdAt: { $gte: twoMonthsAgo },
            alertType: 'NewJob'
        }).populate({ path: 'jobId', select: 'title department jobType location city country deadline' })
        .sort({ createdAt: -1 });
        console.log("Fetched job alerts:", alerts.length);
        res.json({
            success: true,
            alerts: alerts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching alerts",
            error: error.message
        });
    }
});



// Mark alert as read
router.put("/mark-read/:alertId", authMiddleware, async (req, res) => {
    try {
        const alert = await CandidateAlert.findOneAndUpdate(
            { 
                _id: req.params.alertId,
                candidateId: req.user._id 
            },
            { isRead: true },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating alert",
            error: error.message
        });
    }
});

module.exports = router;

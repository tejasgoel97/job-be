const express = require("express");
const router = express.Router();
const {
    getCandidateNotifications,
    // markNotificationsAsRead,
    // getUnreadNotificationsCount
} = require("../controllers/DashboardController/NotificationSummaryController");
const { authMiddleware } = require("../middleware/auth");

// Get all notifications for the logged-in candidate
router.get("/candidate-notifications", authMiddleware, getCandidateNotifications);

// Mark notifications as read
// router.post("/candidate/notifications/mark-read", auth, markNotificationsAsRead);

// // Get count of unread notifications
// router.get("/candidate/notifications/unread-count", auth, getUnreadNotificationsCount);

module.exports = router;

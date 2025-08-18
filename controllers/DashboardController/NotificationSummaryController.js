const CandidateAlert = require("../../models/CandidateAlert");

// Get all notifications for a candidate
const getCandidateNotifications = async (req, res) => {
    try {
        const candidateId = req.user.id;
        const notifications = await CandidateAlert.find({ candidateId })
            .sort({ createdAt: -1 })
            .lean();

        // Transform notifications to be more readable
        const readableNotifications = notifications.map(notification => {
            let message = "";
            let title = "";
            return {
                companyName: notification.companyName,
                jobTitle: notification.jobTitle,
                alertType: notification.alertType,
                changedStatus: notification.changedStatus,
                jobLocation: notification.jobLocation,
                jobId: notification.jobId,
            }
            if (notification.alertType === "NewJob") {
                title = "New Job Alert";
                message = `${notification.companyName} posted a new ${notification.jobTitle} position in ${notification.jobLocation}`;
            } else if (notification.alertType === "ApplicationStatusChange") {
                title = "Application Status Update";
                message = `Your application for ${notification.jobTitle} at ${notification.companyName} has been ${notification.changedStatus}`;
            }

            return {
                id: notification._id,
                title,
                message,
                date: notification.createdAt,
                isRead: notification.isRead,
                type: notification.alertType
            };
        });

        res.json({
            success: true,
            notifications: readableNotifications
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
};

// Mark notifications as read
const markNotificationsAsRead = async (req, res) => {
    try {
        const candidateId = req.user._id;
        const { notificationIds } = req.body;

        await CandidateAlert.updateMany(
            { 
                _id: { $in: notificationIds },
                candidateId
            },
            { $set: { isRead: true } }
        );

        res.json({
            success: true,
            message: "Notifications marked as read successfully"
        });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark notifications as read"
        });
    }
};

// Get unread notifications count
const getUnreadNotificationsCount = async (req, res) => {
    try {
        const candidateId = req.user._id;
        const count = await CandidateAlert.countDocuments({
            candidateId,
            isRead: false
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch unread notifications count"
        });
    }
};

module.exports = {
    getCandidateNotifications,
    markNotificationsAsRead,
    getUnreadNotificationsCount
};

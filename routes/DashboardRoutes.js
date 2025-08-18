const express = require("express");
const router = express.Router();
const { getEmployerSummary, getCandidateSummary } = require("../controllers/DashboardController/SummaryController");
const { authMiddleware } = require("../middleware/auth");

// authMiddlewareed route - only accessible to logged-in employers
router.get("/employer-summary", authMiddleware, getEmployerSummary);
router.get("/candidate-summary", authMiddleware, getCandidateSummary);



module.exports = router;

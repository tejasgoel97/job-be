const express = require("express");
const router = express.Router();
const {
  applyToContract,
  getApplicationsForContract,
  getContractorApplications,
  updateApplicationStatus,
  withdrawApplication,
  checkIfApplied,
  getReceivedApplications,
  getReceivedApplicationsForContract,
} = require("../controllers/ContractApplicationController");
const { authMiddleware } = require("../middleware/auth");

// @route   POST /api/contract-application
// @desc    Apply to a contract
// @access  Private (Contractor)
router.post("/", authMiddleware, applyToContract);

// @route   GET /api/contract-application/contract/:contractId
// @desc    Get all applications for a specific contract
// @access  Private (Employer)
router.get("/contract/:contractId", authMiddleware, getApplicationsForContract);

// @route   GET /api/contract-application/my-applications
// @desc    Get all applications by the logged-in contractor
// @access  Private (Contractor)
router.get("/my-applications", authMiddleware, getContractorApplications);

// @route   PUT /api/contract-application/:id
// @desc    Update application status (by employer)
// @access  Private (Employer)
router.put("/:id", authMiddleware, updateApplicationStatus);

// @route   PUT /api/contract-application/withdraw/:id
// @desc    Withdraw an application (by contractor)
// @access  Private (Contractor)
router.put("/withdraw/:id", authMiddleware, withdrawApplication);

// @route   GET /api/contract-application/check-applied/:contractId
// @desc    Check if a contractor has applied to a specific contract
// @access  Private (Contractor)
router.get("/check-applied/:contractId", authMiddleware, checkIfApplied);

// @route   GET /api/contract-application/received-applications
// @desc    Get all applications for contracts posted by the current user (employer)
// @access  Private (Employer)
router.get("/received-applications", authMiddleware, getReceivedApplications);

// @route   GET /api/contract-application/received-applications-for-contract/:contractId
// @desc    Get all applications for a specific contract ID posted by the current user (employer)
// @access  Private (Employer)
router.get("/received-applications-for-contract/:contractId", authMiddleware, getReceivedApplicationsForContract);

module.exports = router;
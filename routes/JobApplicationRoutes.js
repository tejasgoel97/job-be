const express = require("express");
const router = express.Router();
const JobApplication = require("../models/JobApplication");
const Job = require("../models/Job");
const { authMiddleware } = require("../middleware/auth");
const CandidateResume = require("../models/CandidateResume");
const Company = require("../models/Company");

// 1. Apply for a Job
// POST /api/job-application/apply
// Checks if already applied, then creates a new application.
router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const { jobId, applyingMessageByCandidate } = req.body;
    const candidateUserId = req.user.id; // from authMiddleware

    // Validate input
    if (!jobId ) {
        return res.status(400).json({ success: false, message: "Job ID and Resume ID are required." });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({ jobId, candidateUserId });
    if (existingApplication) {
      return res.status(409).json({ success: false, message: "You have already applied for this job." });
    }
    const candidateResume = await CandidateResume.findOne({ userId: candidateUserId});
    if (!candidateResume) {
      return res.status(404).json({ success: false, message: "Candidate resume not found." });
    }
    // Get job details to find companyId and jobCreatorEmployerId
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    const newApplication = new JobApplication({
      jobId,
      candidateId: candidateUserId,
      candidateResumeId: candidateResume._id,
      companyId: job.companyId, // Assumes 'company' field in Job model
      jobCreatorEmployerId: job.createdBy, // Assumes 'postedBy' field in Job model
      applyingMessageByCandidate,
    });

    await newApplication.save();
    res.status(201).json({ success: true, message: "Application submitted successfully.", application: newApplication });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ success: false, message: "Server error while applying for job." });
  }
});

// 2. Check if the current user has applied for a specific job
// GET /api/job-application/check-applied/:jobId
router.get("/check-applied/:jobId", authMiddleware, async (req, res) => {
    try {
        const { jobId } = req.params;
        const candidateId = req.user.id;

        const application = await JobApplication.findOne({ jobId, candidateId });

        res.status(200).json({ success: true, applied: !!application, application });
    } catch (error) {
        console.error("Error checking application status:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid Job ID format" });
        }
        res.status(500).json({ success: false, message: "Server error." });
    }
});

// 3. Get all jobs applied by the current user (candidate)
// GET /api/job-application/my-applications
router.get("/my-applications", authMiddleware, async (req, res) => {
  try {
    const candidateId = req.user.id;
    const applications = await JobApplication.find({ candidateId })
      .populate({ path: 'jobId', select: 'title jobType location city country ' })
      .populate({ path: 'companyId', select: 'infoData.companyName ' })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Error fetching user's applications:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// 4. Get all applications for jobs posted by the current user (employer)
// GET /api/job-application/received-applications
router.get("/received-applications", authMiddleware, async (req, res) => {
  try {
    const jobCreatorEmployerId = req.user.id;
    const applications = await JobApplication.find({ jobCreatorEmployerId })
      .populate({ path: 'jobId', select: 'title' })
      .populate({ path: 'candidateId', select: 'firstName lastName email' })
      .populate({ path: 'candidateResumeId', select: 'currentDesignation portfolioFile currentSalary contactInfo.city contactInfo.country contactInfo.state' })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Error fetching received applications:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// 5. Get all applications for a specific job ID posted by the current user (employer)
// GET /api/job-application/received-applications-for-job/:jobId
router.get("/received-applications-for-job/:jobId", authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobCreatorEmployerId = req.user.id;

    // Verify the job was posted by this employer to ensure authorization
    const job = await Job.findOne({ _id: jobId, createdBy: jobCreatorEmployerId });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found or you do not have permission to view its applications." });
    }

    const applications = await JobApplication.find({ jobId })
      .populate({ path: 'candidateId', select: 'firstName lastName currentDesignation contactInfo currentSalary email' })
      .populate('candidateResumeId')
      .sort({ createdAt: -1 });

    const returnData = applications.map(app => ({
      ...app.toObject(),
      }));

res.status(200).json({ success: true, applications: returnData, jobTitle: job.title });
  } catch (error) {
    console.error("Error fetching applications for a specific job:", error);
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: "Invalid Job ID format" });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Suggested Route: Update application status (for employers)
// PATCH /api/job-application/update-status/:applicationId
router.patch("/update-status/:applicationId", authMiddleware, async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, notesByEmployer } = req.body;
        const jobCreatorEmployerId = req.user.id;

        // Validate status against the schema enum
        const allowedStatuses = JobApplication.schema.path('currentStatus').enumValues;
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
        }

        const application = await JobApplication.findById(applicationId);

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }

        // Authorization check: ensure the user updating is the one who posted the job
        if (application.jobCreatorEmployerId.toString() !== jobCreatorEmployerId) {
            return res.status(403).json({ success: false, message: "You are not authorized to update this application." });
        }

        application.currentStatus = status;
        if (notesByEmployer) {
            application.notesByEmployer = notesByEmployer;
        }

        const updatedApplication = await application.save();

        // Emit event for status change alert (non-blocking)
        const job = await Job.findById(application.jobId);
        const company = await Company.findById(job.companyId);
        const { emitStatusChangeAlert } = require('../services/alertService');
        console.log("Company ID => ", company)
        emitStatusChangeAlert(updatedApplication, job, company);

        res.status(200).json({ success: true, message: "Application status updated.", application: updatedApplication });
    } catch (error) {
        console.error("Error updating application status:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid Application ID format" });
        }
        res.status(500).json({ success: false, message: "Server error." });
    }
});

module.exports = router;
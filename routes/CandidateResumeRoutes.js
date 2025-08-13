const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const CandidateResume = require("../models/CandidateResume");
const User = require("../models/User");

// @route   POST /api/resume
// @desc    Create or update a candidate's resume
// @access  Private (Candidate Only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Ensure the user has the 'candidate' role
    console.log(req.user)
    const user = await User.findById(req.user.id).select("role");
    if (!user || !user.role.includes("candidate")) {
      return res
        .status(403)
        .json({ message: "Forbidden: Only candidates can manage a resume." });
    }
    console.log(req.body)
    const resumeData = {
      ...req.body,
      userId: req.user.id,
    };

    // Use findOneAndUpdate with upsert to create or update the resume in one go
    const resume = await CandidateResume.findOneAndUpdate(
      { userId: req.user.id },
      { $set: resumeData },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: "Resume saved successfully", resume });
  } catch (error) {
    console.error("Error saving resume:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    }
    res
      .status(500)
      .json({ message: "Server error while saving resume", error: error.message });
  }
});

// @route   GET /api/resume/me
// @desc    Get the current logged-in user's resume
// @access  Private (Candidate Only)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const resume = await CandidateResume.findOne({ userId: req.user.id });

    if (!resume) {
      // It's not an error if a resume doesn't exist yet
      return res.status(200).json({ message: "No resume found for this user.", resume: null });
    }

    res.status(200).json({ resume });
  } catch (error) {
    console.error("Error fetching resume:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/resume/:id
// @desc    Get a resume by its ID
// @access  Open 
router.get("/:id",  async (req, res) => {
  try {
    const resume = await CandidateResume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    // This route is protected, so only logged-in users can access it.
    // You can add more specific role checks if needed, e.g., for employers.

    res.status(200).json({ resume });
  } catch (error) {
    console.error("Error fetching resume by ID:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid resume ID format." });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
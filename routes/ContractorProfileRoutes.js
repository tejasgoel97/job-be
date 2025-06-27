const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const ContractorProfile = require("../models/ContractorProfile");
const User = require("../models/User");
const Company = require("../models/Company");

// @route   POST /api/contractor-profile
// @desc    Create or update a contractor's profile
// @access  Private (Contractor Only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Ensure the user has the 'contractor' role
    const user = await User.findById(req.user.id).select("role, companyId");
    if (!user || !user.role.includes("contractor")) {
      return res
        .status(403)
        .json({ message: "Forbidden: Only contractors can manage a profile." });
    }

    const profileData = {
      ...req.body,
      userId: req.user.id,
      companyId: user.companyId, // Set the creator to the logged-in user
    };

    // Use findOneAndUpdate with upsert to create or update the profile in one go
    const profile = await ContractorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: profileData },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: "Contractor profile saved successfully", profile });
  } catch (error) {
    console.error("Error saving contractor profile:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    }
    res
      .status(500)
      .json({ message: "Server error while saving profile", error: error.message });
  }
});

// @route   GET /api/contractor-profile/me
// @desc    Get the current logged-in contractor's profile
// @access  Private (Contractor Only)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const contractorProfile = await ContractorProfile.findOne({ userId: req.user.id });

    if (!contractorProfile) {
      return res.status(200).json({ message: "No contractor profile found for this user.", profile: null });
    }

    res.status(200).json({ contractorProfile });
  } catch (error) {
    console.error("Error fetching contractor profile:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/contractor-profile/:id
// @desc    Get a contractor profile by its ID
// @access  Private (for logged-in users like employers)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const contractorProfile = await ContractorProfile.findById(req.params.id)
     if (!contractorProfile) {
      return res.status(404).json({ message: "Contractor profile not found." });
    }
    const contractorUser = await User.findById(contractorProfile.userId)
    const contractorCompany = await Company.findById(contractorUser.companyId)
    let returnData = {...contractorProfile.toObject()}
    if(contractorCompany){
        returnData = {...returnData, companyDetails: contractorCompany}
    }
   

    res.status(200).json({success:true, contractorProfile: returnData });
  } catch (error) {
    console.error("Error fetching contractor profile by ID:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid profile ID format." });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
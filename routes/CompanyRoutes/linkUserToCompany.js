const express = require("express");
const router = express.Router();
const Company = require("../../models/Company");
const User = require("../../models/User");
const { authMiddleware } = require("../../middleware/auth");

// @route   POST /api/company/link-user-to-company
// @desc    Link a user to an existing company by company name
// @access  Private
router.post("/", authMiddleware, async (req, res) => {
  const { companyId } = req.body;
  const userId = req.user.id;

  if (!companyId) {
    return res.status(400).json({ error: "Company name is required" });
  }

  try {
    // Check if user is already linked to a company
    const user = await User.findById(userId);




    // Update the user with the company's ID and set verification status
    await User.findByIdAndUpdate(userId, {
      companyId: companyId,
      companyVerifiedToUser: false,
    });

    // Add user to the company's list of users
    await Company.findByIdAndUpdate(companyId, {
      $addToSet: { companyUsers: userId },
    });

    res.status(200).json({
      success:true,
      message: "Request to join company sent. Waiting for verification.",
      companyId: companyId,
    });
  } catch (error) {
    console.error("Error linking user to company:", error);
    res
      .status(500)
      .json({ error: "Server error while linking user to company" });
  }
});

module.exports = router;
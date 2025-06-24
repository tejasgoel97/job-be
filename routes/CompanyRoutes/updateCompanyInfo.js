const express = require("express");
const router = express.Router();
const Company = require("../../models/Company");
const User = require("../../models/User");
const { authMiddleware } = require("../../middleware/auth");

router.put("/", authMiddleware, async (req, res) => {
  const { infoData, contactData, socialData, expertise } = req.body;

  try {
    // Get the logged-in user and their linked company ID
    const user = await User.findById(req.user.id);
    if (!user || !user.companyId) {
      console.log("No company linked to this user");
      return res.status(404).json({ error: "No company linked to this user" });
    }

    // Ensure that the logged-in user is the creator of the company
    const company = await Company.findOne({
      _id: user.companyId,
      createdBy: req.user.id,
    });

    if (!company) {
      return res
        .status(403)
        .json({ error: "You are not authorized to update this company" });
    }

    // Proceed with update
    company.infoData = infoData;
    company.contactData = contactData;
    company.socialData = socialData;
    company.expertise = expertise || []

    await company.save();

    res.status(200).json({
      message: "Company updated successfully",
      company,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ error: "Failed to update company details" });
  }
});

module.exports = router;

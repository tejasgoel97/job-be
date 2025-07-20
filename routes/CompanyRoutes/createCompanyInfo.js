const express = require("express");
const router = express.Router();

const Company = require("../../models/Company");
const User = require("../../models/User");
const { authMiddleware } = require("../../middleware/auth");

router.post("/", authMiddleware, async (req, res) => {
  const { infoData, contactData, socialData, companyLogo, companyPhotos } = req.body;

  try {
    const newCompany = new Company({
      companyLogo,
      companyPhotos,
      createdBy: req.user.id,
      infoData,
      contactData,
      socialData,
      companyUsers: [req.user.id],
    });

    await newCompany.save();

    // Update the user with the company's _id
    await User.findByIdAndUpdate(req.user.id, {
      companyId: newCompany._id,
    });

    res.status(201).json({
      message: "Company saved successfully",
      companyId: newCompany._id, // returning _id as companyId in response
    });
  } catch (error) {
    console.error("Error saving company:", error);
    res.status(500).json({ error: "Failed to save company details" });
  }
});

module.exports = router;

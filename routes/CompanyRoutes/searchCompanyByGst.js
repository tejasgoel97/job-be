const express = require("express");
const router = express.Router();
const Company = require("../../models/Company");
const { authMiddleware } = require("../../middleware/auth");

// @route   GET /api/company/search-by-gst?gstNo=<gst_number>
// @desc    Search for a company by its GST number
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
  const { gstNo } = req.query;

  if (!gstNo) {
    return res.status(400).json({ error: "GST number is required" });
  }

  try {
    // Find the company by GST number (case-insensitive)
    const company = await Company.findOne({
      "infoData.gstNo": { $regex: new RegExp(`^${gstNo}$`, "i") },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    const companyObj = company.toObject();

    res.status(200).json({
      success: true,
      company: {
        ...companyObj,
        companyId: company._id,
      },
    });
  } catch (error) {
    console.error("Error searching for company by GST:", error);
    res.status(500).json({ error: "Server error while searching for company" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Company = require("../../models/Company");

// GET route to fetch a company by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    res.status(200).json({ success: true, company });
  } catch (error) {
    console.error("Error fetching company by ID:", error);
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: "Invalid company ID format" });
    }
    res.status(500).json({ success: false, message: "Error fetching company details", error });
  }
});

module.exports = router;
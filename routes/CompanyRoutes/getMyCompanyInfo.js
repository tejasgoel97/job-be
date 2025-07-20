const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Company = require("../../models/Company");
const { authMiddleware } = require("../../middleware/auth");

Company;
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Get the user and their company ID
    console.log("getCompanyInfo Route");
    const user = await User.findById(req.user.id);
    console.log(user);
    if (!user || !user.companyId) {
      return res.status(200).json({ success:false, error: "No company linked to this user" });
    }

    const company = await Company.findById(user.companyId);
    if (!company) {
      return res.status(200).json({success:false, error: "Company not found" });
    }
        const companyObj = company.toObject();
// Convert Map to object
if (companyObj.companyPhotos instanceof Map) {
  companyObj.companyPhotos = Object.fromEntries(companyObj.companyPhotos);
}

    res.status(200).json({success:true ,company:{...companyObj,compayVerifiedToUser: user.companyVerifiedToUser,companyId:company._id } });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ error: "Failed to fetch company details" });
  }
});
module.exports = router;

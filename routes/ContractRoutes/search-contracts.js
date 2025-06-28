const express = require("express");
const router = express.Router();
const Contract = require("../../models/Contract");
const Company = require("../../models/Company");

router.get("/", async (req, res) => {
  try {
    const { searchText, locationText, companyText, contractType } = req.query;
    const andConditions = [];

    // Search by text in title and description
    if (searchText) {
      const searchRegex = new RegExp(searchText, "i");
      andConditions.push({
        $or: [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
        ],
      });
    }

    // Search by location
    if (locationText) {
      const locationRegex = new RegExp(locationText, "i");
      andConditions.push({
        $or: [
          { "address.country": { $regex: locationRegex } },
          { "address.city": { $regex: locationRegex } },
          { "address.fullAddress": { $regex: locationRegex } },
        ],
      });
    }

    // Search by company name
    if (companyText) {
      const companyRegex = new RegExp(companyText, "i");
      const companies = await Company.find({
        "infoData.companyName": { $regex: companyRegex },
      })
        .select("_id")
        .lean();
      const companyIds = companies.map((c) => c._id);

      if (companyIds.length === 0) {
        return res.status(200).json({ contracts: [] });
      }
      andConditions.push({ companyId: { $in: companyIds } });
    }

    // Search by contract type
    if (contractType && contractType.toLowerCase() !== "all") {
      const contractTypeRegex = new RegExp(`^${contractType}$`, "i");
      andConditions.push({
        $or: [
          { contractType: contractTypeRegex },
          { "contractTypes.name": contractTypeRegex },
          { "contractTypes.subTypes": contractTypeRegex },
        ],
      });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    const contracts = await Contract.find(query).populate("companyId").sort({ createdAt: -1 }).lean();

    res.status(200).json({ contracts });
  } catch (error) {
    console.error("Error searching contracts:", error);
    res.status(500).json({ message: "Error searching contracts", error: error.message });
  }
});

module.exports = router;
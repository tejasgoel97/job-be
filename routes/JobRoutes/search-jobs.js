// GET route to search for jobs
const express = require("express");
const router = express.Router();
const Job = require("../../models/Job");
const Company = require("../../models/Company");


router.get("/", async (req, res) => {
  try {
    console.log(req.query);

    const { searchText, locationText, companyText, expertise } = req.query;
    const andConditions = [];

    if (searchText) {
      const searchRegex = new RegExp(searchText, "i");
      andConditions.push({
        $or: [
          { title: { $regex: searchRegex } },
          { customJobTitle: { $regex: searchRegex } },
          { department: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { qualification: { $regex: searchRegex } },
        ],
      });
    }

    if (locationText) {
      const locationRegex = new RegExp(locationText, "i");
      andConditions.push({
        $or: [
          { country: { $regex: locationRegex } },
          { city: { $regex: locationRegex } },
          { address: { $regex: locationRegex } },
        ],
      });
    }

    if (companyText) {
      const companyRegex = new RegExp(companyText, "i");
      const companies = await Company.find({
        "infoData.companyName": { $regex: companyRegex },
      })
        .select("_id")
        .lean();
      const companyIds = companies.map((c) => c._id);

      if (companyIds.length === 0) {
        return res.status(200).json({ jobs: [] });
      }
      andConditions.push({ companyId: { $in: companyIds } });
    }

    if (expertise && expertise.toLowerCase() !== "all") {
      const expertiseRegex = new RegExp(`^${expertise}$`, "i");
      andConditions.push({
        $or: [
          { "expertise.category": expertiseRegex },
          { "expertise.subcategories": expertiseRegex },
          { "expertise.processes": expertiseRegex },
        ],
      });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    const jobs = await Job.find(query).populate("companyId").sort({ createdAt: -1 }).lean();

    const results = jobs.map((job) => {
      if (job.companyId) {
        job.companyDetails = job.companyId;
        delete job.companyId;
      }
      return job;
    });

    res.status(200).json({ jobs: results });
  } catch (error) {
    console.error("Error searching jobs:", error);
    res.status(500).json({ message: "Error searching jobs", error: error.message });
  }
});

module.exports = router;
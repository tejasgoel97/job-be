// GET route to search for jobs
const express = require("express");
const router = express.Router();
const Job = require("../../models/Job");
const Company = require("../../models/Company");
const { currencyOptions } = require("./CurrencyOptions");

router.get("/", async (req, res) => {
  try {
    console.log(req.query);

    const {
      searchText,
      locationText,
      companyText,
      expertise,
      jobType,
      datePosted,
      experienceLevel,
      salaryCurrency,
      salaryMin,
      salaryMax,
    } = req.query;
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

    // Job Type filter
    if (jobType && Array.isArray(jobType) && jobType.length > 0) {
      let jobTypes = jobType.map((originalString) => {
        let stringWithSpaces = originalString.replace(/_/g, " ");
        let titleCaseString = stringWithSpaces
          .toLowerCase()
          .split(" ")
          .map(function (word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(" ");
        return titleCaseString;
      });
      andConditions.push({ jobType: { $in: jobTypes } });
    }

    // Date Posted filter
    if (datePosted) {
      const currentDate = new Date();
      let dateFilter;

      switch (datePosted) {
        case "1h":
          dateFilter = new Date(currentDate - 60 * 60 * 1000);
          break;
        case "24h":
          dateFilter = new Date(currentDate - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          dateFilter = new Date(currentDate - 7 * 24 * 60 * 60 * 1000);
          break;
        case "14d":
          dateFilter = new Date(currentDate - 14 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          dateFilter = new Date(currentDate - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      if (dateFilter) {
        andConditions.push({ createdAt: { $gte: dateFilter } });
      }
    }

    // Experience Level filter
    if (experienceLevel) {
      andConditions.push({ minExperience: { $lte: experienceLevel } });
    }

    // Salary filter
    if (salaryMin || salaryMax) {
      const salaryFilter = {};

      if (salaryCurrency && salaryMin) {
        const currency = currencyOptions.find(
          (c) => c.value === salaryCurrency
        );
        if (currency) {
          const salaryMinINR = Number(salaryMin) * currency.rateToINR;
          salaryFilter["fromSalaryINR"] = { $gte: salaryMinINR };
        }
      }

      if (salaryCurrency && salaryMax) {
        const currency = currencyOptions.find(
          (c) => c.value === salaryCurrency
        );
        if (currency) {
          const salaryMaxINR = Number(salaryMax) * currency.rateToINR;
          salaryFilter["toSalaryINR"] = { $lte: salaryMaxINR };
        }
      }

      if (Object.keys(salaryFilter).length > 0) {
        andConditions.push(salaryFilter);
      }
    }
    console.log("AND Conditions:", andConditions);
    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    const jobs = await Job.find(query)
      .populate("companyId")
      .sort({ createdAt: -1 })
      .lean();

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
    res
      .status(500)
      .json({ message: "Error searching jobs", error: error.message });
  }
});

module.exports = router;

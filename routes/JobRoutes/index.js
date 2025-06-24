const express = require("express");
const router = express.Router();
const Job = require("../../models/Job");
const { authMiddleware } = require("../../middleware/auth");
const myJobsRouter = require("./my-jobs");
const updateJobRouter = require("./update-job");
const User = require("../../models/User");
const Company = require("../../models/Company");

// POST route to create a new job
router.post("/create-job", authMiddleware, async (req, res) => {
  console.log("in crete Job");
  try {
    const jobData = req.body;
    console.log(jobData);
    console.log("CreatedBy", req.id);
    // find the user in the Db and get the field companyId and store it her

    const user = await User.findById(req.user.id);
    if (!user || !user.companyId) {
      return res.status(404).json({ error: "No company linked to this user" });
    }
    const companyId = user.companyId;
    console.log("Company ID => ", companyId);

    const newJob = new Job({
      ...jobData,
      createdBy: req.user.id,
      companyId: companyId,
    });
    await newJob.save();
    res.status(201).json({ message: "Job posted successfully", job: newJob });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error posting job", error });
  }
});
router.use("/my-jobs", myJobsRouter);
router.use("/update-job", updateJobRouter);

// GET route to fetch a job by ID
router.get("/get-job/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching job with ID:", id);

    const jobDoc = await Job.findById(id);
    if (!jobDoc) {
      return res.status(404).json({ message: "Job not found" });
    }

    const job = jobDoc.toObject(); // Convert to plain object
    const companyId = job.companyId;
    console.log("Company ID => ", companyId);
    const companyDetails = await Company.findById(companyId);
    console.log(companyDetails )
    if (!companyDetails) {
      return res.status(404).json({ message: "Company not found" });
    }
    let retunObj = {...job, companyDetails}
    job.companyDetails = companyDetails;

    console.log("Job with company details:", retunObj);
    res.status(200).json({ job:retunObj });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Error fetching job", error });
  }
});

module.exports = router;

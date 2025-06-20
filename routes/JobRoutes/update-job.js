const express = require("express");

const router = express.Router();

const { authMiddleware } = require("../../middleware/auth");
const Job = require("../../models/Job");

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    console.log("Updating job ID:", id);
    console.log("Updated Data:", updatedData);

    const updatedJob = await Job.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res
      .status(200)
      .json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Error updating job", error });
  }
});
module.exports = router;

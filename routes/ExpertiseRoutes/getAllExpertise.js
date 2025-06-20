const express = require("express");
const router = express.Router();
// const ExpertiseMaster = require("../../models/ExpertiseMaster");

router.get("/", async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      _id: "662a1234bca9d51f7b4a8ef2",
      createdAt: "2025-04-25T05:30:00.000Z",
      expertiseList: [
        {
          name: "Ferrous",
          subCategory: [
            { name: "SS" },
            { name: "MS foundry" },
            { name: "SG/CI foundry" },
            { name: "ADI" },
            { name: "Alloy steel" },
            { name: "Others" },
          ],
          keyProcesses: [
            { name: "Green Sand Molding" },
            { name: "Centrifugal casting" },
            { name: "No bake process" },
            { name: "CO2 Molding" },
            { name: "Vacuum Molding" },
            { name: "Shell Molding" },
            { name: "Sweep Molding" },
            { name: "Wax Molding" },
            { name: "Loss Foam Molding" },
            { name: "Other" },
          ],
          _id: "662a1234bca9d51f7b4a8ef3",
        },
        {
          name: "Non Ferrous",
          subCategory: [
            { name: "Aluminum" },
            { name: "Copper" },
            { name: "Brass" },
            { name: "Gun Metal" },
            { name: "Others" },
          ],
          keyProcesses: [
            { name: "High Pressure Die Casting" },
            { name: "Low Pressure Die Casting" },
            { name: "Gravity Die Casting" },
            { name: "Sand Casting Process" },
            { name: "Other" },
          ],
          _id: "662a1234bca9d51f7b4a8ef4",
        },
      ],
    },
  });
  try {
    const latest = await ExpertiseMaster.findOne()
      .sort({ createdAt: -1 })
      .lean();
    if (!latest)
      return res.status(404).json({ error: "No expertise data found" });
    res.json(latest.expertiseList);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expertise", details: err });
  }
});

module.exports = router;

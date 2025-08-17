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
        { name: "Others" }
      ],
      keyProcesses: [
        { name: "Green Sand Molding" },
        { name: "Centrifugal casting" },
        { name: "No bake process" },
        { name: "Co2 Molding" },
        { name: "Vaccum Molding" },
        { name: "Shell Molding" },
        { name: "Sweep Molding" },
        { name: "Wax Molding" },
        { name: "Loss Foam Molding" },
        { name: "Other" }
      ],
      _id: "662a1234bca9d51f7b4a8ef3",
    },
    {
      name: "Non Ferrous",
      subCategory: [
        { name: "Aluminum" },
        { name: "Cooper" },
        { name: "Brass" },
        { name: "Gun Metal" },
        { name: "Others" }
      ],
      keyProcesses: [
        { name: "High Pressure Die Casting" },
        { name: "Low Pressure Die Casting" },
        { name: "Gravity Die Casting" },
        { name: "Sand Casting Process" },
        { name: "Other" }
      ],
      _id: "662a1234bca9d51f7b4a8ef4",
    },
    {
      name: "Alloys",
      subCategory: [
        { name: "Ferro Magnese" },
        { name: "Ferro Chromium" },
        { name: "Ferro Silicon" },
        { name: "SilicoMagnese" },
        { name: "FeSiMg" },
        { name: "Inoculant" },
        { name: "Refractories" },
        { name: "Cut wire" },
        { name: "Steel Shot" }
      ],
      keyProcesses: [
        { name: "Arc Furnace" },
        { name: "Induction Furnace" },
        { name: "Vaccum Furnace" },
        { name: "Electric Furnace" },
        { name: "Oil Fired Furnace" },
        { name: "Gas Fired Furnace" },
        { name: "Others" }
      ],
      _id: "662a1234bca9d51f7b4a8ef5",
    },
    {
      name: "Raw Material",
      subCategory: [
        { name: "CRCA" },
        { name: "MS scrap" },
        { name: "Cooper" },
        { name: "Tin" },
        { name: "Lead" },
        { name: "Aluminium" },
        { name: "Zinc" }
      ],
      keyProcesses: [
        { name: "Arc Furnace" },
        { name: "Induction Furnace" },
        { name: "Vaccum Furnace" },
        { name: "Electric Furnace" },
        { name: "Oil Fired Furnace" },
        { name: "Gas Fired Furnace" },
        { name: "Others" }
      ],
      _id: "662a1234bca9d51f7b4a8ef6",
    },
    {
      name: "Machine Manufacturer",
      subCategory: [
        { name: "Please specify M/C Name (Multiple M/C allowed)" },
        { name: "Please specify M/C Type" },
        { name: "Please specify M/C uses" },
        { name: "Other" }
      ],
      keyProcesses: [],
      _id: "662a1234bca9d51f7b4a8ef7",
    },
    {
      name: "Machining Operation",
      subCategory: [
        { name: "Type Of Machine experties" },
        { name: "Other" }
      ],
      keyProcesses: [],
      _id: "662a1234bca9d51f7b4a8ef8",
    }
]
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

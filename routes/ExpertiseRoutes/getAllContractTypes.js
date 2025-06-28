const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  return res.status(200).json({
    success: true,

      contractType: [
        {
          name: "Man power Supply",
          subTypes: [
            "Melt shop",
            "Mold Shop",
            "Core Shop",
            "Sand Plant",
            "SMS",
            "Fettling",
            "Dispatch",
            "Quality",
            "All Area's",
            "Other please specify",
          ],
        },
        {
          name: "Job Work/Piece Rate",
          subTypes: [
            "Melt shop",
            "Mold Shop",
            "Core Shop",
            "Sand Plant",
            "SMS",
            "Fettling",
            "Dispatch",
            "Quality",
            "All Area's",
            "Other please specify",
          ],
        },
        {
          name: "Project",
          subTypes: [
            "Civil",
            "Mechanical work",
            "Fabrication",
            "Errision",
            "Electrical",
            "Electronics",
            
          ],
        },
        {
          name: "Civil",
          subTypes: [
            "Structure design",
            "Load calculation & devidation",
            "RCC & PCC",
            "Construction",
            "Structural",
            
          ],
        },
        {
          name: "Mechanical work",
          subTypes: [
            "Welding",
            "Structural",
          ],
        },
        {
          name: "Electrical and electronics",
          subTypes: [
            "Cabeling",
            "Wiring",
            "Panel Fitting",
            "HT yard",
            "Transformer",
            "CT PT work",
            
          ],
        },
        {
          name: "IT",
          subTypes: [
            "Camera",
            "Laptop/Desktop",
            "ERP/SAP/Telly/Busy",
            "LAN/WAN",
            "Companies Special portal",
            
          ],
        },
      ],
    },
  );

  // Future dynamic fetch (disabled in mock):
  /*
  try {
    const latest = await ContractorType.findOne().sort({ createdAt: -1 }).lean();
    if (!latest)
      return res.status(404).json({ error: "No contractorType data found" });
    res.json(latest.contractorType);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contractorType", details: err });
  }
  */
});

module.exports = router;

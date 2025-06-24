const express = require("express");
const router = express.Router();
const Contract = require("../../models/Contract");
const { authMiddleware } = require("../../middleware/auth");
const User = require("../../models/User");
const Company = require("../../models/Company");
const myContractsRouter = require("./my-contracts");
const updateContractRouter = require("./update-contract");

// POST route to create a new contract
router.post("/create-contract", authMiddleware, async (req, res) => {
  try {
    const contractData = req.body;

    // Fetch user to check role and companyId
    const user = await User.findById(req.user.id).select("companyId role");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure user has a role that can create contracts
    if (!user.role.includes("employer") && !user.role.includes("contractor")) {
      return res.status(403).json({ error: "User does not have permission to create contracts." });
    } else if (!user.companyId) {
      return res.status(404).json({ error: "No company linked to this user" });
    }

    const newContract = new Contract({
      ...contractData,
      createdBy: req.user.id,
      companyId: user.companyId,
    });

    await newContract.save();
    res
      .status(201)
      .json({ message: "Contract posted successfully", contract: newContract });
  } catch (error) {
    console.error("Error posting contract:", error);
    // Handle Mongoose validation errors specifically
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    }
    res
      .status(500)
      .json({ message: "Error posting contract", error: error.message });
  }
});

// GET route to fetch a contract by ID
router.get("/get-contract/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Use .populate() to fetch the contract and its associated company in one query
    const contract = await Contract.findById(id).populate("companyId");

    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const contractObject = contract.toObject();
    contractObject.companyDetails = contractObject.companyId;
    delete contractObject.companyId;

    res.status(200).json({ contract: contractObject });
  } catch (error) {
    console.error("Error fetching contract:", error);
    res.status(500).json({ message: "Error fetching contract", error: error.message });
  }
});

router.use("/my-contracts", myContractsRouter);
router.use("/update-contract", updateContractRouter);

module.exports = router;
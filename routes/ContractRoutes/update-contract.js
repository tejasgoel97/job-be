const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middleware/auth");
const Contract = require("../../models/Contract");

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Find the contract by its ID and the user who created it, then update it.
    // This ensures that users can only update their own contracts.
    const updatedContract = await Contract.findOneAndUpdate(
      { _id: id, createdBy: req.user.id }, // Security check
      updatedData,
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedContract) {
      // If no contract is found, it's either a wrong ID or the user doesn't have permission.
      return res.status(404).json({ message: "Contract not found or user not authorized to update." });
    }

    res
      .status(200)
      .json({ message: "Contract updated successfully", contract: updatedContract });
  } catch (error) {
    console.error("Error updating contract:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ message: "Error updating contract", error: error.message });
  }
});

module.exports = router;
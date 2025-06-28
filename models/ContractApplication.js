const mongoose = require("mongoose");

const ContractApplicationSchema = new mongoose.Schema(
  {
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contractorProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "ContractorProfile", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    contractCreatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Notes and Metadata
    applyingMessageByContractor: { type: String },
    proposedRateByContractor:{type:String},
    notesByEmployer: { type: String },
    currentStatus: {
      type: String,
      enum: ["applied", "viewed", "shortlisted", "negotiating", "awarded", "rejected", "withdrawn"],
      default: "applied",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model(
  "ContractApplication",
  ContractApplicationSchema
);
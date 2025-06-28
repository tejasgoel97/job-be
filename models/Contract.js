const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Contract title is required."],
    },
    description: {
      type: String,
      required: [true, "Contract description is required."],
    },
    experience: {
      type: String,
      required: [true, "Experience is required."],
    },
    contractType: {
      type: String,
      required: [true, "Contract type is required."],
    },
    contractTypes: {
      type: [
        {
          name: { type: String, required: true },
          subTypes: [{ type: String }],
        },
      ],
      default: [],
    },
    address: {
      country: { type: String },
      city: { type: String },
      fullAddress: { type: String },
    },
    facilities: {
      canteen: { type: Boolean, default: false },
      accommodation: { type: Boolean, default: false },
      transportation: { type: Boolean, default: false },
      ppes: { type: Boolean, default: false },
      dress: { type: Boolean, default: false },
      medicalInsurance: { type: Boolean, default: false },
      others: [{ type: String }],
    },
    email: {
      type: String,
      required: [true, "Contact email is required."],
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;
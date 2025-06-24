const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  companyUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  infoData: {
    companyName: { type: String, required: true },
    aboutCompany: { type: String },
    gstNo: { type: String },
    contactPerson: { type: String },
    contactNumber: { type: String },
    email: { type: String },
    otherDetails: { type: String },
    factoryLicenseNo: { type: String },
    typeOfCasting: [String],
    manufacturingCapacity: { type: String },
    yearOfEstablishment: { type: String },
    isoCertifications: { type: String },
    keyProducts: { type: String },
    website: { type: String },
  },
  contactData: {
    country: { type: String, default: "India" },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pinCode: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    googleMapLink: { type: String },
  },

  // Social data remains the same
  socialData: {
    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    instagram: { type: String },
  },

  // 🔐 Admin verification fields
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  verificationNotes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
    expertise: {
    type: [
      {
        category: { type: String },
        subcategories: { type: [String], default: [] },
        processes: { type: [String], default: [] },
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("Company", companySchema);

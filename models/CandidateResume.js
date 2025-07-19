const mongoose = require("mongoose");

// Expertise Schema
const expertiseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subcategories: [{ type: String }],
  processes: [{ type: String }]
}, { _id: false });

// Education Schema
const educationSchema = new mongoose.Schema({
  degreeType: { type: String },
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  region: { type: String },
  country: { type: String },
  fromYear: { type: String },
  toYear: { type: String },
  marks: { type: String },
  cgpa: { type: String },
  description: { type: String },
  editing: { type: Boolean },
  id: { type: Number }
}, { _id: false });

// Experience Schema
const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  region: { type: String },
  country: { type: String },
  fromMonth: { type: String },
  fromYear: { type: String },
  toMonth: { type: String },
  toYear: { type: String },
  achievements: [{ type: String }],
  responsibilities: [{ type: String }],
  editing: { type: Boolean },
  id: { type: Number }
}, { _id: false });

// Award Schema (kept as-is)
const awardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fromYear: { type: String },
  toYear: { type: String },
  description: { type: String },
}, { _id: false });

const candidateResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // A user should have only one resume
    },
    firstName: { type: String },
    lastName: { type: String },
     cvFileURL: { type: String },
    profileImageURL: { type: String },

    name: { type: String },
    description: { type: String, required: true },
    age: { type: String },
    totalExperienceYears: { type: String },
    totalExperienceMonths: { type: String },
    currentlyWorking: { type: Boolean, default: false },
    currentSalary: { type: String },
    expectedSalary: { type: String },
    currentSalaryCurrency: { type: String },
    expectedSalaryCurrency: { type: String },
    languages: [{ type: String }],
    education: [educationSchema],
    experiences: [experienceSchema],
    awards: [awardSchema],
    expertise: [expertiseSchema],
    contactInfo: {
      phoneNumber: { type: String },
      email: {
        type: String,
        required: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"],
      },
      country: { type: String },
      state: { type: String },
      pinCode: { type: String },
      city: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
    },
    socialNetworks: {
      facebook: { type: String },
      x: { type: String },
      linkedin: { type: String },
      instagram: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CandidateResume", candidateResumeSchema);

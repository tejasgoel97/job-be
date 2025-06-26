const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  fromYear: { type: String },
  toYear: { type: String },
  description: { type: String },
});

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  fromYear: { type: String },
  toYear: { type: String },
  description: { type: String },
});

const awardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fromYear: { type: String },
  toYear: { type: String },
  description: { type: String },
});

const candidateResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // A user should have only one resume
    },
    currentDesignation:{type: String, default:"Software Engineer"},
    portfolioFile: { type: String }, // URL to the uploaded file
    description: { type: String, required: true },
    age: { type: String },
    totalExperienceYears: { type: String },
    totalExperienceMonths: { type: String },
    currentlyWorking: { type: Boolean, default: false },
    currentSalary: { type: String },
    expectedSalary: { type: String },
    education: [educationSchema],
    experiences: [experienceSchema],
    awards: [awardSchema],
    skills: [{ type: String }],
    languages: [{ type: String }],
    contactInfo: {
      phoneNumber: { type: String },
      email: {
        type: String,
        required: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"],
      },
      country: { type: String, default: "India" },
      state: { type: String },
      city: { type: String },
      completeAddress: { type: String },
      googleMapLink: { type: String },
    },
    socialNetworks: {
      facebook: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
      googlePlus: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CandidateResume", candidateResumeSchema);
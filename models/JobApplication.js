const mongoose = require("mongoose");

const JobApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    candidateResumeId: { type: mongoose.Schema.Types.ObjectId, ref: "CandidateResume", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    jobCreatorEmployerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Notes and Metadata
    applyingMessageByCandidate: { type: String },
    notesByEmployer: { type: String },
    currentStatus: {
      type: String,
      enum: ["applied", "hold", "shortlisted", "interviewed", "offered", "hired", "rejected", "withdrawn"],
      default: "applied",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("JobApplication", JobApplicationSchema);

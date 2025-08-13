const mongoose = require("mongoose");

const JobApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    candidateResumeId: { type: mongoose.Schema.Types.ObjectId, ref: "CandidateResume", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    jobCreatorEmployerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

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

// Compound indexes for common query patterns
JobApplicationSchema.index({ jobCreatorEmployerId: 1, currentStatus: 1 }); // For querying applications by employer and status
JobApplicationSchema.index({ candidateId: 1, currentStatus: 1 }); // For querying applications by candidate and status
JobApplicationSchema.index({ jobId: 1, currentStatus: 1 }); // For querying applications by job and status

module.exports = mongoose.model("JobApplication", JobApplicationSchema);

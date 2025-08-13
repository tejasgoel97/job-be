const mongoose = require("mongoose");

const CandidateAlertSchema = new mongoose.Schema(
  {
    candidateId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true // Index for faster lookup of alerts by candidate
    },
    alertType: { 
      type: String, 
      enum: ["NewJob", "ApplicationStatusChange"], 
      required: true 
    },
    jobId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Job", 
      required: true 
    },
    jobCreatorEmployerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    changedStatus: { 
      type: String,
      default: null
    },
    jobTitle: { 
      type: String, 
      required: true 
    },
    jobDepartment: { 
      type: String, 
    //   required: true 
    },
    jobLocation: { 
      type: String,
    //   required: true
    },
    companyName: { 
      type: String, 
    //   required: true 
    },
    companyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Company", 
      required: true 
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for common query patterns
CandidateAlertSchema.index({ candidateId: 1, createdAt: -1 }); // For fetching recent alerts by candidate
CandidateAlertSchema.index({ candidateId: 1, isRead: 1 }); // For fetching unread alerts
CandidateAlertSchema.index({ jobId: 1, alertType: 1 }); // For querying alerts by job and type

module.exports = mongoose.model("CandidateAlert", CandidateAlertSchema);

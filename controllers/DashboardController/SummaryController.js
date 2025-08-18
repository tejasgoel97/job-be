const Job = require("../../models/Job");
const JobApplication = require("../../models/JobApplication");
const Contract = require("../../models/Contract");
const ContractApplication = require("../../models/ContractApplication");
const CandidateAlert = require("../../models/CandidateAlert");
const CandidateResume = require("../../models/CandidateResume");
const PageViewHour = require("../../models/PageViewHour");

const getEmployerSummary = async (req, res) => {
  try {
    const employerId = req.user._id; // Get the logged-in employer's ID

    // Jobs Statistics
    const totalJobsPosted = await Job.countDocuments({ createdBy: employerId });
    const totalJobApplications = await JobApplication.countDocuments({
      jobCreatorEmployerId: employerId,
    });
    const totalJobsShortlisted = await JobApplication.countDocuments({
      jobCreatorEmployerId: employerId,
      currentStatus: "shortlisted",
    });

    // Contracts Statistics
    const totalContractsPosted = await Contract.countDocuments({
      createdBy: employerId,
    });
    const totalContractApplications = await ContractApplication.countDocuments({
      contractCreatorId: employerId,
    });
    const totalContractsShortlisted = await ContractApplication.countDocuments({
      contractCreatorId: employerId,
      currentStatus: "shortlisted",
    });

    return res.status(200).json({
      success: true,
      data: {
        jobs: {
          totalPosted: totalJobsPosted,
          totalApplications: totalJobApplications,
          totalShortlisted: totalJobsShortlisted,
        },
        contracts: {
          totalPosted: totalContractsPosted,
          totalApplications: totalContractApplications,
          totalShortlisted: totalContractsShortlisted,
        },
      },
    });
  } catch (error) {
    console.error("Employer Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching employer summary",
      error: error.message,
    });
  }
};

const getCandidateSummary = async (req, res) => {
  try {
    const candidateId = req.user.id; // Get the logged-in candidate's ID

    const resume = await CandidateResume.findOne({ userId: candidateId });
    const resumeId = resume ? resume._id : null;
    console.log("Resume ID:", resumeId);
    // Jobs Statistics
    const totalJobsApplied = await JobApplication.countDocuments({
      candidateId,
    });
    const totalJobsShortlisted = await JobApplication.countDocuments({
      candidateId,
      currentStatus: "shortlisted",
    });
    const totalJobAlerts = await CandidateAlert.countDocuments({
      candidateId,
      alertType: "NewJob",
    });

    const totalProfileViews = await PageViewHour.countDocuments({
      pageId: resumeId,
      pageType: "candidate",
    });

    return res.status(200).json({
      success: true,
      summaryData: {
        totalApplied: totalJobsApplied,
        totalShortlisted: totalJobsShortlisted,
        totalAlerts: totalJobAlerts,
        totalProfileViews,
      },
    });
  } catch (error) {
    console.error("Candidate Summary Error:");
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching candidate summary",
      error: error.message,
    });
  }
};

module.exports = {
  getEmployerSummary,
  getCandidateSummary
};

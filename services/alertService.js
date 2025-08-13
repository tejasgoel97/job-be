const CandidateAlert = require("../models/CandidateAlert");
const User = require("../models/User");
const Company = require("../models/Company");
const Job = require("../models/Job");
const EmailServices = require("./emailService");
const { alertEmitter, EVENT_TYPES } = require('./eventService');

// Initialize alert listeners
const initializeAlertListeners = () => {
    // Listen for new job events
    alertEmitter.on(EVENT_TYPES.NEW_JOB, async ({ job, company }) => {
        try {
            // Process in background
            setImmediate(async () => {
                const candidates = await User.find({ role: "candidate" });
                    const jobTitle = job.title !== 'Other' ? job.title : job.customJobTitle;
                for (const candidate of candidates) {
                    // Create alert
                    await CandidateAlert.create({
                        candidateId: candidate._id,
                        alertType: "NewJob",
                        jobId: job._id,
                        jobCreatorEmployerId: job.createdBy,
                        jobTitle: jobTitle,
                        jobDepartment: job.department,
                        jobLocation: `${job.city}, ${job.country}`,
                        companyName: company.infoData.companyName,
                        companyId: company._id
                    });

                    // Send email notification
                    try {
                        await EmailServices.sendNewJobAlert(candidate.email, {
                            jobId: job._id,
                            title: jobTitle,
                            companyName: company.infoData.companyName,
                            department: job.department,
                            jobLocation: `${job.city}, ${job.country}`,
                            salaryFrom: job.salaryFrom,
                            salaryTo: job.salaryTo,
                            salaryCurrency: job.salaryCurrency
                        });
                    } catch (emailError) {
                        console.error("Failed to send email notification:", emailError);
                    }
                }
            });
        } catch (error) {
            console.error("Error processing new job alert:", error);
        }
    });

    // Listen for status change events
    alertEmitter.on(EVENT_TYPES.STATUS_CHANGE, async ({ jobApplication, job, company }) => {
        const jobTitle = job.title !== 'Other' ? job.title : job.customJobTitle;

        try {
            // Process in background
            setImmediate(async () => {
                // Create alert
                await CandidateAlert.create({
                    candidateId: jobApplication.candidateId,
                    alertType: "ApplicationStatusChange",
                    jobId: job._id,
                    jobCreatorEmployerId: job.createdBy,
                    changedStatus: jobApplication.currentStatus,
                    jobTitle: jobTitle,
                    jobDepartment: job.department,
                    jobLocation: `${job.city}, ${job.country}`,
                    companyName: company.infoData.companyName,
                    companyId: company._id
                });

                // Get candidate email
                const candidate = await User.findById(jobApplication.candidateId);
                if (candidate && candidate.email) {
                    try {
                        await EmailServices.sendStatusChangeAlert(candidate.email, {
                            jobId: job._id,
                            jobTitle: jobTitle,
                            companyName: company.infoData.companyName,
                            jobDepartment: job.department,
                            changedStatus: jobApplication.currentStatus
                        });
                    } catch (emailError) {
                        console.error("Failed to send status change email notification:", emailError);
                    }
                }
            });
        } catch (error) {
            console.error("Error processing status change alert:", error);
        }
    });
};

// Helper functions to emit events
const emitNewJobAlert = (job, company) => {
    alertEmitter.emit(EVENT_TYPES.NEW_JOB, { job, company });
};

const emitStatusChangeAlert = (jobApplication, job, company) => {
    alertEmitter.emit(EVENT_TYPES.STATUS_CHANGE, { jobApplication, job, company });
};

module.exports = {
    initializeAlertListeners,
    emitNewJobAlert,
    emitStatusChangeAlert
};

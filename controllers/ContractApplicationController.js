const ContractApplication = require("../models/ContractApplication");
const Contract = require("../models/Contract");
const ContractorProfile = require("../models/ContractorProfile");
const User = require("../models/User");

// @desc    Apply to a contract
// @route   POST /api/contract-application
// @access  Private (Contractor)
exports.applyToContract = async (req, res) => {
  try {
    const contractorId = req.user.id; // Assumes auth middleware sets req.user
    const { contractId, applyingMessageByContractor, proposedRateByContractor } = req.body;

    // 1. Check if the user is a contractor
    const user = await User.findById(contractorId);
    if (!user || !user.role.includes("contractor")) {
      return res.status(403).json({ msg: "Access denied. Only contractors can apply." });
    }

    // 2. Find the contract to ensure it exists
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ msg: "Contract not found" });
    }

    // 3. Find the contractor's profile
    const contractorProfile = await ContractorProfile.findOne({ userId: contractorId });
    if (!contractorProfile) {
      return res.status(404).json({ msg: "Contractor profile not found. Please create one before applying." });
    }

    // 4. Check if already applied
    const existingApplication = await ContractApplication.findOne({ contractId, contractorId });
    if (existingApplication) {
      return res.status(400).json({ msg: "You have already applied for this contract" });
    }

    // 5. Create new application
    const newApplication = new ContractApplication({
      contractId,
      contractorId,
      contractorProfileId: contractorProfile._id,
      companyId: contract.companyId,
      contractCreatorId: contract.createdBy,
      applyingMessageByContractor,
      proposedRateByContractor  
    });

    await newApplication.save();

    res.status(201).json({ success: true, msg: "Application submitted successfully", application: newApplication });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get all applications for a specific contract
// @route   GET /api/contract-application/contract/:contractId
// @access  Private (Employer)
exports.getApplicationsForContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) {
      return res.status(404).json({ msg: "Contract not found" });
    }

    // Ensure the logged-in user is the one who created the contract
    if (contract.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: "User not authorized to view these applications" });
    }

    const applications = await ContractApplication.find({ contractId: req.params.contractId })
      .populate({
        path: "contractorId",
        select: "firstName lastName email",
      })
      .populate("contractorProfileId");

    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get all applications by the logged-in contractor
// @route   GET /api/contract-application/my-applications
// @access  Private (Contractor)
exports.getContractorApplications = async (req, res) => {
  try {
    const applications = await ContractApplication.find({ contractorId: req.user.id })
      .populate({
        path: "contractId",
      })
      .populate({
        path: "companyId",
        select: "infoData.companyName",
      });

    res.json({success: true, applications});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Update application status (by employer)
// @route   PUT /api/contract-application/:id
// @access  Private (Employer)
exports.updateApplicationStatus = async (req, res) => {
  const { currentStatus, notesByEmployer } = req.body;

  try {
    let application = await ContractApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // Ensure the logged-in user is the one who created the contract
    if (application.contractCreatorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "User not authorized to update this application" });
    }

    application = await ContractApplication.findByIdAndUpdate(req.params.id, { $set: { currentStatus, notesByEmployer } }, { new: true });

    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Withdraw an application (by contractor)
// @route   PUT /api/contract-application/withdraw/:id
// @access  Private (Contractor)
exports.withdrawApplication = async (req, res) => {
  try {
    let application = await ContractApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ msg: "Application not found" });
    }

    // Ensure the logged-in user is the applicant
    if (application.contractorId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "User not authorized to withdraw this application" });
    }

    // Instead of deleting, we update the status to 'withdrawn'
    application.currentStatus = "withdrawn";
    await application.save();

    res.json({ msg: "Application successfully withdrawn", application });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Check if the current user has applied for a specific contract
// @route   GET /api/contract-application/check-applied/:contractId
// @access  Private (Contractor)
exports.checkIfApplied = async (req, res) => {
  try {
    const { contractId } = req.params;
    const contractorId = req.user.id;

    const application = await ContractApplication.findOne({ contractId, contractorId });

    res.status(200).json({ success: true, applied: !!application, application });
  } catch (error) {
    console.error("Error checking contract application status:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid Contract ID format" });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc    Get all applications received by the logged-in employer
// @route   GET /api/contract-application/received-applications
// @access  Private (Employer)
exports.getReceivedApplications = async (req, res) => {
  try {
    const contractCreatorId = req.user.id;
    const applications = await ContractApplication.find({ contractCreatorId })
      .populate({ path: "contractId", select: "title" })
      .populate({ path: "contractorId", select: "firstName lastName email" })
      .populate("contractorProfileId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, applications });
  } catch (err) {
    console.error("Error fetching received applications:", err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get all applications for a specific contract ID (for employer)
// @route   GET /api/contract-application/received-applications-for-contract/:contractId
// @access  Private (Employer)
exports.getReceivedApplicationsForContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const contractCreatorId = req.user.id;

    // Verify the contract was posted by this employer to ensure authorization
    const contract = await Contract.findOne({ _id: contractId, createdBy: contractCreatorId });
    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found or you do not have permission to view its applications." });
    }

    const applications = await ContractApplication.find({ contractId })
      .populate({ path: "contractorId", select: "firstName lastName email" })
      .populate("contractorProfileId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Error fetching applications for a specific contract:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid Contract ID format" });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
};
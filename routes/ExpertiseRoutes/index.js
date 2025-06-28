const express = require("express");
const router = express.Router();

const getAllExpertise = require("./getAllExpertise");
const getAllContractTypes = require("./getAllContractTypes");

// Route GET and POST to same path
router.use("/get-all-expertise", getAllExpertise);

router.use('/get-contract-type', getAllContractTypes)

module.exports = router;

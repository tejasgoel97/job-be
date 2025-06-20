const express = require("express");
const router = express.Router();

const getAllExpertise = require("./getAllExpertise");

// Route GET and POST to same path
router.use("/get-all-expertise", getAllExpertise);

module.exports = router;

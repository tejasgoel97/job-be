const express = require("express");
const router = express.Router();

const getMyCompanyInfoRouter = require("./getMyCompanyInfo");
const updateCompanyInfoRouter = require("./updateCompanyInfo");
const createCompanyInfoRouter = require("./createCompanyInfo");

router.use("/get-my-company-info", getMyCompanyInfoRouter);
router.use("/update-company-info", updateCompanyInfoRouter);
router.use("/create-company-info", createCompanyInfoRouter);

module.exports = router;

const express = require("express");
const router = express.Router();

const getMyCompanyInfoRouter = require("./getMyCompanyInfo");
const updateCompanyInfoRouter = require("./updateCompanyInfo");
const createCompanyInfoRouter = require("./createCompanyInfo");
const linkUserToCompanyRouter = require("./linkUserToCompany");
const searchCompanyByGstRouter = require("./searchCompanyByGst");
const getCompanyByIdRouter = require("./getCompanyById");

router.use("/get-my-company-info", getMyCompanyInfoRouter);
router.use("/update-company-info", updateCompanyInfoRouter);
router.use("/create-company-info", createCompanyInfoRouter);
router.use("/link-user-to-company", linkUserToCompanyRouter);
router.use("/search-by-gst", searchCompanyByGstRouter);
router.use("/get-by-id", getCompanyByIdRouter);

module.exports = router;

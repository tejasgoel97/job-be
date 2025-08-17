const express = require('express');
const router = express.Router();
const { getJobsByExpertise } = require('../controllers/MainPageController');

// Route to get jobs grouped by expertise with counts
router.get('/jobs-by-expertise', getJobsByExpertise);

module.exports = router;

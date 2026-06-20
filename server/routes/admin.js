const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getOverview,
  getScoreDistribution,
  getDailyTrend,
  getCompanyPopularity,
  getDomainPopularity,
  getTopStudents,
  getRecruiterActivity
} = require('../controllers/adminController');

router.use(protect);

router.get('/overview', getOverview);
router.get('/score-distribution', getScoreDistribution);
router.get('/daily-trend', getDailyTrend);
router.get('/company-popularity', getCompanyPopularity);
router.get('/domain-popularity', getDomainPopularity);
router.get('/top-students', getTopStudents);
router.get('/recruiter-activity', getRecruiterActivity);

module.exports = router;
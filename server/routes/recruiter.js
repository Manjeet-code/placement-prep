const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getAllStudents,
  getStudentDetail,
  shortlistStudent,
  getShortlisted
} = require('../controllers/recruiterController');

router.use(protect);

router.get('/students', getAllStudents);
router.get('/students/:id', getStudentDetail);
router.post('/shortlist/:studentId', shortlistStudent);
router.get('/shortlisted', getShortlisted);

module.exports = router;
const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  startInterview,
  sendMessage,
  endInterview,
  getMyInterviews,
  getInterview
} = require('../controllers/interviewController');

router.use(protect); // all routes require login


router.post('/start', startInterview);
router.post('/message', sendMessage);
router.post('/end', endInterview);
router.get('/my', getMyInterviews);
router.get('/:id', getInterview);

module.exports = router;
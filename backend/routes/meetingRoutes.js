const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', meetingController.logMeeting);
router.get('/', meetingController.getMeetings);

module.exports = router;

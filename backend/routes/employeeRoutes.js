const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { startSession, endSession, startBreak, endBreak, applyLeave, logMeeting, getMyData } = require('../controllers/employeeController');

// All employee routes require authentication
router.use(verifyToken);

// Standard Employee Routes
router.post('/session/start', startSession);
router.post('/session/end', endSession);
router.post('/break/start', startBreak);
router.post('/break/end', endBreak);
router.post('/leave/apply', applyLeave);
router.post('/meeting/log', logMeeting);
router.get('/my-data', getMyData);

module.exports = router;

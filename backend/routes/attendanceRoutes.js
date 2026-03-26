const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getMyHistory, getAllAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Employee dashboard pulse: check current status for today
router.get('/me', getMyAttendance);

// Personnel operational history (scoped by individual identity from JWT)
router.get('/history', getMyHistory);

// Organizational pulse monitoring (Admin/HR Tiers)
router.get('/all', authorize(['Admin', 'HR']), getAllAttendance);

// Arrival event
router.post('/checkin', checkIn);

// Departure event
router.post('/checkout', checkOut);

module.exports = router;

const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', leaveController.applyLeave);
router.get('/', leaveController.getLeaves);
router.put('/:id', leaveController.updateLeaveStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const breakController = require('../controllers/breakController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/start', breakController.startBreak);
router.post('/end', breakController.endBreak);
router.get('/', breakController.getBreaks);

module.exports = router;

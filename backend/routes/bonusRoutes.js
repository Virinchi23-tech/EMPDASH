const express = require('express');
const router = express.Router();
const bonusController = require('../controllers/bonusController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', bonusController.assignBonus);
router.get('/', bonusController.getBonuses);
router.put('/:id', bonusController.editBonus);

module.exports = router;

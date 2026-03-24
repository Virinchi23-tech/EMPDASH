const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { createUser, updateUser, deleteUser, getAllData } = require('../controllers/adminController');

// All admin routes require authentication & strict 'Admin' role
router.use(verifyToken);
router.use(authorizeRoles('Admin'));

// User CRUD Management
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Global State
router.get('/all-data', getAllData);

module.exports = router;

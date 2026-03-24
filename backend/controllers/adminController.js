const { executeQuery } = require('../config/db');
const bcrypt = require('bcryptjs');

// Create user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields (name, email, password, role) are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await executeQuery(
      'INSERT INTO USERS (name, email, password, role, managerId) VALUES (?, ?, ?, ?, ?) RETURNING id, name, email, role, managerId',
      [name, email, hashedPassword, role, managerId || null]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error creating user', error: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role, managerId } = req.body;
    
    // Simplistic update for requirements (could expand for dynamic updates)
    const result = await executeQuery(
      'UPDATE USERS SET name = ?, email = ?, role = ?, managerId = ? WHERE id = ? RETURNING id, name, email, role, managerId',
      [name, email, role, managerId || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error updating user', error: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await executeQuery('DELETE FROM USERS WHERE id = ? RETURNING id', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error deleting user', error: err.message });
  }
};

// Get all data across entire organization
const getAllData = async (req, res) => {
  try {
    const [users, sessions, breaks, leaves, meetings] = await Promise.all([
      executeQuery('SELECT id, name, email, role, managerId FROM USERS'),
      executeQuery('SELECT * FROM SESSIONS'),
      executeQuery('SELECT * FROM BREAKS'),
      executeQuery('SELECT * FROM LEAVES'),
      executeQuery('SELECT * FROM MEETINGS')
    ]);

    res.json({
      success: true,
      data: {
        users: users.rows,
        sessions: sessions.rows,
        breaks: breaks.rows,
        leaves: leaves.rows.map(l => ({ ...l, name: users.rows.find(u => u.id === l.userId)?.name || 'Unknown' })),
        meetings: meetings.rows
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching organizational data', error: err.message });
  }
};

module.exports = { createUser, updateUser, deleteUser, getAllData };

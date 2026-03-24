const { executeQuery } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const validRoles = ['Employee', 'Manager', 'Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await executeQuery(
      'INSERT INTO USERS (name, email, password, role) VALUES (?, ?, ?, ?) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ success: true, user: result.rows[0], message: 'Registration successful' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[LOGIN DEBUG] Attempt: email=${email}, password_len=${password?.length}`);
    
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const result = await executeQuery('SELECT * FROM USERS WHERE email = ?', [email]);
    console.log(`[LOGIN DEBUG] DB rows found: ${result.rows.length}`);
    
    if (result.rows.length === 0) {
      console.log(`[LOGIN DEBUG] User not found for email: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log(`[LOGIN DEBUG] User found: id=${user.id}, role=${user.role}, pw_type=${typeof user.password}, pw_len=${user.password?.length}`);
    
    // Compare hashed password safely
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[LOGIN DEBUG] bcrypt.compare result: ${isMatch}`);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    // Exclude password from the returned object
    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;

    console.log(`[LOGIN DEBUG] SUCCESS: Returning token for userId=${user.id}`);
    res.json({ success: true, token, user: userWithoutPassword });
  } catch (err) {
    console.error(`[LOGIN DEBUG] Exception:`, err.message);
    res.status(500).json({ success: false, message: 'Server error logging in', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await executeQuery('SELECT id, name, email, role, managerId FROM USERS WHERE id = ?', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching user state', error: err.message });
  }
};

module.exports = { register, login, getMe };

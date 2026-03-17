const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const dotenv = require('dotenv');

dotenv.config();

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and Password are required!' });
  }

  try {
    // Check in the employees table for everyone
    const user = await db.getAsync('SELECT * FROM employees WHERE username = ?', [username]);

    if (!user) {
      return res.status(401).json({ message: 'Invalid Credentials!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Credentials!' });
    }

    // Role is stored in employee_level
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.employee_level 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        name: user.name,
        role: user.employee_level 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Backend Error!', error: err.message });
  }
};

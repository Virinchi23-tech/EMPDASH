const { executeQuery } = require('../config/db');

// Start a work session
const startSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await executeQuery('INSERT INTO SESSIONS (userId, startTime, status) VALUES (?, datetime(\'now\'), \'active\') RETURNING *', [userId]);
    res.status(201).json({ success: true, session: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error starting session', error: err.message });
  }
};

// End a work session
const endSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await executeQuery('UPDATE SESSIONS SET endTime = datetime(\'now\'), status = \'completed\' WHERE userId = ? AND status = \'active\' RETURNING *', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No active session found' });
    }
    res.json({ success: true, session: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error ending session', error: err.message });
  }
};

// Start a break
const startBreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await executeQuery('INSERT INTO BREAKS (userId, startTime) VALUES (?, datetime(\'now\')) RETURNING *', [userId]);
    res.status(201).json({ success: true, break: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error starting break', error: err.message });
  }
};

// End a break
const endBreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await executeQuery('UPDATE BREAKS SET endTime = datetime(\'now\') WHERE userId = ? AND endTime IS NULL RETURNING *', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No active break found' });
    }
    res.json({ success: true, break: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error ending break', error: err.message });
  }
};

// Apply for leave
const applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, reason, date } = req.body;
    if (!type) return res.status(400).json({ success: false, message: 'Leave type is required' });

    const result = await executeQuery('INSERT INTO LEAVES (userId, type, reason, status, time) VALUES (?, ?, ?, \'Pending\', ?) RETURNING *', [userId, type, reason || null, date || new Date().toISOString()]);
    res.status(201).json({ success: true, leave: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error applying for leave', error: err.message });
  }
};

// Log a meeting
const logMeeting = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, date, duration, participants, description } = req.body;
    
    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Title and date are required' });
    }

    const result = await executeQuery(
      'INSERT INTO MEETINGS (userId, title, time, duration, participants, description) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
      [userId, title, date, duration || null, participants || 0, description || null]
    );

    res.status(201).json({ success: true, meeting: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error logging meeting', error: err.message });
  }
};

// Get all own data
const getMyData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Using parallel execution for efficiency
    const [sessions, breaks, leaves, meetings] = await Promise.all([
      executeQuery('SELECT * FROM SESSIONS WHERE userId = ?', [userId]),
      executeQuery('SELECT * FROM BREAKS WHERE userId = ?', [userId]),
      executeQuery('SELECT * FROM LEAVES WHERE userId = ?', [userId]),
      executeQuery('SELECT * FROM MEETINGS WHERE userId = ?', [userId])
    ]);

    res.json({
      success: true,
      data: {
        sessions: sessions.rows,
        breaks: breaks.rows,
        leaves: leaves.rows,
        meetings: meetings.rows
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching user data', error: err.message });
  }
};

module.exports = { startSession, endSession, startBreak, endBreak, applyLeave, getMyData, logMeeting };

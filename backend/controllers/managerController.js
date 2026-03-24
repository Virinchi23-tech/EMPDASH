const { executeQuery } = require('../config/db');

// Get all users under this manager
const getTeam = async (req, res) => {
  try {
    const managerId = req.user.id;
    // Admins can see all users if needed, but managers see users where managerId matches
    let query = 'SELECT id, name, email, role, managerId FROM USERS WHERE managerId = ?';
    let args = [managerId];
    
    // If Admin wants to see team route (fallback to all users for simplicity or keep strict to manager setup)
    if (req.user.role === 'Admin') {
      query = 'SELECT id, name, email, role, managerId FROM USERS';
      args = [];
    }
    
    const result = await executeQuery(query, args);
    res.json({ success: true, team: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching team', error: err.message });
  }
};

// Get all data for his team (users, sessions, leaves)
const getTeamData = async (req, res) => {
  try {
    const managerId = req.user.id;
    
    // 1. Get Team Users
    let usersQuery = 'SELECT id, name, email, role, managerId FROM USERS WHERE managerId = ?';
    if (req.user.role === 'Admin') usersQuery = 'SELECT id FROM USERS';
    const teamUsers = await executeQuery(usersQuery, req.user.role === 'Admin' ? [] : [managerId]);
    const userIds = teamUsers.rows.map(u => u.id);

    if (userIds.length === 0) {
      return res.json({ success: true, data: { users: [], sessions: [], leaves: [], meetings: [] } });
    }

    const placeholders = userIds.map(() => '?').join(',');

    // 2. Fetch related data using IN clause
    const [sessions, leaves, meetings, breaks] = await Promise.all([
      executeQuery(`SELECT * FROM SESSIONS WHERE userId IN (${placeholders})`, userIds),
      executeQuery(`SELECT * FROM LEAVES WHERE userId IN (${placeholders})`, userIds),
      executeQuery(`SELECT * FROM MEETINGS WHERE userId IN (${placeholders})`, userIds),
      executeQuery(`SELECT * FROM BREAKS WHERE userId IN (${placeholders})`, userIds)
    ]);

    res.json({
      success: true,
      data: {
        users: teamUsers.rows,
        sessions: sessions.rows,
        leaves: leaves.rows.map(l => ({ ...l, name: teamUsers.rows.find(u => u.id === l.userId)?.name || 'Unknown' })),
        meetings: meetings.rows,
        breaks: breaks.rows
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching team data', error: err.message });
  }
};

// Generic Leave Update
const updateLeaveStatus = async (req, res, newStatus) => {
  try {
    const leaveId = req.params.id;
    // Optional context check: ideally verify that the leave belongs to a team member
    const result = await executeQuery('UPDATE LEAVES SET status = ? WHERE id = ? RETURNING *', [newStatus, leaveId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }
    res.json({ success: true, leave: result.rows[0], message: `Leave ${newStatus.toLowerCase()} successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: `Server error updating leave`, error: err.message });
  }
};

const approveLeave = (req, res) => updateLeaveStatus(req, res, 'Approved');
const rejectLeave = (req, res) => updateLeaveStatus(req, res, 'Rejected');

// Get all data for a single user (for Admin/Manager view)
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [user, sessions, leaves, meetings, breaks] = await Promise.all([
      executeQuery('SELECT id, name, email, role, managerId FROM USERS WHERE id = ?', [userId]),
      executeQuery('SELECT * FROM SESSIONS WHERE userId = ?', [userId]),
      executeQuery('SELECT * FROM LEAVES WHERE userId = ?', [userId]),
      executeQuery('SELECT * FROM MEETINGS WHERE userId = ?', [userId]),
      executeQuery('SELECT * FROM BREAKS WHERE userId = ?', [userId])
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        user: user.rows[0],
        sessions: sessions.rows,
        leaves: leaves.rows,
        meetings: meetings.rows,
        breaks: breaks.rows
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching user profile', error: err.message });
  }
};

module.exports = { getTeam, getTeamData, approveLeave, rejectLeave, getUserProfile };

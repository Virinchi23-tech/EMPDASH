const db = require('../db');

const Leave = {
  getAll: () => db.allAsync(`
    SELECT l.*, e.name as employee_name 
    FROM leaves l 
    JOIN employees e ON l.employee_id = e.id 
    ORDER BY l.start_date DESC
  `),
  
  getByEmployee: (employee_id) => db.allAsync(`
    SELECT l.*, e.name as employee_name 
    FROM leaves l 
    JOIN employees e ON l.employee_id = e.id 
    WHERE l.employee_id = ?
    ORDER BY l.start_date DESC
  `, [employee_id]),

  getByManager: (managerId) => db.allAsync(`
    SELECT l.*, e.name as employee_name 
    FROM leaves l 
    JOIN employees e ON l.employee_id = e.id 
    WHERE e.manager_id = ?
    ORDER BY l.start_date DESC
  `, [managerId]),

  apply: (data) => db.runAsync(
    'INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
    [data.employee_id, data.leave_type, data.start_date, data.end_date, data.reason]
  ),
  
  updateStatus: (id, status) => db.runAsync('UPDATE leaves SET status = ? WHERE id = ?', [status, id]),
  
  getOnLeaveToday: (today) => db.getAsync('SELECT COUNT(*) as count FROM leaves WHERE ? BETWEEN start_date AND end_date AND status = "Approved"', [today]),
  
  getTypeStats: () => db.allAsync(`
    SELECT leave_type, COUNT(*) as count 
    FROM leaves 
    GROUP BY leave_type
  `),
};

module.exports = Leave;

const db = require('../db');

const Meeting = {
  getAll: () => db.allAsync(`
    SELECT m.*, e.name as employee_name 
    FROM meetings m 
    JOIN employees e ON m.employee_id = e.id 
    ORDER BY m.meeting_date DESC
  `),
  
  getByEmployee: (employee_id) => db.allAsync(`
    SELECT * FROM meetings WHERE employee_id = ? ORDER BY meeting_date DESC
  `, [employee_id]),

  getByManager: (managerId) => db.allAsync(`
    SELECT m.*, e.name as employee_name 
    FROM meetings m 
    JOIN employees e ON m.employee_id = e.id 
    WHERE e.manager_id = ?
    ORDER BY m.meeting_date DESC
  `, [managerId]),

  create: (data) => db.runAsync(
    'INSERT INTO meetings (employee_id, title, meeting_date, duration, notes) VALUES (?, ?, ?, ?, ?)',
    [data.employee_id, data.title, data.meeting_date, data.duration, data.notes]
  ),
};

module.exports = Meeting;

const db = require('../db');

const Break = {
  getAll: () => db.allAsync(`
    SELECT b.*, e.name as employee_name 
    FROM breaks b 
    JOIN employees e ON b.employee_id = e.id 
    ORDER BY b.date DESC, b.break_start DESC
  `),
  
  getByEmployee: (employee_id) => db.allAsync(`
    SELECT * FROM breaks WHERE employee_id = ? ORDER BY date DESC, break_start DESC
  `, [employee_id]),

  getByManager: (managerId) => db.allAsync(`
    SELECT b.*, e.name as employee_name 
    FROM breaks b 
    JOIN employees e ON b.employee_id = e.id 
    WHERE e.manager_id = ?
    ORDER BY b.date DESC, b.break_start DESC
  `, [managerId]),

  getActiveBreak: (employee_id, date) => db.getAsync('SELECT * FROM breaks WHERE employee_id = ? AND date = ? AND break_end IS NULL', [employee_id, date]),
  
  start: (employee_id, now, today) => db.runAsync('INSERT INTO breaks (employee_id, break_start, date) VALUES (?, ?, ?)', [employee_id, now, today]),
  
  end: (id, now, duration) => db.runAsync('UPDATE breaks SET break_end = ?, break_duration = ? WHERE id = ?', [now, duration, id]),
};

module.exports = Break;

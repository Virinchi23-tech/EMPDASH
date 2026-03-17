const db = require('../db');
const { parseISO, differenceInMinutes, format } = require('date-fns');

const Attendance = {
  getAll: () => db.allAsync(`
    SELECT a.*, e.name as employee_name 
    FROM attendance a 
    JOIN employees e ON a.employee_id = e.id 
    ORDER BY a.date DESC, a.check_in DESC
  `),
  
  getByEmployee: (employee_id) => db.allAsync(`
    SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC, check_in DESC
  `, [employee_id]),

  getByManager: (managerId) => db.allAsync(`
    SELECT a.*, e.name as employee_name 
    FROM attendance a 
    JOIN employees e ON a.employee_id = e.id 
    WHERE e.manager_id = ?
    ORDER BY a.date DESC, a.check_in DESC
  `, [managerId]),

  getByEmployeeAndDate: (employee_id, date) => db.getAsync('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [employee_id, date]),
  
  getActiveCheckIn: (employee_id, date) => db.getAsync('SELECT * FROM attendance WHERE employee_id = ? AND date = ? AND check_out IS NULL', [employee_id, date]),
  
  checkIn: (employee_id, now, today) => db.runAsync('INSERT INTO attendance (employee_id, check_in, date, status) VALUES (?, ?, ?, "Active")', [employee_id, now, today]),
  
  checkOut: (id, now, workHours) => db.runAsync('UPDATE attendance SET check_out = ?, work_hours = ? WHERE id = ?', [now, workHours, id]),
  
  concludeSession: (id) => db.runAsync('UPDATE attendance SET status = "Concluded" WHERE id = ?', [id]),

  getStatsByDate: (date) => db.getAsync('SELECT COUNT(*) as count FROM attendance WHERE date = ?', [date]),
  
  getRecentTrends: (limit = 7) => db.allAsync(`
    SELECT date, COUNT(*) as count 
    FROM attendance 
    GROUP BY date 
    ORDER BY date DESC 
    LIMIT ?
  `, [limit]),

  getTotalWorkingHoursToday: (today) => db.getAsync('SELECT SUM(work_hours) as total FROM attendance WHERE date = ?', [today]),
};

module.exports = Attendance;

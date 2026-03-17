const Attendance = require('../models/attendanceModel');
const Leave = require('../models/leaveModel');
const Bonus = require('../models/bonusModel');
const Employee = require('../models/employeeModel');
const db = require('../db');
const { format } = require('date-fns');

exports.getStats = async (req, res) => {
  const { role, id } = req.query;
  const today = format(new Date(), 'yyyy-MM-dd');
  
  try {
    if (role === 'Staff') {
      // Individual productivity stats
      const [attRes, leaveRes, bonusRes, trendRes] = await Promise.all([
        db.getAsync('SELECT COUNT(*) as count FROM attendance WHERE employee_id = ? AND date = ?', [id, today]),
        db.getAsync('SELECT COUNT(*) as count FROM leaves WHERE employee_id = ? AND status = "Approved"', [id]),
        db.getAsync('SELECT SUM(bonus_amount) as total FROM bonuses WHERE employee_id = ?', [id]),
        db.allAsync('SELECT date, work_hours as count FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT 7', [id])
      ]);

      return res.json({
        summary: {
          totalEmployees: 1,
          presentToday: attRes.count,
          onLeaveToday: leaveRes.count,
          totalBonuses: bonusRes.total || 0,
          workingHoursToday: 0 // Fetch from current active session if needed
        },
        attendanceStats: trendRes.reverse(),
        leaveStats: { "Personal": leaveRes.count }
      });
    }

    // Manager / Admin stats
    const [totalEmpRes, presentRes, leaveRes, bonusRes, workHoursRes, attendanceTrend, leaveTypeStats, mgrCountRes, admCountRes] = await Promise.all([
      db.getAsync('SELECT COUNT(*) as count FROM employees'),
      Attendance.getStatsByDate(today),
      Leave.getOnLeaveToday(today),
      Bonus.getTotal(),
      Attendance.getTotalWorkingHoursToday(today),
      Attendance.getRecentTrends(7),
      Leave.getTypeStats(),
      db.getAsync('SELECT COUNT(*) as count FROM employees WHERE employee_level = "Manager"'),
      db.getAsync('SELECT COUNT(*) as count FROM employees WHERE employee_level = "Admin"')
    ]);

    res.json({
      summary: {
        totalEmployees: totalEmpRes.count,
        presentToday: presentRes.count,
        onLeaveToday: leaveRes.count,
        totalBonuses: bonusRes.total || 0,
        workingHoursToday: workHoursRes.total || 0,
        managerCount: mgrCountRes.count,
        adminCount: admCountRes.count,
      },
      attendanceStats: attendanceTrend,
      leaveStats: leaveTypeStats.reduce((acc, curr) => ({ ...acc, [curr.leave_type]: curr.count }), {}),
    });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

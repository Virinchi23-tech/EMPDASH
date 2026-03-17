const Attendance = require('../models/attendanceModel');
const { parseISO, differenceInMinutes, format } = require('date-fns');

exports.checkIn = async (req, res) => {
  const { employee_id } = req.body;
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date().toISOString();

  try {
    const existing = await Attendance.getByEmployeeAndDate(employee_id, today);
    if (existing) {
      return res.status(400).json({ message: 'Already checked in today!' });
    }

    await Attendance.checkIn(employee_id, now, today);
    res.json({ message: 'Session started!' });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.checkOut = async (req, res) => {
  const { employee_id } = req.body;
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date().toISOString();

  try {
    const attendance = await Attendance.getActiveCheckIn(employee_id, today);

    if (!attendance) {
      return res.status(400).json({ message: 'No active session found!' });
    }

    const checkInTime = parseISO(attendance.check_in);
    const checkOutTime = parseISO(now);
    const diffMinutes = differenceInMinutes(checkOutTime, checkInTime);
    const workHours = (diffMinutes / 60).toFixed(2);

    await Attendance.checkOut(attendance.id, now, workHours);
    res.json({ message: 'Session Ended Successfully!', workHours });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.concludeSession = async (req, res) => {
  const { id } = req.params;
  try {
    await Attendance.concludeSession(id);
    res.json({ message: 'Session concluded successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  const { role, id } = req.query; // Passed from frontend based on logged in user
  try {
    let attendance;
    if (role === 'Admin') {
      attendance = await Attendance.getAll();
    } else if (role === 'Manager') {
      attendance = await Attendance.getByManager(id);
    } else {
      attendance = await Attendance.getByEmployee(id);
    }
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

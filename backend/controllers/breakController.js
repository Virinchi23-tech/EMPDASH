const Break = require('../models/breakModel');
const { format, parseISO, differenceInMinutes } = require('date-fns');

exports.startBreak = async (req, res) => {
  const { employee_id } = req.body;
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date().toISOString();

  try {
    await Break.start(employee_id, now, today);
    res.json({ message: 'Break started!' });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.endBreak = async (req, res) => {
  const { employee_id } = req.body;
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = new Date().toISOString();

  try {
    const breakSession = await Break.getActiveBreak(employee_id, today);

    if (!breakSession) {
      return res.status(400).json({ message: 'No active break found for today!' });
    }

    const start = parseISO(breakSession.break_start);
    const end = parseISO(now);
    const diff = differenceInMinutes(end, start);

    await Break.end(breakSession.id, now, diff);
    res.json({ message: 'Break ended!', durationMinutes: diff });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.getBreaks = async (req, res) => {
  const { role, id } = req.query;
  try {
    let breaks;
    if (role === 'Admin') {
      breaks = await Break.getAll();
    } else if (role === 'Manager') {
      breaks = await Break.getByManager(id);
    } else {
      breaks = await Break.getByEmployee(id);
    }
    res.json(breaks);
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

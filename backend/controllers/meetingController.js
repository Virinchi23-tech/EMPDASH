const Meeting = require('../models/meetingModel');

exports.logMeeting = async (req, res) => {
  try {
    await Meeting.create(req.body);
    res.json({ message: 'Meeting logged successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.getMeetings = async (req, res) => {
  const { role, id } = req.query;
  try {
    let meetings;
    if (role === 'Admin') {
      meetings = await Meeting.getAll();
    } else if (role === 'Manager') {
      meetings = await Meeting.getByManager(id);
    } else {
      meetings = await Meeting.getByEmployee(id);
    }
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

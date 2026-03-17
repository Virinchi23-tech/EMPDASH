const Leave = require('../models/leaveModel');

exports.applyLeave = async (req, res) => {
  try {
    await Leave.apply(req.body);
    res.json({ message: 'Leave request submitted!' });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.getLeaves = async (req, res) => {
  const { role, id } = req.query;
  try {
    let leaves;
    if (role === 'Admin') {
      leaves = await Leave.getAll();
    } else if (role === 'Manager') {
      leaves = await Leave.getByManager(id);
    } else {
      leaves = await Leave.getByEmployee(id);
    }
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await Leave.updateStatus(id, status);
    res.json({ message: `Leave ${status} successfully!` });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

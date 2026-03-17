const Bonus = require('../models/bonusModel');
const { format } = require('date-fns');

exports.assignBonus = async (req, res) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  try {
    await Bonus.assign({ ...req.body, date_given: today });
    res.json({ message: 'Bonus assigned successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.getBonuses = async (req, res) => {
  const { role, id } = req.query;
  try {
    let bonuses;
    if (role === 'Admin') {
      bonuses = await Bonus.getAll();
    } else if (role === 'Manager') {
      bonuses = await Bonus.getByManager(id);
    } else {
      bonuses = await Bonus.getByEmployee(id);
    }
    res.json(bonuses);
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

exports.editBonus = async (req, res) => {
  const { id } = req.params;
  try {
    await Bonus.update(id, req.body);
    res.json({ message: 'Bonus updated successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Database Error!', error: err.message });
  }
};

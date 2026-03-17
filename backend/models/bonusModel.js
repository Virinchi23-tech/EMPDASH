const db = require('../db');

const Bonus = {
  getAll: () => db.allAsync(`
    SELECT b.*, e.name as employee_name 
    FROM bonuses b
    JOIN employees e ON b.employee_id = e.id 
    ORDER BY b.date_given DESC
  `),

  getByEmployee: (employee_id) => db.allAsync(`
    SELECT b.*, e.name as employee_name 
    FROM bonuses b
    JOIN employees e ON b.employee_id = e.id 
    WHERE b.employee_id = ?
    ORDER BY b.date_given DESC
  `, [employee_id]),

  getByManager: (managerId) => db.allAsync(`
    SELECT b.*, e.name as employee_name 
    FROM bonuses b
    JOIN employees e ON b.employee_id = e.id 
    WHERE e.manager_id = ?
    ORDER BY b.date_given DESC
  `, [managerId]),

  assign: (data) => db.runAsync(
    'INSERT INTO bonuses (employee_id, bonus_amount, bonus_reason, date_given) VALUES (?, ?, ?, ?)',
    [data.employee_id, data.bonus_amount, data.bonus_reason, data.date_given]
  ),
  
  update: (id, data) => db.runAsync('UPDATE bonuses SET bonus_amount = ?, bonus_reason = ? WHERE id = ?', [data.bonus_amount, data.bonus_reason, id]),
  
  getTotal: () => db.getAsync('SELECT SUM(bonus_amount) as total FROM bonuses'),
};

module.exports = Bonus;

const db = require('../db');
const bcrypt = require('bcryptjs');

const Employee = {
  getAll: () => db.allAsync(`
    SELECT e1.*, e2.name as manager_name 
    FROM employees e1 
    LEFT JOIN employees e2 ON e1.manager_id = e2.id
  `),
  
  getByManager: (managerId) => db.allAsync(`
    SELECT e1.*, e2.name as manager_name 
    FROM employees e1 
    LEFT JOIN employees e2 ON e1.manager_id = e2.id
    WHERE e1.manager_id = ?
  `, [managerId]),

  getById: (id) => db.getAsync(`
    SELECT e1.*, e2.name as manager_name 
    FROM employees e1 
    LEFT JOIN employees e2 ON e1.manager_id = e2.id
    WHERE e1.id = ?
  `, [id]),

  create: async (data) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password || 'password123', salt);
    
    return db.runAsync(
      'INSERT INTO employees (username, password, name, email, role, department, salary, employee_level, manager_id, joining_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.username, hashedPassword, data.name, data.email, data.role, data.department, data.salary, data.employee_level, data.manager_id, data.joining_date]
    );
  },

  update: async (id, data) => {
    let sql = 'UPDATE employees SET name=?, email=?, role=?, department=?, salary=?, employee_level=?, manager_id=?, joining_date=? WHERE id=?';
    let params = [data.name, data.email, data.role, data.department, data.salary, data.employee_level, data.manager_id, data.joining_date, id];

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      sql = 'UPDATE employees SET name=?, email=?, role=?, department=?, salary=?, employee_level=?, manager_id=?, joining_date=?, password=? WHERE id=?';
      params = [data.name, data.email, data.role, data.department, data.salary, data.employee_level, data.manager_id, data.joining_date, hashedPassword, id];
    }

    return db.runAsync(sql, params);
  },

  getManagers: () => db.allAsync('SELECT id, name FROM employees WHERE employee_level IN ("Manager", "Admin")'),
  
  delete: (id) => db.runAsync('DELETE FROM employees WHERE id=?', [id]),
};

module.exports = Employee;

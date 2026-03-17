const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, './database/database.sqlite');
const schemaPath = path.resolve(__dirname, './database/schema.sql');
const db = new sqlite3.Database(dbPath);

const run = async () => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  const schema = fs.readFileSync(schemaPath, 'utf8');

  db.serialize(() => {
    // Initialize schema
    db.exec(schema, (err) => {
      if (err) {
        console.error('Error initializing schema:', err.message);
        return;
      }
      console.log('Schema initialized.');

      // Clear existing data
      db.run('DELETE FROM employees', (err) => {
        if (err) console.error(err);

        // 1. ADMIN ROLE
        db.run(`INSERT INTO employees (username, password, name, email, role, department, salary, employee_level, joining_date) VALUES 
          ('admin', ?, 'Super User', 'admin@company.com', 'System Admin', 'MANAGEMENT', 0, 'Admin', '2023-01-01')`, [password], function(err) {
          if (err) return console.error('Error inserting admin:', err.message);
          const adminId = this.lastID;

          // 2. MANAGER ROLE
          db.run(`INSERT INTO employees (username, password, name, email, role, department, salary, employee_level, manager_id, joining_date) VALUES 
            ('manager1', ?, 'Marcus Manager', 'marcus@company.com', 'Engineering Mgr', 'ENGINEERING', 150000, 'Manager', ?, '2023-03-01')`, [password, adminId], function(err) {
            if (err) return console.error('Error inserting manager:', err.message);
            const managerId = this.lastID;

            // 3. STAFF ROLE
            db.run(`INSERT INTO employees (username, password, name, email, role, department, salary, employee_level, manager_id, joining_date) VALUES 
              ('staff1', ?, 'Steve Staff', 'steve@company.com', 'Senior Developer', 'ENGINEERING', 110000, 'Staff', ?, '2023-06-15')`, [password, managerId], function(err) {
              if (err) return console.error('Error inserting staff:', err.message);
              console.log('Database seeded successfully with RBAC Test Accounts:');
              console.log('Admin: admin / password123');
              console.log('Manager: manager1 / password123');
              console.log('Staff: staff1 / password123');
              db.close();
            });
          });
        });
      });
    });
  });
};

run();

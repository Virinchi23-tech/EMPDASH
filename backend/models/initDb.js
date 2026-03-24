const { executeQuery } = require('../config/db');

const initializeDatabase = async () => {
  const schemaQueries = [
    `CREATE TABLE IF NOT EXISTS USERS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('Employee', 'Manager', 'Admin')) NOT NULL,
      managerId INTEGER,
      FOREIGN KEY (managerId) REFERENCES USERS(id)
    )`,
    `CREATE TABLE IF NOT EXISTS SESSIONS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT,
      status TEXT CHECK(status IN ('active', 'completed')),
      FOREIGN KEY (userId) REFERENCES USERS(id)
    )`,
    `CREATE TABLE IF NOT EXISTS BREAKS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT,
      FOREIGN KEY (userId) REFERENCES USERS(id)
    )`,
    `CREATE TABLE IF NOT EXISTS LEAVES (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      reason TEXT,
      status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
      time TEXT,
      FOREIGN KEY (userId) REFERENCES USERS(id)
    )`,
    `CREATE TABLE IF NOT EXISTS MEETINGS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      time TEXT NOT NULL,
      duration TEXT,
      participants INTEGER,
      FOREIGN KEY (userId) REFERENCES USERS(id)
    )`
  ];

  try {
    for (const query of schemaQueries) {
      await executeQuery(query);
    }

    // Seed Data
    const usersCount = await executeQuery('SELECT COUNT(*) as count FROM USERS');
    const count = typeof usersCount.rows[0].count === 'bigint' ? Number(usersCount.rows[0].count) : usersCount.rows[0].count;
    
    if (count === 0) {
      const bcrypt = require('bcryptjs');
      console.log('🌱 Turso database is empty. Beginning core initial seed protocol...');
      
      const adminPw = await bcrypt.hash('admin123', 10);
      const mgrPw = await bcrypt.hash('manager123', 10);
      const empPw = await bcrypt.hash('employee123', 10);

      await executeQuery(
        'INSERT INTO USERS (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@company.com', adminPw, 'Admin']
      );

      // We get the recently inserted manager to act as the employees managerId
      await executeQuery(
        'INSERT INTO USERS (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Manager User', 'manager@company.com', mgrPw, 'Manager']
      );
      
      const mgrRes = await executeQuery('SELECT id FROM USERS WHERE role = ?', ['Manager']);
      const managerId = mgrRes.rows[0].id;

      await executeQuery(
        'INSERT INTO USERS (name, email, password, role, managerId) VALUES (?, ?, ?, ?, ?)',
        ['Employee User', 'employee@company.com', empPw, 'Employee', managerId]
      );

      console.log('✅ Base organization structure generated (Admin, Manager, Employee)');
    } else {
      console.log(`✅ System verified: Turso database already holds ${count} valid users.`);
    }
  } catch (err) {
    console.error("❌ DB Initialization Failed:", err.message);
  }
};

module.exports = { initializeDatabase };

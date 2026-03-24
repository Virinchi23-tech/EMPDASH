require('dotenv').config();
const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

// Connect directly to remote Turso (same connection as the running server)
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const seedTestUsers = async () => {
    try {
        console.log('Connecting to remote Turso DB:', process.env.TURSO_DATABASE_URL);
        console.log('Seeding test users...\n');
        
        const rawPassword = 'password123';
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Admin test user
        try {
            await client.execute({ sql: 'INSERT INTO USERS (name, email, password, role) VALUES (?, ?, ?, ?)', args: ['Test Admin', 'admin@test.com', hashedPassword, 'Admin'] });
            console.log('✅ Inserted: admin@test.com');
        } catch (e) {
            console.log('⚠️  admin@test.com already exists, updating password...');
            await client.execute({ sql: 'UPDATE USERS SET password = ? WHERE email = ?', args: [hashedPassword, 'admin@test.com'] });
        }

        // Manager test user
        try {
            await client.execute({ sql: 'INSERT INTO USERS (name, email, password, role) VALUES (?, ?, ?, ?)', args: ['Test Manager', 'manager@test.com', hashedPassword, 'Manager'] });
            console.log('✅ Inserted: manager@test.com');
        } catch (e) {
            console.log('⚠️  manager@test.com already exists, updating password...');
            await client.execute({ sql: 'UPDATE USERS SET password = ? WHERE email = ?', args: [hashedPassword, 'manager@test.com'] });
        }

        // Employee test user
        const mgrRes = await client.execute({ sql: 'SELECT id FROM USERS WHERE email = ?', args: ['manager@test.com'] });
        const managerId = mgrRes.rows.length > 0 ? mgrRes.rows[0].id : null;
        try {
            await client.execute({ sql: 'INSERT INTO USERS (name, email, password, role, managerId) VALUES (?, ?, ?, ?, ?)', args: ['Test Employee', 'employee@test.com', hashedPassword, 'Employee', managerId] });
            console.log('✅ Inserted: employee@test.com');
        } catch (e) {
            console.log('⚠️  employee@test.com already exists, updating password...');
            await client.execute({ sql: 'UPDATE USERS SET password = ? WHERE email = ?', args: [hashedPassword, 'employee@test.com'] });
        }

        // Also fix the original company.com users' passwords
        const empPw = await bcrypt.hash('employee123', 10);
        const mgrPw = await bcrypt.hash('manager123', 10);
        const adminPw = await bcrypt.hash('admin123', 10);
        await client.execute({ sql: 'UPDATE USERS SET password = ? WHERE email = ?', args: [empPw, 'employee@company.com'] });
        await client.execute({ sql: 'UPDATE USERS SET password = ? WHERE email = ?', args: [mgrPw, 'manager@company.com'] });
        await client.execute({ sql: 'UPDATE USERS SET password = ? WHERE email = ?', args: [adminPw, 'admin@company.com'] });
        console.log('\n✅ Also updated company.com user passwords');

        console.log('\n✅ Also updated company.com user passwords');
        
        // --- Add Mock Data for dashboards ---
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Sessions for Employee and Manager
        const testUserIds = [7, 8, 9]; // IDs from the list: admin@test.com, manager@test.com, employee@test.com
        for (const uid of testUserIds) {
            // Add a completed session
            await client.execute({
                sql: 'INSERT INTO SESSIONS (userId, startTime, endTime, status) VALUES (?, ?, ?, ?)',
                args: [uid, `${today}T09:00:00Z`, `${today}T17:00:00Z`, 'completed']
            });
            // Add an active session for today
            await client.execute({
                sql: 'INSERT INTO SESSIONS (userId, startTime, status) VALUES (?, ?, ?)',
                args: [uid, `${today}T09:30:00Z`, 'active']
            });
        }
        
        // 2. Meetings for Employee
        await client.execute({
            sql: 'INSERT INTO MEETINGS (userId, title, description, time, duration, participants) VALUES (?, ?, ?, ?, ?, ?)',
            args: [9, 'Q1 Planning', 'Annual R&D goals', `${today} 14:00`, '1h', 5]
        });
        await client.execute({
            sql: 'INSERT INTO MEETINGS (userId, title, description, time, duration, participants) VALUES (?, ?, ?, ?, ?, ?)',
            args: [9, 'Code Review', 'Reviewing auth PR', `${today} 10:00`, '30m', 2]
        });

        // 3. Leaves for Employee (Pending)
        await client.execute({
            sql: 'INSERT INTO LEAVES (userId, type, reason, status, time) VALUES (?, ?, ?, ?, ?)',
            args: [9, 'Casual', 'Personal work', 'Pending', `${today}`]
        });

        console.log('✅ Mock sessions, meetings, and leaves added for test users.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        process.exit(0);
    }
};

seedTestUsers();

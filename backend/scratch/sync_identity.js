const { client } = require('../config/db');

async function sync() {
    try {
        console.log('🔄 Manually synchronizing Users table with Employees table...');
        
        // Update users table by matching emails
        await client.execute(`
            UPDATE users 
            SET emp_id = (SELECT emp_id FROM employees WHERE employees.email = users.email),
                name = (SELECT name FROM employees WHERE employees.email = users.email)
            WHERE EXISTS (SELECT 1 FROM employees WHERE employees.email = users.email)
        `);
        
        console.log('✅ Synchronization complete.');
        
        // Verify Virinchi's record
        const rows = await client.execute("SELECT id, emp_id, email, name FROM users WHERE email = 'virinchi@gmail.com'");
        console.log('Current Virinchi in Users:');
        console.table(rows.rows);
        
        const empRows = await client.execute("SELECT id, emp_id, email, name FROM employees WHERE email = 'virinchi@gmail.com'");
        console.log('Current Virinchi in Employees:');
        console.table(empRows.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

sync();

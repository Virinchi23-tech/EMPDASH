const { client } = require('../config/db');

async function check() {
    try {
        console.log('--- Employees ---');
        const emps = await client.execute("SELECT id, emp_id, name, email FROM employees");
        console.table(emps.rows);
        
        console.log('--- Users ---');
        const users = await client.execute("SELECT id, email, role FROM users");
        console.table(users.rows);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();

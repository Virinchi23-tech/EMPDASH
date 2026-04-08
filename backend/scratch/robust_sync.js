const { client } = require('../config/db');

async function robustSync() {
    try {
        console.log('🔄 Executing Robust Identity Handshake...');
        
        // 1. Update existing mappings
        await client.execute(`
            UPDATE users 
            SET emp_id = (SELECT emp_id FROM employees WHERE employees.email = users.email),
                name = (SELECT name FROM employees WHERE employees.email = users.email),
                role = (SELECT role FROM employees WHERE employees.email = users.email),
                department = (SELECT department FROM employees WHERE employees.email = users.email),
                profile_image = (SELECT profile_image FROM employees WHERE employees.email = users.email)
            WHERE EXISTS (SELECT 1 FROM employees WHERE employees.email = users.email)
        `);
        
        // 2. Insert missing mappings
        await client.execute(`
            INSERT OR IGNORE INTO users (emp_id, name, email, password, role, department, profile_image)
            SELECT emp_id, name, email, password, role, department, profile_image FROM employees
        `);

        console.log('✅ Identity clusters synchronized and aligned.');
        
        // 3. Verify specifically for Virinchi
        const rows = await client.execute("SELECT id, emp_id, email, name FROM users WHERE email = 'virinchi@gmail.com'");
        console.log('Final Verification (Users):');
        console.table(rows.rows);

        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err.message);
        process.exit(1);
    }
}

robustSync();

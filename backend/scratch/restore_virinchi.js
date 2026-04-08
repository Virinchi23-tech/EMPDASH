const { client } = require('../config/db');
const bcrypt = require('bcryptjs');

async function restoreVirinchi() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        console.log('🌱 Restoring Virinchi to the Master Registry...');
        
        await client.execute({
            sql: "INSERT OR IGNORE INTO employees (emp_id, name, email, password, role, designation, department, joining_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            args: ["EMP7986", "Virinchi", "virinchi@gmail.com", hashedPassword, "Employee", "Developer", "Engineering", "2024-04-01", 75000]
        });
        
        console.log('✅ Virinchi restored and synced.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

restoreVirinchi();

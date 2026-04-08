const { client } = require('../config/db');
const bcrypt = require('bcryptjs');

async function repairPasswords() {
    try {
        console.log('🛡️  Repairing Hashed Credentials Registry...');
        
        const emps = await client.execute("SELECT id, email, password FROM employees");
        
        for (const emp of emps.rows) {
            // Check if password is NOT hashed
            if (!emp.password.startsWith('$2a$') && !emp.password.startsWith('$2b$')) {
                console.log(`🔐 Hashing plaintext password for: ${emp.email}`);
                const hashedPassword = await bcrypt.hash(emp.password, 10);
                
                await client.execute({
                    sql: "UPDATE employees SET password = ? WHERE id = ?",
                    args: [hashedPassword, emp.id]
                });
                
                // Also update users table (triggers might handle this but doing it explicitly to be sure)
                await client.execute({
                    sql: "UPDATE users SET password = ? WHERE email = ?",
                    args: [hashedPassword, emp.email]
                });
            }
        }
        
        console.log('✅ All passwords synchronized and hashed.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Repair Failure:', err.message);
        process.exit(1);
    }
}

repairPasswords();

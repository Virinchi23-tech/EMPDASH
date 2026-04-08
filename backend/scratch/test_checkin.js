const { client } = require('../config/db');

async function testCheckIn() {
    const employee_id = 'EMP7986'; // Virinchi's ID
    const date = new Date().toISOString().split('T')[0];
    const time = '10:00';

    try {
        console.log(`🚀 Attempting manual INSERT for ${employee_id}...`);
        
        await client.execute({
            sql: "INSERT INTO attendance (employee_id, date, check_in_time, status) VALUES (?, ?, ?, ?)",
            args: [employee_id, date, time, 'Checked In']
        });
        
        console.log('✅ INSERT successful!');
        
        // Clean up
        await client.execute("DELETE FROM attendance WHERE employee_id = ? AND date = ? AND check_in_time = ?", [employee_id, date, time]);
        console.log('🧹 Cleaned up test record.');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ INSERT failed:', err.message);
        process.exit(1);
    }
}

testCheckIn();

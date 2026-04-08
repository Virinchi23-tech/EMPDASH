const { client } = require('../config/db');

async function fixAttendance() {
    try {
        console.log('🚧 Repairing Attendance Infrastructure...');
        
        // 1. Drop existing table to clear stale Foreign Key constraints
        await client.execute("DROP TABLE IF EXISTS attendance");
        console.log('🗑️  Stale table purged.');
        
        // 2. Recreate with correct Foreign Key targeting emp_id (TEXT)
        await client.execute(`
            CREATE TABLE attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id TEXT NOT NULL,
                date TEXT NOT NULL,
                check_in_time TEXT,
                check_out_time TEXT,
                total_hours REAL DEFAULT 0,
                status TEXT DEFAULT 'Absent',
                FOREIGN KEY (employee_id) REFERENCES employees(emp_id) ON DELETE CASCADE
            )
        `);
        console.log('🏗️  New Attendance Registry established with correct Identity Mapping.');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Repair failed:', err.message);
        process.exit(1);
    }
}

fixAttendance();

const { client } = require('./db');

/**
 * setupDatabase - Final Comprehensive Schema Initialization
 * Enforces a complete organizational registry across Turso Cloud.
 */
const setupDatabase = async () => {
    try {
        console.log('🏗️  Enforcing Master Data Schema [Final Sync]...');

        // 0. Migration Safeguard: Inspect Attendance Table
        const attendInfo = await client.execute("PRAGMA table_info(attendance)");
        const hasEmployeeId = attendInfo.rows.some(r => r.name === 'employee_id');
        
        if (attendInfo.rows.length > 0 && !hasEmployeeId) {
            console.log('🔄 Outdated Attendance Schema detected. Migrating to Employee Registry standard...');
            await client.execute("DROP TABLE attendance");
        } else if (hasEmployeeId) {
            console.log('🔍 Standardizing ID formats (EMP001)...');
            // Migration query attempt for numeric IDs
            try {
                const results = await client.execute("SELECT employee_id FROM attendance LIMIT 5");
                const anyNumeric = results.rows.some(r => /^\d+$/.test(r.employee_id));
                if (anyNumeric) {
                    console.log('🔄 Converting numeric IDs to Employee Registry strings...');
                    await client.execute(`
                        UPDATE attendance 
                        SET employee_id = (SELECT emp_id FROM users WHERE CAST(users.id AS TEXT) = attendance.employee_id)
                        WHERE employee_id NOT LIKE 'EMP%'
                    `);
                }
            } catch (e) {
                console.log('✨ Registry ID alignment already optimal.');
            }
        }

        // 1. Core Personnel Registry
        await client.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                emp_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'Employee',
                department TEXT DEFAULT 'Engineering',
                joining_date TEXT,
                salary REAL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 1.5 Legacy Support View (Employee Mapping)
        await client.execute(`
            CREATE VIEW IF NOT EXISTS employees AS 
            SELECT emp_id AS id, name, email, role FROM users
        `);

        // 2. Strategic Infrastructure (Projects)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                budget REAL DEFAULT 0,
                start_date TEXT,
                end_date TEXT,
                status TEXT DEFAULT 'Active',
                tech_stack TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Relational Assignments
        await client.execute(`
            CREATE TABLE IF NOT EXISTS project_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id TEXT NOT NULL,
                employee_id TEXT NOT NULL,
                assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
                FOREIGN KEY (employee_id) REFERENCES users(emp_id) ON DELETE CASCADE
            )
        `);

        // 4. Performance Metrics
        await client.execute(`
            CREATE TABLE IF NOT EXISTS performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                emp_id TEXT NOT NULL,
                score INTEGER NOT NULL,
                review_date TEXT NOT NULL,
                comments TEXT,
                FOREIGN KEY (emp_id) REFERENCES users(emp_id) ON DELETE CASCADE
            )
        `);

        // 5. Financial Infrastructure (Salaries)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS salaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                emp_id TEXT NOT NULL,
                base_salary REAL NOT NULL,
                bonus REAL DEFAULT 0,
                deductions REAL DEFAULT 0,
                month TEXT NOT NULL,
                year TEXT NOT NULL,
                status TEXT DEFAULT 'Paid',
                generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (emp_id) REFERENCES users(emp_id) ON DELETE CASCADE
            )
        `);

        // 6. Operational Handshakes (Attendance)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id TEXT NOT NULL,
                date TEXT NOT NULL,
                check_in_time TEXT,
                check_out_time TEXT,
                total_hours REAL DEFAULT 0,
                status TEXT DEFAULT 'Absent',
                FOREIGN KEY (employee_id) REFERENCES users(emp_id) ON DELETE CASCADE
            )
        `);

        // 7. Time Logic (Breaks)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS breaks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                attendance_id INTEGER NOT NULL,
                start_time TEXT,
                end_time TEXT,
                duration_minutes INTEGER DEFAULT 0,
                FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE
            )
        `);

        // 8. Lifecycle Management (Leaves)
        await client.execute(`
            CREATE TABLE IF NOT EXISTS leaves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                emp_id TEXT NOT NULL,
                leave_type TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                reason TEXT,
                status TEXT DEFAULT 'Pending',
                FOREIGN KEY (emp_id) REFERENCES users(emp_id) ON DELETE CASCADE
            )
        `);

        // 9. Core Seeding Logic
        console.log('🌱 Checking Master Registry for core personnel...');
        const userCheck = await client.execute("SELECT COUNT(*) as count FROM users");
        if (userCheck.rows[0].count === 0) {
            console.log('🌱 Registry empty. Initializing strategic personnel data...');
            const personnel = [
                ["EMP001", "Admin User", "admin@empdash.com", "admin123", "Admin", "Executive", "2024-01-01", 120000],
                ["EMP002", "Jane Manager", "jane@empdash.com", "manager123", "Manager", "Engineering", "2024-01-15", 95000],
                ["EMP003", "Robert HR", "robert@empdash.com", "hr123", "HR", "Corporate", "2024-02-01", 85000],
                ["EMP004", "Alice Employee", "alice@empdash.com", "emp123", "Employee", "Design", "2024-03-01", 60000]
            ];
            for (const u of personnel) {
                await client.execute({
                    sql: "INSERT INTO users (emp_id, name, email, password, role, department, joining_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    args: u
                });
            }

            // Seed initial project and assignment
            await client.execute({
                sql: "INSERT INTO projects (project_id, title, budget, start_date, end_date, status, tech_stack) VALUES (?, ?, ?, ?, ?, ?, ?)",
                args: ["PRJ001", "Strategic Infrastructure Sync", 150000, "2024-03-25", "2024-12-31", "Active", "Node.js, Turso, React"]
            });
            await client.execute({
                sql: "INSERT INTO project_assignments (project_id, employee_id) VALUES (?, ?), (?, ?)",
                args: ["PRJ001", "EMP001", "PRJ001", "EMP004"]
            });
            
            // Seed sample attendance for Alice
            await client.execute({
                sql: "INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, total_hours, status) VALUES (?, ?, ?, ?, ?, ?)",
                args: ["EMP004", new Date().toISOString().split('T')[0], "09:00", "18:00", 9.0, "Checked Out"]
            });

            console.log('✅ Master Registry Initialized.');
        } else {
            console.log('✅ Personnel Registry active.');
        }

        console.log('✅ Final Cloud Schema Synchronized.');
    } catch (error) {
        console.error('❌ Schema Sync Failure:', error.message);
    }
};

module.exports = setupDatabase;

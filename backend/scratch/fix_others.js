const { client } = require('../config/db');

async function fixOtherTables() {
    try {
        console.log('🚧 Repairing Extended Infrastructure...');
        
        // Fix Leaves
        await client.execute("DROP TABLE IF EXISTS leaves");
        await client.execute(`
            CREATE TABLE leaves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id TEXT NOT NULL,
                from_date TEXT NOT NULL,
                to_date TEXT NOT NULL,
                reason TEXT,
                status TEXT DEFAULT 'Pending',
                FOREIGN KEY (employee_id) REFERENCES employees(emp_id) ON DELETE CASCADE
            )
        `);
        console.log('🏗️  Leaves table repaired.');

        // Fix Performance
        await client.execute("DROP TABLE IF EXISTS performance");
        await client.execute(`
            CREATE TABLE performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                emp_id TEXT NOT NULL,
                score INTEGER NOT NULL,
                review_date TEXT NOT NULL,
                comments TEXT,
                FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE
            )
        `);
        console.log('🏗️  Performance table repaired.');

        // Fix Salaries
        await client.execute("DROP TABLE IF EXISTS salaries");
        await client.execute(`
            CREATE TABLE salaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                emp_id TEXT NOT NULL,
                base_salary REAL NOT NULL,
                bonus REAL DEFAULT 0,
                deductions REAL DEFAULT 0,
                month TEXT NOT NULL,
                year TEXT NOT NULL,
                status TEXT DEFAULT 'Paid',
                generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (emp_id) REFERENCES employees(emp_id) ON DELETE CASCADE
            )
        `);
        console.log('🏗️  Salaries table repaired.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Repair failed:', err.message);
        process.exit(1);
    }
}

fixOtherTables();

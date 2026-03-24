require('dotenv').config();
const { executeQuery } = require('./config/db');

const resetMeetingsTable = async () => {
    try {
        console.log('Resetting MEETINGS table for schema parity...');
        
        // 1. Drop existing
        try {
            await executeQuery('DROP TABLE IF EXISTS MEETINGS');
            console.log('Dropped MEETINGS table');
        } catch (e) {
            console.warn('Failed to drop MEETINGS table:', e.message);
        }

        // 2. Re-create with correct schema
        const schema = `CREATE TABLE IF NOT EXISTS MEETINGS (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            time TEXT NOT NULL,
            duration TEXT,
            participants INTEGER,
            FOREIGN KEY (userId) REFERENCES USERS(id)
        )`;
        await executeQuery(schema);
        console.log('Re-created MEETINGS table with correct schema');

        // 3. Verify
        const result = await executeQuery('PRAGMA table_info(MEETINGS)');
        console.log('Current MEETINGS columns:');
        result.rows.forEach(row => console.log(`- ${row.name}`));

    } catch (err) {
        console.error('Reset failed:', err);
    } finally {
        process.exit(0);
    }
};

resetMeetingsTable();

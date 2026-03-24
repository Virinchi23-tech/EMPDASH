const { executeQuery } = require('./config/db');

const checkSchema = async () => {
    try {
        const result = await executeQuery('PRAGMA table_info(MEETINGS)');
        console.log('Columns in MEETINGS:');
        result.rows.forEach(row => {
            console.log(`- ${row.name} (${row.type})`);
        });
    } catch (err) {
        console.error('Failed to check schema:', err);
    } finally {
        process.exit(0);
    }
};

checkSchema();

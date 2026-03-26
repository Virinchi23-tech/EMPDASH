const { client } = require('../config/db');

async function checkDatabase() {
    try {
        console.log('--- TABLES ---');
        const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
        console.log(JSON.stringify(tables.rows, null, 2));

        for (const table of tables.rows) {
            console.log(`--- SCHEMA: ${table.name} ---`);
            const info = await client.execute(`PRAGMA table_info(${table.name})`);
            console.log(JSON.stringify(info.rows, null, 2));
        }
    } catch (err) {
        console.error('❌ Database Check Failed:', err.message);
    }
    process.exit();
}

checkDatabase();

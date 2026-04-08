const { client } = require('../config/db');

async function check() {
    try {
        console.log('--- Employees Table Info ---');
        const info = await client.execute("PRAGMA table_info(employees)");
        console.table(info.rows);

        console.log('--- Employees Index List ---');
        const indexes = await client.execute("PRAGMA index_list(employees)");
        console.table(indexes.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();

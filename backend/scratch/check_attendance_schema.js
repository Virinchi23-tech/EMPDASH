const { client } = require('../config/db');

async function check() {
    try {
        const info = await client.execute("PRAGMA table_info(attendance)");
        console.table(info.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();

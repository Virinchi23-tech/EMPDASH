const { client } = require('../config/db');

async function check() {
    try {
        const rows = await client.execute("SELECT id, emp_id, email, name FROM users WHERE email = 'virinchi@gmail.com'");
        console.table(rows.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();

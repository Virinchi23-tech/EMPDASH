const { client } = require('../config/db');

async function check() {
    try {
        console.log('--- Duplicate Emails in Employees ---');
        const dupes = await client.execute("SELECT email, COUNT(*) as c FROM employees GROUP BY email HAVING c > 1");
        console.table(dupes.rows);

        console.log('--- Duplicate emp_id in Employees ---');
        const dupesId = await client.execute("SELECT emp_id, COUNT(*) as c FROM employees GROUP BY emp_id HAVING c > 1");
        console.table(dupesId.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();

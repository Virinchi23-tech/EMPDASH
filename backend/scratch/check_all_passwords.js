const { client } = require('../config/db');

async function check() {
    try {
        const rows = await client.execute("SELECT email, password FROM users");
        for (const r of rows.rows) {
            const isHashed = r.password.startsWith('$2a$') || r.password.startsWith('$2b$');
            console.log(`${r.email}: ${isHashed ? '✅ Hashed' : '❌ Plaintext'}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();

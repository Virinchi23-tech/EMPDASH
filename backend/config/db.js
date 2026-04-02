const { createClient } = require('@libsql/client');
require('dotenv').config();

const url = (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL)?.trim();
const authToken = (process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN)?.trim();

/**
 * 🌍 Simple Remote Connection Only (Task 2)
 * Do NOT use local file, replication, or sync features (Task 1 & 3)
 */
const db = createClient({
  url: url,
  authToken: authToken || '',
});

/**
 * connectDB - Simple connection health check
 */
const connectDB = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`🔌 [Attempt ${i+1}] Probing Turso Cloud: ${url}`);
            // Direct query as requested (Task 4)
            const result = await db.execute('SELECT 1 as probe');
            if (result.rows.length > 0) {
                console.log('✅ Turso Cloud Node: OPERATIONAL');
                return true;
            }
        } catch (error) {
            console.warn(`⚠️  Cloud Probe Failed: ${error.message}`);
            if (i < retries - 1) {
                console.log('🔄 Retrying cloud handshake in 2s...');
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }
    return false;
};

/**
 * proxy client: Logs queries for observability
 */
const client = new Proxy({}, {
    get: (target, prop) => {
        if (prop === 'execute') {
            return async (query) => {
                const sql = typeof query === 'string' ? query : query.sql;
                const start = Date.now();
                console.log(`🔍 [SQL Query] ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
                try {
                    const result = await db.execute(query);
                    console.log(`✔️  [SQL Success] Latency: ${Date.now() - start}ms`);
                    return result;
                } catch (err) {
                    console.error(`❌ [SQL Error] ${err.message}`);
                    throw err;
                }
            };
        }
        
        if (typeof db[prop] === 'function') {
            return db[prop].bind(db);
        }
        return db[prop];
    }
});

const executeQuery = async (sql, args = []) => {
    return await client.execute({ sql, args });
};

module.exports = { client, connectDB, executeQuery };

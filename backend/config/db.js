const { createClient } = require('@libsql/client');

let dbClient;
try {
  dbClient = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:./local.db',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  });
} catch (err) {
  console.error("❌ Failed to initialize libSQL client:", err.message);
  process.exit(1);
}

// Ensure the DB is definitely reachable before letting the app pretend it's fine.
const verifyConnection = async () => {
  try {
    console.log("⏳ Attempting to connect to Turso database...");
    await dbClient.execute('SELECT 1;');
    console.log("✅ Turso Connected Successfully!");
  } catch (err) {
    console.error("❌ Turso Connection Failed:", err.message);
    process.exit(1); // Stop server if DB totally unreachable
  }
};

const executeQuery = async (sql, args = []) => {
  try {
    return await dbClient.execute({ sql, args });
  } catch (err) {
    console.error(`❌ DB Query Error [${sql}]:`, err.message);
    throw err;
  }
};

module.exports = { dbClient, executeQuery, verifyConnection };

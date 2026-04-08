const { client } = require('../config/db');

async function migrate() {
    try {
        console.log('🚀 Starting profile_image migration...');
        
        // Add column to employees
        try {
            await client.execute("ALTER TABLE employees ADD COLUMN profile_image TEXT DEFAULT NULL;");
            console.log('✅ Column profile_image added to employees table');
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log('ℹ️ Column profile_image already exists in employees table');
            } else {
                throw e;
            }
        }

        // Add column to users
        try {
            await client.execute("ALTER TABLE users ADD COLUMN profile_image TEXT DEFAULT NULL;");
            console.log('✅ Column profile_image added to users table');
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log('ℹ️ Column profile_image already exists in users table');
            } else {
                throw e;
            }
        }

        console.log('🏁 Migration finished successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();

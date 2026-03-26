const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

if (!process.env.TURSO_DATABASE_URL && !process.env.DATABASE_URL) {
    console.error("❌ ERROR: TURSO_DATABASE_URL or DATABASE_URL environment variable is missing.");
    process.exit(1);
}
if (!process.env.TURSO_AUTH_TOKEN && !process.env.DATABASE_AUTH_TOKEN) {
    console.warn("⚠️ WARNING: TURSO_AUTH_TOKEN or DATABASE_AUTH_TOKEN is missing (only okay if using a local SQLite file).");
}

const { connectDB } = require('./config/db');
const setupDatabase = require('./config/db-setup');

// Module Routing Infrastructure
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const projectRoutes = require('./routes/projectRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const performanceRoutes = require('./routes/performanceRoutes'); // Strategic Module

const app = express();
app.use(cors());
app.use(express.json());

// Observation Layer: Real-time traffic monitoring
app.use(morgan('📡 [:method] :url -> Status: :status (:response-time ms)'));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salary', salaryRoutes); // Financial Registry
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes); // Organizational Pulse
app.use('/api/performance', performanceRoutes); // Performance Monitoring

app.get('/', (req, res) => res.json({ status: 'Operational', syncMode: 'Cloud' }));

/**
 * startServer - Synchronizes and binds the system to Port 3001
 */
const startServer = async () => {
    try {
        console.log('🔄 Loading Cloud Portfolio Infrastructure...');
        const isDBReady = await connectDB(3); // Retry 3 times
        
        if (!isDBReady) {
            console.error('❌ Cloud Connection Terminal Error: Cannot sync data.');
            process.exit(1);
        }
        
        // Finalize schema with Performance and Salary tiers
        await setupDatabase();

        const PORT = parseInt(process.env.PORT) || 3001; 
        app.listen(PORT, () => {
            console.log(`🌐 Production API Lifecycle started on: http://localhost:${PORT}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`🔥 FATAL: Port ${PORT} occupied. Infrastructure startup aborted.`);
                process.exit(1);
            } else {
                console.error('🔥 Unexpected Error:', err.message);
                process.exit(1);
            }
        });

    } catch (criticalErr) {
        console.error('🔥 CRITICAL SYSTEM CRASH during boot phase:');
        console.error(criticalErr.stack);
        process.exit(1);
    }
};

startServer();

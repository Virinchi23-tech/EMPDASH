const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// 1. Environment Guard: Turso Synchronicity Verification
if (!process.env.TURSO_DATABASE_URL && !process.env.DATABASE_URL) {
    console.error("❌ ERROR: TURSO_DATABASE_URL environment variable is missing.");
    process.exit(1);
}

const { connectDB } = require('./config/db');
const setupDatabase = require('./config/db-setup');

// 2. Route Topology Mapping
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const projectRoutes = require('./routes/projectRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const breakRoutes = require('./routes/breakRoutes');
const bonusRoutes = require('./routes/bonusRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 3. Middlewares: Production Hardening
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000',
  'https://emp-dash-seven.vercel.app', // Core production node
  '*' // Fallback for initial cloud handshake
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Tunneling rejected for this origin.'));
    }
  },
  credentials: true
}));

app.use(express.json());
// Global Traffic Monitoring
app.use(morgan('📡 [:method] :url -> Status: :status (:response-time ms)'));

// 4. API Request Auditing for Cloud Debugging
app.use((req, res, next) => {
  console.log(`[CLOUD TRACE] ${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// 5. Health Handshake
app.get('/api/health', (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    node: process.env.NODE_ENV || 'production'
  });
});

// 6. Registered Strategy Routes with mandatory /api prefixes 
// As requested for Render-Vercel synchronization
console.log('🏗️  Mapping Organizational Topology...');
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/breaks', breakRoutes);
app.use('/api/bonus', bonusRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.json({ 
    success: true, 
    message: 'Admin-Employee Dashboard Backend API Operational',
    status: 'Cloud Ready',
    prefix: '/api'
}));

// 7. Topology Catch-all
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `Strategic Route ${req.method} ${req.url} not found in this node.` 
    });
});

// 8. Lifecycle Bootstrap
const startServer = async () => {
    try {
        console.log('🚀 Initializing Enterprise Backend Logic...');
        
        // Database Handshake
        const isDBReady = await connectDB(3);
        if (!isDBReady) {
            console.error('❌ Cloud Connection Terminal Error: Sync aborted.');
            process.exit(1);
        }
        
        // Sync Logic Schema
        await setupDatabase();
        console.log('✅ Final Hub Schema Synchronized.');

        // Dynamic Port Binding for Render Excellence
        const PORT = process.env.PORT || 5000; 
        app.listen(PORT, () => {
            console.log(`✅ Production Hub Operational on Port ${PORT}`);
            console.log(`📡 Dashboard API: http://localhost:${PORT}/api`);
            console.log(`📋 Health: http://localhost:${PORT}/api/health\n`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`🔥 PORT ${PORT} OCCUPIED: Shutdown conflicting nodes.`);
                process.exit(1);
            } else {
                console.error('🔥 BOOT ERROR:', err.message);
                process.exit(1);
            }
        });

    } catch (criticalErr) {
        console.error('🔥 HUB CRITICAL FAILURE:');
        console.error(criticalErr.stack);
        process.exit(1);
    }
};

startServer();

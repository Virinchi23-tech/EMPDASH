require('dotenv').config();

// 1. Validate Environment Variables IMMEDIATELY
if (!process.env.TURSO_DATABASE_URL) {
  console.error("❌ ERROR: TURSO_DATABASE_URL environment variable is missing.");
  process.exit(1);
}
if (!process.env.TURSO_AUTH_TOKEN) {
  console.warn("⚠️ WARNING: TURSO_AUTH_TOKEN is missing (only okay if intentionally using a local SQLite file).");
}

const express = require('express');
const cors = require('cors');

const { initializeDatabase } = require('./models/initDb');
const { verifyConnection } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const managerRoutes = require('./routes/managerRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'] }));
app.use(express.json());

// API Request Logging
app.use((req, res, next) => {
  console.log(`[API LOG] HTTP ${req.method} ${req.url}`);
  next();
});

// Register Route Modules
app.use('/auth', authRoutes);
app.use('/api', employeeRoutes);
app.use('/api', managerRoutes);
app.use('/api', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: "Backend running" });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'EMP Dashboard Health Check: OK', timestamp: new Date().toISOString() });
});

// Legacy health check for backwards compatibility
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EMP Dashboard Turso API is streaming successfully.', timestamp: new Date().toISOString() });
});

// Unknown routes catch-all
app.use((req, res) => {
  console.warn(`[API WARNING] 404 Route Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found on the backend.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🛑 [GLOBAL ERROR]", err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Boot Database & Validate State
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`📋 Health check available at: http://localhost:${port}/api/health\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} busy, switching to ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Failed to start server:', err.message);
      process.exit(1);
    }
  });
};

const bootServer = async () => {
  console.log("🚀 Starting server...");
  try {
    // 2. Init and test Turso database
    await verifyConnection();
    await initializeDatabase();
    
    // 3. Server lifecycle start
    startServer(PORT);
  } catch (err) {
    console.error("❌ Fatal Boot Error. Server aborted:", err.message);
    process.exit(1);
  }
};

bootServer();

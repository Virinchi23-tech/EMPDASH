const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Schema
const schemaPath = path.join(__dirname, 'database', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.serialize(() => {
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error initializing schema:', err.message);
    } else {
      console.log('Database schema initialized.');
    }
  });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const breakRoutes = require('./routes/breakRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const bonusRoutes = require('./routes/bonusRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const meetingRoutes = require('./routes/meetingRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/break', breakRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/bonuses', bonusRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/meetings', meetingRoutes);

app.get('/', (req, res) => {
  res.send('Employee Dashboard API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

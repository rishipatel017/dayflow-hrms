const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const db = require('./config/db');
const { verifyToken } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Test Route
app.get('/', (req, res) => {
  res.send('DayFlow HRMS Backend is running');
});

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const seedRoutes = require('./routes/seedRoutes');

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/users', verifyToken, employeeRoutes);
app.use('/api/attendance', verifyToken, attendanceRoutes);
app.use('/api/leaves', verifyToken, leaveRoutes);
app.use('/api/salary', verifyToken, salaryRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);
app.use('/api/seed', verifyToken, seedRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

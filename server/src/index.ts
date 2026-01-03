import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import leaveRoutes from './routes/leaveRoutes';
import salaryRoutes from './routes/salaryRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { authenticateJWT } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', authenticateJWT, uploadRoutes);

// Protected routes
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/attendance', authenticateJWT, attendanceRoutes);
app.use('/api/leaves', authenticateJWT, leaveRoutes);
app.use('/api/salaries', authenticateJWT, salaryRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

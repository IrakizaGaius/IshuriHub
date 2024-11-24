// backend/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const attendanceRoutes = require('./routes/attendance');
const gradeRoutes = require('./routes/grade');
const parentRoutes = require('./routes/parent');
const studentRoutes = require('./routes/student');
const subjectRoutes = require('./routes/subject');
const notificationRoutes = require('./routes/notification');
const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const termRoutes = require('./routes/term');
const { authenticate, authorize } = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Public routes
app.use('/api/users', userRoutes);

// Protected routes
app.use('/api/attendances', authenticate, authorize(['School Admin', 'Teacher']), attendanceRoutes);
app.use('/api/grades', authenticate, authorize(['School Admin', 'Teacher']), gradeRoutes);
app.use('/api/parents', authenticate, authorize(['School Admin', 'Teacher']), parentRoutes);
app.use('api/parents/parents-metrics', authenticate, authorize(['School Admin', 'Teacher']), parentRoutes);
app.use('/api/students', authenticate, authorize(['School Admin', 'Teacher']), studentRoutes);
app.use('/api/subjects', authenticate, authorize(['School Admin', 'Teacher']), subjectRoutes);
app.use('/api/notifications', authenticate, authorize(['School Admin', 'Teacher']), notificationRoutes);
app.use('/api/events', authenticate, authorize(['School Admin', 'Teacher']), eventRoutes);
app.use('/api/terms', authenticate, authorize(['School Admin', 'Teacher']), termRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection (cached for serverless)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Import models
const User = require('../backend/models/User');
const Material = require('../backend/models/Material');
const Chat = require('../backend/models/Chat');
const Doubt = require('../backend/models/Doubt');

// Import controllers
const authController = require('../backend/controllers/authController');
const userController = require('../backend/controllers/userController');
const materialController = require('../backend/controllers/materialController');
const chatController = require('../backend/controllers/chatController');
const doubtController = require('../backend/controllers/doubtController');

// Import middleware
const { authenticateToken, authorizeRoles } = require('../backend/middleware/auth');

// Connect to DB before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Auth Routes
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);
app.get('/api/auth/me', authenticateToken, authController.getMe);

// User Routes
app.get('/api/users', authenticateToken, authorizeRoles('admin'), userController.getAllUsers);
app.post('/api/users', authenticateToken, authorizeRoles('admin'), userController.createUser);
app.put('/api/users/:id', authenticateToken, authorizeRoles('admin'), userController.updateUser);
app.delete('/api/users/:id', authenticateToken, authorizeRoles('admin'), userController.deleteUser);
app.get('/api/users/students', authenticateToken, authorizeRoles('teacher', 'admin'), userController.getStudents);
app.get('/api/users/teacher/students', authenticateToken, authorizeRoles('teacher'), userController.getTeacherStudents);
app.post('/api/users/teacher/students', authenticateToken, authorizeRoles('teacher'), userController.addStudentToTeacher);
app.delete('/api/users/teacher/students/:studentId', authenticateToken, authorizeRoles('teacher'), userController.removeStudentFromTeacher);

// Material Routes
app.get('/api/materials', authenticateToken, materialController.getMaterials);
app.get('/api/materials/:id', authenticateToken, materialController.getMaterialById);
app.post('/api/materials', authenticateToken, authorizeRoles('teacher', 'admin'), materialController.createMaterial);
app.put('/api/materials/:id', authenticateToken, authorizeRoles('teacher', 'admin'), materialController.updateMaterial);
app.delete('/api/materials/:id', authenticateToken, authorizeRoles('teacher', 'admin'), materialController.deleteMaterial);
app.get('/api/materials/:id/download', authenticateToken, materialController.downloadMaterial);
app.get('/api/materials/teacher/stats', authenticateToken, authorizeRoles('teacher'), materialController.getTeacherStats);

// Chat Routes
app.get('/api/chat/history', authenticateToken, chatController.getChatHistory);
app.post('/api/chat/message', authenticateToken, chatController.sendMessage);
app.delete('/api/chat/history', authenticateToken, chatController.clearHistory);

// Doubt Routes
app.post('/api/doubts/ask', authenticateToken, doubtController.askDoubt);
app.get('/api/doubts/history', authenticateToken, doubtController.getDoubtHistory);
app.get('/api/doubts/:id', authenticateToken, doubtController.getDoubtById);
app.delete('/api/doubts/:id', authenticateToken, doubtController.deleteDoubt);
app.post('/api/doubts/:id/followup', authenticateToken, doubtController.askFollowUp);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

module.exports = serverless(app);

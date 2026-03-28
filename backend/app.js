require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

// Import all API route handlers
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const materialRoutes = require('./routes/materials');
const doubtRoutes = require('./routes/doubts');
const courseRoutes = require('./routes/courses');
const progressRoutes = require('./routes/progress');
const revisionRoutes = require('./routes/revisions');
const gamificationRoutes = require('./routes/gamification');
const aiRoutes = require('./routes/ai');
const notificationRoutes = require('./routes/notifications');
const quizRoutes = require('./routes/quiz');
const channelRoutes = require('./routes/channels');
const directMessageRoutes = require('./routes/directMessages');

const app = express();

// Machine Learning Service Configuration
// URL for communicating with ML inference service
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// Middleware Configuration
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes Configuration
// Register all application routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/revisions', revisionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/direct-messages', directMessageRoutes);

// ========== MACHINE LEARNING SERVICE PROXY ENDPOINTS ==========
// These endpoints forward requests to the ML microservice

/**
 * Risk Prediction Endpoint
 * Analyzes student data to predict learning risk
 */
app.post('/api/ml/risk/predict', async (req, res) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/risk/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('ML Service risk prediction error:', error);
    res.status(503).json({ error: 'ML Service unavailable', details: error.message });
  }
});

/**
 * Batch Risk Prediction Endpoint
 * Analyzes multiple students for risk prediction in bulk
 */
app.post('/api/ml/risk/batch-predict', async (req, res) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/risk/batch-predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('ML Service batch prediction error:', error);
    res.status(503).json({ error: 'ML Service unavailable', details: error.message });
  }
});

/**
 * Revision Mind Map Endpoint
 * Generates personalized revision mind maps based on student progress
 */
app.post('/api/ml/revision/mindmap', async (req, res) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/revision/mindmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('ML Service mind map generation error:', error);
    res.status(503).json({ error: 'ML Service unavailable', details: error.message });
  }
});

/**
 * Topic Urgency Endpoint
 * Calculates revision urgency scores for different topics
 */
app.post('/api/ml/revision/topic-urgency', async (req, res) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/revision/topic-urgency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('ML Service topic urgency error:', error);
    res.status(503).json({ error: 'ML Service unavailable', details: error.message });
  }
});

// ========== HEALTH CHECK AND STATUS ENDPOINTS ==========

/**
 * Root Status Endpoint
 * Used by deployment platforms (Render, Vercel) for health checks
 */
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Education API is running', timestamp: new Date() });
});

/**
 * API Health Check Endpoint
 * Returns current API status and availability
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Education API is running', timestamp: new Date() });
});

// ========== ERROR HANDLING MIDDLEWARE ==========

/**
 * Global Error Handler
 * Catches and formats all unhandled errors
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

/**
 * 404 Not Found Handler
 * Handles requests to undefined routes
 */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

module.exports = app;

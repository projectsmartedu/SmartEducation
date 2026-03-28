const app = require('./app');
const connectDB = require('./config/db');
const notifications = require('./notifications');
const http = require('http');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
  } catch (dbErr) {
    console.error(`Database connection failed: ${dbErr.message}`);
    
    // Allow server to start in mock mode if MOCK_DATABASE is enabled
    if (process.env.MOCK_DATABASE === 'true') {
      console.warn('⚠️  Starting in MOCK MODE - Database is unavailable but server will continue');
      console.warn('⚠️  All API responses will use mock data');
    } else {
      console.error('MOCK_DATABASE not enabled. Exiting...');
      process.exit(1);
    }
  }

  const server = http.createServer(app);

  // initialize socket.io notifications
  notifications.init(server);

  // Log whether Gemini API key is present (masked)
  try {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      console.log('Gemini API key present:', `${key.substring(0, 6)}...${key.substring(key.length - 4)}`);
    } else {
      console.warn('Gemini API key is NOT set. AI features will fail until configured.');
    }
  } catch (e) {}

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.MOCK_DATABASE === 'true') {
      console.log('📊 MOCK MODE ENABLED - Using mock data for all API responses');
    }
  });
};

startServer();

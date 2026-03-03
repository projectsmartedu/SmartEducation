const app = require('./app');
const connectDB = require('./config/db');
const notifications = require('./notifications');
const http = require('http');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
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
    });
  })
  .catch((err) => {
    console.error(`Failed to connect to DB: ${err.message}`);
    process.exit(1);
  });

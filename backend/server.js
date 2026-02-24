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

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Failed to connect to DB: ${err.message}`);
    process.exit(1);
  });

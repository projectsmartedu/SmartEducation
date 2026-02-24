let io = null;

function init(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

function emitNewCourse(course) {
  if (!io) return;
  io.emit('courseCreated', { course });
}

function emitNewTopic(topic, courseId) {
  if (!io) return;
  io.emit('topicCreated', { topic, courseId });
}

module.exports = { init, getIO, emitNewCourse, emitNewTopic };

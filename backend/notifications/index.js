let io = null;

function init(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // client should send register with { userId, role }
    socket.on('register', ({ userId, role }) => {
      try {
        if (userId) socket.join(`user_${userId}`);
        if (role) socket.join(`role_${role}`);
      } catch (e) {
        console.error('Register socket room error', e);
      }
    });

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

function emitNewDoubt(doubt) {
  if (!io) return;
  // notify all teachers
  io.to('role_teacher').emit('newDoubt', { doubt });
}

function emitDoubtAnswered(doubt, studentId) {
  if (!io) return;
  if (!studentId) return;
  io.to(`user_${studentId}`).emit('doubtAnswered', { doubt });
}

function emitDeadlineAlert(alert, userIds = []) {
  if (!io) return;
  if (!Array.isArray(userIds) || userIds.length === 0) {
    io.emit('deadlineAlert', { alert });
    return;
  }
  userIds.forEach((id) => io.to(`user_${id}`).emit('deadlineAlert', { alert }));
}

module.exports = {
  init,
  getIO,
  emitNewCourse,
  emitNewTopic,
  emitNewDoubt,
  emitDoubtAnswered,
  emitDeadlineAlert
};

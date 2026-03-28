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
        if (userId) {
          socket.join(`user_${userId}`);
          socket.userId = userId;
        }
        if (role) socket.join(`role_${role}`);
      } catch (e) {
        console.error('Register socket room error', e);
      }
    });

    // Channel-specific: Join channel room
    socket.on('joinChannel', ({ channelId, userId }) => {
      try {
        socket.join(`channel_${channelId}`);
        socket.currentChannel = channelId;
        io.to(`channel_${channelId}`).emit('userJoined', { userId, channelId });
      } catch (e) {
        console.error('Join channel error', e);
      }
    });

    // Channel-specific: Leave channel room
    socket.on('leaveChannel', ({ channelId, userId }) => {
      try {
        socket.leave(`channel_${channelId}`);
        io.to(`channel_${channelId}`).emit('userLeft', { userId, channelId });
      } catch (e) {
        console.error('Leave channel error', e);
      }
    });

    // Channel-specific: Typing indicator
    socket.on('userTyping', ({ channelId, userId, userName }) => {
      try {
        io.to(`channel_${channelId}`).emit('userIsTyping', { userId, userName, channelId });
      } catch (e) {
        console.error('Typing indicator error', e);
      }
    });

    // Channel-specific: Stop typing
    socket.on('stopTyping', ({ channelId, userId }) => {
      try {
        io.to(`channel_${channelId}`).emit('userStoppedTyping', { userId, channelId });
      } catch (e) {
        console.error('Stop typing error', e);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      if (socket.currentChannel && socket.userId) {
        io.to(`channel_${socket.currentChannel}`).emit('userLeft', { 
          userId: socket.userId, 
          channelId: socket.currentChannel 
        });
      }
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

// Channel-specific emissions
function emitNewMessage(channelId, message) {
  if (!io) return;
  io.to(`channel_${channelId}`).emit('newMessage', { channelId, message });
}

function emitMessageEdited(channelId, messageId, newContent) {
  if (!io) return;
  io.to(`channel_${channelId}`).emit('messageEdited', { channelId, messageId, newContent });
}

function emitMessageDeleted(channelId, messageId) {
  if (!io) return;
  io.to(`channel_${channelId}`).emit('messageDeleted', { channelId, messageId });
}

function emitReactionAdded(channelId, messageId, emoji, userId) {
  if (!io) return;
  io.to(`channel_${channelId}`).emit('reactionAdded', { channelId, messageId, emoji, userId });
}

function emitChannelCreated(classId, channel) {
  if (!io) return;
  io.to(`class_${classId}`).emit('channelCreated', { classId, channel });
}

function emitChannelUpdated(classId, channel) {
  if (!io) return;
  io.to(`class_${classId}`).emit('channelUpdated', { classId, channel });
}

function emitChannelDeleted(classId, channelId) {
  if (!io) return;
  io.to(`class_${classId}`).emit('channelDeleted', { classId, channelId });
}

// Legacy emissions
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

// Direct Message emissions
function emitDirectMessage(conversationId, message) {
  if (!io) return;
  io.to(`dm_${conversationId}`).emit('directMessage', { conversationId, message });
}

function emitDirectMessageEdited(conversationId, messageId, newContent) {
  if (!io) return;
  io.to(`dm_${conversationId}`).emit('directMessageEdited', { conversationId, messageId, newContent });
}

function emitDirectMessageDeleted(conversationId, messageId) {
  if (!io) return;
  io.to(`dm_${conversationId}`).emit('directMessageDeleted', { conversationId, messageId });
}

function emitDirectMessageReaction(conversationId, messageId, emoji, userId) {
  if (!io) return;
  io.to(`dm_${conversationId}`).emit('directMessageReaction', { conversationId, messageId, emoji, userId });
}

module.exports = {
  init,
  getIO,
  // Channel emissions
  emitNewMessage,
  emitMessageEdited,
  emitMessageDeleted,
  emitReactionAdded,
  emitChannelCreated,
  emitChannelUpdated,
  emitChannelDeleted,
  // DM emissions
  emitDirectMessage,
  emitDirectMessageEdited,
  emitDirectMessageDeleted,
  emitDirectMessageReaction,
  // Legacy emissions
  emitNewCourse,
  emitNewTopic,
  emitNewDoubt,
  emitDoubtAnswered,
  emitDeadlineAlert
};

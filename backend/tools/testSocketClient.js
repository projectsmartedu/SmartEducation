const { io } = require('socket.io-client');

const backend = process.env.BACKEND || 'http://localhost:5000';
const socket = io(backend, { transports: ['websocket', 'polling'] });

socket.on('connect', () => {
  console.log('Connected to socket server', socket.id);
  // register as a dummy user (no auth) just to join role_teacher room too
  socket.emit('register', { userId: 'test-user', role: 'teacher' });
});

socket.on('courseCreated', (data) => console.log('courseCreated', data));
socket.on('topicCreated', (data) => console.log('topicCreated', data));
socket.on('newDoubt', (data) => console.log('newDoubt', data));
socket.on('doubtAnswered', (data) => console.log('doubtAnswered', data));
socket.on('deadlineAlert', (data) => console.log('deadlineAlert', data));

socket.on('disconnect', () => console.log('Socket disconnected'));

// keep process alive
setInterval(() => {}, 1000);

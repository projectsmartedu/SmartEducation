const { io } = require('socket.io-client');

const backend = process.env.BACKEND || 'http://localhost:5000';
const socket = io(backend, { transports: ['websocket', 'polling'] });

socket.on('connect', () => {
  console.log('Student client connected', socket.id);
  socket.emit('register', { userId: 'student-1', role: 'student' });
});

socket.on('courseCreated', (data) => console.log('[student] courseCreated', data));
socket.on('topicCreated', (data) => console.log('[student] topicCreated', data));
socket.on('newDoubt', (data) => console.log('[student] newDoubt', data));
socket.on('doubtAnswered', (data) => console.log('[student] doubtAnswered', data));
socket.on('deadlineAlert', (data) => console.log('[student] deadlineAlert', data));

socket.on('disconnect', () => console.log('Student socket disconnected'));

setInterval(() => {}, 1000);

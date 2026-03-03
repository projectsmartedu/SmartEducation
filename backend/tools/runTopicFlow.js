require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { execSync } = require('child_process');
const mongoose = require('mongoose');
const axios = require('axios');
const { io } = require('socket.io-client');

const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

const API = process.env.API_URL || 'http://localhost:5000';

(async () => {
  try {
    console.log('Seeding database (this will clear existing data)...');
    execSync('node seed.js', { cwd: __dirname + '/..', stdio: 'inherit' });

    // connect to DB to find teacher and course
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URI_DIRECT;
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const teacher = await User.findOne({ email: 'meera@education.com' });
    if (!teacher) {
      console.error('Teacher not found in seeded data');
      process.exit(1);
    }

    const course = await Course.findOne({ createdBy: teacher._id }).lean();
    if (!course) {
      console.error('No course found for teacher', teacher.email);
      process.exit(1);
    }

    const studentId = course.enrolledStudents && course.enrolledStudents[0];
    console.log('Using course:', course.title, 'id=', course._id.toString());
    console.log('Notifying student id:', studentId ? studentId.toString() : 'none');

    // start student socket listener
    const socket = io(API, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => {
      console.log('[socket] connected as test student', socket.id);
      if (studentId) socket.emit('register', { userId: studentId.toString(), role: 'student' });
    });
    socket.on('topicCreated', (data) => console.log('[socket] topicCreated event received:', data));
    socket.on('deadlineAlert', (d) => console.log('[socket] deadlineAlert', d));

    // login as teacher
    console.log('Logging in as teacher', teacher.email);
    const loginResp = await axios.post(`${API}/api/auth/login`, { email: teacher.email, password: 'teacher123' });
    const token = loginResp.data.token;

    // create a new topic via API
    const topicPayload = { title: 'Thermochemistry — Test Topic', description: 'Auto-created test topic' };
    console.log('Posting new topic to course via API...');
    const topicResp = await axios.post(`${API}/api/courses/${course._id}/topics`, topicPayload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Topic create response:', topicResp.data.message || topicResp.data);

    // wait a moment for socket
    await new Promise(r => setTimeout(r, 2000));

    // check notifications for the student
    const notifs = await Notification.find({ recipient: studentId }).sort({ createdAt: -1 }).limit(10).lean();
    console.log('Notifications for student:', notifs.length);
    notifs.forEach(n => console.log(`- ${n.type} | ${n.message} | ${n.data && JSON.stringify(n.data)}`));

    socket.disconnect();
    await mongoose.disconnect();
    console.log('Flow complete.');
    process.exit(0);
  } catch (e) {
    console.error('Error in runTopicFlow:', e.response?.data || e.message || e);
    process.exit(1);
  }
})();

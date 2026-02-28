require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

const uri = process.env.MONGODB_URI || process.env.MONGODB_URI_DIRECT;

(async () => {
  if (!uri) {
    console.error('No MongoDB URI found in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined, useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const total = await Notification.countDocuments();
    console.log('Total notifications:', total);

    const recent = await Notification.find().sort({ createdAt: -1 }).limit(10).populate('recipient', 'name email').populate('sender', 'name email');
    console.log('Recent notifications:');
    recent.forEach((n) => {
      console.log(`- ${n._id} | type=${n.type} | message=${n.message} | recipient=${n.recipient?.email || n.recipient} | sender=${n.sender?.email || n.sender} | read=${n.read} | createdAt=${n.createdAt}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('Error querying notifications:', e);
    process.exit(1);
  }
})();

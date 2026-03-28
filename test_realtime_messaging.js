/**
 * Test Real-Time Messaging with Socket.io
 * Simulates two users connecting and sending/receiving messages
 */

const io = require('socket.io-client');

const API_BASE = 'http://localhost:5000';

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║          REAL-TIME MESSAGING TEST - WITH AUTH               ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// First, authenticate to get valid JWT tokens
async function authenticateUser(email, password) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      console.error(`Login failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('📌 Login response:', JSON.stringify(data).substring(0, 150));
    return { 
      token: data.token || data.access_token,
      user: data.user || data,
      userId: data.user?._id || data._id 
    };
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return null;
  }
}
class User {
  constructor(name, token, userId) {
    this.name = name;
    this.token = token;
    this.userId = userId;
    this.messagesReceived = [];
  }

  connect() {
    return new Promise((resolve) => {
      this.socket = io(API_BASE, {
        auth: { token: this.token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log(`✅ ${this.name} connected (Socket ID: ${this.socket.id})`);
        // Register user
        this.socket.emit('register', {
          userId: this.userId,
          role: 'student'
        });
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log(`❌ ${this.name} disconnected`);
      });

      // Listen for new messages
      this.socket.on('newMessage', ({ message }) => {
        console.log(`\n📨 ${this.name} RECEIVED MESSAGE:`);
        console.log(`   From: ${message.sender?.name || 'Unknown'}`);
        console.log(`   Content: "${message.content}"`);
        this.messagesReceived.push(message);
      });

      this.socket.on('error', (error) => {
        console.log(`❌ ${this.name} Socket Error:`, error);
      });
    });
  }

  async sendMessage(channelId, content, token) {
    console.log(`\n📤 ${this.name} SENDING MESSAGE to channel ${channelId}:`);
    console.log(`   Content: "${content}"`);
    
    try {
      // Send message via REST API (the correct way)
      const response = await fetch(`${API_BASE}/api/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        console.log(`❌ Failed to send message: ${response.status}`);
        return;
      }

      const message = await response.json();
      console.log(`✅ Message sent successfully`);
    } catch (error) {
      console.log(`❌ Error sending message: ${error.message}`);
    }
  }

  joinChannel(channelId) {
    console.log(`\n👉 ${this.name} joining channel: ${channelId}`);
    this.socket.emit('joinChannel', { channelId });
  }

  disconnect() {
    console.log(`\n🔌 ${this.name} disconnecting...`);
    this.socket.disconnect();
  }
}

async function runTest() {
  try {
    console.log('╭─────────────────────────────────────────────────────────────╮');
    console.log('│ STEP 0: Authenticate Users                                 │');
    console.log('╰─────────────────────────────────────────────────────────────╯\n');

    // Try to use existing test users from seed.js
    const auth1 = await authenticateUser('student@education.com', 'student123');
    if (!auth1) {
      console.log('❌ Could not authenticate Jane Student');
      process.exit(1);
    }

    const auth2 = await authenticateUser('priya@education.com', 'student123');
    if (!auth2) {
      console.log('❌ Could not authenticate Priya Nair');
      process.exit(1);
    }

    console.log(`✅ User 1 authenticated: ${auth1.user.name}`);
    console.log(`✅ User 2 authenticated: ${auth2.user.name}\n`);

    console.log('╭─────────────────────────────────────────────────────────────╮');
    console.log('│ STEP 1: Connect Two Users via Socket.io                    │');
    console.log('╰─────────────────────────────────────────────────────────────╯\n');

    const user1 = new User('📱 Jane Student', auth1.token, auth1.user._id);
    const user2 = new User('📱 Priya Nair', auth2.token, auth2.user._id);

    await user1.connect();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await user2.connect();
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n╭─────────────────────────────────────────────────────────────╮');
    console.log('│ STEP 2: Get Channel & Both Users Join                      │');
    console.log('╰─────────────────────────────────────────────────────────────╯');

    // First, get a real channel from the database - try to find a class first
    // Assuming Jane's class (you can modify this)
    const classResponse = await fetch(`${API_BASE}/api/users/${auth1.user._id}`, {
      headers: { 'Authorization': `Bearer ${auth1.token}` }
    });
    
    let testChannelId = null;
    
    if (classResponse.ok) {
      const userData = await classResponse.json();
      const classId = userData.enrolledCourses?.[0]?.course || userData.enrolledCourses?.[0]?._id;
      
      if (classId) {
        const channelsRes = await fetch(`${API_BASE}/api/channels/class/${classId}`, {
          headers: { 'Authorization': `Bearer ${auth1.token}` }
        });
        
        if (channelsRes.ok) {
          const channels = await channelsRes.json();
          if (channels.length > 0) {
            testChannelId = channels[0]._id;
            console.log('✅ Using real channel:', channels[0].name, '(' + testChannelId + ')');
          }
        }
      }
    }
    
    // Fallback: Create a test channel if none found
    if (!testChannelId) {
      console.log('📝 Creating new test channel...');
      const createChannelRes = await fetch(`${API_BASE}/api/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth1.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test Real-Time Channel',
          description: 'Channel for real-time messaging tests',
          classId: '507f1f77bcf86cd799439011', // Default test class ID
          channelType: 'discussion'
        })
      });
      
      if (createChannelRes.ok) {
        const newChannel = await createChannelRes.json();
        testChannelId = newChannel._id;
        console.log('✅ Created test channel:', newChannel.name);
      } else {
        console.error('❌ Failed to create test channel. No valid channel ID available.');
        process.exit(1);
      }
    }

    // Add Priya as a member to the channel (so she can send messages)
    console.log('👥 Adding Priya as channel member...');
    const addMemberRes = await fetch(`${API_BASE}/api/channels/${testChannelId}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth1.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        memberIds: [auth2.user._id]
      })
    });
    
    if (addMemberRes.ok) {
      console.log('✅ Priya added to channel');
    } else {
      console.log('⚠️  Could not add Priya explicitly (she may auto-join anyway)');
    }

    user1.joinChannel(testChannelId);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    user2.joinChannel(testChannelId);
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n╭─────────────────────────────────────────────────────────────╮');
    console.log('│ STEP 3: User 1 Sends Message                               │');
    console.log('╰─────────────────────────────────────────────────────────────╯');

    await user1.sendMessage(testChannelId, 'Hello from Jane! 👋', auth1.token);   
    // Wait for message to be broadcast
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n╭─────────────────────────────────────────────────────────────╮');
    console.log('│ STEP 4: User 2 Sends Message                               │');
    console.log('╰─────────────────────────────────────────────────────────────╯');

    await user2.sendMessage(testChannelId, 'Hi Jane! This is Priya 👋', auth2.token);
    
    // Wait for message to be broadcast
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n╭─────────────────────────────────────────────────────────────╮');
    console.log('│ TEST RESULTS                                               │');
    console.log('╰─────────────────────────────────────────────────────────────╯\n');

    console.log(`📊 User 1 (Jane) received ${user1.messagesReceived.length} messages`);
    console.log(`📊 User 2 (Priya) received ${user2.messagesReceived.length} messages`);

    if (user1.messagesReceived.length > 0) {
      console.log('\n✅ User 1 message history:');
      user1.messagesReceived.forEach((msg, idx) => {
        console.log(`   [${idx+1}] ${msg.sender?.name}: "${msg.content}"`);
      });
    }

    if (user2.messagesReceived.length > 0) {
      console.log('\n✅ User 2 message history:');
      user2.messagesReceived.forEach((msg, idx) => {
        console.log(`   [${idx+1}] ${msg.sender?.name}: "${msg.content}"`);
      });
    }

    // Test Results Summary
    console.log('\n╭─────────────────────────────────────────────────────────────╮');
    if (user1.messagesReceived.length > 0 && user2.messagesReceived.length > 0) {
      console.log('│ ✅ REAL-TIME MESSAGING WORKING! Messages synced to all    │');
      console.log('╰─────────────────────────────────────────────────────────────╯');
    } else {
      console.log('│ ❌ REAL-TIME MESSAGING FAILED! Messages not syncing       │');
      console.log('╰─────────────────────────────────────────────────────────────╯');
    }

    // Cleanup
    user1.disconnect();
    user2.disconnect();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    process.exit(1);
  }
}

runTest();

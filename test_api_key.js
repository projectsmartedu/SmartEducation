// Quick test for the new Gemini API key
const https = require('https');

const apiKey = 'AIzaSyCTyeHJYy_VkX09dqJp0AusE50-yl2C-3w';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

const data = JSON.stringify({
  contents: [{
    parts: [{
      text: "Say 'Key is working!'"
    }]
  }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let response = '';
  res.on('data', chunk => response += chunk);
  res.on('end', () => {
    console.log('\n✅ Status:', res.statusCode);
    console.log('\n📝 Response:');
    try {
      const parsed = JSON.parse(response);
      if (parsed.error) {
        console.log('❌ Error:', parsed.error.message);
      } else if (parsed.candidates) {
        console.log('✅ Success! Response:', parsed.candidates[0]?.content?.parts[0]?.text || 'Generated');
      }
    } catch (e) {
      console.log(response);
    }
  });
});

req.on('error', err => console.log('❌ Connection error:', err.message));
req.write(data);
req.end();

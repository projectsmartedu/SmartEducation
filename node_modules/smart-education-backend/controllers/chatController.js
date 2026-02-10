const Chat = require('../models/Chat');
const https = require('https');

// System prompt for the educational chatbot
const SYSTEM_PROMPT = `You are SmartEdu AI, an intelligent and friendly academic assistant for students. Your role is to:

1. Help students understand complex concepts in subjects like Mathematics, Science, History, Literature, Computer Science, and more
2. Provide clear, step-by-step explanations
3. Encourage critical thinking and problem-solving
4. Give examples and analogies to make concepts easier to understand
5. Be patient, supportive, and encouraging
6. If you don't know something, admit it honestly
7. Suggest additional resources or study tips when appropriate

Always maintain a friendly, professional tone suitable for educational settings. Format your responses with proper structure using bullet points, numbered lists, or paragraphs as appropriate.`;

// Helper function to make HTTPS request
const makeRequest = (url, data) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${parsed.error?.message || responseData}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.write(postData);
    req.end();
  });
};

// Gemini API call using native HTTPS
const getGeminiResponse = async (messages) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Build conversation history for context
    const conversationHistory = messages.map(msg => {
      return `${msg.role === 'user' ? 'Student' : 'SmartEdu AI'}: ${msg.content}`;
    }).join('\n\n');

    // Create the full prompt with system instruction and history
    const fullPrompt = `${SYSTEM_PROMPT}\n\n--- Conversation History ---\n${conversationHistory}\n\n--- End of History ---\n\nPlease respond to the student's last message as SmartEdu AI:`;

    // Try different models - lite models may have separate quota
    const models = ['gemini-2.0-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];
    let lastError = null;
    
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await makeRequest(url, {
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        });

        if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log(`✅ Gemini API success with ${model}`);
          return response.candidates[0].content.parts[0].text;
        }
      } catch (err) {
        console.log(`❌ ${model} failed: ${err.message}`);
        lastError = err;
      }
    }
    
    throw lastError || new Error('All models failed');
  } catch (error) {
    console.error('Gemini API error:', error.message);
    throw error;
  }
};

// Smart fallback response generator
const generateMockResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Math-related responses
  if (lowerMessage.includes('pythagoras') || lowerMessage.includes('pythagorean')) {
    return `**The Pythagorean Theorem** 📐

The Pythagorean theorem states that in a right-angled triangle:

**a² + b² = c²**

Where:
- **a** and **b** are the lengths of the two shorter sides (legs)
- **c** is the length of the longest side (hypotenuse)

**Example:**
If a = 3 and b = 4, then:
- c² = 3² + 4² = 9 + 16 = 25
- c = √25 = **5**

This theorem is fundamental in geometry, construction, navigation, and many real-world applications!`;
  }
  
  if (lowerMessage.includes('quadratic') || lowerMessage.includes('equation')) {
    return `**Quadratic Equations** 📊

A quadratic equation has the form: **ax² + bx + c = 0**

**The Quadratic Formula:**
x = (-b ± √(b² - 4ac)) / 2a

**Steps to solve:**
1. Identify a, b, and c from your equation
2. Calculate the discriminant: b² - 4ac
3. Apply the formula

**Example:** 2x² + 5x - 3 = 0
- a = 2, b = 5, c = -3
- Discriminant = 25 - 4(2)(-3) = 25 + 24 = 49
- x = (-5 ± 7) / 4
- Solutions: x = 0.5 or x = -3`;
  }
  
  // Science responses
  if (lowerMessage.includes('photosynthesis')) {
    return `**Photosynthesis** 🌱

Photosynthesis is the process by which plants convert light energy into chemical energy.

**The Equation:**
6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂

**In simple terms:**
- Plants take in **carbon dioxide** (CO₂) and **water** (H₂O)
- Using **sunlight**, they produce **glucose** (sugar) and release **oxygen**

**Key stages:**
1. **Light-dependent reactions** - occur in the thylakoid
2. **Light-independent reactions (Calvin Cycle)** - occur in the stroma

This process is essential for life on Earth as it produces oxygen and forms the base of most food chains!`;
  }
  
  if (lowerMessage.includes('newton') || lowerMessage.includes('motion') || lowerMessage.includes('law')) {
    return `**Newton's Laws of Motion** 🍎

**First Law (Inertia):**
An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.

**Second Law (F = ma):**
Force equals mass times acceleration. The greater the force, the greater the acceleration.

**Third Law (Action-Reaction):**
For every action, there is an equal and opposite reaction.

**Real-world examples:**
- A car needs brakes to stop (1st law)
- Pushing a shopping cart (2nd law)  
- Rocket propulsion (3rd law)`;
  }
  
  if (lowerMessage.includes('gravity') || lowerMessage.includes('gravitational')) {
    return `**Gravity** 🌍

Gravity is a fundamental force that attracts objects with mass toward each other.

**Key Facts:**
- Discovered by **Sir Isaac Newton**
- On Earth, gravitational acceleration is **9.8 m/s²**
- Formula: F = G(m₁m₂)/r²

**Examples:**
- Why we stay on Earth
- Why planets orbit the Sun
- Why the Moon causes tides

Einstein later explained gravity through General Relativity as the curvature of spacetime!`;
  }
  
  // History
  if (lowerMessage.includes('world war') || lowerMessage.includes('ww')) {
    return `**World Wars Overview** 🌍

**World War I (1914-1918):**
- Also called "The Great War"
- Triggered by assassination of Archduke Franz Ferdinand
- Involved Allied Powers vs Central Powers
- Resulted in ~17 million deaths

**World War II (1939-1945):**
- Largest conflict in human history
- Started with Germany's invasion of Poland
- Allied Powers vs Axis Powers
- Holocaust: 6 million Jews killed
- Ended with atomic bombs on Japan
- Resulted in ~70-85 million deaths

Both wars reshaped global politics and led to the creation of the United Nations.`;
  }
  
  // Programming
  if (lowerMessage.includes('programming') || lowerMessage.includes('code') || lowerMessage.includes('python') || lowerMessage.includes('javascript')) {
    return `**Programming Basics** 💻

Programming is giving instructions to computers using special languages.

**Popular Languages:**
- **Python** - Great for beginners, AI, data science
- **JavaScript** - Web development, front-end & back-end
- **Java** - Enterprise applications, Android
- **C++** - Game development, systems programming

**Core Concepts:**
1. **Variables** - Store data
2. **Loops** - Repeat actions
3. **Conditions** - Make decisions (if/else)
4. **Functions** - Reusable code blocks

Start with Python - it's beginner-friendly and powerful!`;
  }
  
  // Default helpful response
  return `Thank you for your question! 📚

**Your question:** "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"

I'm currently operating in offline mode, but here's how you can find answers:

**Study Tips:**
1. 📖 Review your textbook or class notes
2. 🔍 Search for tutorials on Khan Academy or YouTube
3. 👥 Form a study group with classmates
4. 👨‍🏫 Ask your teacher during office hours

**Online Resources:**
- Khan Academy (khanacademy.org)
- Coursera (coursera.org)
- Wikipedia for quick overviews

I'll be back to full capacity soon. Keep learning! 🌟`;
};

// @desc    Send message and get AI response
// @route   POST /api/chat/message
// @access  Private/Student
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Find or create chat for user
    let chat = await Chat.findOne({ user: req.user._id });
    
    if (!chat) {
      chat = new Chat({
        user: req.user._id,
        messages: []
      });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message.trim()
    });

    // Get AI response from Gemini
    let aiResponse;
    try {
      aiResponse = await getGeminiResponse(chat.messages);
    } catch (error) {
      console.error('Gemini API failed, using fallback:', error.message);
      aiResponse = generateMockResponse(message.trim());
    }

    // Add AI response
    chat.messages.push({
      role: 'assistant',
      content: aiResponse
    });

    await chat.save();

    // Return the last two messages (user + assistant)
    const lastMessages = chat.messages.slice(-2);
    
    res.json({
      userMessage: lastMessages[0],
      assistantMessage: lastMessages[1]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to process message' });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private/Student
const getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user._id });
    
    if (!chat) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chat.messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear chat history
// @route   DELETE /api/chat/history
// @access  Private/Student
const clearChatHistory = async (req, res) => {
  try {
    await Chat.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendMessage, getChatHistory, clearChatHistory };

// ML Model Microservice - Separate from Main App
// Run this on its own Render service for independent scaling
// Start with: node ml-service/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

console.log('ML Service starting...');
console.log(`   Models directory: ${path.join(__dirname, 'models')}`);
console.log(`   Inference script: ${path.join(__dirname, 'ml_inference.py')}`);

// Auto-install Python dependencies on every startup
const installDeps = () => {
  console.log('\n[STARTUP] Checking Python dependencies...');
  try {
    const reqPath = path.join(__dirname, 'requirements.txt');
    if (fs.existsSync(reqPath)) {
      console.log('[STARTUP] Running: pip install -r requirements.txt');
      const result = execSync('pip install -q -r ' + reqPath, { 
        encoding: 'utf-8',
        timeout: 120000 
      });
      console.log('[STARTUP] Python dependencies installed successfully\n');
      return true;
    }
  } catch (e) {
    console.warn('[STARTUP] Warning: pip install error -', e.message);
    console.log('[STARTUP] Attempting to continue anyway...\n');
  }
};

installDeps();

// ========== RISK PREDICTION API ==========

app.post('/api/risk/predict', async (req, res) => {
  try {
    const studentData = req.body;
    let responseSent = false;
    
    const pythonProcess = spawn('python3', [
      path.join(__dirname, 'ml_inference.py'),
      'risk',
      JSON.stringify(studentData)
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (responseSent) return;
      responseSent = true;
      
      if (code !== 0) {
        console.error('Python error:', error);
        return res.status(500).json({ error: 'Risk prediction failed', details: error });
      }
      try {
        const prediction = JSON.parse(result);
        res.json(prediction);
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse prediction' });
      }
    });

    // Timeout after 30s
    setTimeout(() => {
      if (responseSent) return;
      responseSent = true;
      pythonProcess.kill();
      res.status(408).json({ error: 'Request timeout' });
    }, 30000);

  } catch (error) {
    console.error('Risk prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/risk/batch-predict', async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students)) {
      return res.status(400).json({ error: 'Expected array of students' });
    }

    let responseSent = false;

    const pythonProcess = spawn('python3', [
      path.join(__dirname, 'ml_inference.py'),
      'batch_risk',
      JSON.stringify(students)
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (responseSent) return;
      responseSent = true;
      
      if (code !== 0) {
        return res.status(500).json({ error: 'Batch prediction failed' });
      }
      try {
        const predictions = JSON.parse(result);
        res.json({ predictions });
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse predictions' });
      }
    });

    setTimeout(() => {
      if (responseSent) return;
      responseSent = true;
      pythonProcess.kill();
      res.status(408).json({ error: 'Request timeout' });
    }, 60000);

  } catch (error) {
    console.error('Batch risk prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== REVISION URGENCY API ==========

app.post('/api/revision/mindmap', async (req, res) => {
  try {
    const { studentId, topicProgress } = req.body;
    let responseSent = false;
    
    if (!studentId || !topicProgress) {
      return res.status(400).json({ error: 'studentId and topicProgress required' });
    }

    const pythonProcess = spawn('python3', [
      path.join(__dirname, 'ml_inference.py'),
      'mindmap',
      JSON.stringify({ studentId, topicProgress })
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (responseSent) return;
      responseSent = true;
      
      if (code !== 0) {
        return res.status(500).json({ error: 'Mind map generation failed', details: error });
      }
      try {
        const mindmap = JSON.parse(result);
        res.json(mindmap);
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse mind map' });
      }
    });

    setTimeout(() => {
      if (responseSent) return;
      responseSent = true;
      pythonProcess.kill();
      res.status(408).json({ error: 'Request timeout' });
    }, 30000);

  } catch (error) {
    console.error('Mind map error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/revision/topic-urgency', async (req, res) => {
  try {
    const { mastery, lastStudied, attempts, lastScore, practiceHours } = req.body;
    let responseSent = false;
    
    if (mastery === undefined || lastStudied === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pythonProcess = spawn('python3', [
      path.join(__dirname, 'ml_inference.py'),
      'topic_urgency',
      JSON.stringify({ 
        mastery, 
        lastStudied, 
        attempts: attempts || 0, 
        lastScore: lastScore || 0, 
        practiceHours: practiceHours || 0 
      })
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (responseSent) return;
      responseSent = true;
      
      if (code !== 0) {
        return res.status(500).json({ error: 'Topic urgency prediction failed' });
      }
      try {
        const prediction = JSON.parse(result);
        res.json(prediction);
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse prediction' });
      }
    });

    setTimeout(() => {
      if (responseSent) return;
      responseSent = true;
      pythonProcess.kill();
      res.status(408).json({ error: 'Request timeout' });
    }, 30000);

  } catch (error) {
    console.error('Topic urgency error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== HEALTH & INFO ENDPOINTS ==========

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'ML Model Service', version: '2.0' });
});

app.get('/api/risk/info', (req, res) => {
  res.json({
    model: 'risk_prediction_v2',
    version: '2.0',
    status: 'active',
    testAUC: 0.9013,
    features: ['prior_failures', 'study_time', 'absences', 'parent_edu', 'family_support', 'health', 'internet', 'activities', 'travel_time', 'age', 'paid_support']
  });
});

app.get('/api/revision/info', (req, res) => {
  res.json({
    model: 'revision_urgency_v2',
    version: '2.0',
    status: 'active',
    testAUC: 0.9166,
    features: ['mastery', 'last_studied', 'attempts', 'last_score', 'practice_hours']
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'Smart Education ML Service',
    status: 'running',
    version: '2.0',
    endpoints: {
      risk: '/api/risk/predict',
      revision: '/api/revision/mindmap',
      health: '/api/health'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ML Service running on port ${PORT}`);
  console.log(`Risk API: POST /api/risk/predict`);
  console.log(`Revision API: POST /api/revision/mindmap`);
  console.log(`Health: GET /api/health`);
});

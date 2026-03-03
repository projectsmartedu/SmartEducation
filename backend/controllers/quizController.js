const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const Course = require('../models/Course');
const TopicQuiz = require('../models/TopicQuiz');

const MODELS = ['gemini-2.0-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];
const MAX_LLM_GENERATIONS_PER_TOPIC = 5;

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Invalid JSON response');
  }
  const jsonStr = text.slice(start, end + 1);
  return JSON.parse(jsonStr);
}

function normalizeQuestions(rawQuestions, topicId, questionCount) {
  if (!Array.isArray(rawQuestions)) return [];

  const normalized = rawQuestions.map((q, index) => {
    const question = typeof q.question === 'string' ? q.question.trim() : '';
    const options = Array.isArray(q.options)
      ? q.options.map(opt => String(opt).trim()).filter(Boolean).slice(0, 4)
      : [];

    let answerIndex = Number.isInteger(q.answerIndex) ? q.answerIndex : null;
    if ((answerIndex === null || answerIndex < 0 || answerIndex >= options.length) && q.answer) {
      const answerText = String(q.answer).trim().toLowerCase();
      const idx = options.findIndex(opt => opt.toLowerCase() === answerText);
      if (idx >= 0) answerIndex = idx;
    }

    if (!question || options.length !== 4 || answerIndex === null || answerIndex < 0 || answerIndex >= 4) {
      return null;
    }

    return {
      id: `${topicId}_${index + 1}`,
      question,
      options,
      answerIndex,
      explanation: typeof q.explanation === 'string' ? q.explanation.trim() : ''
    };
  }).filter(Boolean);

  return normalized.slice(0, questionCount);
}

function buildFallbackQuestions(topic, course, questionCount, difficulty, materialSnippet = '') {
  const baseTopic = String(topic?.title || 'this topic').trim();
  const baseCourse = String(course?.title || 'this course').trim();
  const normalizedDifficulty = String(difficulty || 'moderate').trim().toLowerCase();
  const difficultyLabel = normalizedDifficulty === 'hard'
    ? 'advanced'
    : normalizedDifficulty === 'easy'
      ? 'foundational'
      : 'intermediate';

  const words = materialSnippet
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 5);

  const uniqueWords = [...new Set(words)].slice(0, 8);

  const templates = [
    {
      question: `What is the primary learning goal of ${baseTopic}?`,
      options: [
        `Understand and apply core ${baseTopic} concepts in problems`,
        `Memorize unrelated definitions only`,
        `Avoid practical use of ${baseTopic}`,
        `Replace ${baseCourse} with a different subject`
      ],
      answerIndex: 0,
      explanation: `${baseTopic} is evaluated by applying concepts, not rote memorization.`
    },
    {
      question: `Which technique is best for evaluating understanding in ${baseTopic}?`,
      options: [
        'Scenario-based multiple-choice questions with explanations',
        'Random guessing without review',
        'Ignoring incorrect responses',
        'Using only attendance data'
      ],
      answerIndex: 0,
      explanation: 'Scenario-based MCQs test conceptual clarity and application.'
    },
    {
      question: `A student scores below 50% in a ${baseTopic} quiz. What should happen next?`,
      options: [
        'Mark topic as in-progress and reattempt the quiz',
        'Mark topic as completed immediately',
        'Delete progress data',
        'Skip the topic permanently'
      ],
      answerIndex: 0,
      explanation: 'Reattempt after feedback is required for low scores.'
    },
    {
      question: `What does a quiz score of 50% or higher indicate in this system?`,
      options: [
        'Topic can be marked as completed',
        'Topic is locked again',
        'The student is unenrolled',
        'No progress should be saved'
      ],
      answerIndex: 0,
      explanation: 'A passing score completes the topic and stores progress.'
    },
    {
      question: `Why are explanations shown after quiz submission?`,
      options: [
        'To provide feedback and support revision before reattempts',
        'To hide the correct answers',
        'To increase loading time',
        'To prevent scoring'
      ],
      answerIndex: 0,
      explanation: 'Explanations close knowledge gaps and improve the next attempt.'
    },
    {
      question: `Which statement best describes ${difficultyLabel} evaluation for ${baseTopic}?`,
      options: [
        'Questions should test both concept recall and application',
        'Only trivia should be asked',
        'No topic context should be used',
        'All answers should be marked correct'
      ],
      answerIndex: 0,
      explanation: `At ${difficultyLabel} level, balanced assessment is most effective.`
    }
  ];

  if (uniqueWords.length >= 2) {
    templates.push({
      question: `Which keyword pair is most likely relevant to ${baseTopic} from the study material?`,
      options: [
        `${uniqueWords[0]} and ${uniqueWords[1]}`,
        'banana and mountain',
        'pencil and thunder',
        'window and galaxy'
      ],
      answerIndex: 0,
      explanation: 'Keywords drawn from study material are usually core to topic understanding.'
    });
  }

  const pool = templates.length > 0 ? templates : [{
    question: `What is a key outcome after studying ${baseTopic}?`,
    options: [
      `Ability to apply ${baseTopic} concepts`,
      'No measurable understanding',
      'Skipping all practice',
      'Avoiding revision'
    ],
    answerIndex: 0,
    explanation: 'Learning outcomes focus on usable understanding.'
  }];

  const questions = [];
  for (let index = 0; index < questionCount; index += 1) {
    const selected = pool[index % pool.length];
    questions.push({
      id: `${topic._id}_${index + 1}`,
      question: selected.question,
      options: selected.options,
      answerIndex: selected.answerIndex,
      explanation: selected.explanation
    });
  }

  return questions;
}

// @desc    Generate a quiz for a topic using Gemini
// @route   POST /api/quiz/topic/:topicId
// @access  Private (Student)
exports.generateTopicQuiz = async (req, res) => {
  try {
    const { questionCount = 10, difficulty = 'moderate' } = req.body || {};
    const count = Math.max(1, Math.min(20, parseInt(questionCount, 10) || 10));
    const normalizedDifficulty = String(difficulty || 'moderate').trim().toLowerCase();
    const topicId = req.params.topicId;

    const existingCount = await TopicQuiz.countDocuments({
      topic: topicId,
      difficulty: normalizedDifficulty,
      questionCount: count
    });

    const topic = await Topic.findById(topicId)
      .populate('course', 'title subject')
      .populate('material', 'content title subject topic');

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const course = topic.course?._id
      ? topic.course
      : await Course.findById(topic.course).select('title subject');

    const materialContent = topic.material?.content || '';
    const materialSnippet = materialContent
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000);

    if (existingCount >= MAX_LLM_GENERATIONS_PER_TOPIC) {
      const [randomQuiz] = await TopicQuiz.aggregate([
        {
          $match: {
            topic: new mongoose.Types.ObjectId(topicId),
            difficulty: normalizedDifficulty,
            questionCount: count
          }
        },
        { $sample: { size: 1 } }
      ]);

      if (randomQuiz) {
        await TopicQuiz.updateOne({ _id: randomQuiz._id }, { $inc: { usageCount: 1 } });
        return res.json({
          topicId: randomQuiz.topic,
          questions: randomQuiz.questions,
          modelUsed: randomQuiz.modelUsed || 'db',
          source: 'db'
        });
      }
    }

    const prompt = [
      'You are an expert educator creating a quiz for students.',
      `Generate ${count} multiple-choice questions at ${normalizedDifficulty} difficulty.`,
      'Each question must have 4 options and one correct answer.',
      'Return strict JSON only with this structure:',
      '{"questions":[{"question":"...","options":["A","B","C","D"],"answerIndex":0,"explanation":"..."}]}',
      'Do not include markdown or code fences.',
      '',
      `Course: ${course?.title || 'Course'} (${course?.subject || 'Subject'})`,
      `Topic: ${topic.title}`,
      topic.description ? `Topic Description: ${topic.description}` : '',
      materialSnippet ? `Material Context: ${materialSnippet}` : ''
    ].filter(Boolean).join('\n');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const questions = buildFallbackQuestions(topic, course, count, normalizedDifficulty, materialSnippet);
      return res.json({
        topicId: topic._id,
        questions,
        modelUsed: 'rule-based-fallback',
        source: 'fallback-no-key'
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const responseText = result?.response?.text();
        if (!responseText) throw new Error('Empty response');

        const parsed = extractJson(responseText);
        const questions = normalizeQuestions(parsed.questions, topic._id, count);
        if (questions.length < count) {
          throw new Error('Incomplete quiz generated');
        }

        const savedQuiz = await TopicQuiz.create({
          topic: topic._id,
          difficulty: normalizedDifficulty,
          questionCount: count,
          questions,
          modelUsed: modelName
        });

        return res.json({
          topicId: savedQuiz.topic,
          questions: savedQuiz.questions,
          modelUsed: savedQuiz.modelUsed,
          source: 'llm'
        });
      } catch (err) {
        console.error(`Quiz generation failed with model ${modelName}:`, err.message);
      }
    }

    const [fallbackQuiz] = await TopicQuiz.aggregate([
      {
        $match: {
          topic: new mongoose.Types.ObjectId(topicId),
          difficulty: normalizedDifficulty,
          questionCount: count
        }
      },
      { $sample: { size: 1 } }
    ]);

    if (fallbackQuiz) {
      await TopicQuiz.updateOne({ _id: fallbackQuiz._id }, { $inc: { usageCount: 1 } });
      return res.json({
        topicId: fallbackQuiz.topic,
        questions: fallbackQuiz.questions,
        modelUsed: fallbackQuiz.modelUsed || 'db',
        source: 'db-fallback'
      });
    }

    const questions = buildFallbackQuestions(topic, course, count, normalizedDifficulty, materialSnippet);
    return res.json({
      topicId: topic._id,
      questions,
      modelUsed: 'rule-based-fallback',
      source: 'fallback-on-error'
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ message: 'Error generating quiz' });
  }
};

// @desc    Get stored quiz pool stats (topic-wise)
// @route   GET /api/quiz/stats
// @access  Private (Teacher/Admin)
exports.getQuizPoolStats = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            topic: '$topic',
            difficulty: '$difficulty',
            questionCount: '$questionCount'
          },
          setsStored: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' },
          latestCreatedAt: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'topics',
          localField: '_id.topic',
          foreignField: '_id',
          as: 'topic'
        }
      },
      {
        $unwind: {
          path: '$topic',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          topicId: '$_id.topic',
          topicTitle: '$topic.title',
          difficulty: '$_id.difficulty',
          questionCount: '$_id.questionCount',
          setsStored: 1,
          llmGenerationsRemaining: {
            $max: [0, { $subtract: [MAX_LLM_GENERATIONS_PER_TOPIC, '$setsStored'] }]
          },
          totalUsage: 1,
          latestCreatedAt: 1
        }
      },
      {
        $sort: {
          topicTitle: 1,
          difficulty: 1,
          questionCount: 1
        }
      }
    ];

    const stats = await TopicQuiz.aggregate(pipeline);

    res.json({
      maxLlmGenerationsPerTopic: MAX_LLM_GENERATIONS_PER_TOPIC,
      totalBuckets: stats.length,
      stats
    });
  } catch (error) {
    console.error('Get quiz pool stats error:', error);
    res.status(500).json({ message: 'Error fetching quiz pool stats' });
  }
};

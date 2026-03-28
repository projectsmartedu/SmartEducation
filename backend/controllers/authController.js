const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock user for development
const MOCK_USER = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Demo Student',
  email: 'student@example.com',
  role: 'student'
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Get mock token
const getMockToken = () => {
  return generateToken(MOCK_USER._id);
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if using mock database
    if (process.env.MOCK_DATABASE === 'true') {
      console.log('🎭 Returning mock user - Database is unavailable');
      return res.json({
        _id: MOCK_USER._id,
        name: MOCK_USER.name,
        email: MOCK_USER.email,
        role: MOCK_USER.role,
        token: getMockToken(),
        isMock: true
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user data with token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Fallback to mock mode on database error
    if (process.env.MOCK_DATABASE === 'true') {
      console.log('🎭 Database error - returning mock user instead');
      return res.json({
        _id: MOCK_USER._id,
        name: MOCK_USER.name,
        email: MOCK_USER.email,
        role: MOCK_USER.role,
        token: getMockToken(),
        isMock: true
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // Check if using mock database
    if (process.env.MOCK_DATABASE === 'true') {
      return res.json({
        _id: MOCK_USER._id,
        name: MOCK_USER.name,
        email: MOCK_USER.email,
        role: MOCK_USER.role,
        isMock: true
      });
    }

    const user = await User.findById(req.user.id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Get me error:', error);
    
    // Fallback to mock mode on database error
    if (process.env.MOCK_DATABASE === 'true') {
      return res.json({
        _id: MOCK_USER._id,
        name: MOCK_USER.name,
        email: MOCK_USER.email,
        role: MOCK_USER.role,
        isMock: true
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = { login, getMe, logout, MOCK_USER, getMockToken };

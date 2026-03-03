const express = require('express');
const router = express.Router();
const { testDoubt } = require('../controllers/debugController');

// Development-only debug endpoints
router.post('/doubt-test', testDoubt);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAiInsights } = require('../Controllers/AiController');

router.get('/', getAiInsights);

module.exports = router;

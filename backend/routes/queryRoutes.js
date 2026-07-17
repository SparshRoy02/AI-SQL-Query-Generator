const express = require('express');
const router = express.Router();
const { generateQuery, getHistory } = require('../controllers/queryController');

router.post('/generate', generateQuery);
router.get('/history', getHistory);

module.exports = router;

const fetch = require('node-fetch');
const Query = require('../models/Query');

const generateQuery = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3',
        prompt: `You are an expert SQL developer. Generate ONLY a valid SQL query for the following request. Do not include any explanation, markdown formatting, or introductory text. Just the raw SQL query.\n\nRequest: ${prompt}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const sqlQuery = data.response.trim();

    // Save to database
    const newQuery = new Query({
      prompt,
      sqlQuery
    });
    
    await newQuery.save();

    res.json({ sql: sqlQuery, id: newQuery._id });
  } catch (error) {
    console.error('Error generating SQL:', error);
    res.status(500).json({ error: 'Failed to generate SQL query. Make sure Ollama is running locally.' });
  }
};

const getHistory = async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 }).limit(20);
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch query history' });
  }
};

module.exports = {
  generateQuery,
  getHistory
};

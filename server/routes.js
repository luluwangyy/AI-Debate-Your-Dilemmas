const express = require('express');
const axios = require('axios');
const router = express.Router();

const OPENAI_API_KEY = 'sk-proj-rxlT2tlbv7xAGRCcko90T3BlbkFJG0GZqpxY9zIiQJBHtXW3';



// Route to generate the question from AI based on user input
router.post('/question', async (req, res) => {
    const { concern, view1, view2 } = req.body;
    const prompt = `Given the concern "${concern}" and the views "${view1}" and "${view2}", what additional question would you ask to better understand the context?`;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 50
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const question = response.data.choices[0].message.content.trim();
        res.json({ question });
    } catch (error) {
        console.error('Error generating AI question:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error generating AI question' });
    }
});

// Route to generate AI responses based on user input and context
router.post('/ai', async (req, res) => {
    const { view, message, context, history } = req.body;

    const prompt = [
        ...history,
        { role: 'user', content: `Based on the context "${context}", respond to the message "${message}" from the perspective of "${view}". Very concise in one sentence. Responsive tone. Please respond to the latest conversation history. Avoid repeat the same reasoning you have mentioned previously` }
    ];

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: prompt,
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiMessage = response.data.choices[0].message.content.trim();
        res.json({ message: aiMessage });
    } catch (error) {
        console.error('Error generating AI response:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error generating AI response' });
    }
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('FATAL: GEMINI_API_KEY is not set in environment.');
  process.exit(1);
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    console.log('Received message from VSCode:', message);

    let prompt = `You are Alice, an AI assistant inside VSCode. The user is asking: "${message}".`;
    if (context && context.file) {
      prompt += `\n\nContext:\nActive File: ${context.file}\n`;
    }
    if (context && context.selection) {
      prompt += `Selected Code:\n\`\`\`\n${context.selection}\n\`\`\`\n`;
    }
    
    prompt += "\nIf you provide code, put it in standard markdown code blocks. If you need to run a shell command, output exactly: <run_command>your command</run_command>";

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    let replyText = response.data.candidates[0].content.parts[0].text;
    res.json({ reply: replyText });
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to contact AI' });
  }
});

app.listen(PORT, () => {
  console.log(`OpenClaw Bridge listening on port ${PORT}`);
});

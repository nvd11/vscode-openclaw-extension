const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Replace with actual OpenClaw API endpoint/token
const OPENCLAW_API = process.env.OPENCLAW_API || 'http://localhost:8000/api/chat'; 

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    console.log('Received message from VSCode:', message);
    console.log('Context:', context);

    // This is a stub for the real OpenClaw integration
    // const response = await axios.post(OPENCLAW_API, { message, context });
    // res.json({ reply: response.data.reply });

    // Mock response for now
    res.json({
      reply: `Hello from Alice! I see you are working in ${context.file}. Here is a sample code block you can apply:\n\n\`\`\`console.log('Alice says hi!');\`\`\``
    });
  } catch (error) {
    console.error('Error communicating with OpenClaw:', error.message);
    res.status(500).json({ error: 'Failed to contact OpenClaw' });
  }
});

app.listen(PORT, () => {
  console.log(`OpenClaw Bridge listening on port ${PORT}`);
});

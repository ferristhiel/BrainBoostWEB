import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const userPrompt = req.body.prompt;
  if (!userPrompt) return res.status(400).json({ error: 'Kein Prompt gesendet' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',  // oder 'gpt-4o' je nachdem
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    const data = await response.json();

    if (data.error) return res.status(500).json({ error: data.error.message });

    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});

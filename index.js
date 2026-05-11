import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(express.static(__dirname, {
  extensions: ['html'],
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  },
}));

function fallbackReply(prompt) {
  return [
    'BrainBoost Lernhilfe (lokaler Fallback)',
    '',
    `Dein Thema: ${prompt}`,
    '',
    '1. Formuliere ein klares Lernziel in einem Satz.',
    '2. Sammle 3 Schlüsselbegriffe und erkläre sie mit eigenen Worten.',
    '3. Übe 10 Minuten aktiv: Aufgabe lösen, laut erklären, Karteikarte schreiben.',
    '4. Prüfe dich mit 3 Mini-Fragen und markiere Unsicherheiten für morgen.',
  ].join('\n');
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'BrainBoostWEB' });
});

app.post('/api/chat', async (req, res) => {
  const prompt = String(req.body?.prompt || '').trim();
  if (!prompt) return res.status(400).json({ error: 'Bitte gib eine Lernfrage ein.' });
  if (prompt.length > 2000) return res.status(413).json({ error: 'Die Anfrage ist zu lang. Bitte kürzen.' });

  if (!client) return res.json({ reply: fallbackReply(prompt), fallback: true });

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Du bist BrainBoost: hilfreich, knapp, schülerfreundlich, auf Deutsch. Gib konkrete Lernschritte und sichere keine personenbezogenen Daten.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 700,
    });
    res.json({ reply: completion.choices?.[0]?.message?.content?.trim() || fallbackReply(prompt) });
  } catch (error) {
    console.error('OpenAI request failed:', error);
    res.status(502).json({ error: 'Die KI ist gerade nicht erreichbar. Nutze bitte die lokalen Tools oder versuche es später erneut.' });
  }
});

app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`BrainBoost läuft auf http://localhost:${port}`);
});

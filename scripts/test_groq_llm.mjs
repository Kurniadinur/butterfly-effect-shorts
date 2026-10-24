import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
const t0 = Date.now();
const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'qwen/qwen3.8-27b',
    messages: [{ role: 'user', content: 'Say Hello in Indonesian' }],
    temperature: 0.7
  })
});
const data = await res.json();
console.log('Groq Qwen response in', ((Date.now() - t0) / 1000).toFixed(2), 's:', data.choices?.[0]?.message?.content);

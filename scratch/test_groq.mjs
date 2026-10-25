import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
console.log('Testing Groq LPU speed...');
const t0 = Date.now();

const prompt = 'Buat 1 naskah pendek format JSON murni: { "title": "TITANIC", "hook": { "narration": "Kunci loker yang terlupakan menenggelamkan kapal terbesar." } }';

const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: 'You are a documentary scriptwriter. Return pure JSON.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })
});

const data = await res.json();
console.log(`⚡ Groq LPU finished in ${Date.now() - t0} ms!`);
console.log(data.choices?.[0]?.message?.content?.slice(0, 150));

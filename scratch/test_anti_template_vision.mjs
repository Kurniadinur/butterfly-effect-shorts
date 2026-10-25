import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('C:/Users/dinur/Documents/ButterflyProject/.env') });

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function auditNewLook() {
  const imgPath = 'C:/Users/dinur/.gemini/antigravity/brain/641930d7-c85b-4ae0-b40f-a70538e51c71/preview_anti_template_dossier.png';
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');

  const prompt = `Anda adalah Direktur Sinematografi & Kurator Visual Film Dokumenter Investigasi.
Bandingkan gaya visual frame ini dengan template video Shorts/TikTok yang klise dan pasaran:
1. Apakah frame ini masih terlihat seperti template Remotion / CapCut murahan, atau sudah berhasil bertransformasi menjadi visual berkelas film dokumenter (HBO / Netflix / Lemmino / Vox)?
2. Bagaimana tipografi subtitle barunya (archival transcript declassified box) dibandingkan subtitle kuning memantul yang biasa dipakai orang?
3. Apa atmosfer yang dirasakan dari perpaduan optik 35mm, stempel bukti, dan desain forensiknya?

Berikan penilaian jujur dan skor dari 0 sampai 100.`;

  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/png',
              data: imgBase64,
            },
          },
        ],
      },
    ],
  });

  console.log(res.text);
}

auditNewLook().catch(console.error);

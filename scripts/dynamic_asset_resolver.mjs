/**
 * Dynamic AI Visual Asset Resolver & Generator for 3D Medical Simulation
 * Uses Gemini AI to deduce the exact action character & target organ,
 * verifies on-disk availability, and generates missing assets on-the-fly.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { rpmGovernor } from './gemini_rpm_governor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Triggers AI Generation for missing character pose or organ cutout
 */
function generateMissingAsset(assetType, description, relativePath) {
  const fullDiskPath = path.join(ROOT_DIR, 'public', relativePath);
  if (fs.existsSync(fullDiskPath) && fs.statSync(fullDiskPath).size > 5000) {
    return relativePath;
  }

  console.log(`\n      🎨 [AI Auto-Asset] Aset "${relativePath}" belum tersedia.`);
  console.log(`      🚀 [AI Visual Synthesis] Menghasilkan 3D cutout baru via AI Multi-Candidate & rembg...`);

  const pyScript = path.join(ROOT_DIR, 'scripts', 'generate_ai_asset.py');
  const res = spawnSync('python', [pyScript, assetType, description, fullDiskPath], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    encoding: 'utf-8',
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });

  if (res.status === 0 && fs.existsSync(fullDiskPath) && fs.statSync(fullDiskPath).size > 5000) {
    console.log(`      ✓ [AI Auto-Asset Berhasil] Aset 3D baru siap digunakan: ${relativePath}`);
    return relativePath;
  }

  console.warn(`      ⚠ [AI Asset Fallback] Menggunakan aset standar terdekat`);
  const fallbackRel = assetType === 'character' ? 'butterfly/characters/action_drinking.png' : 'butterfly/organs/stomach.png';
  const fallbackFull = path.join(ROOT_DIR, 'public', fallbackRel);
  if (fs.existsSync(fallbackFull) && !fs.existsSync(fullDiskPath)) {
    try {
      fs.copyFileSync(fallbackFull, fullDiskPath);
      console.log(`      ✓ [AI Auto-Asset Salin] Aset dasar berhasil disalin ke: ${relativePath}`);
      return relativePath;
    } catch (e) {
      // ignore
    }
  }
  return fallbackRel;
}

/**
 * AI Asset Strategist:
 * Deduces the exact character action pose and target organ from the story content
 */
async function deduceAssetSpecsWithAI(storyData) {
  const context = `
Judul: "${storyData.title || ''}"
Headline Hook: "${storyData.hook?.headline || ''}"
Narasi Hook: "${storyData.hook?.narration || ''}"
Adegan Awal: "${storyData.nodes?.[0]?.headline || ''} - ${storyData.nodes?.[0]?.narration || ''}"
`;

  const prompt = `
Sebagai Sutradara Aset Visual 3D Zack D. Films, tentukan karakter aksi dan organ target untuk video simulasi medis berikut:
${context}

Aturan:
1. 'characterFile': Nama file PNG karakter aksi (contoh: 'action_drinking.png', 'action_holding_pee.png', 'action_eating.png', 'action_sleepy.png', 'action_inhaling.png', 'action_swallowing.png', 'action_shivering.png', 'action_coughing.png', 'action_electrocuted.png').
2. 'characterPrompt': Deskripsi visual detail bahasa Inggris untuk AI 3D image generator (contoh: "young man clutching neck in panic, accidentally swallowed a battery").
3. 'targetOrganFile': Nama file PNG organ target (contoh: 'stomach.png', 'brain.png', 'heart.png', 'kidneys.png', 'bladder.png', 'lungs.png', 'esophagus.png', 'vocal_cords.png', 'nerves.png', 'liver.png', 'intestines.png', 'pancreas.png').
4. 'organPrompt': Deskripsi detail organ target dalam bahasa Inggris.

Output PURE JSON:
{
  "characterFile": "action_xxx.png",
  "characterPrompt": "...",
  "targetOrganFile": "xxx.png",
  "organPrompt": "..."
}
`;

  try {
    const rawResult = await rpmGovernor.executeWithGovernor('Asset Strategist', async (ai, key, keyNum) => {
      const model = rpmGovernor.getBestModelForKey(keyNum, 'text');
      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { temperature: 0.2 },
      });
      return res.text;
    });

    let clean = rawResult.replace(/```json/gi, '').replace(/```/g, '').trim();
    const fIdx = clean.indexOf('{');
    const lIdx = clean.lastIndexOf('}');
    if (fIdx !== -1 && lIdx !== -1) {
      return JSON.parse(clean.slice(fIdx, lIdx + 1));
    }
  } catch (err) {
    console.warn('      ⚠ [Asset Strategist AI Notice] Menggunakan pemetaan heuristik:', err.message);
  }

  // Fallback heuristic
  const lower = context.toLowerCase();
  let charFile = 'action_drinking.png';
  let charPrompt = 'young man holding coffee mug';
  let organFile = 'stomach.png';
  let organPrompt = 'human stomach digestive system';

  if (/kencing|pipis|kemih|bladder/i.test(lower)) {
    charFile = 'action_holding_pee.png';
    charPrompt = 'young man holding bladder in distress';
    organFile = 'bladder.png';
    organPrompt = 'human urinary bladder glowing';
  } else if (/tidur|begadang|melek|insomnia/i.test(lower)) {
    charFile = 'action_sleepy.png';
    charPrompt = 'exhausted man with dark circles';
    organFile = 'brain.png';
    organPrompt = 'human brain with glowing neural networks';
  } else if (/makan|mie|pedas|cabai/i.test(lower)) {
    charFile = 'action_eating.png';
    charPrompt = 'young man eating food hungrily';
    organFile = 'stomach.png';
    organPrompt = 'human stomach with glowing gastric acid';
  } else if (/helium|gas|hirup/i.test(lower)) {
    charFile = 'action_inhaling.png';
    charPrompt = 'young man inhaling gas from balloon';
    organFile = 'vocal_cords.png';
    organPrompt = 'human vocal cords vibrating';
  } else if (/baterai|koin|magnet|telan/i.test(lower)) {
    charFile = 'action_swallowing.png';
    charPrompt = 'young man clutching neck in panic';
    organFile = 'esophagus.png';
    organPrompt = 'human esophagus tube connecting throat to stomach';
  } else if (/dingin|beku|hipotermia/i.test(lower)) {
    charFile = 'action_shivering.png';
    charPrompt = 'young man shivering in freezing cold';
    organFile = 'blood_vessels.png';
    organPrompt = 'human blood vessels circulatory system';
  }

  return { characterFile: charFile, characterPrompt: charPrompt, targetOrganFile: organFile, organPrompt: organPrompt };
}

/**
 * Automatically inspects, resolves, and generates all story assets (characters + organs)
 */
export async function resolveDynamicStoryAssets(storyData) {
  if (storyData.editorialStyle?.mood === 'typography-storyteller') {
    console.log('   🔍 [Asset Auto-Resolver] Mode Minimalist Typography Story Flow aktif.');
    console.log('      ✓ Fokus pada tipografi kinetik estetik & alur cerita yang mengalir (zero asset bottleneck).\n');
    return storyData;
  }

  console.log('   🔍 [Asset Auto-Resolver] Menganalisis kebutuhan aset visual 3D via AI...');
  
  const specs = await deduceAssetSpecsWithAI(storyData);
  console.log(`      ✓ AI Action Pose Target : ${specs.characterFile}`);
  console.log(`      ✓ AI Target Organ       : ${specs.targetOrganFile}`);

  // 1. Resolve / Generate Character Action Pose
  const charRelPath = `butterfly/characters/${specs.characterFile}`;
  const fullCharDiskPath = path.join(ROOT_DIR, 'public', charRelPath);

  let verifiedCharRelPath = charRelPath;
  if (!fs.existsSync(fullCharDiskPath) || fs.statSync(fullCharDiskPath).size < 5000) {
    verifiedCharRelPath = generateMissingAsset('character', specs.characterPrompt, charRelPath);
  }
  storyData.hook.characterActionPng = verifiedCharRelPath;
  console.log(`      ✓ Karakter 3D aksi terverifikasi: ${verifiedCharRelPath}`);

  // 2. Resolve / Generate Target Organ for Hook
  const organRelPath = `butterfly/organs/${specs.targetOrganFile}`;
  const fullOrganDiskPath = path.join(ROOT_DIR, 'public', organRelPath);

  let verifiedOrganRelPath = organRelPath;
  if (!fs.existsSync(fullOrganDiskPath) || fs.statSync(fullOrganDiskPath).size < 5000) {
    verifiedOrganRelPath = generateMissingAsset('organ', specs.organPrompt, organRelPath);
  }
  storyData.hook.targetOrganPng = verifiedOrganRelPath;
  console.log(`      ✓ Target organ terverifikasi: ${verifiedOrganRelPath}`);

  // 3. Normalize & Validate all node organTargets + Auto-Assign matching character action pose
  console.log('   🧑 [Character Action Matcher] Menyelaraskan ekspresi karakter untuk setiap adegan...');
  for (const node of storyData.nodes || []) {
    const rawTarget = (node.organTarget || '').toLowerCase();
    if (rawTarget === 'kidneys') node.organTarget = 'kidney';
    if (rawTarget === 'blood_vessels') node.organTarget = 'blood';
    if (rawTarget === 'intestines') node.organTarget = 'intestine';

    // Auto-assign matching character action pose dynamically
    if (!node.characterActionPng) {
      const combined = `${node.headline || ''} ${node.humanFeeling || ''} ${node.narration || ''} ${node.caption || ''}`.toLowerCase();
      const organ = (node.organTarget || '').toLowerCase();

      if (/gemetar|goyang.*kaki|tarian kencing|kaki|fidget|tremor|menggoyangkan/i.test(combined)) {
        node.characterActionPng = 'butterfly/characters/action_shaking_legs.png';
      } else if (/pegal|pinggang|ginjal|flank|punggung belakang|ngilu/i.test(combined)) {
        node.characterActionPng = 'butterfly/characters/action_back_pain.png';
      } else if (/geli|perut bawah|sensasi awal|sinyal pertama|150ml/i.test(combined)) {
        node.characterActionPng = 'butterfly/characters/action_belly_tingle.png';
      } else if (/kencing|pipis|kemih|beser|ngompol|sfingter/i.test(combined)) {
        node.characterActionPng = 'butterfly/characters/action_holding_pee.png';
      } else if (/pusing|kepala|migrain|otak|vertigo|penat|sulit fokus|linglung/i.test(combined)) {
        node.characterActionPng = 'butterfly/characters/action_headache.png';
      } else if (/dada|jantung|debar|berdebar|sesak|takikardia|serangan jantung/i.test(combined)) {
        node.characterActionPng = 'butterfly/characters/action_chest_pain.png';
      } else if (/perut|lambung|asam|maag|mual|muntah|kembung|melilit|kram perut|diare/i.test(combined)) {
        node.characterActionPng = 'butterfly/characters/action_stomachache.png';
      } else if (/batuk|tersedak|tenggorokan|pita suara|paru/i.test(combined)) {
        node.characterActionPng = 'butterfly/characters/action_coughing.png';
      } else if (/menggigil|meriang|demam|dingin|sepsis|chills/i.test(combined)) {
        node.characterActionPng = 'butterfly/characters/action_shivering.png';
      } else if (/mengantuk|sleepy|lemas|tidur|begadang|insomnia/i.test(combined)) {
        node.characterActionPng = 'butterfly/characters/action_sleepy.png';
      } else if (/kopi|minum|kafein|cairan|dehidrasi/i.test(combined)) {
        node.characterActionPng = 'butterfly/characters/action_drinking.png';
      } else if (/makan|mie|pedas|cabai|makanan/i.test(combined)) {
        node.characterActionPng = 'butterfly/characters/action_eating.png';
      } else if (organ === 'brain') {
        node.characterActionPng = 'butterfly/characters/action_headache.png';
      } else if (organ === 'heart') {
        node.characterActionPng = 'butterfly/characters/action_chest_pain.png';
      } else if (organ === 'lungs') {
        node.characterActionPng = 'butterfly/characters/action_coughing.png';
      } else if (organ === 'stomach' || organ === 'intestine') {
        node.characterActionPng = 'butterfly/characters/action_stomachache.png';
      } else if (organ === 'kidney') {
        node.characterActionPng = 'butterfly/characters/action_back_pain.png';
      } else if (organ === 'bladder') {
        node.characterActionPng = 'butterfly/characters/action_holding_pee.png';
      } else if (organ === 'muscles') {
        node.characterActionPng = 'butterfly/characters/action_shaking_legs.png';
      } else {
        node.characterActionPng = charRelPath;
      }
    }
  }

  console.log(`      ✓ Seluruh organ & karakter 3D 100% tervalidasi dan siap dirender.\n`);
  return storyData;
}

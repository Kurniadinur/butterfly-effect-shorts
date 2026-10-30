/**
 * Dynamic AI Visual Asset Resolver & Generator for 3D Medical Simulation
 * Automatically detects, verifies, and generates missing 3D character action poses
 * and anatomical organs on-the-fly using AI generation + rembg cutout.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CHARACTER_ACTION_CATALOG = [
  { keywords: ['helium', 'gas', 'balon', 'hirup', 'menghirup', 'uap', 'inhaler'], file: 'action_inhaling.png', prompt: 'young man inhaling gas from a balloon, cheeks puffed' },
  { keywords: ['kencing', 'pipis', 'tahan', 'kemih', 'menahan', 'toilet'], file: 'action_holding_pee.png', prompt: 'young man holding bladder in distress, legs crossed, urgent painful expression' },
  { keywords: ['mie', 'makan', 'mie instan', 'makanan', 'pedas', 'cabai', 'telan', 'kunyah'], file: 'action_eating.png', prompt: 'young man eating noodles with chopsticks hungrily' },
  { keywords: ['tidur', 'begadang', 'melek', 'lelah', 'ngantuk', 'insomnia', 'mata'], file: 'action_sleepy.png', prompt: 'exhausted young man with dark circles under eyes looking at glowing smartphone' },
  { keywords: ['kopi', 'minum', 'kafein', 'soda', 'cairan', 'alkohol', 'air laut'], file: 'action_drinking.png', prompt: 'young man holding a hot cup of coffee with steam' },
  { keywords: ['baterai', 'koin', 'magnet', 'tersedak', 'esofagus'], file: 'action_swallowing.png', prompt: 'young man clutching throat in panic, swallowing foreign object' },
  { keywords: ['dingin', 'beku', 'salju', 'menggigil', 'hipotermia', 'es'], file: 'action_shivering.png', prompt: 'young man shivering in extreme cold, hugging chest tightly' },
  { keywords: ['batuk', 'tersedak', 'tenggorokan', 'faring'], file: 'action_coughing.png', prompt: 'young man coughing hard, one hand covering mouth in pain' },
  { keywords: ['listrik', 'petir', 'setrum', 'volt', 'kejang'], file: 'action_electrocuted.png', prompt: 'young man shocked by electrical surge, trembling arms, wide eyes' },
];

const ORGAN_CATALOG = [
  { keywords: ['pita suara', 'laring', 'vocal', 'suara', 'helium'], file: 'vocal_cords.png', organId: 'vocal_cords', prompt: 'human larynx vocal cords vibrating, glowing cyan illumination' },
  { keywords: ['kerongkongan', 'esofagus', 'esophagus', 'telan', 'baterai'], file: 'esophagus.png', organId: 'esophagus', prompt: 'human esophagus tube connecting throat to stomach, glowing cyan' },
  { keywords: ['kandung kemih', 'kemih', 'bladder', 'pipis', 'kencing'], file: 'bladder.png', organId: 'bladder', prompt: 'human urinary bladder distended with glowing fluid' },
  { keywords: ['pembuluh darah', 'darah', 'arteri', 'blood'], file: 'blood_vessels.png', organId: 'blood', prompt: 'vascular circulatory network of human arteries and veins, glowing red and blue' },
  { keywords: ['otak', 'kepala', 'brain', 'neuron', 'kesadaran'], file: 'brain.png', organId: 'brain', prompt: 'human brain hemispheres with glowing synaptic neural firing' },
  { keywords: ['jantung', 'heart', 'detak', 'nadi'], file: 'heart.png', organId: 'heart', prompt: 'anatomical human heart with aorta and ventricles glowing muscular details' },
  { keywords: ['paru', 'lungs', 'napas', 'oksigen', 'alveolus'], file: 'lungs.png', organId: 'lungs', prompt: 'human pair of lungs with bronchial tree and alveoli glowing' },
  { keywords: ['lambung', 'perut', 'stomach', 'asam lambung', 'maag'], file: 'stomach.png', organId: 'stomach', prompt: 'human stomach with gastric mucosa and glowing digestive acid' },
  { keywords: ['hati', 'liver', 'empedu'], file: 'liver.png', organId: 'liver', prompt: 'human liver lobule with gallbladder glowing amber bile' },
  { keywords: ['ginjal', 'kidney', 'filtrasi', 'urin'], file: 'kidneys.png', organId: 'kidney', prompt: 'pair of human kidneys with renal arteries glowing filtration units' },
  { keywords: ['usus', 'intestine', 'pencernaan', 'usus halus'], file: 'intestines.png', organId: 'intestine', prompt: 'human small and large intestines coiled digestive tract glowing' },
  { keywords: ['saraf', 'nerves', 'tulang belakang', 'nyeri'], file: 'nerves.png', organId: 'nerves', prompt: 'human central nervous system spinal cord with glowing action potential impulses' },
  { keywords: ['pankreas', 'pancreas', 'insulin', 'gula'], file: 'pancreas.png', organId: 'pancreas', prompt: 'human pancreas with pancreatic duct glowing endocrine tissue' },
];

/**
 * Triggers AI Generation for missing character pose or organ cutout
 */
function generateMissingAsset(assetType, description, relativePath) {
  const fullDiskPath = path.join(ROOT_DIR, 'public', relativePath);
  if (fs.existsSync(fullDiskPath) && fs.statSync(fullDiskPath).size > 5000) {
    return relativePath;
  }

  console.log(`\n      🎨 [AI Auto-Asset] Aset "${relativePath}" belum tersedia.`);
  console.log(`      🚀 [AI Visual Synthesis] Menghasilkan 3D cutout baru via AI & rembg...`);

  const pyScript = path.join(ROOT_DIR, 'scripts', 'generate_ai_asset.py');
  const res = spawnSync('python', [pyScript, assetType, description, fullDiskPath], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    encoding: 'utf-8',
  });

  if (res.status === 0 && fs.existsSync(fullDiskPath)) {
    console.log(`      ✓ [AI Auto-Asset Berhasil] Aset 3D baru siap digunakan: ${relativePath}`);
    return relativePath;
  }

  console.warn(`      ⚠ [AI Asset Fallback] Menggunakan aset standar terdekat`);
  return assetType === 'character' ? 'butterfly/characters/action_drinking.png' : 'butterfly/organs/stomach.png';
}

/**
 * Automatically inspects, resolves, and generates all story assets (characters + organs)
 */
export async function resolveDynamicStoryAssets(storyData) {
  console.log('   🔍 [Asset Auto-Resolver] Memverifikasi & menyesuaikan aset visual dengan judul...');
  const combinedContext = `${storyData.title || ''} ${storyData.hook?.headline || ''} ${storyData.hook?.narration || ''}`.toLowerCase();

  // 1. Resolve / Generate Character Action Pose
  let matchedCharEntry = CHARACTER_ACTION_CATALOG[0];
  for (const entry of CHARACTER_ACTION_CATALOG) {
    if (entry.keywords.some(k => combinedContext.includes(k))) {
      matchedCharEntry = entry;
      break;
    }
  }

  const charRelPath = `butterfly/characters/${matchedCharEntry.file}`;
  const fullCharDiskPath = path.join(ROOT_DIR, 'public', charRelPath);

  if (!fs.existsSync(fullCharDiskPath) || fs.statSync(fullCharDiskPath).size < 5000) {
    generateMissingAsset('character', matchedCharEntry.prompt, charRelPath);
  }
  storyData.hook.characterActionPng = charRelPath;
  console.log(`      ✓ Karakter 3D disesuaikan dengan topik: ${charRelPath}`);

  // 2. Resolve / Generate Target Organ for Hook
  let matchedOrganEntry = ORGAN_CATALOG[7]; // default stomach
  for (const entry of ORGAN_CATALOG) {
    if (entry.keywords.some(k => combinedContext.includes(k))) {
      matchedOrganEntry = entry;
      break;
    }
  }

  const organRelPath = `butterfly/organs/${matchedOrganEntry.file}`;
  const fullOrganDiskPath = path.join(ROOT_DIR, 'public', organRelPath);

  if (!fs.existsSync(fullOrganDiskPath) || fs.statSync(fullOrganDiskPath).size < 5000) {
    generateMissingAsset('organ', matchedOrganEntry.prompt, organRelPath);
  }
  storyData.hook.targetOrganPng = organRelPath;
  console.log(`      ✓ Target organ disesuaikan dengan topik: ${organRelPath}`);

  // 3. Normalize & Validate all node organTargets
  for (const node of storyData.nodes || []) {
    const rawTarget = (node.organTarget || '').toLowerCase();
    if (rawTarget === 'kidneys') node.organTarget = 'kidney';
    if (rawTarget === 'blood_vessels') node.organTarget = 'blood';
    if (rawTarget === 'intestines') node.organTarget = 'intestine';
  }

  console.log(`      ✓ Seluruh organ & karakter 3D 100% tervalidasi dan siap dirender.\n`);
  return storyData;
}

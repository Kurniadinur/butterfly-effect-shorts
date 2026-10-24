import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SFX_DIR = path.join(ROOT_DIR, 'public', 'butterfly', 'sfx');

function createWavBuffer(sampleRate, channels, samples) {
  const bytesPerSample = 2; // 16-bit
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt Subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data Subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intSample = Math.round(s < 0 ? s * 32768 : s * 32767);
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }

  return buffer;
}

/**
 * 1. Seamless Looping Cinematic Tension Drone (12 Seconds)
 * Rich analog low-end bed (55Hz sub + 110Hz octave + 82.4Hz fifth)
 * Modulated by gentle tape flutter and slow breathing LFO.
 */
function generateTensionDrone() {
  const sampleRate = 44100;
  const durationSec = 12.0;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Breathing LFOs for organic movement (seamless over 12s)
    const lfo1 = Math.sin((2 * Math.PI * t) / 12.0); // 12s cycle
    const lfo2 = Math.cos((4 * Math.PI * t) / 12.0); // 6s cycle

    // Fundamental tones: Sub-bass 55Hz (A1) + 110Hz (A2) + 82.4Hz (E2)
    const sub = Math.sin(2 * Math.PI * 55 * t + lfo1 * 0.15) * 0.55;
    const fifth = Math.sin(2 * Math.PI * 82.4 * t + lfo2 * 0.12) * 0.35;
    const octave = Math.sin(2 * Math.PI * 110 * t) * 0.22;

    // Very subtle warm analog vinyl/tape air
    const noise = (Math.random() * 2 - 1) * 0.02;

    // Smooth loop crossfade at edges (first/last 0.2s)
    let envelope = 1.0;
    if (t < 0.2) envelope = t / 0.2;
    else if (t > durationSec - 0.2) envelope = (durationSec - t) / 0.2;

    samples[i] = (sub + fifth + octave + noise) * envelope * 0.75;
  }

  return createWavBuffer(sampleRate, 1, samples);
}

/**
 * 2. Cinematic Climax Sub-Bass Impact Boom (1.5 Seconds)
 * Powerful, deep cinematic thud for high-chaos climax moments
 * Pitch sweep from 75Hz down to 35Hz with exponential decay.
 */
function generateCinematicImpact() {
  const sampleRate = 44100;
  const durationSec = 1.5;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Pitch sweep: 85Hz down to 32Hz
    const pitch = 32 + 53 * Math.exp(-t * 8.0);
    const phase = 2 * Math.PI * pitch * t;

    // Initial punch transient
    const transient = Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t * 28.0) * 0.45;

    // Sub-bass body with smooth decay
    const subBody = Math.sin(phase) * Math.exp(-t * 2.8) * 0.85;

    // Soft sub-harmonic rumble
    const rumble = Math.sin(phase * 0.5) * Math.exp(-t * 2.2) * 0.35;

    samples[i] = (transient + subBody + rumble) * 0.9;
  }

  return createWavBuffer(sampleRate, 1, samples);
}

// Generate & write files
fs.mkdirSync(SFX_DIR, { recursive: true });

const droneBuffer = generateTensionDrone();
const dronePath = path.join(SFX_DIR, 'tension_drone.wav');
fs.writeFileSync(dronePath, droneBuffer);
console.log(`✓ Generated tension drone: ${dronePath} (${(droneBuffer.length / 1024).toFixed(1)} KB)`);

const impactBuffer = generateCinematicImpact();
const impactPath = path.join(SFX_DIR, 'cinematic_impact.wav');
fs.writeFileSync(impactPath, impactBuffer);
console.log(`✓ Generated cinematic impact: ${impactPath} (${(impactBuffer.length / 1024).toFixed(1)} KB)`);

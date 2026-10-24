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
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);

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

// 1. Tension Drone (12s)
function generateTensionDrone() {
  const sampleRate = 44100;
  const durationSec = 12.0;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const lfo1 = Math.sin((2 * Math.PI * t) / 12.0);
    const lfo2 = Math.cos((4 * Math.PI * t) / 12.0);
    const sub = Math.sin(2 * Math.PI * 55 * t + lfo1 * 0.15) * 0.55;
    const fifth = Math.sin(2 * Math.PI * 82.4 * t + lfo2 * 0.12) * 0.35;
    const octave = Math.sin(2 * Math.PI * 110 * t) * 0.22;
    const noise = (Math.random() * 2 - 1) * 0.02;
    let envelope = 1.0;
    if (t < 0.2) envelope = t / 0.2;
    else if (t > durationSec - 0.2) envelope = (durationSec - t) / 0.2;
    samples[i] = (sub + fifth + octave + noise) * envelope * 0.75;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 2. Cinematic Impact (1.5s)
function generateCinematicImpact() {
  const sampleRate = 44100;
  const durationSec = 1.5;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const pitch = 32 + 53 * Math.exp(-t * 8.0);
    const phase = 2 * Math.PI * pitch * t;
    const transient = Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t * 28.0) * 0.45;
    const subBody = Math.sin(phase) * Math.exp(-t * 2.8) * 0.85;
    const rumble = Math.sin(phase * 0.5) * Math.exp(-t * 2.2) * 0.35;
    samples[i] = (transient + subBody + rumble) * 0.9;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 3. Lock Click (Key-lockbox / Vault latch)
function generateLockClick() {
  const sampleRate = 44100;
  const durationSec = 0.35;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Click 1 at 0.04s, Click 2 at 0.14s
    let val = 0;
    if (t >= 0.04 && t < 0.12) {
      const dt = t - 0.04;
      val += (Math.sin(2 * Math.PI * 2200 * dt) + (Math.random() * 2 - 1) * 0.6) * Math.exp(-dt * 60) * 0.7;
    }
    if (t >= 0.14 && t < 0.32) {
      const dt = t - 0.14;
      val += (Math.sin(2 * Math.PI * 1650 * dt) + Math.sin(2 * Math.PI * 920 * dt) * 0.5) * Math.exp(-dt * 45) * 0.85;
    }
    samples[i] = val;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 4. Morse Code SOS (Telegraph / Maritime distress)
function generateMorseCode() {
  const sampleRate = 44100;
  const durationSec = 1.1;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  // Pattern: dit dit dit (3 short bursts)
  const beeps = [
    { start: 0.05, end: 0.13 },
    { start: 0.18, end: 0.26 },
    { start: 0.31, end: 0.39 },
    { start: 0.48, end: 0.70 }, // dah
    { start: 0.76, end: 0.98 }, // dah
  ];
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let active = false;
    let env = 0;
    for (const b of beeps) {
      if (t >= b.start && t <= b.end) {
        active = true;
        const fade = Math.min((t - b.start) / 0.01, (b.end - t) / 0.01, 1.0);
        env = Math.max(0, fade);
        break;
      }
    }
    if (active) {
      samples[i] = Math.sin(2 * Math.PI * 780 * t) * env * 0.45;
    }
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 5. Gavel Strike (Courtroom / Official verdict)
function generateGavelStrike() {
  const sampleRate = 44100;
  const durationSec = 0.55;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const body = Math.sin(2 * Math.PI * 240 * t) * Math.exp(-t * 14.0) * 0.8;
    const resonance = Math.sin(2 * Math.PI * 480 * t) * Math.exp(-t * 18.0) * 0.4;
    const impact = (Math.random() * 2 - 1) * Math.exp(-t * 50.0) * 0.5;
    samples[i] = (body + resonance + impact) * 0.75;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 6. Paper Stamp (Memo investigation / Confidential dossier)
function generatePaperStamp() {
  const sampleRate = 44100;
  const durationSec = 0.4;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const thud = Math.sin(2 * Math.PI * 130 * t) * Math.exp(-t * 22.0) * 0.85;
    const paperShuff = (Math.random() * 2 - 1) * Math.exp(-t * 18.0) * 0.35;
    samples[i] = (thud + paperShuff) * 0.7;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 7. Radar Ping (Tactical map / Sonar coordinates)
function generateRadarPing() {
  const sampleRate = 44100;
  const durationSec = 0.85;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const ping = Math.sin(2 * Math.PI * 1220 * t) * Math.exp(-t * 5.5) * 0.5;
    // Echo
    let echo = 0;
    if (t > 0.22) {
      echo = Math.sin(2 * Math.PI * 1220 * (t - 0.22)) * Math.exp(-(t - 0.22) * 7.0) * 0.18;
    }
    samples[i] = (ping + echo);
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 8. Geiger Counter Ticks (Reactor meltdown / Radiation hazard)
function generateGeigerTick() {
  const sampleRate = 44100;
  const durationSec = 1.0;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  // Rapid erratic clicks
  const clicks = [0.08, 0.15, 0.22, 0.38, 0.45, 0.52, 0.61, 0.73, 0.82, 0.91];
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let val = 0;
    for (const c of clicks) {
      if (t >= c && t < c + 0.02) {
        const dt = t - c;
        val += (Math.random() * 2 - 1) * Math.exp(-dt * 250) * 0.7;
      }
    }
    samples[i] = val;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 9. Clock Escapement Tick (Clock countdown / Seconds ticking)
function generateClockTick() {
  const sampleRate = 44100;
  const durationSec = 0.65;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  // Tick at 0.05s, Tock at 0.35s
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let val = 0;
    if (t >= 0.05 && t < 0.15) {
      const dt = t - 0.05;
      val += Math.sin(2 * Math.PI * 2800 * dt) * Math.exp(-dt * 90) * 0.6;
    }
    if (t >= 0.35 && t < 0.45) {
      const dt = t - 0.35;
      val += Math.sin(2 * Math.PI * 2200 * dt) * Math.exp(-dt * 85) * 0.55;
    }
    samples[i] = val;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 10. Sledgehammer Concrete Hit (Wall demolition)
function generateHammerHit() {
  const sampleRate = 44100;
  const durationSec = 0.6;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const impactLow = Math.sin(2 * Math.PI * 160 * t) * Math.exp(-t * 18.0) * 0.75;
    const metallicRing = Math.sin(2 * Math.PI * 1250 * t) * Math.exp(-t * 24.0) * 0.35;
    const debris = (Math.random() * 2 - 1) * Math.exp(-t * 12.0) * 0.4;
    samples[i] = (impactLow + metallicRing + debris) * 0.8;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 11. Heavy Barrier Gate Creak (Gate breach)
function generateGateCreak() {
  const sampleRate = 44100;
  const durationSec = 0.85;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const freq = 180 + 120 * (t / 0.85);
    const metalGroan = Math.sin(2 * Math.PI * freq * t) * Math.sin(2 * Math.PI * 18 * t) * Math.exp(-t * 2.5) * 0.6;
    const friction = (Math.random() * 2 - 1) * 0.15 * Math.exp(-t * 3.0);
    samples[i] = (metalGroan + friction) * 0.75;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 12. High-Pressure Steam Release (Valve failure / Critical gauge)
function generateSteamHiss() {
  const sampleRate = 44100;
  const durationSec = 0.75;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const noise = (Math.random() * 2 - 1);
    const env = t < 0.08 ? (t / 0.08) : Math.exp(-(t - 0.08) * 4.0);
    samples[i] = noise * env * 0.55;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 13. Camera Blitz Flash Pop (Press podium / Journalists)
function generateCameraBlitz() {
  const sampleRate = 44100;
  const durationSec = 0.45;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Electronic capacitor pop at 0.05s
    let pop = 0;
    if (t >= 0.03 && t < 0.15) {
      const dt = t - 0.03;
      pop = (Math.sin(2 * Math.PI * 1800 * dt) + (Math.random() * 2 - 1) * 0.6) * Math.exp(-dt * 65) * 0.8;
    }
    // High-pitched capacitor whine
    const whine = Math.sin(2 * Math.PI * 3200 * t) * Math.exp(-t * 8.0) * 0.15;
    samples[i] = pop + whine;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 14. Vintage Rotary Phone Ring (Panic phone / Emergency post)
function generatePhoneRing() {
  const sampleRate = 44100;
  const durationSec = 0.85;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Bell clapper tremolo at 18Hz
    const clapper = 0.5 + 0.5 * Math.sin(2 * Math.PI * 18 * t);
    // Dual bell chime frequencies (850Hz & 1050Hz)
    const bell = (Math.sin(2 * Math.PI * 850 * t) + Math.sin(2 * Math.PI * 1050 * t) * 0.7) * clapper;
    const env = t < 0.7 ? 1.0 : Math.exp(-(t - 0.7) * 12.0);
    samples[i] = bell * env * 0.4;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 15. Domino Rapid Cascade (Domino collapse 3D)
function generateDominoClick() {
  const sampleRate = 44100;
  const durationSec = 0.7;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  const taps = [0.05, 0.14, 0.22, 0.30, 0.38, 0.45];
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let val = 0;
    for (let k = 0; k < taps.length; k++) {
      const tapTime = taps[k];
      if (t >= tapTime && t < tapTime + 0.08) {
        const dt = t - tapTime;
        const freq = 650 + k * 80;
        val += Math.sin(2 * Math.PI * freq * dt) * Math.exp(-dt * 70) * (0.5 + k * 0.08);
      }
    }
    samples[i] = val * 0.65;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 16. Glass Beaker Clink (Laboratory discovery / Petri dish)
function generateBeakerClink() {
  const sampleRate = 44100;
  const durationSec = 0.65;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const chime = Math.sin(2 * Math.PI * 2650 * t) * Math.exp(-t * 6.0) * 0.55;
    const harmonic = Math.sin(2 * Math.PI * 5300 * t) * Math.exp(-t * 12.0) * 0.25;
    samples[i] = (chime + harmonic) * 0.7;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 17. Car Tire Skid & Engine Brake (Car route / Sarajevo convoy)
function generateCarSkid() {
  const sampleRate = 44100;
  const durationSec = 0.75;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Rubber screech: high-frequency modulated friction
    const freq = 1600 - 400 * t;
    const screech = Math.sin(2 * Math.PI * freq * t) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 45 * t));
    const noise = (Math.random() * 2 - 1) * 0.35;
    const env = t < 0.1 ? (t / 0.1) : Math.exp(-(t - 0.1) * 4.5);
    samples[i] = (screech * 0.6 + noise * 0.4) * env * 0.55;
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// 18. Emergency Broadcast Alert Beeps (Breaking news / TV transmission)
function generateBroadcastBeeps() {
  const sampleRate = 44100;
  const durationSec = 0.8;
  const totalSamples = Math.round(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);
  const beeps = [
    { start: 0.05, end: 0.22 },
    { start: 0.28, end: 0.45 },
    { start: 0.51, end: 0.72 },
  ];
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let active = false;
    for (const b of beeps) {
      if (t >= b.start && t <= b.end) {
        active = true;
        break;
      }
    }
    if (active) {
      // Dual-frequency alert chime (853Hz & 960Hz)
      const tone = (Math.sin(2 * Math.PI * 853 * t) + Math.sin(2 * Math.PI * 960 * t) * 0.8) * 0.35;
      samples[i] = tone;
    }
  }
  return createWavBuffer(sampleRate, 1, samples);
}

// Run synthesis
fs.mkdirSync(SFX_DIR, { recursive: true });

const sfxList = [
  { name: 'tension_drone.wav', gen: generateTensionDrone },
  { name: 'cinematic_impact.wav', gen: generateCinematicImpact },
  { name: 'lock_click.wav', gen: generateLockClick },
  { name: 'morse_code.wav', gen: generateMorseCode },
  { name: 'gavel_strike.wav', gen: generateGavelStrike },
  { name: 'paper_stamp.wav', gen: generatePaperStamp },
  { name: 'radar_ping.wav', gen: generateRadarPing },
  { name: 'geiger_tick.wav', gen: generateGeigerTick },
  { name: 'clock_tick.wav', gen: generateClockTick },
  { name: 'hammer_hit.wav', gen: generateHammerHit },
  { name: 'gate_creak.wav', gen: generateGateCreak },
  { name: 'steam_hiss.wav', gen: generateSteamHiss },
  { name: 'camera_blitz.wav', gen: generateCameraBlitz },
  { name: 'phone_ring.wav', gen: generatePhoneRing },
  { name: 'domino_click.wav', gen: generateDominoClick },
  { name: 'beaker_clink.wav', gen: generateBeakerClink },
  { name: 'car_skid.wav', gen: generateCarSkid },
  { name: 'broadcast_beeps.wav', gen: generateBroadcastBeeps },
];

for (const sfx of sfxList) {
  const buf = sfx.gen();
  const fullPath = path.join(SFX_DIR, sfx.name);
  fs.writeFileSync(fullPath, buf);
  console.log(`✓ Synthesized: ${sfx.name} (${(buf.length / 1024).toFixed(1)} KB)`);
}

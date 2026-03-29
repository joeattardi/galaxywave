/**
 * Generates a sci-fi laser pulse WAV file.
 *
 * Character: sharp attack, descending frequency sweep with harmonics,
 * a quick "bite" transient, and exponential decay — punchy and clean.
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const DURATION = 0.35; // seconds
const NUM_SAMPLES = Math.floor(SAMPLE_RATE * DURATION);

const samples = new Float32Array(NUM_SAMPLES);

for (let i = 0; i < NUM_SAMPLES; i++) {
  const t = i / SAMPLE_RATE;
  const tNorm = t / DURATION; // 0..1

  // --- Frequency sweep: 2800 Hz → 140 Hz (exponential) ---
  const freqStart = 900;
  const freqEnd = 80;
  const freq = freqStart * Math.pow(freqEnd / freqStart, tNorm);

  // Phase accumulation for the sweep
  // We integrate frequency to get phase: phase += 2π * freq / sampleRate each sample
  // But since we're computing per-sample without carrying phase, approximate:
  // phase(t) = 2π * ∫₀ᵗ f(τ)dτ = 2π * freqStart * (freqEnd/freqStart)^tNorm / ln(freqEnd/freqStart) * DURATION
  const logRatio = Math.log(freqEnd / freqStart);
  const phase = 2 * Math.PI * DURATION * freqStart * (Math.pow(freqEnd / freqStart, tNorm) - 1) / logRatio;

  // --- Waveform: sawtooth-ish blend for brightness ---
  const fundamental = Math.sin(phase);
  const second      = 0.35 * Math.sin(2 * phase);  // 2nd harmonic
  const third       = 0.15 * Math.sin(3 * phase);  // 3rd harmonic

  // Soft waveshaping (mild overdrive on the mix)
  let wave = fundamental + second + third;
  wave = Math.tanh(wave * 1.4) / Math.tanh(1.4); // keep roughly in [-1,1]

  // --- Envelope ---
  // Attack: very sharp (~3ms)
  const attackTime = 0.003;
  const attack = t < attackTime ? (t / attackTime) : 1.0;

  // Decay: exponential, tail off by end
  const decayRate = 9.0;
  const decay = Math.exp(-decayRate * t);

  // Extra "snap" transient at the start (short noise burst)
  const snapDuration = 0.008;
  const snapEnv = t < snapDuration ? Math.exp(-t / 0.002) * 0.4 : 0;
  const snap = snapEnv * (Math.random() * 2 - 1);

  samples[i] = (wave * attack * decay + snap) * 0.85;
}

// Normalize to prevent clipping
let peak = 0;
for (let i = 0; i < NUM_SAMPLES; i++) peak = Math.max(peak, Math.abs(samples[i]));
if (peak > 0) for (let i = 0; i < NUM_SAMPLES; i++) samples[i] /= peak;

// Scale to 0.90 to leave a little headroom
for (let i = 0; i < NUM_SAMPLES; i++) samples[i] *= 0.90;

// --- Write 16-bit mono WAV ---
const pcm = Buffer.alloc(NUM_SAMPLES * 2);
for (let i = 0; i < NUM_SAMPLES; i++) {
  const s = Math.max(-1, Math.min(1, samples[i]));
  pcm.writeInt16LE(Math.round(s * 32767), i * 2);
}

const dataSize = pcm.length;
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + dataSize, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);          // PCM chunk size
header.writeUInt16LE(1, 20);           // PCM format
header.writeUInt16LE(1, 22);           // mono
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
header.writeUInt16LE(2, 32);           // block align
header.writeUInt16LE(16, 34);          // bits per sample
header.write('data', 36);
header.writeUInt32LE(dataSize, 40);

const out = path.join(__dirname, '../public/assets/laserShoot.wav');
fs.writeFileSync(out, Buffer.concat([header, pcm]));
console.log(`Written: ${out} (${(dataSize / 1024).toFixed(1)} KB)`);

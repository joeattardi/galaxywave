/**
 * Generates a 32x32 pixel art player fighter ship PNG.
 * Top-down view: pointed nose, wide body, swept wings, flat tail.
 * No external dependencies — writes raw PNG using zlib deflate.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 32, H = 32;

// Palette (RGBA)
const T  = [0,   0,   0,   0  ]; // transparent
const O  = [10,  10,  16,  255]; // outline
const D2 = [50,  54,  68,  255]; // dark gray
const M1 = [80,  86,  105, 255]; // mid gray
const M2 = [108, 116, 140, 255]; // mid-light gray
const L1 = [145, 154, 178, 255]; // light gray
const L2 = [182, 190, 212, 255]; // lighter gray
const CK = [12,  42,  88,  255]; // canopy dark
const CL = [52,  138, 228, 255]; // canopy light
const CR = [188, 222, 255, 255]; // canopy reflection
const VN = [58,  62,  78,  255]; // vent/panel line

// Silhouette per row: f=[fuselage_left, fuselage_right], s=[full_left, full_right]
// Ship faces UP (nose at low y). No single-pixel tail — flat end.
const S = {
   3: { f: [15, 15] },            // nose tip
   4: { f: [14, 16] },
   5: { f: [13, 17] },            // canopy
   6: { f: [12, 18] },            // canopy
   7: { f: [12, 18] },            // canopy
   8: { f: [12, 18] },
   9: { f: [12, 18], s: [ 9, 21] }, // wing leading edge begins
  10: { f: [12, 18], s: [ 7, 23] },
  11: { f: [12, 18], s: [ 5, 25] },
  12: { f: [12, 18], s: [ 4, 26] }, // max wing span
  13: { f: [12, 18], s: [ 5, 25] },
  14: { f: [12, 18], s: [ 7, 23] },
  15: { f: [12, 18], s: [10, 20] }, // wing trailing edge
  16: { f: [12, 18] },
  17: { f: [12, 18] },
  18: { f: [12, 18] },
  19: { f: [12, 18] },
  20: { f: [12, 18] },
  21: { f: [12, 18] },
  22: { f: [12, 18] },
  23: { f: [11, 19] },            // tail fins begin
  24: { f: [11, 19], s: [ 9, 21] },
  25: { f: [11, 19], s: [ 9, 21] },
  26: { f: [12, 18] },
  27: { f: [13, 17] },
  28: { f: [13, 17] },            // flat tail end
};

const CANOPY = new Set([5, 6, 7]);

function getColor(x, y) {
  const row = S[y];
  if (!row) return T;

  const [fl, fr] = row.f;
  const wl = row.s ? row.s[0] : fl;
  const wr = row.s ? row.s[1] : fr;

  if (x < wl || x > wr) return T;

  const onOutline = x === wl || x === wr;
  const inFuselage = x >= fl && x <= fr;

  if (onOutline) return O;

  // Canopy
  if (CANOPY.has(y) && inFuselage) {
    const inner = Math.min(x - fl, fr - x);
    if (inner === 0) return CK;
    if (inner === 1) return CL;
    return CR;
  }

  // Wing
  if (!inFuselage) {
    const span = fl - wl;
    const dist = x < fl ? fl - 1 - x : x - fr - 1;
    const t = dist / Math.max(span - 1, 1);
    if (t > 0.7) return D2;
    if (t > 0.35) return M1;
    return M2;
  }

  // Fuselage
  const fw = fr - fl + 1;
  const lx = x - fl;

  // Hard edges
  if (lx === 0 || lx === fw - 1) return D2;

  // Horizontal panel lines
  if (y === 8 || y === 16 || y === 22) return VN;

  // Shading — light from upper-left
  const t = (lx - 1) / Math.max(fw - 3, 1);
  if (t < 0.18) return L2;
  if (t < 0.45) return L1;
  if (t < 0.72) return M2;
  return M1;
}

// Build RGBA buffer
const pixels = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const c = getColor(x, y);
    const i = (y * W + x) * 4;
    pixels[i] = c[0]; pixels[i+1] = c[1]; pixels[i+2] = c[2]; pixels[i+3] = c[3];
  }
}

// PNG encoder
function crc32(buf) {
  const table = crc32.t || (crc32.t = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })());
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const tb = Buffer.from(type, 'ascii');
  const lb = Buffer.alloc(4); lb.writeUInt32BE(data.length);
  const cb = Buffer.alloc(4); cb.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([lb, tb, data, cb]);
}
function buildPng(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const rows = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    rows[y * (1 + w * 4)] = 0;
    rgba.copy(rows, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const out = path.join(__dirname, '../public/assets/playerShip.png');
fs.writeFileSync(out, buildPng(W, H, pixels));
console.log(`Written: ${out}`);

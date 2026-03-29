/**
 * Generates a 32x32 pixel art alien circular drone enemy ship PNG.
 * No external dependencies — writes raw PNG using zlib deflate.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 32, H = 32;
const cx = 15.5, cy = 15.5;

// Palette (RGBA)
const T  = [0,   0,   0,   0  ]; // transparent
const O  = [5,   0,   12,  255]; // outline
const H1 = [18,  7,   38,  255]; // hull darkest
const H2 = [35,  14,  65,  255]; // hull dark
const H3 = [60,  24,  100, 255]; // hull mid
const H4 = [88,  40,  135, 255]; // hull light
const H5 = [120, 65,  170, 255]; // hull highlight
const G1 = [6,   40,  10,  255]; // glow darkest
const G2 = [12,  105, 22,  255]; // glow dark
const G3 = [42,  195, 52,  255]; // glow mid
const G4 = [115, 255, 125, 255]; // glow bright
const E1 = [55,  5,   5,   255]; // eye dark
const E2 = [155, 12,  12,  255]; // eye mid
const E3 = [245, 55,  55,  255]; // eye bright
const E4 = [255, 210, 210, 255]; // eye core

// Hand-placed rivet positions [col, row]
const rivets = new Set([
  '5,8', '8,5', '10,3', '20,3', '22,5', '26,8',
  '26,22', '22,26', '20,28', '10,28', '8,26', '5,22',
]);

function getColor(px, py) {
  const dx = px - cx;
  const dy = py - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 13.5) return T;

  const angleDeg = ((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360;

  // Panel seams every 60°, ±1.5°
  const seam = [0, 60, 120, 180, 240, 300].some(a => {
    const d = Math.abs(angleDeg - a);
    return Math.min(d, 360 - d) < 1.8;
  });

  // Vent slots: three arcs at 90°, 210°, 330° on the outer ring (R 11-13)
  const vent = dist > 10.8 && dist < 12.8 && [90, 210, 330].some(a => {
    const d = Math.abs(angleDeg - a);
    return Math.min(d, 360 - d) < 8;
  });

  // Outline ring
  if (dist > 12.5) return O;

  // Outer hull (R 10.8–12.5)
  if (dist > 10.8) {
    if (vent) return H1;
    if (seam) return H1;
    return dist > 11.8 ? H2 : H3;
  }

  // Rivets on hull ring
  if (rivets.has(`${px},${py}`)) return H5;

  // Inner hull shell (R 8.8–10.8) with directional shading
  if (dist > 8.8) {
    if (seam) return H1;
    // "light" from top-left
    const lightFactor = (Math.cos((angleDeg - 225) * Math.PI / 180) + 1) / 2;
    if (lightFactor > 0.7) return H5;
    if (lightFactor > 0.4) return H4;
    return H3;
  }

  // Energy transition band (R 7.2–8.8)
  if (dist > 7.2) {
    if (seam) return G1;
    return dist > 8.0 ? H2 : G1;
  }

  // Energy ring (R 5.5–7.2) — alien green glow
  if (dist > 5.5) {
    if (seam) return G2;
    // Pulse texture: brighter in 6 lobes aligned with seams
    const lobeFactor = Math.cos(6 * angleDeg * Math.PI / 180);
    if (lobeFactor > 0.4) return G4;
    if (dist < 6.4) return G3;
    return G2;
  }

  // Inner glow fill (R 3.8–5.5)
  if (dist > 3.8) {
    return dist > 4.6 ? G3 : G2;
  }

  // Eye ring (R 2.2–3.8)
  if (dist > 2.2) return E1;

  // Eye iris (R 1.0–2.2)
  if (dist > 1.0) return E2;

  // Eye pupil core (R ≤ 1.0)
  return dist > 0.3 ? E3 : E4;
}

// Build raw RGBA
const pixels = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const c = getColor(x, y);
    const i = (y * W + x) * 4;
    pixels[i]     = c[0];
    pixels[i + 1] = c[1];
    pixels[i + 2] = c[2];
    pixels[i + 3] = c[3];
  }
}

// PNG encoder (no dependencies)
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
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const rows = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    rows[y * (1 + w * 4)] = 0; // filter None
    rgba.copy(rows, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const out = path.join(__dirname, '../public/assets/enemyShip.png');
fs.writeFileSync(out, buildPng(W, H, pixels));
console.log(`Written: ${out} (${W}x${H} RGBA PNG)`);

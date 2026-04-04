import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function drawIcon(size, maskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size / 512;

  // Background
  if (maskable) {
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 80 * s);
    ctx.fill();
  }

  // Document-robot icon centered
  const pw = 220 * s;
  const ph = 270 * s;
  const px = (size - pw) / 2;
  const py = (size - ph) / 2 + 20 * s;
  const r = 20 * s;
  const fold = 32 * s;

  ctx.strokeStyle = '#3dc78c';
  ctx.lineWidth = 10 * s;
  ctx.fillStyle = '#3dc78c';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Page outline with folded top-right corner
  ctx.beginPath();
  ctx.moveTo(px + pw - fold, py);
  ctx.lineTo(px + r, py);
  ctx.arcTo(px, py, px, py + r, r);
  ctx.lineTo(px, py + ph - r);
  ctx.arcTo(px, py + ph, px + r, py + ph, r);
  ctx.lineTo(px + pw - r, py + ph);
  ctx.arcTo(px + pw, py + ph, px + pw, py + ph - r, r);
  ctx.lineTo(px + pw, py + fold);
  ctx.closePath();
  ctx.stroke();

  // Fold line
  ctx.beginPath();
  ctx.moveTo(px + pw - fold, py);
  ctx.lineTo(px + pw - fold, py + fold);
  ctx.lineTo(px + pw, py + fold);
  ctx.stroke();

  // Eyes
  const eyeR = 22 * s;
  const eyeY = py + ph * 0.32;
  ctx.beginPath();
  ctx.arc(px + pw * 0.35, eyeY, eyeR, 0, Math.PI * 2);
  ctx.arc(px + pw * 0.65, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.beginPath();
  ctx.moveTo(px + pw * 0.32, py + ph * 0.48);
  ctx.lineTo(px + pw * 0.68, py + ph * 0.48);
  ctx.stroke();

  // Text lines
  ctx.lineWidth = 7 * s;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(px + 30 * s, py + ph * 0.62 + i * 30 * s);
    ctx.lineTo(px + pw - 30 * s - (i === 2 ? 40 * s : 0), py + ph * 0.62 + i * 30 * s);
    ctx.stroke();
  }
  ctx.lineWidth = 10 * s;

  // Antenna
  const cx = px + pw / 2;
  ctx.beginPath();
  ctx.moveTo(cx, py);
  ctx.lineTo(cx, py - 45 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, py - 52 * s, 12 * s, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

const sizes = [
  { name: 'favicon-32.png', size: 32, maskable: false },
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-maskable.png', size: 512, maskable: true },
];

for (const { name, size, maskable } of sizes) {
  const png = drawIcon(size, maskable);
  const outPath = resolve(__dirname, '..', 'public', name);
  writeFileSync(outPath, png);
  console.log(`${name}: ${png.byteLength} bytes`);
}

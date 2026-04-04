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

  const green = '#3dc78c';
  const bg = '#1c1c1c';

  const pw = 220 * s;
  const ph = 270 * s;
  const px = (size - pw) / 2;
  const py = (size - ph) / 2 + 20 * s;
  const r = 24 * s;
  const fold = 36 * s;

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Antenna stem
  const cx = px + pw / 2;
  ctx.strokeStyle = green;
  ctx.lineWidth = 14 * s;
  ctx.beginPath();
  ctx.moveTo(cx, py);
  ctx.lineTo(cx, py - 45 * s);
  ctx.stroke();

  // Antenna tip
  ctx.fillStyle = green;
  ctx.beginPath();
  ctx.arc(cx, py - 52 * s, 16 * s, 0, Math.PI * 2);
  ctx.fill();

  // Filled page shape with folded corner
  ctx.fillStyle = green;
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
  ctx.fill();

  // Fold triangle (dark cutout)
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(px + pw - fold, py);
  ctx.lineTo(px + pw - fold, py + fold);
  ctx.lineTo(px + pw, py + fold);
  ctx.closePath();
  ctx.fill();

  // Eyes (dark knockout)
  const eyeR = 19 * s;
  const eyeY = py + ph * 0.32;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(px + pw * 0.35, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(px + pw * 0.65, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (dark knockout)
  ctx.strokeStyle = bg;
  ctx.lineWidth = 14 * s;
  ctx.beginPath();
  ctx.moveTo(px + pw * 0.34, py + ph * 0.48);
  ctx.lineTo(px + pw * 0.66, py + ph * 0.48);
  ctx.stroke();

  // Text lines (dark knockout)
  ctx.lineWidth = 13 * s;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(px + 30 * s, py + ph * 0.66 + i * 26 * s);
    ctx.lineTo(px + pw - 30 * s - (i === 2 ? 40 * s : 0), py + ph * 0.66 + i * 26 * s);
    ctx.stroke();
  }

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

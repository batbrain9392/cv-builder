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
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 80 * s);
    ctx.fill();
  }

  // Robot icon centered
  const iconW = 240 * s;
  const iconH = 200 * s;
  const cx = size / 2;
  const cy = size / 2;
  const rx = cx - iconW / 2;
  const ry = cy - iconH / 2 + 20 * s;

  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 10 * s;
  ctx.fillStyle = '#60a5fa';

  // Head
  const headW = iconW;
  const headH = 180 * s;
  ctx.beginPath();
  ctx.roundRect(rx, ry, headW, headH, 32 * s);
  ctx.stroke();

  // Eyes
  const eyeR = 24 * s;
  ctx.beginPath();
  ctx.arc(rx + headW * 0.35, ry + headH * 0.42, eyeR, 0, Math.PI * 2);
  ctx.arc(rx + headW * 0.65, ry + headH * 0.42, eyeR, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.beginPath();
  ctx.moveTo(rx + headW * 0.3, ry + headH * 0.72);
  ctx.lineTo(rx + headW * 0.7, ry + headH * 0.72);
  ctx.stroke();

  // Antenna
  ctx.beginPath();
  ctx.moveTo(cx, ry);
  ctx.lineTo(cx, ry - 55 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, ry - 62 * s, 14 * s, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

const sizes = [
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

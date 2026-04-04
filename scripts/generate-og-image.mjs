import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WIDTH = 1200;
const HEIGHT = 630;

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

// Background — dark zinc matching app's primary color
ctx.fillStyle = '#18181b';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Subtle gradient overlay
const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
grad.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
grad.addColorStop(1, 'rgba(139, 92, 246, 0.08)');
ctx.fillStyle = grad;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// App name — draw text first to measure, then align icon to it
ctx.fillStyle = '#fafafa';
ctx.font = 'bold 80px sans-serif';
ctx.textAlign = 'left';
const textY = 270;
const textMetrics = ctx.measureText('BioBot');
const textTop = textY - textMetrics.actualBoundingBoxAscent;
const textBottom = textY + textMetrics.actualBoundingBoxDescent;
const textCenterY = (textTop + textBottom) / 2;

// Robot icon (drawn manually), head square centered with text
const iconH = 80;
const ry = Math.round(textCenterY - iconH / 2);
const rx = 90;

ctx.strokeStyle = '#60a5fa';
ctx.lineWidth = 4;
ctx.fillStyle = '#60a5fa';

// Head
ctx.beginPath();
ctx.roundRect(rx, ry, 100, iconH, 14);
ctx.stroke();

// Eyes
ctx.beginPath();
ctx.arc(rx + 32, ry + 35, 10, 0, Math.PI * 2);
ctx.arc(rx + 68, ry + 35, 10, 0, Math.PI * 2);
ctx.fill();

// Antenna
ctx.beginPath();
ctx.moveTo(rx + 50, ry);
ctx.lineTo(rx + 50, ry - 25);
ctx.stroke();
ctx.beginPath();
ctx.arc(rx + 50, ry - 30, 6, 0, Math.PI * 2);
ctx.fill();

// Mouth
ctx.beginPath();
ctx.moveTo(rx + 30, ry + 58);
ctx.lineTo(rx + 70, ry + 58);
ctx.stroke();

ctx.fillStyle = '#fafafa';
ctx.fillText('BioBot', 220, textY);

// Tagline
ctx.fillStyle = '#a1a1aa';
ctx.font = '32px sans-serif';
ctx.fillText('AI-powered CV and cover letter builder', 80, 370);

// Sub-tagline
ctx.fillStyle = '#71717a';
ctx.font = '24px sans-serif';
ctx.fillText('Runs entirely in your browser · No sign-up · No cookies', 80, 420);

// PWA badge area
ctx.fillStyle = 'rgba(250, 250, 250, 0.06)';
ctx.beginPath();
ctx.roundRect(80, 470, 440, 60, 12);
ctx.fill();

ctx.fillStyle = '#a1a1aa';
ctx.font = '20px sans-serif';
ctx.fillText('Install as a Progressive Web App', 100, 508);

// URL
ctx.fillStyle = '#3b82f6';
ctx.font = '22px sans-serif';
ctx.textAlign = 'right';
ctx.fillText('batbrain9392.github.io/cv-builder', WIDTH - 80, 560);

const outPath = resolve(__dirname, '..', 'public', 'og-image.png');
const png = canvas.toBuffer('image/png');
writeFileSync(outPath, png);
console.log(`OG image written to ${outPath} (${png.byteLength} bytes)`);

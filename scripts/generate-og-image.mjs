import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const OUT = resolve(ROOT, 'public', 'og-image.png');

const W = 1200;
const H = 630;
const BASE_URL = 'http://localhost:4173/cv-builder/';

// App dark-mode palette (from src/index.css)
const BG = '#1c1c1c';
const FG = '#fafafa';
const MUTED_FG = '#d4d4d8';
const PRIMARY = '#3dc78c';
const MUTED_BG = '#343836';

GlobalFonts.registerFromPath(
  resolve(ROOT, 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'),
  'Geist',
);

// ---------------------------------------------------------------------------
// 1. Start preview server
// ---------------------------------------------------------------------------

if (!existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

function startPreviewServer() {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('npx', ['vite', 'preview'], { cwd: ROOT, stdio: 'pipe' });
    let settled = false;

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      if (!settled && text.includes('Local:')) {
        settled = true;
        resolvePromise(child);
      }
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      if (!settled && text.includes('Local:')) {
        settled = true;
        resolvePromise(child);
      }
    });

    child.on('error', (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });

    child.on('exit', (code) => {
      if (!settled) {
        settled = true;
        reject(new Error(`Preview server exited with code ${code}`));
      }
    });

    setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('Preview server did not start within 15 seconds'));
      }
    }, 15_000);
  });
}

// ---------------------------------------------------------------------------
// 2. Capture mobile screenshot
// ---------------------------------------------------------------------------

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const formShot = await page.screenshot({ type: 'png' });

  // Open the preview panel via the mobile FAB
  await page.click('button[aria-label="Open preview"]');
  await page.waitForTimeout(600);
  const previewShot = await page.screenshot({ type: 'png' });

  await browser.close();
  return { formShot, previewShot };
}

// ---------------------------------------------------------------------------
// 3. Draw robot icon (reused from generate-icons.mjs, scaled to fit)
// ---------------------------------------------------------------------------

// Returns the actual drawn width so callers can position text tightly after it.
// Draws the document-robot icon centered on centerY (page body only; antenna above).
function drawRobot(ctx, left, centerY, height) {
  // The page body in the 512-unit design is 270 units tall.
  const s = height / 270;
  const pw = 220 * s;
  const ph = 270 * s;
  const px = left;
  const py = centerY - ph / 2;
  const r = 20 * s;
  const fold = 32 * s;
  const lw = 10 * s;

  ctx.save();
  ctx.strokeStyle = PRIMARY;
  ctx.lineWidth = lw;
  ctx.fillStyle = PRIMARY;
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

  // Fold
  ctx.beginPath();
  ctx.moveTo(px + pw - fold, py);
  ctx.lineTo(px + pw - fold, py + fold);
  ctx.lineTo(px + pw, py + fold);
  ctx.stroke();

  // Eyes
  const eyeR = 22 * s;
  ctx.beginPath();
  ctx.arc(px + pw * 0.35, py + ph * 0.32, eyeR, 0, Math.PI * 2);
  ctx.arc(px + pw * 0.65, py + ph * 0.32, eyeR, 0, Math.PI * 2);
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

  // Antenna
  const cx = px + pw / 2;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(cx, py);
  ctx.lineTo(cx, py - 45 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, py - 52 * s, 12 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  return pw;
}

// Draw a download-arrow icon (↓ with tray) at the given position.
function drawDownloadIcon(ctx, x, centerY, size) {
  const half = size / 2;
  const lw = Math.max(2, size * 0.14);
  ctx.save();
  ctx.strokeStyle = PRIMARY;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Vertical shaft
  ctx.beginPath();
  ctx.moveTo(x + half, centerY - half * 0.7);
  ctx.lineTo(x + half, centerY + half * 0.3);
  ctx.stroke();

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(x + half - half * 0.45, centerY - half * 0.1);
  ctx.lineTo(x + half, centerY + half * 0.4);
  ctx.lineTo(x + half + half * 0.45, centerY - half * 0.1);
  ctx.stroke();

  // Tray (bottom line)
  ctx.beginPath();
  ctx.moveTo(x + half - half * 0.6, centerY + half * 0.7);
  ctx.lineTo(x + half + half * 0.6, centerY + half * 0.7);
  ctx.stroke();

  ctx.restore();
}

// Draw a globe icon at the given position (simplified: circle + two arcs + equator).
function drawGlobeIcon(ctx, x, centerY, size) {
  const r = size / 2 - 1;
  const cx = x + size / 2;
  const cy = centerY;
  const lw = Math.max(1.5, size * 0.1);

  ctx.save();
  ctx.strokeStyle = PRIMARY;
  ctx.lineWidth = lw;

  // Outer circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Equator
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.stroke();

  // Vertical ellipse (meridian)
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.4, r, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 4. Composite
// ---------------------------------------------------------------------------

async function composite(formBuf, previewBuf) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  const PAD = 36;
  const TEXT_X = PAD;

  // Element heights
  const titleFontSize = 52;
  const robotHeight = 60;
  const titleH = Math.max(titleFontSize, robotHeight);
  const subtitleH = 28;
  const secondaryH = 20;
  const pillH = 42;

  // Uniform gap between elements
  const GAP = 28;

  // Center the block (title through pill, URL is a separate footer)
  const blockH = titleH + subtitleH + secondaryH + pillH + GAP * 3;
  const blockTop = Math.round((H - blockH) / 2);
  let y = blockTop;

  // -- Robot icon + title on same line --
  const titleCenterY = y + titleH / 2;
  const robotW = drawRobot(ctx, TEXT_X, titleCenterY, robotHeight);

  ctx.fillStyle = FG;
  ctx.font = `bold ${titleFontSize}px Geist`;
  ctx.textBaseline = 'middle';
  ctx.fillText('BioBot', TEXT_X + robotW + 16, titleCenterY);
  y += titleH + GAP;

  // -- Subtitle --
  ctx.fillStyle = MUTED_FG;
  ctx.font = '28px Geist';
  ctx.textBaseline = 'top';
  ctx.fillText('AI-powered CV and cover letter builder', TEXT_X, y);
  y += subtitleH + GAP;

  // -- Secondary line --
  ctx.font = '20px Geist';
  ctx.fillText('Runs entirely in your browser \u00B7 No sign-up \u00B7 No cookies', TEXT_X, y);
  y += secondaryH + GAP;

  // -- Install CTA pill --
  const pillLabel = 'Install as a Progressive Web App';
  ctx.font = '18px Geist';
  const iconSize = 18;
  const iconGap = 8;
  const pillPadX = 18;
  const pillMetrics = ctx.measureText(pillLabel);
  const pillW = pillPadX + iconSize + iconGap + pillMetrics.width + pillPadX;
  const pillCenterY = y + pillH / 2;

  ctx.fillStyle = MUTED_BG;
  ctx.beginPath();
  ctx.roundRect(TEXT_X, y, pillW, pillH, pillH / 2);
  ctx.fill();

  drawDownloadIcon(ctx, TEXT_X + pillPadX, pillCenterY, iconSize);

  ctx.fillStyle = PRIMARY;
  ctx.textBaseline = 'middle';
  ctx.fillText(pillLabel, TEXT_X + pillPadX + iconSize + iconGap, pillCenterY);

  // -- URL (footer, anchored to bottom) with link icon --
  const urlIconSize = 16;
  const urlIconGap = 6;
  const urlText = 'batbrain9392.github.io/cv-builder';
  const urlY = H - PAD;
  drawGlobeIcon(ctx, TEXT_X, urlY - urlIconSize / 2 - 2, urlIconSize);
  ctx.fillStyle = PRIMARY;
  ctx.font = '18px Geist';
  ctx.textBaseline = 'bottom';
  ctx.fillText(urlText, TEXT_X + urlIconSize + urlIconGap, urlY);

  // -- Phone screenshots on the right --
  const phoneR = 16;
  const phoneGap = 16;
  const phoneFrameH = H - 40;
  const phoneFrameW = Math.round(phoneFrameH * (390 / 844));
  const phonesW = phoneFrameW * 2 + phoneGap;
  const phonesX = W - phonesW - PAD;
  const phoneY = 20;

  const formImg = await loadImage(formBuf);
  const previewImg = await loadImage(previewBuf);

  for (const [img, offsetX] of [[formImg, 0], [previewImg, phoneFrameW + phoneGap]]) {
    const px = phonesX + offsetX;

    // Drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.roundRect(px, phoneY, phoneFrameW, phoneFrameH, phoneR);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // Clip and draw
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(px, phoneY, phoneFrameW, phoneFrameH, phoneR);
    ctx.clip();
    ctx.drawImage(img, 0, 0, img.width, img.height, px, phoneY, phoneFrameW, phoneFrameH);
    ctx.restore();
  }

  return canvas.toBuffer('image/png');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('Starting preview server…');
const server = await startPreviewServer();
console.log('Preview server ready.');

try {
  console.log('Capturing screenshots…');
  const { formShot, previewShot } = await captureScreenshots();
  console.log(`Form: ${formShot.byteLength} bytes, Preview: ${previewShot.byteLength} bytes.`);

  console.log('Compositing OG image…');
  const png = await composite(formShot, previewShot);
  writeFileSync(OUT, png);
  console.log(`Done → ${OUT} (${png.byteLength} bytes)`);
} finally {
  server.kill();
}

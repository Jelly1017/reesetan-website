// Build a 1200x630 OG share card using Reese's retouched training photo
// (the Canva-screen classroom shot, face 3/4 to camera, slight smile, slimmer).
const sharp = require('sharp');
const fs = require('fs');

const photoPath = 'public/images/training-hero-classroom.jpg';
const W = 1200, H = 630;
const rightW = Math.round(W * 0.58);  // 696 px reserved for the photo column

// Source: 2400x1792 (4:3). We keep the top 80% (cuts the audience member's
// head at the bottom) and the full width, then resize-cover to the right
// column. Result: AV rack on the left, Reese pointing in the middle, Canva
// "First Impressions Matter" screen on the right.
sharp(photoPath)
  .metadata()
  .then(meta => {
    const cropH = Math.round(meta.height * 0.82);  // ~1469 px, cuts bottom 18%
    return sharp(photoPath)
      .extract({
        left: 0,
        top: 0,
        width: meta.width,
        height: cropH,
      })
      .resize(rightW, H, { fit: 'cover', position: 'center' })
      .toBuffer({ resolveWithObject: true });
  })
  .then(photo => {
    // Stage 2: SVG text panel on the left
    const svg = `
      <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0a0a0a" stop-opacity="0.95"/>
            <stop offset="50%" stop-color="#0a0a0a" stop-opacity="0.85"/>
            <stop offset="80%" stop-color="#0a0a0a" stop-opacity="0.30"/>
            <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="vgrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#000" stop-opacity="0.10"/>
            <stop offset="100%" stop-color="#000" stop-opacity="0.30"/>
          </linearGradient>
        </defs>

        <rect width="${W}" height="${H}" fill="url(#grad)"/>
        <rect width="${W}" height="${H}" fill="url(#vgrad)"/>

        <!-- Brand mark: Reese. (top left) -->
        <g transform="translate(56, 52)">
          <text x="0" y="42" font-family="Georgia, serif" font-size="52" font-weight="700" fill="#ffffff" letter-spacing="-1.5">Reese</text>
          <circle cx="222" cy="36" r="11" fill="#e8553a"/>
        </g>

        <!-- Headline -->
        <g transform="translate(56, 200)" font-family="Georgia, serif" font-weight="700" fill="#ffffff" letter-spacing="-1.2">
          <text x="0" y="0" font-size="56">AI Trainer for</text>
          <text x="0" y="64" font-size="56">SMEs &amp;</text>
          <text x="0" y="128" font-size="56">Corporate Teams</text>
        </g>

        <!-- Subtitle -->
        <g transform="translate(56, 405)" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="500" fill="#ffffff" fill-opacity="0.95">
          <text x="0" y="0">Stop wasting 10 hours a week</text>
          <text x="0" y="28">on manual work.</text>
        </g>

        <!-- Trust pills -->
        <g transform="translate(56, 505)" font-family="Helvetica, Arial, sans-serif" font-size="12" font-weight="700" fill="#ffffff" letter-spacing="0.10em">
          <g>
            <rect x="0" y="0" width="166" height="36" rx="6" fill="none" stroke="#e8553a" stroke-width="1.5"/>
            <text x="83" y="23" text-anchor="middle">HRDC ACCREDITED</text>
          </g>
          <g transform="translate(180, 0)">
            <rect x="0" y="0" width="186" height="36" rx="6" fill="none" stroke="#e8553a" stroke-width="1.5"/>
            <text x="93" y="23" text-anchor="middle">HRD CORP CLAIMABLE</text>
          </g>
          <g transform="translate(380, 0)">
            <rect x="0" y="0" width="166" height="36" rx="6" fill="none" stroke="#e8553a" stroke-width="1.5"/>
            <text x="83" y="23" text-anchor="middle">LPPEH 5 CPD HOURS</text>
          </g>
        </g>
      </svg>
    `;

    // Stage 3: composite the photo + SVG onto a 1200x630 canvas
    return sharp({
      create: {
        width: W, height: H, channels: 4,
        background: { r: 8, g: 8, b: 10, alpha: 1 }
      }
    })
    .composite([
      { input: photo.data, left: W - rightW, top: 0 },
      { input: Buffer.from(svg), top: 0, left: 0 }
    ])
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile('public/og-image.jpg');
  })
  .then(info => {
    const size = fs.statSync('public/og-image.jpg').size;
    console.log('done: ' + info.width + 'x' + info.height + ', ' + (size / 1024).toFixed(1) + ' KB');
  })
  .catch(e => { console.error('error:', e.message); process.exit(1); });

# Nowhere Mark

Add your mark. Protect your image.

Nowhere Mark is a privacy-first Next.js web app for adding text or image watermarks to your images directly in the browser using HTML Canvas.

## Features
- Drag/drop + file picker upload (JPG, JPEG, PNG, WebP)
- Text watermark controls (text, font size, color, opacity, margin, rotation, 9-position grid)
- Image watermark controls (PNG/SVG/WebP logo, size, opacity, margin, rotation, 9-position grid)
- Original and watermarked previews with preserved aspect ratio
- Local PNG export as `nowhere-mark-{timestamp}.png`
- No backend, no database, no external image processing API

## Privacy-first
All image processing happens locally in your browser. Images are never uploaded.

## Local development
```bash
npm install
npm run dev
```

## Pre-deploy commands
```bash
npm run verify
npm run predeploy
```

## Supported image types
- Source image: JPG/JPEG, PNG, WebP
- Watermark image: PNG, SVG, WebP

## Known limitations
- Very large images may use significant memory in-browser.
- SVG rendering quality depends on browser decoding behavior.

## Future improvements
- Batch watermark
- Repeated watermark pattern
- JPEG/WebP export
- Preset saving in localStorage

## Deployment (Vercel-ready)
Run the deploy checklist first, then deploy with Vercel CLI or Git integration.

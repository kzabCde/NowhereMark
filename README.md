# Nowhere Mark

Privacy-first image studio built with Next.js. Images are processed in the browser and are not uploaded to an application server.

## Product surfaces

- `/` — bilingual landing page
- `/tools` — image-tool directory
- `/editor` — unified batch editor

## Editor capabilities

- Upload up to 9 JPG, PNG or WebP images
- Shared workspace: images remain available while changing tools
- Resize by exact width or height, with optional aspect-ratio locking
- Social presets: 1080×1080, 1080×1350 and 1920×1080
- Center crop presets: 1:1, 4:5, 16:9 and 9:16
- Rotate and flip
- Brightness, contrast, saturation, grayscale and blur adjustments
- AI background removal through `@imgly/background-removal`
- Text, image and hybrid watermarks
- PNG, JPEG and WebP export
- JPEG/WebP quality control for compression
- Undo and redo for non-destructive settings
- Local project save and restore through IndexedDB
- Thai and English interface

The editor creates reduced preview renders and sends standard image processing to a Web Worker with `OffscreenCanvas` when supported. Browsers without those APIs use a Canvas fallback.

## Privacy

Source images, edited previews and local projects remain on the user's device. The first background-removal run may download model assets used by `@imgly/background-removal`.

Review the AGPL-3.0 licensing and model-hosting terms of `@imgly/background-removal` before offering a commercial hosted service.

## Local development

Requirements:

- Node.js 20.9 or newer
- npm 10 or newer

```bash
npm ci
npm run dev
```

Then open `http://localhost:3000`.

## Validation

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run check:audit
```

Run the complete pre-deploy gate with:

```bash
npm run predeploy
```

The production dependency audit intentionally uses `--omit=dev`; lint dependencies are not part of the deployed application.

## Supported exports

| Format | Transparency | Compression control |
|---|---:|---:|
| PNG | Yes | Lossless |
| JPEG | No | Yes |
| WebP | Yes | Yes |

## Known constraints

- Large source images can still require significant browser memory during full-resolution export.
- Multiple downloads may require the user to allow automatic downloads in their browser.
- Background removal depends on WebAssembly/browser compatibility and has a larger first-load cost.

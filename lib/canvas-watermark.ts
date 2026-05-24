import { getWatermarkPosition } from '@/lib/watermark-position';
import type { ImageWatermarkSettings, TextWatermarkSettings } from '@/types/watermark';

function drawRotated(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rotation: number, draw: () => void) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);
  draw();
  ctx.restore();
}

function ensureImageLoaded(image: HTMLImageElement): Promise<void> {
  if (image.complete && image.naturalWidth > 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Failed to load watermark image.'));
  });
}

export async function renderWatermarkedCanvas(
  sourceImage: HTMLImageElement,
  mode: 'text' | 'image',
  textSettings: TextWatermarkSettings,
  imageSettings: ImageWatermarkSettings,
  watermarkImage: HTMLImageElement | null
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = sourceImage.naturalWidth;
  canvas.height = sourceImage.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Always draw source first so watermark remains visible.
  ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

  if (mode === 'text') {
    const text = textSettings.text.trim() || 'Nowhere Mark';
    const color = textSettings.color || '#ffffff';
    const opacity = Math.max(textSettings.opacity || 0.85, 0.8);
    const proportionalFontSize = Math.round(Math.min(canvas.width, canvas.height) * 0.05);
    const fontSize = Math.max(textSettings.fontSize || 0, 28, proportionalFontSize);

    ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = Math.max(fontSize, (metrics.actualBoundingBoxAscent || 0) + (metrics.actualBoundingBoxDescent || 0));
    const pos = getWatermarkPosition(textSettings.position, canvas.width, canvas.height, textWidth, textHeight, textSettings.margin);

    drawRotated(ctx, pos.x, pos.y, textWidth, textHeight, textSettings.rotation, () => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.textBaseline = 'top';
      ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.08));
      ctx.strokeStyle = '#000000';
      ctx.fillStyle = color;
      ctx.strokeText(text, 0, 0);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });
  }

  if (mode === 'image' && watermarkImage) {
    await ensureImageLoaded(watermarkImage);

    const opacity = Math.max(imageSettings.opacity || 0.85, 0.8);
    const baseWidth = canvas.width * (imageSettings.sizePercent / 100);
    const ratio = watermarkImage.naturalHeight / watermarkImage.naturalWidth;
    const w = Math.max(24, baseWidth);
    const h = w * ratio;
    const pos = getWatermarkPosition(imageSettings.position, canvas.width, canvas.height, w, h, imageSettings.margin);

    drawRotated(ctx, pos.x, pos.y, w, h, imageSettings.rotation, () => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(watermarkImage, 0, 0, w, h);
      ctx.restore();
    });
  }

  return canvas;
}

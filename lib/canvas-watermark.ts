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

export function renderWatermarkedCanvas(
  sourceImage: HTMLImageElement,
  mode: 'text' | 'image',
  textSettings: TextWatermarkSettings,
  imageSettings: ImageWatermarkSettings,
  watermarkImage: HTMLImageElement | null
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sourceImage.naturalWidth;
  canvas.height = sourceImage.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

  if (mode === 'text' && textSettings.text.trim()) {
    ctx.font = `${textSettings.fontSize}px Inter, Arial, sans-serif`;
    const metrics = ctx.measureText(textSettings.text);
    const textHeight = textSettings.fontSize;
    const pos = getWatermarkPosition(textSettings.position, canvas.width, canvas.height, metrics.width, textHeight, textSettings.margin);
    drawRotated(ctx, pos.x, pos.y, metrics.width, textHeight, textSettings.rotation, () => {
      ctx.globalAlpha = textSettings.opacity;
      ctx.fillStyle = textSettings.color;
      ctx.textBaseline = 'top';
      ctx.fillText(textSettings.text, 0, 0);
    });
    ctx.globalAlpha = 1;
  }

  if (mode === 'image' && watermarkImage) {
    const baseWidth = canvas.width * (imageSettings.sizePercent / 100);
    const ratio = watermarkImage.naturalHeight / watermarkImage.naturalWidth;
    const w = baseWidth;
    const h = w * ratio;
    const pos = getWatermarkPosition(imageSettings.position, canvas.width, canvas.height, w, h, imageSettings.margin);
    drawRotated(ctx, pos.x, pos.y, w, h, imageSettings.rotation, () => {
      ctx.globalAlpha = imageSettings.opacity;
      ctx.drawImage(watermarkImage, 0, 0, w, h);
    });
    ctx.globalAlpha = 1;
  }

  return canvas;
}

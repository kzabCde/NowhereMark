import type { ImageWatermarkSettings, TextWatermarkSettings, WatermarkTransform } from '@/types/watermark';
import { transformToCanvasPixels } from '@/lib/watermark-transform';

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

export async function renderWatermarkedCanvas(
  sourceImage: HTMLImageElement,
  mode: 'text' | 'image',
  textSettings: TextWatermarkSettings,
  imageSettings: ImageWatermarkSettings,
  watermarkImage: HTMLImageElement | null,
  transform: WatermarkTransform
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = sourceImage.naturalWidth;
  canvas.height = sourceImage.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

  const t = transformToCanvasPixels(canvas.width, canvas.height, transform);
  if (mode === 'text') {
    const text = textSettings.text.trim() || 'Nowhere Mark';
    const fill = textSettings.color || '#ffffff';
    const fontSize = Math.max(24, t.width / Math.max(text.length * 0.6, 2));
    ctx.save();
    ctx.globalAlpha = t.opacity;
    ctx.translate(t.x, t.y);
    ctx.rotate((t.rotation * Math.PI) / 180);
    ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.fillStyle = fill;
    ctx.lineWidth = Math.max(2, fontSize * 0.08);
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  if (mode === 'image' && watermarkImage) {
    const w = t.width;
    const h = w * (watermarkImage.naturalHeight / watermarkImage.naturalWidth);
    ctx.save();
    ctx.globalAlpha = t.opacity;
    ctx.translate(t.x, t.y);
    ctx.rotate((t.rotation * Math.PI) / 180);
    ctx.drawImage(watermarkImage, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  return canvas;
}

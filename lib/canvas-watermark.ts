import type { WatermarkSettings } from '@/types/watermark';

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function drawTextWatermark(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, settings: WatermarkSettings) {
  const text = settings.text.trim() || 'Nowhere Mark';
  const x = canvas.width * (settings.xPercent / 100);
  const y = canvas.height * (settings.yPercent / 100);
  const width = canvas.width * (settings.widthPercent / 100);
  const fontSize = Math.max(24, width / Math.max(text.length * 0.6, 2));

  ctx.save();
  ctx.globalAlpha = settings.opacity;
  ctx.translate(x, y);
  ctx.rotate((settings.rotation * Math.PI) / 180);
  ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.fillStyle = settings.color || '#ffffff';
  ctx.lineWidth = Math.max(2, fontSize * 0.08);
  ctx.strokeText(text, 0, 0);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

async function drawImageWatermark(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, settings: WatermarkSettings) {
  if (!settings.imageSrc) return;
  const watermarkImage = await loadImage(settings.imageSrc);
  const x = canvas.width * (settings.xPercent / 100);
  const y = canvas.height * (settings.yPercent / 100);
  const width = canvas.width * (settings.widthPercent / 100);
  const height = width * ((watermarkImage.naturalHeight || watermarkImage.height) / (watermarkImage.naturalWidth || watermarkImage.width));

  ctx.save();
  ctx.globalAlpha = settings.opacity;
  ctx.translate(x, y);
  ctx.rotate((settings.rotation * Math.PI) / 180);
  ctx.drawImage(watermarkImage, -width / 2, -height / 2, width, height);
  ctx.restore();
}

export async function renderWatermarkedImage({
  imageSrc,
  settings
}: {
  imageSrc: string;
  settings: WatermarkSettings;
}): Promise<string> {
  const originalImage = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas is not supported');
  }

  canvas.width = originalImage.naturalWidth || originalImage.width;
  canvas.height = originalImage.naturalHeight || originalImage.height;

  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

  if (settings.mode === 'text') {
    drawTextWatermark(ctx, canvas, settings);
  }

  if (settings.mode === 'image') {
    await drawImageWatermark(ctx, canvas, settings);
  }

  return canvas.toDataURL('image/png');
}

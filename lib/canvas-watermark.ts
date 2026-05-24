import type { WatermarkSettings } from '@/types/watermark';

type RenderInput = {
  sourceImage: CanvasImageSource;
  sourceWidth: number;
  sourceHeight: number;
  settings: WatermarkSettings;
  watermarkImage?: CanvasImageSource | null;
  targetCanvas?: HTMLCanvasElement;
};

export type RenderWatermarkedImageInput = {
  mainImageSrc: string;
  watermarkSettings: WatermarkSettings;
  watermarkImageSrc?: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function applyEffects(ctx: CanvasRenderingContext2D, s: WatermarkSettings) {
  ctx.filter = [`grayscale(${s.grayscale}%)`, `brightness(${s.brightness}%)`, `contrast(${s.contrast}%)`, `invert(${s.invert}%)`, `blur(${s.blur}px)`].join(' ');
}

export async function renderWatermarkedImage({ mainImageSrc, watermarkSettings, watermarkImageSrc }: RenderWatermarkedImageInput): Promise<string> {
  const sourceImage = await loadImage(mainImageSrc);
  const wm = watermarkImageSrc ? await loadImage(watermarkImageSrc) : null;
  const canvas = renderWatermarkedCanvas({
    sourceImage,
    sourceWidth: sourceImage.naturalWidth,
    sourceHeight: sourceImage.naturalHeight,
    settings: watermarkSettings,
    watermarkImage: wm,
  });
  return canvas.toDataURL('image/png');
}

export function renderWatermarkedCanvas({ sourceImage, sourceWidth, sourceHeight, settings, watermarkImage, targetCanvas }: RenderInput): HTMLCanvasElement {
  const canvas = targetCanvas ?? document.createElement('canvas');
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.filter = 'none';
  ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

  const wmW = (settings.widthPercent / 100) * canvas.width;
  const wmH = watermarkImage ? wmW * (((watermarkImage as HTMLImageElement).naturalHeight / (watermarkImage as HTMLImageElement).naturalWidth) || 1) : settings.fontSize * 1.5;
  const x = (settings.xPercent / 100) * canvas.width;
  const y = (settings.yPercent / 100) * canvas.height;

  ctx.save();
  ctx.globalAlpha = settings.opacity;
  ctx.globalCompositeOperation = settings.blendMode;
  applyEffects(ctx, settings);
  if (settings.shadow) {
    ctx.shadowColor = settings.shadowColor;
    ctx.shadowBlur = settings.shadowBlur;
    ctx.shadowOffsetX = settings.shadowOffsetX;
    ctx.shadowOffsetY = settings.shadowOffsetY;
  }

  const drawAt = (dx: number, dy: number) => {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate((settings.rotation * Math.PI) / 180);
    ctx.scale(settings.flipX ? -1 : 1, settings.flipY ? -1 : 1);

    if ((settings.mode === 'image' || settings.mode === 'hybrid') && watermarkImage) {
      ctx.drawImage(watermarkImage, -wmW / 2, -wmH / 2, wmW, wmH);
      if (settings.stroke) {
        ctx.strokeStyle = settings.strokeColor;
        ctx.lineWidth = settings.strokeWidth;
        ctx.strokeRect(-wmW / 2, -wmH / 2, wmW, wmH);
      }
    }
    if (settings.mode === 'text' || settings.mode === 'hybrid') {
      ctx.font = `${settings.textItalic ? 'italic ' : ''}${settings.textBold ? '700 ' : '400 '}${settings.fontSize}px Inter, Arial, sans-serif`;
      ctx.fillStyle = settings.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const chars = settings.text.split('');
      let cx = 0;
      for (const ch of chars) {
        const w = ctx.measureText(ch).width;
        if (settings.stroke) {
          ctx.strokeStyle = settings.textStrokeColor;
          ctx.lineWidth = settings.strokeWidth;
          ctx.strokeText(ch, cx, 0);
        }
        ctx.fillText(ch, cx, 0);
        cx += w + settings.letterSpacing;
      }
    }
    ctx.restore();
  };

  if (settings.repeat) {
    const stepX = Math.max(80, wmW * 1.6);
    const stepY = Math.max(80, wmH * 1.6);
    for (let ty = -stepY; ty < canvas.height + stepY; ty += stepY) {
      for (let tx = -stepX; tx < canvas.width + stepX; tx += stepX) {
        drawAt(tx, ty);
      }
    }
  } else {
    drawAt(x, y);
  }

  ctx.restore();
  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  return canvas;
}

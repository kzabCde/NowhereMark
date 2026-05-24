import type { WatermarkPosition, WatermarkTransform } from '@/types/watermark';

export function clampTransform(transform: WatermarkTransform): WatermarkTransform {
  const rotation = ((transform.rotation + 180) % 360 + 360) % 360 - 180;
  return {
    xPercent: Math.min(100, Math.max(0, transform.xPercent)),
    yPercent: Math.min(100, Math.max(0, transform.yPercent)),
    widthPercent: Math.min(80, Math.max(5, transform.widthPercent)),
    rotation,
    opacity: Math.min(1, Math.max(0.1, transform.opacity))
  };
}

export function presetToTransform(position: WatermarkPosition): Pick<WatermarkTransform, 'xPercent' | 'yPercent'> {
  const map: Record<WatermarkPosition, { xPercent: number; yPercent: number }> = {
    'top-left': { xPercent: 12, yPercent: 12 },
    'top-center': { xPercent: 50, yPercent: 12 },
    'top-right': { xPercent: 88, yPercent: 12 },
    'center-left': { xPercent: 12, yPercent: 50 },
    center: { xPercent: 50, yPercent: 50 },
    'center-right': { xPercent: 88, yPercent: 50 },
    'bottom-left': { xPercent: 12, yPercent: 88 },
    'bottom-center': { xPercent: 50, yPercent: 88 },
    'bottom-right': { xPercent: 88, yPercent: 88 }
  };
  return map[position];
}

export function transformToCanvasPixels(canvasWidth: number, canvasHeight: number, transform: WatermarkTransform) {
  return {
    x: canvasWidth * (transform.xPercent / 100),
    y: canvasHeight * (transform.yPercent / 100),
    width: canvasWidth * (transform.widthPercent / 100),
    opacity: transform.opacity,
    rotation: transform.rotation
  };
}

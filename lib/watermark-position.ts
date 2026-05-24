import type { WatermarkPosition } from '@/types/watermark';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getWatermarkPosition(
  position: WatermarkPosition,
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  margin: number
): { x: number; y: number } {
  const safeMargin = Math.max(0, margin);
  const maxX = Math.max(0, canvasWidth - watermarkWidth);
  const maxY = Math.max(0, canvasHeight - watermarkHeight);

  const left = clamp(safeMargin, 0, maxX);
  const centerX = clamp((canvasWidth - watermarkWidth) / 2, 0, maxX);
  const right = clamp(canvasWidth - watermarkWidth - safeMargin, 0, maxX);

  const top = clamp(safeMargin, 0, maxY);
  const centerY = clamp((canvasHeight - watermarkHeight) / 2, 0, maxY);
  const bottom = clamp(canvasHeight - watermarkHeight - safeMargin, 0, maxY);

  const map: Record<WatermarkPosition, { x: number; y: number }> = {
    'top-left': { x: left, y: top },
    'top-center': { x: centerX, y: top },
    'top-right': { x: right, y: top },
    'center-left': { x: left, y: centerY },
    center: { x: centerX, y: centerY },
    'center-right': { x: right, y: centerY },
    'bottom-left': { x: left, y: bottom },
    'bottom-center': { x: centerX, y: bottom },
    'bottom-right': { x: right, y: bottom }
  };

  return map[position];
}

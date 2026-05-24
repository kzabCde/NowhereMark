import type { WatermarkPosition } from '@/types/watermark';

export function getWatermarkPosition(
  position: WatermarkPosition,
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  margin: number
): { x: number; y: number } {
  const left = margin;
  const centerX = (canvasWidth - watermarkWidth) / 2;
  const right = canvasWidth - watermarkWidth - margin;

  const top = margin;
  const centerY = (canvasHeight - watermarkHeight) / 2;
  const bottom = canvasHeight - watermarkHeight - margin;

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

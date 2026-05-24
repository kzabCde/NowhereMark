import { describe, expect, it } from 'vitest';
import { clampTransform, presetToTransform, transformToCanvasPixels } from '../lib/watermark-transform';

describe('watermark transform helpers', () => {
  it('converts percents to canvas pixels', () => {
    expect(transformToCanvasPixels(1000, 800, { xPercent: 50, yPercent: 25, widthPercent: 20, rotation: 30, opacity: 0.8 })).toEqual({ x: 500, y: 200, width: 200, rotation: 30, opacity: 0.8 });
  });

  it('clamps transform values', () => {
    expect(clampTransform({ xPercent: -10, yPercent: 120, widthPercent: 90, rotation: 200, opacity: 2 })).toEqual({ xPercent: 0, yPercent: 100, widthPercent: 80, rotation: -160, opacity: 1 });
  });

  it('maps preset to percentages', () => {
    expect(presetToTransform('top-left')).toEqual({ xPercent: 12, yPercent: 12 });
    expect(presetToTransform('center')).toEqual({ xPercent: 50, yPercent: 50 });
    expect(presetToTransform('bottom-right')).toEqual({ xPercent: 88, yPercent: 88 });
  });
});

import { describe, expect, it } from 'vitest';
import {
  calculateResizeDimensions,
  centerCropForAspect,
  clampCenter,
  getOutputFilename,
  normalizeCrop,
  trackedTextWidth,
} from '@/lib/image-math';

describe('image resize math', () => {
  it('preserves aspect ratio from a requested width', () => {
    expect(calculateResizeDimensions(4000, 3000, {
      width: 1000,
      height: null,
      keepAspectRatio: true,
    })).toEqual({ width: 1000, height: 750 });
  });

  it('uses exact dimensions when aspect ratio is unlocked', () => {
    expect(calculateResizeDimensions(4000, 3000, {
      width: 1080,
      height: 1350,
      keepAspectRatio: false,
    })).toEqual({ width: 1080, height: 1350 });
  });

  it('keeps original dimensions when no size is requested', () => {
    expect(calculateResizeDimensions(1920, 1080, {
      width: null,
      height: null,
      keepAspectRatio: true,
    })).toEqual({ width: 1920, height: 1080 });
  });
});

describe('crop and export helpers', () => {
  it('creates a centered square crop for a landscape image', () => {
    expect(centerCropForAspect(4000, 3000, 1, 1)).toEqual({
      xPercent: 12.5,
      yPercent: 0,
      widthPercent: 75,
      heightPercent: 100,
    });
  });

  it('normalizes crop values so they stay inside the image', () => {
    expect(normalizeCrop({
      xPercent: 90,
      yPercent: -5,
      widthPercent: 50,
      heightPercent: 200,
    })).toEqual({
      xPercent: 90,
      yPercent: 0,
      widthPercent: 10,
      heightPercent: 100,
    });
  });

  it('converts output extensions without preserving the source extension', () => {
    expect(getOutputFilename('photo.jpeg', 'image/webp')).toBe('photo-edited.webp');
  });
});

describe('watermark layout helpers', () => {
  it('measures tracked text without spacing after the final character', () => {
    expect(trackedTextWidth([10, 20, 10], 2)).toBe(44);
  });

  it('keeps watermark centers within the canvas', () => {
    expect(clampCenter(990, 200, 1000)).toBe(900);
    expect(clampCenter(10, 200, 1000)).toBe(100);
  });
});

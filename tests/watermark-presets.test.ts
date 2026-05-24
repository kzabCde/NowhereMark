import { describe, expect, it } from 'vitest';
import { applyLayoutPreset } from '@/lib/watermark-presets';

describe('watermark presets', () => {
  it('maps center', () => {
    expect(applyLayoutPreset('center')).toEqual({ xPercent: 50, yPercent: 50, rotation: 0, repeat: false });
  });
  it('maps tiled', () => {
    expect(applyLayoutPreset('tiled-diagonal').repeat).toBe(true);
  });
});

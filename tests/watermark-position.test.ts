import { describe, expect, it } from 'vitest';
import { getWatermarkPosition } from '@/lib/watermark-position';

const base = [1000, 800, 200, 100, 20] as const;

describe('getWatermarkPosition', () => {
  it.each([
    ['top-left', { x: 20, y: 20 }],
    ['top-center', { x: 400, y: 20 }],
    ['top-right', { x: 780, y: 20 }],
    ['center-left', { x: 20, y: 350 }],
    ['center', { x: 400, y: 350 }],
    ['center-right', { x: 780, y: 350 }],
    ['bottom-left', { x: 20, y: 680 }],
    ['bottom-center', { x: 400, y: 680 }],
    ['bottom-right', { x: 780, y: 680 }]
  ])('returns %s', (position, expected) => {
    expect(getWatermarkPosition(position as never, ...base)).toEqual(expected);
  });
});

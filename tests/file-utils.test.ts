import { describe, expect, it } from 'vitest';
import { getExportFilename, isValidSourceImageType, isValidWatermarkImageType } from '@/lib/file-utils';

describe('file utils', () => {
  it('validates source types', () => {
    expect(isValidSourceImageType(new File(['x'], 'a.jpg', { type: 'image/jpeg' }))).toBe(true);
    expect(isValidSourceImageType(new File(['x'], 'a.gif', { type: 'image/gif' }))).toBe(false);
  });

  it('validates watermark types', () => {
    expect(isValidWatermarkImageType(new File(['x'], 'a.svg', { type: 'image/svg+xml' }))).toBe(true);
  });

  it('formats export filename', () => {
    expect(getExportFilename(undefined, new Date('2026-05-24T12:00:00.000Z'))).toBe('nowhere-mark-2026-05-24T12-00-00-000Z.png');
  });
});

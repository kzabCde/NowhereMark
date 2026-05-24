import { describe, expect, it } from 'vitest';
import { getExportFilename, isValidSourceImageType } from '@/lib/file-utils';

describe('file utils', () => {
  it('detects invalid file type', () => {
    const file = new File(['x'], 'x.gif', { type: 'image/gif' });
    expect(isValidSourceImageType(file)).toBe(false);
  });

  it('builds export filename', () => {
    const name = getExportFilename(new Date('2026-05-24T12:00:00.000Z'));
    expect(name).toBe('nowhere-mark-2026-05-24T12-00-00-000Z.png');
  });
});

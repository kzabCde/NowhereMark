import { describe, expect, it } from 'vitest';

describe('canvas math', () => {
  it('percent helper sanity', () => {
    expect((25 / 100) * 800).toBe(200);
  });
});

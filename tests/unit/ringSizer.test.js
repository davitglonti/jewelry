import { describe, it, expect } from 'vitest';
import { SIZE_CHART, getClosestSize } from '../../src/components/store/RingSizerTool';

describe('Ring Sizer logic and ISO 8653 size conversion', () => {
  it('contains expected standard size chart with EU and US mappings', () => {
    expect(SIZE_CHART.length).toBeGreaterThanOrEqual(15);
    const size16_5 = SIZE_CHART.find((s) => s.eu === '16.5');
    expect(size16_5).toBeDefined();
    expect(size16_5.diameter).toBe(16.5);
    expect(size16_5.us).toBe('6');
  });

  it('matches exact diameter correctly', () => {
    expect(getClosestSize(16.5).eu).toBe('16.5');
    expect(getClosestSize(17.0).eu).toBe('17.0');
    expect(getClosestSize(18.0).eu).toBe('18.0');
  });

  it('finds the nearest standard size when input diameter is between sizes', () => {
    // 16.6 mm is closer to 16.5 mm
    expect(getClosestSize(16.6).eu).toBe('16.5');
    // 16.9 mm is closer to 17.0 mm
    expect(getClosestSize(16.9).eu).toBe('17.0');
  });

  it('handles boundary extremes without breaking', () => {
    expect(getClosestSize(13.0).eu).toBe('15.0');
    expect(getClosestSize(25.0).eu).toBe('22.0');
  });
});

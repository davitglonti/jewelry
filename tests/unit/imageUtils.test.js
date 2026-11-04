import { describe, it, expect } from 'vitest';
import { getOptimizedImageUrl, getUnsplashSrcSet, getProductCardSrcSet, sanitizeImageUrl } from '../../src/utils/imageUtils';

describe('imageUtils optimizations', () => {
  const unsplashUrl = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338';

  it('appends fm=webp and q=60 to Unsplash image URLs', () => {
    const optimized = getOptimizedImageUrl(unsplashUrl, 500);
    expect(optimized).toContain('fm=webp');
    expect(optimized).toContain('q=60');
    expect(optimized).toContain('w=500');
    expect(optimized).toContain('auto=format');
  });

  it('generates webp srcSet for Unsplash URLs', () => {
    const srcSet = getUnsplashSrcSet(unsplashUrl);
    expect(srcSet).toBeDefined();
    expect(srcSet).toContain('fm=webp');
    expect(srcSet).toContain('q=60');
  });

  it('generates webp card srcSet for Unsplash URLs', () => {
    const cardSrcSet = getProductCardSrcSet(unsplashUrl);
    expect(cardSrcSet).toBeDefined();
    expect(cardSrcSet).toContain('fm=webp');
    expect(cardSrcSet).toContain('q=60');
  });

  it('returns non-unsplash URLs safely', () => {
    const localUrl = '/brand-logo.jpg';
    expect(getOptimizedImageUrl(localUrl)).toBe(localUrl);
    expect(getUnsplashSrcSet(localUrl)).toBeUndefined();
    expect(getProductCardSrcSet(localUrl)).toBeUndefined();
  });
});

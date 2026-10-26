import { describe, it, expect } from 'vitest';
import { calculateDiscountPercent, formatPrice, pick } from '../../src/utils/i18n';

describe('i18n and formatting utilities', () => {
  describe('calculateDiscountPercent', () => {
    it('calculates discount percentage correctly when oldPrice is higher than price', () => {
      expect(calculateDiscountPercent('1000', '1250')).toBe(20);
      expect(calculateDiscountPercent(800, 1000)).toBe(20);
      expect(calculateDiscountPercent('4,500 ₾', '5,000 ₾')).toBe(10);
    });

    it('returns null if oldPrice is missing or invalid', () => {
      expect(calculateDiscountPercent('1000', null)).toBeNull();
      expect(calculateDiscountPercent('1000', '')).toBeNull();
      expect(calculateDiscountPercent('1000', undefined)).toBeNull();
    });

    it('returns null if price is greater than or equal to oldPrice', () => {
      expect(calculateDiscountPercent('1000', '1000')).toBeNull();
      expect(calculateDiscountPercent('1200', '1000')).toBeNull();
    });

    it('returns null for negative or zero oldPrice', () => {
      expect(calculateDiscountPercent('100', '0')).toBeNull();
      expect(calculateDiscountPercent('100', '-50')).toBeNull();
    });
  });

  describe('formatPrice', () => {
    it('formats numbers with thousand separators and lari symbol', () => {
      expect(formatPrice(1250)).toBe('1,250 ₾');
      expect(formatPrice(1000000)).toBe('1,000,000 ₾');
      expect(formatPrice('5500')).toBe('5,500 ₾');
    });

    it('preserves decimal fractions when not zero', () => {
      expect(formatPrice(1250.5)).toBe('1,250.5 ₾');
      expect(formatPrice('1250.75')).toBe('1,250.75 ₾');
    });

    it('returns empty string for null, undefined or blank values', () => {
      expect(formatPrice(null)).toBe('');
      expect(formatPrice(undefined)).toBe('');
      expect(formatPrice('')).toBe('');
    });
  });

  describe('pick', () => {
    const item = {
      name: 'ბეჭედი აურელია',
      nameEn: 'Aurelia Ring',
      description: 'ოქროს ბეჭედი',
      descriptionEn: 'Gold Ring'
    };

    it('returns Georgian field when lang is ka', () => {
      expect(pick(item, 'name', 'ka')).toBe('ბეჭედი აურელია');
      expect(pick(item, 'description', 'ka')).toBe('ოქროს ბეჭედი');
    });

    it('returns English field when lang is en', () => {
      expect(pick(item, 'name', 'en')).toBe('Aurelia Ring');
      expect(pick(item, 'description', 'en')).toBe('Gold Ring');
    });

    it('falls back to Georgian field if English field is missing when lang is en', () => {
      const itemWithoutEn = { name: 'უნიკალური სამკაული' };
      expect(pick(itemWithoutEn, 'name', 'en')).toBe('უნიკალური სამკაული');
    });
  });
});

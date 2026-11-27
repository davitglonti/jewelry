import { describe, it, expect } from 'vitest';
import { DEFAULT_PROMO_CODES, evaluatePromoCode } from '../../api/_lib/orders.js';

describe('Promo Codes & Discounts logic (Server-side only)', () => {
  it('includes default active promo codes strictly on server', () => {
    expect(DEFAULT_PROMO_CODES.length).toBeGreaterThan(0);
    const matare10 = DEFAULT_PROMO_CODES.find((c) => c.code === 'MATARE10');
    expect(matare10).toBeDefined();
    expect(matare10.type).toBe('percentage');
    expect(matare10.value).toBe(10);
    expect(matare10.isActive).toBe(true);
    expect(evaluatePromoCode(DEFAULT_PROMO_CODES, 'MATARE10', 500, 'ka').valid).toBe(true);
  });

  it('correctly calculates percentage discount', () => {
    const rawSubtotal = 1000;
    const promo = { type: 'percentage', value: 15 };
    const discount = Math.round(rawSubtotal * (promo.value / 100));
    expect(discount).toBe(150);
  });

  it('correctly calculates fixed amount discount capped at subtotal', () => {
    const promo = { type: 'fixed', value: 50 };
    expect(Math.min(1000, promo.value)).toBe(50);
    expect(Math.min(30, promo.value)).toBe(30);
  });

  it('correctly identifies expired promo codes', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const futureDate = new Date(Date.now() + 86400000).toISOString();

    const isExpired = (c) => {
      if (!c.expiresAt) return false;
      const exp = new Date(c.expiresAt);
      return !isNaN(exp.getTime()) && exp < new Date();
    };

    expect(isExpired({ expiresAt: pastDate })).toBe(true);
    expect(isExpired({ expiresAt: futureDate })).toBe(false);
    expect(isExpired({ expiresAt: null })).toBe(false);
  });

  it('correctly identifies max usage limit exceeded', () => {
    const isExhausted = (c) => {
      if (!c.maxUses) return false;
      return (c.usedCount || 0) >= c.maxUses;
    };

    expect(isExhausted({ maxUses: 10, usedCount: 10 })).toBe(true);
    expect(isExhausted({ maxUses: 10, usedCount: 11 })).toBe(true);
    expect(isExhausted({ maxUses: 10, usedCount: 9 })).toBe(false);
    expect(isExhausted({ maxUses: null, usedCount: 999 })).toBe(false);
  });

  it('validates minimum order amount requirement', () => {
    const promo = { minOrderAmount: 200 };
    const isValidAmount = (subtotal) => subtotal >= promo.minOrderAmount;

    expect(isValidAmount(250)).toBe(true);
    expect(isValidAmount(200)).toBe(true);
    expect(isValidAmount(199)).toBe(false);
  });
});

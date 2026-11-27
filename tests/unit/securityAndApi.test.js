import { describe, it, expect, vi, beforeEach } from 'vitest';
import { escapeHtml, sanitizeUrl, resolveSafeOrigin } from '../../api/_lib/security.js';
import { evaluatePromoCode, sanitizeOrderForPublicTracking } from '../../api/_lib/orders.js';
import admin2faHandler from '../../api/admin-2fa.js';
import createOrderHandler from '../../api/create-order.js';
import checkAdminHandler from '../../api/check-admin.js';

function createMockRes() {
  const headers = {};
  return {
    statusCode: 200,
    headers,
    body: null,
    setHeader(k, v) {
      headers[k.toLowerCase()] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end() {
      return this;
    },
  };
}

describe('Security helpers & server API hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('escapes HTML entities to prevent XSS / HTML injection', () => {
    const dirty = '<script>alert("xss")</script> & \'test\'';
    const clean = escapeHtml(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;test&#39;');
  });

  it('sanitizes untrusted URL protocols while preserving https/http/relative URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)', '/fallback.jpg')).toBe('/fallback.jpg');
    expect(sanitizeUrl('data:text/html,<script>', '/fallback.jpg')).toBe('/fallback.jpg');
    expect(sanitizeUrl('https://images.unsplash.com/photo.jpg')).toBe('https://images.unsplash.com/photo.jpg');
    expect(sanitizeUrl('/brand-logo.jpg')).toBe('/brand-logo.jpg');
  });

  it('resolves safe origin and blocks arbitrary external redirect origins', () => {
    expect(resolveSafeOrigin('https://evil.attacker.com')).toBe('https://www.matare.store');
    expect(resolveSafeOrigin('http://localhost:5173/')).toBe('http://localhost:5173');
    expect(resolveSafeOrigin('https://www.matare.store')).toBe('https://www.matare.store');
  });

  it('evaluates promo codes cleanly server-side', () => {
    const promos = [
      { id: '1', code: 'SAVE15', type: 'percentage', value: 15, minOrderAmount: 500, isActive: true },
      { id: '2', code: 'EXPIRED', type: 'percentage', value: 20, expiresAt: '2020-01-01', isActive: true },
      { id: '3', code: 'MAXED', type: 'fixed', value: 50, maxUses: 5, usedCount: 5, isActive: true },
    ];

    expect(evaluatePromoCode(promos, 'save15', 1000).valid).toBe(true);
    expect(evaluatePromoCode(promos, 'SAVE15', 200).valid).toBe(false);
    expect(evaluatePromoCode(promos, 'EXPIRED', 1000).valid).toBe(false);
    expect(evaluatePromoCode(promos, 'MAXED', 1000).valid).toBe(false);
    expect(evaluatePromoCode(promos, 'UNKNOWN', 1000).valid).toBe(false);
  });

  it('masks PII on anonymous public order tracking while keeping full details for authorized owner', () => {
    const order = {
      id: 'MTR-123456',
      clientName: 'დავით გლონტი',
      clientPhone: '599112233',
      clientEmail: 'davit@example.com',
      address: 'ჭავჭავაძის 24',
      notes: 'კართან დარეკეთ',
      city: 'თბილისი',
      status: 'გზაშია',
      totalPrice: 2500,
      items: [{ id: '1', name: 'ბეჭედი', sku: 'AUR-1', size: '17', price: 2500 }],
    };

    const masked = sanitizeOrderForPublicTracking(order, false);
    expect(masked.clientEmail).toBeUndefined();
    expect(masked.clientPhone).toBeUndefined();
    expect(masked.address).toBeUndefined();
    expect(masked.notes).toBeUndefined();
    expect(masked.clientName).toBe('დ*** გ***');
    expect(masked.status).toBe('გზაშია');

    const full = sanitizeOrderForPublicTracking(order, true);
    expect(full.clientEmail).toBe('davit@example.com');
    expect(full.address).toBe('ჭავჭავაძის 24');
  });

  it('rejects unauthenticated activate action on /api/check-admin', async () => {
    const req = { method: 'POST', headers: {}, body: { action: 'activate', email: 'fake@example.com' } };
    const res = createMockRes();
    await checkAdminHandler(req, res);
    expect(res.statusCode).toBe(401);
  });

  it('rejects unauthenticated requests to /api/admin-2fa', async () => {
    const req = { method: 'POST', headers: {}, body: { action: 'status' } };
    const res = createMockRes();
    await admin2faHandler(req, res);
    expect(res.statusCode).toBe(403);
  });

  it('rejects unauthenticated init-reset requests to /api/admin-2fa', async () => {
    const req = { method: 'POST', headers: {}, body: { action: 'init-reset' } };
    const res = createMockRes();
    await admin2faHandler(req, res);
    expect(res.statusCode).toBe(403);
  });

  it('rejects invalid / empty order payloads on /api/create-order cleanly', async () => {
    const req = {
      method: 'POST',
      headers: { 'x-forwarded-for': '127.0.0.1' },
      body: { clientName: 'Test User', clientPhone: '123', items: [] },
    };
    const res = createMockRes();
    await createOrderHandler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body?.error).toBeTruthy();
  });

  it('rejects unauthenticated requests to /api/check-admin', async () => {
    const req = { method: 'POST', headers: {}, body: {} };
    const res = createMockRes();
    await checkAdminHandler(req, res);
    expect(res.statusCode).toBe(401);
    expect(res.body?.isAdmin).toBe(false);
  });
});

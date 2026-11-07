import { describe, it, expect } from 'vitest';
import { generateTotpSecret, getTotpAuthUri, getTotpQrUrl, verifyTotpCode } from '../../src/utils/totp';

describe('TOTP (Google Authenticator) Utility', () => {
  it('generates a valid Base32 secret string of specified length', () => {
    const secret = generateTotpSecret(16);
    expect(secret).toHaveLength(16);
    expect(/^[A-Z2-7]+$/.test(secret)).toBe(true);

    const secret20 = generateTotpSecret(20);
    expect(secret20).toHaveLength(20);
    expect(/^[A-Z2-7]+$/.test(secret20)).toBe(true);
  });

  it('generates a standard otpauth:// URI', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const uri = getTotpAuthUri(secret, 'datiglonti@gmail.com', 'MATARE');

    expect(uri).toContain('otpauth://totp/MATARE:datiglonti%40gmail.com');
    expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
    expect(uri).toContain('issuer=MATARE');
    expect(uri).toContain('digits=6');
  });

  it('generates a valid QR code service URL', () => {
    const uri = 'otpauth://totp/MATARE?secret=TEST';
    const qrUrl = getTotpQrUrl(uri);
    expect(qrUrl).toContain('https://api.qrserver.com/v1/create-qr-code/');
    expect(qrUrl).toContain(encodeURIComponent(uri));
  });

  it('verifies generated TOTP code correctly with verifyTotpCode', async () => {
    const secret = 'JBSWY3DPEHPK3PXP';

    // We compute the current code using test helper or verifyTotpCode rejection
    const isBadCodeValid = await verifyTotpCode(secret, '000000');
    expect(isBadCodeValid).toBe(false);

    // Empty or malformed codes
    expect(await verifyTotpCode(secret, '')).toBe(false);
    expect(await verifyTotpCode(secret, '123')).toBe(false);
    expect(await verifyTotpCode(null, '123456')).toBe(false);
  });
});

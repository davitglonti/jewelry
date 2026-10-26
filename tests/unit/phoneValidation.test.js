import { describe, it, expect } from 'vitest';

describe('Georgian Phone Number Validation', () => {
  const georgianPhoneRegex = /^(\+?995)?5\d{8}$/;
  const cleanPhone = (val) => val.replace(/[\s\-()]/g, '');

  it('validates standard 9-digit Georgian mobile numbers starting with 5', () => {
    expect(georgianPhoneRegex.test(cleanPhone('599123456'))).toBe(true);
    expect(georgianPhoneRegex.test(cleanPhone('555 12 34 56'))).toBe(true);
    expect(georgianPhoneRegex.test(cleanPhone('577-98-76-54'))).toBe(true);
    expect(georgianPhoneRegex.test(cleanPhone('(598) 11 22 33'))).toBe(true);
  });

  it('validates numbers with country code prefix (+995 or 995)', () => {
    expect(georgianPhoneRegex.test(cleanPhone('+995 599 12 34 56'))).toBe(true);
    expect(georgianPhoneRegex.test(cleanPhone('995599123456'))).toBe(true);
    expect(georgianPhoneRegex.test(cleanPhone('+995577001122'))).toBe(true);
  });

  it('rejects invalid numbers or wrong length', () => {
    expect(georgianPhoneRegex.test(cleanPhone('12345'))).toBe(false);
    expect(georgianPhoneRegex.test(cleanPhone('59912345'))).toBe(false); // only 8 digits
    expect(georgianPhoneRegex.test(cleanPhone('5991234567'))).toBe(false); // 10 digits without code
    expect(georgianPhoneRegex.test(cleanPhone('699123456'))).toBe(false); // starts with 6 instead of 5
    expect(georgianPhoneRegex.test(cleanPhone('599-abc-def'))).toBe(false);
    expect(georgianPhoneRegex.test(cleanPhone(''))).toBe(false);
  });
});

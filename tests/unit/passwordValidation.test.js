// tests/unit/passwordValidation.test.js
import { describe, it, expect } from 'vitest';
import {
  checkPasswordCriteria,
  getPasswordScore,
  isStrongPassword,
  getPasswordStrengthMeta,
  getPasswordValidationMessage,
} from '../../src/utils/passwordValidation';

describe('passwordValidation utility', () => {
  it('should flag simple weak passwords as invalid', () => {
    // Specifically test user example "asdfgh"
    expect(isStrongPassword('asdfgh')).toBe(false);
    expect(isStrongPassword('123456')).toBe(false);
    expect(isStrongPassword('password')).toBe(false);
    expect(isStrongPassword('')).toBe(false);
    expect(isStrongPassword('short1A')).toBe(false); // 7 characters
  });

  it('should evaluate individual criteria correctly', () => {
    const asdfgh = checkPasswordCriteria('asdfgh');
    expect(asdfgh.minLength).toBe(false);
    expect(asdfgh.hasUpper).toBe(false);
    expect(asdfgh.hasLower).toBe(true);
    expect(asdfgh.hasNumberOrSymbol).toBe(false);

    const withUpper = checkPasswordCriteria('Asdfghjk');
    expect(withUpper.minLength).toBe(true);
    expect(withUpper.hasUpper).toBe(true);
    expect(withUpper.hasLower).toBe(true);
    expect(withUpper.hasNumberOrSymbol).toBe(false);

    const withDigit = checkPasswordCriteria('Asdfgh12');
    expect(withDigit.minLength).toBe(true);
    expect(withDigit.hasUpper).toBe(true);
    expect(withDigit.hasLower).toBe(true);
    expect(withDigit.hasNumberOrSymbol).toBe(true);
    expect(isStrongPassword('Asdfgh12')).toBe(true);
  });

  it('should accept strong passwords meeting all requirements', () => {
    expect(isStrongPassword('Matare#2026')).toBe(true);
    expect(isStrongPassword('JewelryApp1!')).toBe(true);
    expect(isStrongPassword('Secur3P@ssword')).toBe(true);
  });

  it('should compute strength score and meta correctly', () => {
    expect(getPasswordScore('asdfgh')).toBe(1);
    expect(getPasswordScore('Asdfgh12')).toBe(4);

    const weakMeta = getPasswordStrengthMeta('asdfgh', 'ka');
    expect(weakMeta.label).toBe('სუსტი');
    expect(weakMeta.colorClass).toContain('red');

    const strongMeta = getPasswordStrengthMeta('Matare#2026', 'ka');
    expect(strongMeta.label).toBe('ძლიერი');
    expect(strongMeta.colorClass).toContain('emerald');
  });

  it('should provide clear Georgian and English messages on missing criteria', () => {
    const msgKa = getPasswordValidationMessage('asdfgh', 'ka');
    expect(msgKa).toContain('მინიმუმ 8 სიმბოლო');
    expect(msgKa).toContain('დიდი ასო');

    const msgEn = getPasswordValidationMessage('asdfgh', 'en');
    expect(msgEn).toContain('at least 8 characters');
    expect(msgEn).toContain('uppercase letter');

    expect(getPasswordValidationMessage('Matare#2026', 'ka')).toBeNull();
  });
});

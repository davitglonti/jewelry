// src/utils/passwordValidation.js

/**
 * Checks a password against strong password security criteria.
 * Criteria required for a valid account password:
 * 1. Minimum 8 characters in length
 * 2. At least one uppercase Latin letter (A-Z)
 * 3. At least one lowercase Latin letter (a-z)
 * 4. At least one number or special character / symbol
 */
export function checkPasswordCriteria(password = '') {
  const pwd = typeof password === 'string' ? password : '';
  return {
    minLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumberOrSymbol: /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd),
  };
}

/**
 * Computes a password strength score from 0 to 4 based on criteria met.
 */
export function getPasswordScore(password = '') {
  const criteria = checkPasswordCriteria(password);
  let score = 0;
  if (criteria.minLength) score += 1;
  if (criteria.hasUpper) score += 1;
  if (criteria.hasLower) score += 1;
  if (criteria.hasNumberOrSymbol) score += 1;
  return score;
}

/**
 * Returns whether all strong password criteria are satisfied.
 */
export function isStrongPassword(password = '') {
  const criteria = checkPasswordCriteria(password);
  return (
    criteria.minLength &&
    criteria.hasUpper &&
    criteria.hasLower &&
    criteria.hasNumberOrSymbol
  );
}

/**
 * Returns localized label and styling for password strength meter.
 */
export function getPasswordStrengthMeta(password = '', lang = 'ka') {
  if (!password) {
    return {
      score: 0,
      label: '',
      colorClass: 'bg-stone-700',
      textClass: 'text-stone-400',
    };
  }

  const score = getPasswordScore(password);

  if (score <= 1) {
    return {
      score,
      label: lang === 'ka' ? 'სუსტი' : 'Weak',
      colorClass: 'bg-red-500',
      textClass: 'text-red-400',
    };
  }
  if (score <= 3) {
    return {
      score,
      label: lang === 'ka' ? 'საშუალო' : 'Moderate',
      colorClass: 'bg-amber-500',
      textClass: 'text-amber-400',
    };
  }
  return {
    score: 4,
    label: lang === 'ka' ? 'ძლიერი' : 'Strong',
    colorClass: 'bg-emerald-500',
    textClass: 'text-emerald-400',
  };
}

/**
 * Generates a helpful localized error message detailing which requirements are missing.
 */
export function getPasswordValidationMessage(password = '', lang = 'ka') {
  if (!password) {
    return lang === 'ka' ? 'გთხოვთ შეიყვანოთ პაროლი.' : 'Please enter a password.';
  }

  const criteria = checkPasswordCriteria(password);
  if (
    criteria.minLength &&
    criteria.hasUpper &&
    criteria.hasLower &&
    criteria.hasNumberOrSymbol
  ) {
    return null;
  }

  const missing = [];
  if (!criteria.minLength) {
    missing.push(lang === 'ka' ? 'მინიმუმ 8 სიმბოლო' : 'at least 8 characters');
  }
  if (!criteria.hasUpper) {
    missing.push(lang === 'ka' ? 'დიდი ასო (A-Z)' : 'uppercase letter (A-Z)');
  }
  if (!criteria.hasLower) {
    missing.push(lang === 'ka' ? 'პატარა ასო (a-z)' : 'lowercase letter (a-z)');
  }
  if (!criteria.hasNumberOrSymbol) {
    missing.push(lang === 'ka' ? 'ციფრი ან სიმბოლო (0-9, !@#)' : 'number or symbol (0-9, !@#)');
  }

  if (lang === 'ka') {
    return `პაროლი უნდა შეიცავდეს: ${missing.join(', ')}.`;
  }
  return `Password must contain: ${missing.join(', ')}.`;
}

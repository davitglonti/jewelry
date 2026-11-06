// src/components/auth/PasswordStrengthIndicator.jsx
import React from 'react';
import { Check, CircleDot } from 'lucide-react';
import { checkPasswordCriteria, getPasswordStrengthMeta } from '../../utils/passwordValidation';

export default function PasswordStrengthIndicator({ password = '', lang = 'ka', darkMode = true }) {
  if (!password) {
    return (
      <div className="mt-2 text-[11px] opacity-60 flex items-center gap-1.5">
        <CircleDot className="w-3 h-3 text-amber-500/70 shrink-0" />
        <span>
          {lang === 'ka'
            ? 'გამოიყენეთ მინ. 8 სიმბოლო, დიდი/პატარა ასოები და ციფრი/სიმბოლო.'
            : 'Use at least 8 characters, upper/lower letters, and a number/symbol.'}
        </span>
      </div>
    );
  }

  const criteria = checkPasswordCriteria(password);
  const meta = getPasswordStrengthMeta(password, lang);

  const rules = [
    { key: 'minLength', label: lang === 'ka' ? 'მინ. 8 სიმბოლო' : 'Min. 8 characters', met: criteria.minLength },
    { key: 'hasUpper', label: lang === 'ka' ? 'დიდი ასო (A-Z)' : 'Uppercase (A-Z)', met: criteria.hasUpper },
    { key: 'hasLower', label: lang === 'ka' ? 'პატარა ასო (a-z)' : 'Lowercase (a-z)', met: criteria.hasLower },
    { key: 'hasNumberOrSymbol', label: lang === 'ka' ? 'ციფრი / სიმბოლო' : 'Number / Symbol', met: criteria.hasNumberOrSymbol },
  ];

  return (
    <div className="mt-2.5 space-y-2 animate-fadeIn">
      {/* Strength meter bar */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="opacity-60">
          {lang === 'ka' ? 'პაროლის სიმძლავრე:' : 'Password strength:'}
        </span>
        <span className={`font-semibold tracking-wide ${meta.textClass}`}>
          {meta.label}
          {meta.score === 4 && (
            <span className="ml-1 opacity-75 font-normal text-[10px]">
              {lang === 'ka' ? '✓ დაცულია' : '✓ Secure'}
            </span>
          )}
        </span>
      </div>

      {/* 4 segments */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => {
          const isActive = meta.score >= step;
          return (
            <div
              key={step}
              className={`h-full rounded-full transition-all duration-300 ${
                isActive
                  ? meta.colorClass
                  : darkMode
                  ? 'bg-stone-800'
                  : 'bg-stone-200'
              }`}
            />
          );
        })}
      </div>

      {/* Criteria checklist */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
        {rules.map((rule) => (
          <div
            key={rule.key}
            className={`flex items-center gap-1.5 text-[11px] transition-colors duration-200 ${
              rule.met
                ? 'text-emerald-400 font-medium'
                : 'opacity-50 text-stone-400'
            }`}
          >
            {rule.met ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-stone-500 shrink-0 mx-[3px]" />
            )}
            <span className="truncate">{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

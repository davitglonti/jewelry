// tests/components/PasswordStrengthIndicator.test.jsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PasswordStrengthIndicator from '../../src/components/auth/PasswordStrengthIndicator';

describe('PasswordStrengthIndicator component', () => {
  it('renders helpful guide when password is empty', () => {
    render(<PasswordStrengthIndicator password="" lang="ka" darkMode={true} />);
    expect(screen.getByText(/გამოიყენეთ მინ. 8 სიმბოლო/i)).toBeInTheDocument();
  });

  it('renders weak status when simple password like asdfgh is entered', () => {
    render(<PasswordStrengthIndicator password="asdfgh" lang="ka" darkMode={true} />);
    expect(screen.getByText('სუსტი')).toBeInTheDocument();
  });

  it('renders strong status and secure badge for a strong password', () => {
    render(<PasswordStrengthIndicator password="Matare#2026" lang="ka" darkMode={true} />);
    expect(screen.getByText('ძლიერი')).toBeInTheDocument();
    expect(screen.getByText(/✓ დაცულია/i)).toBeInTheDocument();
  });

  it('works in English mode', () => {
    render(<PasswordStrengthIndicator password="asdfgh" lang="en" darkMode={true} />);
    expect(screen.getByText('Weak')).toBeInTheDocument();
  });
});

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../../src/pages/LoginPage';
import RegisterPage from '../../src/pages/RegisterPage';
import ProfilePage from '../../src/pages/ProfilePage';
import AdminLoginView from '../../src/components/admin/AdminLoginView';
import { StoreContext } from '../../src/context/StoreContext';
import { AuthContext, getAuthErrorMessage } from '../../src/context/AuthContext';
import * as navigationModule from '../../src/utils/navigation';

describe('Google Authentication & Error Handling', () => {
  describe('getAuthErrorMessage for Google OAuth codes', () => {
    it('returns Georgian and English messages for popup closed by user', () => {
      const err = { code: 'auth/popup-closed-by-user' };
      expect(getAuthErrorMessage(err, 'ka')).toContain('ავტორიზაციის ფანჯარა დაიხურა');
      expect(getAuthErrorMessage(err, 'en')).toContain('popup was closed');
    });

    it('returns Georgian and English messages for popup blocked by browser', () => {
      const err = { code: 'auth/popup-blocked' };
      expect(getAuthErrorMessage(err, 'ka')).toContain('ბრაუზერმა დაბლოკა');
      expect(getAuthErrorMessage(err, 'en')).toContain('blocked');
    });

    it('returns Georgian and English messages for cancelled popup request', () => {
      const err = { code: 'auth/cancelled-popup-request' };
      expect(getAuthErrorMessage(err, 'ka')).toContain('გაუქმდა');
      expect(getAuthErrorMessage(err, 'en')).toContain('cancelled');
    });

    it('returns Georgian and English messages for account exists with different credential', () => {
      const err = { code: 'auth/account-exists-with-different-credential' };
      expect(getAuthErrorMessage(err, 'ka')).toContain('სხვა ავტორიზაციის მეთოდით');
      expect(getAuthErrorMessage(err, 'en')).toContain('different sign-in method');
    });

    it('returns Georgian and English messages for operation-not-allowed', () => {
      const err = { code: 'auth/operation-not-allowed' };
      expect(getAuthErrorMessage(err, 'ka')).toContain('Firebase Console');
      expect(getAuthErrorMessage(err, 'en')).toContain('Firebase Console');
    });
  });

  describe('LoginPage with Google Authentication', () => {
    const mockStore = {
      darkMode: true,
      setDarkMode: vi.fn(),
      lang: 'ka',
      setLang: vi.fn(),
      siteSettings: {},
      favorites: [],
      setShowFavoritesModal: vi.fn()
    };

    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(navigationModule, 'navigateTo').mockImplementation(() => {});
    });

    it('renders Google sign-in button in Georgian and English', () => {
      const mockAuth = {
        login: vi.fn(),
        loginWithGoogle: vi.fn().mockResolvedValue({ uid: 'g-123' }),
        resetPassword: vi.fn(),
        verifyResetCode: vi.fn(),
        confirmReset: vi.fn(),
        user: null
      };

      const { rerender } = render(
        <AuthContext.Provider value={mockAuth}>
          <StoreContext.Provider value={mockStore}>
            <LoginPage initialMode="login" />
          </StoreContext.Provider>
        </AuthContext.Provider>
      );

      expect(screen.getByRole('button', { name: /Google-ით შესვლა/i })).toBeDefined();

      rerender(
        <AuthContext.Provider value={mockAuth}>
          <StoreContext.Provider value={{ ...mockStore, lang: 'en' }}>
            <LoginPage initialMode="login" />
          </StoreContext.Provider>
        </AuthContext.Provider>
      );

      expect(screen.getByRole('button', { name: /Sign in with Google/i })).toBeDefined();
    });

    it('triggers loginWithGoogle and navigates on successful click', async () => {
      const mockLoginWithGoogle = vi.fn().mockResolvedValue({ uid: 'g-123' });
      const mockAuth = {
        login: vi.fn(),
        loginWithGoogle: mockLoginWithGoogle,
        resetPassword: vi.fn(),
        verifyResetCode: vi.fn(),
        confirmReset: vi.fn(),
        user: null
      };

      render(
        <AuthContext.Provider value={mockAuth}>
          <StoreContext.Provider value={mockStore}>
            <LoginPage initialMode="login" />
          </StoreContext.Provider>
        </AuthContext.Provider>
      );

      const googleBtn = screen.getByRole('button', { name: /Google-ით შესვლა/i });
      fireEvent.click(googleBtn);

      await waitFor(() => {
        expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
        expect(navigationModule.navigateTo).toHaveBeenCalledWith('/');
      });
    });

    it('displays error message when loginWithGoogle fails', async () => {
      const mockLoginWithGoogle = vi.fn().mockRejectedValue({ code: 'auth/popup-closed-by-user' });
      const mockAuth = {
        login: vi.fn(),
        loginWithGoogle: mockLoginWithGoogle,
        resetPassword: vi.fn(),
        verifyResetCode: vi.fn(),
        confirmReset: vi.fn(),
        user: null
      };

      render(
        <AuthContext.Provider value={mockAuth}>
          <StoreContext.Provider value={mockStore}>
            <LoginPage initialMode="login" />
          </StoreContext.Provider>
        </AuthContext.Provider>
      );

      const googleBtn = screen.getByRole('button', { name: /Google-ით შესვლა/i });
      fireEvent.click(googleBtn);

      await waitFor(() => {
        expect(screen.getByText(/ავტორიზაციის ფანჯარა დაიხურა/i)).toBeDefined();
      });
    });
  });

  describe('RegisterPage with Google Authentication', () => {
    const mockStore = {
      darkMode: true,
      setDarkMode: vi.fn(),
      lang: 'ka',
      setLang: vi.fn(),
      siteSettings: {},
      favorites: [],
      setShowFavoritesModal: vi.fn()
    };

    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(navigationModule, 'navigateTo').mockImplementation(() => {});
    });

    it('renders Google sign-up button in Georgian and English', () => {
      const mockAuth = {
        register: vi.fn(),
        registerWithGoogle: vi.fn().mockResolvedValue({ uid: 'g-456' }),
        user: null
      };

      const { rerender } = render(
        <AuthContext.Provider value={mockAuth}>
          <StoreContext.Provider value={mockStore}>
            <RegisterPage />
          </StoreContext.Provider>
        </AuthContext.Provider>
      );

      expect(screen.getByRole('button', { name: /Google-ით რეგისტრაცია/i })).toBeDefined();

      rerender(
        <AuthContext.Provider value={mockAuth}>
          <StoreContext.Provider value={{ ...mockStore, lang: 'en' }}>
            <RegisterPage />
          </StoreContext.Provider>
        </AuthContext.Provider>
      );

      expect(screen.getByRole('button', { name: /Sign up with Google/i })).toBeDefined();
    });

    it('triggers registerWithGoogle and navigates on click', async () => {
      const mockRegisterWithGoogle = vi.fn().mockResolvedValue({ uid: 'g-456' });
      const mockAuth = {
        register: vi.fn(),
        registerWithGoogle: mockRegisterWithGoogle,
        user: null
      };

      render(
        <AuthContext.Provider value={mockAuth}>
          <StoreContext.Provider value={mockStore}>
            <RegisterPage />
          </StoreContext.Provider>
        </AuthContext.Provider>
      );

      const googleBtn = screen.getByRole('button', { name: /Google-ით რეგისტრაცია/i });
      fireEvent.click(googleBtn);

      await waitFor(() => {
        expect(mockRegisterWithGoogle).toHaveBeenCalledTimes(1);
        expect(navigationModule.navigateTo).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('AdminLoginView with Google Authentication', () => {
    it('renders Google sign-in button for admin authentication', () => {
      render(
        <AdminLoginView
          darkMode={true}
          auth={{}}
          signInWithEmailAndPassword={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /Google-ით ავტორიზაცია/i })).toBeDefined();
    });
  });

  describe('ProfilePage & Client Suite Navigation', () => {
    const mockStore = {
      darkMode: true,
      setDarkMode: vi.fn(),
      lang: 'ka',
      setLang: vi.fn(),
      siteSettings: {},
      favorites: ['aur-101'],
      inquiries: [],
      products: []
    };

    const mockAuth = {
      user: { email: 'client@example.com', displayName: 'David Client', providerData: [{ providerId: 'google.com' }] },
      userRole: 'member',
      loading: false,
      updateUserProfile: vi.fn(),
      changePassword: vi.fn(),
      logout: vi.fn()
    };

    it('renders quiet luxury client suite header and tabs', () => {
      render(
        <AuthContext.Provider value={mockAuth}>
          <StoreContext.Provider value={mockStore}>
            <ProfilePage />
          </StoreContext.Provider>
        </AuthContext.Provider>
      );

      expect(screen.getAllByText('David Client').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/client@example\.com/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('button', { name: /პირადი პროფილი/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /ჩემი შეკვეთები/i })).toBeDefined();
    });

    it('switches tabs and updates history state on tab click', () => {
      const pushSpy = vi.spyOn(window.history, 'pushState');

      render(
        <AuthContext.Provider value={mockAuth}>
          <StoreContext.Provider value={mockStore}>
            <ProfilePage />
          </StoreContext.Provider>
        </AuthContext.Provider>
      );

      const ordersBtn = screen.getByRole('button', { name: /ჩემი შეკვეთები/i });
      fireEvent.click(ordersBtn);

      expect(pushSpy).toHaveBeenCalledWith(
        { tab: 'orders' },
        '',
        expect.stringContaining('tab=orders')
      );
    });
  });
});

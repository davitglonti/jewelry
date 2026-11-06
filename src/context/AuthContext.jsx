// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLazyAuth } from '../lib/firebase';
import { isStrongPassword, getPasswordValidationMessage } from '../utils/passwordValidation';

const AuthContext = createContext(null);

export const getAuthErrorMessage = (error, lang = 'ka', action = 'login') => {
  const code = error?.code || (typeof error === 'string' ? error : '');
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      if (action === 'change-password') {
        return lang === 'ka'
          ? 'მიმდინარე (ძველი) პაროლი არასწორია.'
          : 'Current password is incorrect.';
      }
      return lang === 'ka'
        ? 'ელფოსტა ან პაროლი არასწორია.'
        : 'Invalid email or password.';
    case 'auth/missing-current-password':
      return lang === 'ka'
        ? 'გთხოვთ შეიყვანოთ მიმდინარე (ძველი) პაროლი.'
        : 'Please enter your current password.';
    case 'auth/user-not-found':
      return action === 'reset'
        ? (lang === 'ka' ? 'ამ ელფოსტით დარეგისტრირებული მომხმარებელი ვერ მოიძებნა.' : 'No user found with this email address.')
        : (lang === 'ka' ? 'ელფოსტა ან პაროლი არასწორია.' : 'Invalid email or password.');
    case 'auth/missing-email':
      return lang === 'ka'
        ? 'გთხოვთ მიუთითოთ ელფოსტის მისამართი.'
        : 'Please enter your email address.';
    case 'auth/email-already-in-use':
      return lang === 'ka'
        ? 'ეს ელფოსტა უკვე დარეგისტრირებულია სისტემაში.'
        : 'This email is already registered.';
    case 'auth/weak-password':
      if (error?.message && !error.message.startsWith('auth/')) {
        return error.message;
      }
      return lang === 'ka'
        ? 'პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს, დიდ და პატარა ასოებს, და ციფრს ან სიმბოლოს.'
        : 'Password must contain at least 8 characters, uppercase and lowercase letters, and a number or symbol.';
    case 'auth/invalid-email':
      return lang === 'ka'
        ? 'გთხოვთ მიუთითოთ სწორი ელფოსტის ფორმატი (მაგ: mail@example.com).'
        : 'Please provide a valid email address.';
    case 'auth/too-many-requests':
      return lang === 'ka'
        ? 'უსაფრთხოების მიზნით წვდომა დროებით შეზღუდულია. სცადეთ მოგვიანებით.'
        : 'Access temporarily disabled due to multiple failed attempts. Try again later.';
    case 'auth/network-request-failed':
      return lang === 'ka'
        ? 'ინტერნეტთან კავშირი შეფერხებულია. შეამოწმეთ ქსელი.'
        : 'Network connection failed. Please check your internet.';
    case 'auth/user-disabled':
      return lang === 'ka'
        ? 'ეს ანგარიში დეაქტივირებულია ადმინისტრაციის მიერ.'
        : 'This account has been disabled by an administrator.';
    case 'auth/expired-action-code':
      return lang === 'ka'
        ? 'პაროლის აღდგენის ბმულის ვადა ამოიწურა. გთხოვთ მოითხოვოთ ახალი ბმული.'
        : 'The password reset link has expired. Please request a new one.';
    case 'auth/invalid-action-code':
      return lang === 'ka'
        ? 'პაროლის აღდგენის ბმული არასწორია ან უკვე გამოყენებულია.'
        : 'The reset link is invalid or has already been used.';
    case 'auth/requires-recent-login':
      return lang === 'ka'
        ? 'უსაფრთხოების მიზნით, პაროლის შესაცვლელად გთხოვთ ხელახლა გაიაროთ ავტორიზაცია.'
        : 'This operation is sensitive and requires recent authentication. Please log in again.';
    default:
      return error?.message || (lang === 'ka' ? 'დაფიქსირდა შეცდომა. სცადეთ ხელახლა.' : 'An error occurred. Please try again.');
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('guest'); // 'guest' | 'member' | 'moderator' | 'admin' | 'superadmin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = null;
    let idleId = null;
    let timerId = null;
    let isCancelled = false;

    const initAuthListener = async () => {
      try {
        const auth = await getLazyAuth();
        if (!auth || isCancelled) {
          if (!isCancelled) setLoading(false);
          return;
        }

        const { onAuthStateChanged } = await import('firebase/auth');
        if (isCancelled) return;

        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (isCancelled) return;
          setUser(currentUser);

          if (!currentUser) {
            setUserRole('guest');
            setLoading(false);
            return;
          }

          // როლის განსაზღვრა (Super Admin / Admin / Moderator / Member)
          try {
            const { checkUserIsAdmin } = await import('../lib/adminAuth');
            const { db } = await import('../lib/firebase');
            const check = await checkUserIsAdmin(currentUser, db);
            if (!isCancelled) {
              if (check.isSuperAdmin) setUserRole('superadmin');
              else if (check.role === 'moderator') setUserRole('moderator');
              else if (check.isAdmin) setUserRole('admin');
              else setUserRole('member');
            }
          } catch (e) {
            if (!isCancelled) setUserRole('member');
          }

          if (!isCancelled) setLoading(false);
        });
      } catch (err) {
        console.warn('Firebase Auth defer init error:', err);
        if (!isCancelled) setLoading(false);
      }
    };

    // Defer auth initialization using requestIdleCallback with ~800ms fallback
    // to avoid blocking First Paint, LCP, and initial product browsing
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(
        () => {
          initAuthListener();
        },
        { timeout: 1500 }
      );
    } else {
      timerId = setTimeout(initAuthListener, 800);
    }

    return () => {
      isCancelled = true;
      if (idleId && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timerId) {
        clearTimeout(timerId);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const register = async (email, password, displayName = '') => {
    if (!isStrongPassword(password)) {
      const msg = getPasswordValidationMessage(password, 'ka');
      const err = new Error(msg || 'auth/weak-password');
      err.code = 'auth/weak-password';
      throw err;
    }
    const auth = await getLazyAuth();
    if (!auth) throw new Error('Firebase Auth არ არის ინიციალიზებული');
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && displayName.trim()) {
      await updateProfile(userCredential.user, {
        displayName: displayName.trim()
      });
      setUser({ ...userCredential.user, displayName: displayName.trim() });
    } else {
      setUser(userCredential.user);
    }
    return userCredential.user;
  };

  const login = async (email, password) => {
    const auth = await getLazyAuth();
    if (!auth) throw new Error('Firebase Auth არ არის ინიციალიზებული');
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    setUser(userCredential.user);
    return userCredential.user;
  };

  const logout = async () => {
    const auth = await getLazyAuth();
    if (!auth) return;
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    setUser(null);
  };

  const resetPassword = async (email) => {
    if (!email || !email.trim()) {
      const err = new Error('auth/missing-email');
      err.code = 'auth/missing-email';
      throw err;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    const res = await fetch('/api/send-reset-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), origin }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.error || 'შეცდომა ბმულის გაგზავნისას');
      err.code = data.code || 'custom/reset-error';
      throw err;
    }

    return data;
  };

  const verifyResetCode = async (actionCode) => {
    const auth = await getLazyAuth();
    if (!auth) throw new Error('Firebase Auth არ არის ინიციალიზებული');
    const { verifyPasswordResetCode: fbVerifyPasswordResetCode } = await import('firebase/auth');
    return await fbVerifyPasswordResetCode(auth, actionCode);
  };

  const confirmReset = async (actionCode, newPassword) => {
    const auth = await getLazyAuth();
    if (!auth) throw new Error('Firebase Auth არ არის ინიციალიზებული');
    if (!isStrongPassword(newPassword)) {
      const msg = getPasswordValidationMessage(newPassword, 'ka');
      const err = new Error(msg || 'auth/weak-password');
      err.code = 'auth/weak-password';
      throw err;
    }
    const { confirmPasswordReset: fbConfirmPasswordReset } = await import('firebase/auth');
    await fbConfirmPasswordReset(auth, actionCode, newPassword);
  };

  const updateUserProfile = async ({ displayName, photoURL }) => {
    const auth = await getLazyAuth();
    if (!auth || !auth.currentUser) throw new Error('ავტორიზაცია არ მოიძებნა');
    const { updateProfile } = await import('firebase/auth');
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName.trim();
    if (photoURL !== undefined) updates.photoURL = photoURL;

    await updateProfile(auth.currentUser, updates);
    setUser({ ...auth.currentUser, ...updates });
  };

  const changePassword = async (newPassword, currentPassword = '') => {
    const auth = await getLazyAuth();
    if (!auth || !auth.currentUser) throw new Error('ავტორიზაცია არ მოიძებნა');
    if (!currentPassword || !currentPassword.trim()) {
      const err = new Error('auth/missing-current-password');
      err.code = 'auth/missing-current-password';
      throw err;
    }
    if (!isStrongPassword(newPassword)) {
      const msg = getPasswordValidationMessage(newPassword, 'ka');
      const err = new Error(msg || 'auth/weak-password');
      err.code = 'auth/weak-password';
      throw err;
    }
    const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword.trim());
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  };

  const value = {
    user,
    userRole,
    loading,
    register,
    login,
    logout,
    updateUserProfile,
    changePassword,
    resetPassword,
    verifyResetCode,
    confirmReset,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      userRole: 'guest',
      loading: false,
      isAuthenticated: false,
      register: async () => {},
      login: async () => {},
      logout: async () => {},
      updateUserProfile: async () => {},
      changePassword: async () => {},
      resetPassword: async () => {},
      verifyResetCode: async () => {},
      confirmReset: async () => {},
    };
  }
  return context;
};

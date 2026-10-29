// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext(null);

export const getAuthErrorMessage = (error, lang = 'ka') => {
  const code = error?.code || (typeof error === 'string' ? error : '');
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return lang === 'ka'
        ? 'ელფოსტა ან პაროლი არასწორია.'
        : 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return lang === 'ka'
        ? 'ეს ელფოსტა უკვე დარეგისტრირებულია სისტემაში.'
        : 'This email is already registered.';
    case 'auth/weak-password':
      return lang === 'ka'
        ? 'პაროლი ძალიან სუსტია. შეიყვანეთ მინიმუმ 6 სიმბოლო.'
        : 'Password is too weak. Please use at least 6 characters.';
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
    default:
      return error?.message || (lang === 'ka' ? 'დაფიქსირდა შეცდომა. სცადეთ ხელახლა.' : 'An error occurred. Please try again.');
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email, password, displayName = '') => {
    if (!auth) throw new Error('Firebase Auth არ არის ინიციალიზებული');
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && displayName.trim()) {
      await updateProfile(userCredential.user, {
        displayName: displayName.trim()
      });
      // განვაახლოთ ლოკალური state
      setUser({ ...userCredential.user, displayName: displayName.trim() });
    }
    return userCredential.user;
  };

  const login = async (email, password) => {
    if (!auth) throw new Error('Firebase Auth არ არის ინიციალიზებული');
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
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
    throw new Error('useAuth უნდა გამოიძახოთ AuthProvider-ის შიგნით');
  }
  return context;
};

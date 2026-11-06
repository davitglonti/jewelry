// src/components/admin/AdminLoginView.jsx
import React, { useState } from 'react';
import {
  Lock, AlertCircle, ShieldAlert, KeyRound, CheckCircle2,
  ArrowLeft, Send, Eye, EyeOff
} from 'lucide-react';
import { checkUserIsAdmin } from '../../lib/adminAuth';
import { db } from '../../lib/firebase';
import { getAuthErrorMessage } from '../../context/AuthContext';

export default function AdminLoginView({ darkMode = true, auth, signInWithEmailAndPassword }) {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'

  // Login states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Password reset states
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!auth) {
      setLoginError('Firebase Auth არ არის აქტიური!');
      return;
    }

    setLoginLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        adminEmail.trim(),
        adminPassword.trim()
      );

      // გადავამოწმოთ, ნამდვილად აქვს თუ არა ამ მომხმარებელს ადმინისტრატორის ან მოდერატორის უფლებები
      const adminCheck = await checkUserIsAdmin(userCred.user, db);
      if (!adminCheck.isAdmin) {
        // თუ ჩვეულებრივი მომხმარებელია, დაუყოვნებლივ გამოვლოგოთ
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        setLoginError(`წვდომა შეზღუდულია: ანგარიშს (${userCred.user.email}) არ გააჩნია ადმინისტრატორის ან მოდერატორის უფლებები!`);
        setLoginLoading(false);
        return;
      }

      setLoginError('');
    } catch (err) {
      console.error('Firebase Login Error:', err.code, err.message);
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setLoginError('არასწორი ელ-ფოსტა ან პაროლი!');
      } else if (err.code === 'auth/invalid-email') {
        setLoginError('ელ-ფოსტის ფორმატი არასწორია!');
      } else {
        setLoginError(`შეცდომა: ${err.code || err.message}`);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);

    const targetEmail = resetEmail.trim() || adminEmail.trim();

    if (!targetEmail) {
      setResetError('გთხოვთ მიუთითოთ ელფოსტის მისამართი');
      return;
    }

    setResetLoading(true);

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch('/api/send-reset-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, origin }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.code === 'auth/user-not-found') {
          throw new Error('ამ ელფოსტით დარეგისტრირებული ადმინისტრატორი ვერ მოიძებნა.');
        }
        throw new Error(data.error || 'შეცდომა ბმულის გაგზავნისას');
      }

      setResetSuccess(true);
    } catch (err) {
      console.error('Admin password reset error:', err);
      setResetError(getAuthErrorMessage(err, 'ka', 'reset'));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className={`p-8 sm:p-10 max-w-md mx-auto mt-14 sm:mt-16 rounded-3xl border text-center space-y-6 shadow-2xl transition-all ${
        darkMode ? 'bg-[#121110] border-stone-800' : 'bg-white border-stone-200 shadow-stone-300/40'
      }`}
    >
      {mode === 'login' ? (
        <>
          <div className="w-14 h-14 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-medium tracking-wide">ადმინისტრატორის ავტორიზაცია</h3>
            <p className="text-xs opacity-65">შეიყვანეთ ადმინისტრატორის ელ-ფოსტა და პაროლი</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5 text-left">
            <div>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="ადმინის ელფოსტა"
                required
                disabled={loginLoading}
                className={`w-full px-4 py-3 rounded-xl text-xs border outline-none transition-all ${
                  darkMode
                    ? 'bg-stone-900 border-stone-700 text-white focus:border-amber-500'
                    : 'bg-stone-100 border-stone-300 text-stone-900 focus:border-amber-600'
                }`}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="პაროლი..."
                required
                disabled={loginLoading}
                className={`w-full pl-4 pr-11 py-3 rounded-xl text-xs border outline-none transition-all ${
                  darkMode
                    ? 'bg-stone-900 border-stone-700 text-white focus:border-amber-500'
                    : 'bg-stone-100 border-stone-300 text-stone-900 focus:border-amber-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setResetEmail(adminEmail);
                  setLoginError('');
                  setResetError('');
                  setResetSuccess(false);
                }}
                className="text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors"
              >
                დაგავიწყდათ პაროლი?
              </button>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2.5 text-left animate-fadeIn">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 mt-1"
            >
              {loginLoading ? 'მოწმდება...' : 'შესვლა'}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30 shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-medium tracking-wide">პაროლის აღდგენა</h3>
            <p className="text-xs opacity-65 leading-relaxed">
              შეიყვანეთ ადმინისტრატორის ან მოდერატორის ელ-ფოსტა და გამოგიგზავნით პაროლის განახლების ბმულს.
            </p>
          </div>

          {resetSuccess ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs text-left flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold mb-1">ბმული წარმატებით გაიგზავნა!</p>
                  <p className="opacity-90">
                    პაროლის აღდგენის ბმული გაეგზავნა <strong>{resetEmail || adminEmail}</strong>-ს. გთხოვთ შეამოწმოთ თქვენი ელ-ფოსტის შემოსული წერილები (Inbox ან Spam).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setResetSuccess(false);
                }}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider transition-all"
              >
                ავტორიზაციაზე დაბრუნება
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-3.5 text-left">
              <div>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="თქვენი ელფოსტა (მაგ: admin@matare.store)"
                  required
                  disabled={resetLoading}
                  className={`w-full px-4 py-3 rounded-xl text-xs border outline-none transition-all ${
                    darkMode
                      ? 'bg-stone-900 border-stone-700 text-white focus:border-amber-500'
                      : 'bg-stone-100 border-stone-300 text-stone-900 focus:border-amber-600'
                  }`}
                />
              </div>

              {resetError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2 text-left animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{resetError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {resetLoading ? (
                  <span>იგზავნება...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>აღდგენის ბმულის გაგზავნა</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setResetError('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>ავტორიზაციაზე დაბრუნება</span>
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth, getAuthErrorMessage } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function RegisterPage() {
  const { register } = useAuth();
  const { darkMode, setDarkMode, lang, setLang, siteSettings, favorites, setShowFavoritesModal } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const redirectTarget = params.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage(lang === 'ka' ? 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი' : 'Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        lang === 'ka'
          ? 'პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან'
          : 'Password must be at least 6 characters long'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        lang === 'ka'
          ? 'პაროლები არ ემთხვევა ერთმანეთს'
          : 'Passwords do not match'
      );
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
      window.location.href = redirectTarget;
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, lang));
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
      darkMode ? 'bg-[#0c0b0a] text-[#f5f0e6]' : 'bg-[#faf7f2] text-[#1c1917]'
    }`}>
      <Navbar
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        favorites={favorites}
        setShowFavoritesModal={setShowFavoritesModal}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 flex items-center justify-center px-4 py-28 sm:py-36">
        <div className={`w-full max-w-md p-6 sm:p-9 rounded-3xl border transition-all shadow-2xl ${
          darkMode ? 'bg-[#141210] border-stone-800 shadow-black/80' : 'bg-white border-stone-200 shadow-stone-300/40'
        }`}>
          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 mb-3 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide">
              {lang === 'ka' ? 'რეგისტრაცია' : 'Create Account'}
            </h1>
            <p className="text-xs sm:text-sm opacity-70 mt-1.5">
              {lang === 'ka'
                ? 'შემოუერთდით კოლექციონერებსა და ავტორებს'
                : 'Join our fine jewelry community'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold opacity-80 mb-1.5">
                {lang === 'ka' ? 'სახელი და გვარი' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'ka' ? 'თქვენი სახელი' : 'Your name'}
                  autoComplete="name"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all ${
                    darkMode
                      ? 'bg-stone-900/90 border-stone-700/80 text-white placeholder-stone-500 focus:border-amber-500'
                      : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold opacity-80 mb-1.5">
                {lang === 'ka' ? 'ელფოსტა' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all ${
                    darkMode
                      ? 'bg-stone-900/90 border-stone-700/80 text-white placeholder-stone-500 focus:border-amber-500'
                      : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold opacity-80 mb-1.5">
                {lang === 'ka' ? 'პაროლი (მინ. 6 სიმბოლო)' : 'Password (min. 6 chars)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm border outline-none transition-all ${
                    darkMode
                      ? 'bg-stone-900/90 border-stone-700/80 text-white placeholder-stone-500 focus:border-amber-500'
                      : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold opacity-80 mb-1.5">
                {lang === 'ka' ? 'გაიმეორეთ პაროლი' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all ${
                    darkMode
                      ? 'bg-stone-900/90 border-stone-700/80 text-white placeholder-stone-500 focus:border-amber-500'
                      : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{lang === 'ka' ? 'რეგისტრაცია' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-5 border-t border-stone-500/15 text-center text-xs opacity-80">
            <span>{lang === 'ka' ? 'უკვე გაქვთ ანგარიში? ' : 'Already have an account? '}</span>
            <a
              href={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
              className="text-amber-500 hover:text-amber-400 font-semibold underline underline-offset-4 ml-1 transition-colors"
            >
              {lang === 'ka' ? 'გაიარეთ ავტორიზაცია' : 'Sign In'}
            </a>
          </div>

          {/* Back to store */}
          <div className="mt-4 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 hover:text-amber-500 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === 'ka' ? 'საიტზე დაბრუნება' : 'Back to Store'}</span>
            </a>
          </div>
        </div>
      </main>

      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />
    </div>
  );
}

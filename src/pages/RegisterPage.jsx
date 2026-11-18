// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth, getAuthErrorMessage } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { navigateTo } from '../utils/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import { isStrongPassword, getPasswordValidationMessage } from '../utils/passwordValidation';

export default function RegisterPage() {
  const { register, registerWithGoogle } = useAuth();
  const { darkMode, setDarkMode, lang, setLang, siteSettings, favorites, setShowFavoritesModal } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const redirectTarget = params.get('redirect') || '/';

  const handleGoogleRegister = async () => {
    setErrorMessage('');
    setGoogleLoading(true);
    try {
      await registerWithGoogle();
      navigateTo(redirectTarget);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, lang, 'register'));
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage(lang === 'ka' ? 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი' : 'Please fill in all required fields');
      return;
    }

    if (!isStrongPassword(password)) {
      setErrorMessage(
        getPasswordValidationMessage(password, lang) ||
        (lang === 'ka'
          ? 'პაროლი უნდა შედგებოდეს მინიმუმ 8 სიმბოლოსგან და შეიცავდეს დიდ ასოს, პატარა ასოს და ციფრს ან სიმბოლოს.'
          : 'Password must be at least 8 characters and contain uppercase, lowercase letters, and a number or symbol.')
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(lang === 'ka' ? 'პაროლები არ ემთხვევა ერთმანეთს' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
      navigateTo(redirectTarget);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, lang));
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 text-sm bg-white border border-[#DCD6CC] focus:border-[#141311] text-[#141311] placeholder-[#9C958B] outline-none transition-colors';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF9F6] text-[#141311]">
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

      <main className="flex-1 flex items-center justify-center px-4 pt-[108px] pb-24">
        <div className="w-full max-w-md p-8 sm:p-10 bg-white border border-[#E8E3DB]">
          <div className="text-center mb-8 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.26em] text-[#9D7B48] font-medium block">
              {siteSettings?.brandName || 'MATARE'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#141311]">
              {lang === 'ka' ? 'რეგისტრაცია' : 'Create Account'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5C574F] font-light">
              {lang === 'ka'
                ? 'შემოუერთდით კოლექციონერებსა და ავტორებს'
                : 'Join our fine jewelry community'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-[#FDF6F6] border border-[#E8C8C8] text-[#8E2424] text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading || googleLoading}
            className="w-full py-3 px-4 border border-[#DCD6CC] bg-white hover:border-[#141311] text-[#141311] flex items-center justify-center gap-3 text-xs tracking-[0.12em] uppercase font-medium transition-colors disabled:opacity-50 mb-5 cursor-pointer"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-[1.5px] border-[#141311] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.36 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.43l4.02-3.14z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.26 6.57l4.02 3.14c.95-2.83 3.6-4.96 6.72-4.96z" />
                </svg>
                <span>{lang === 'ka' ? 'Google-ით რეგისტრაცია' : 'Sign up with Google'}</span>
              </>
            )}
          </button>

          <div className="relative mb-6 flex items-center justify-center">
            <div className="border-t border-[#E8E3DB] w-full absolute" />
            <span className="relative px-3 text-[10px] uppercase tracking-[0.18em] bg-white text-[#847E75]">
              {lang === 'ka' ? 'ან ელფოსტით' : 'or with email'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#5C574F] font-medium mb-1.5">
                {lang === 'ka' ? 'სახელი და გვარი' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847E75] stroke-[1.5]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'ka' ? 'თქვენი სახელი' : 'Your name'}
                  autoComplete="name"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#5C574F] font-medium mb-1.5">
                {lang === 'ka' ? 'ელფოსტა' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847E75] stroke-[1.5]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#5C574F] font-medium mb-1.5">
                {lang === 'ka' ? 'პაროლი (მინ. 8 სიმბოლო)' : 'Password (min. 8 chars)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847E75] stroke-[1.5]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#847E75] hover:text-[#141311] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                </button>
              </div>
              <PasswordStrengthIndicator password={password} lang={lang} darkMode={false} />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#5C574F] font-medium mb-1.5">
                {lang === 'ka' ? 'გაიმეორეთ პაროლი' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847E75] stroke-[1.5]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#141311] hover:bg-[#2C2A26] text-white font-medium text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-[1.5px] border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 stroke-[1.5]" />
                  <span>{lang === 'ka' ? 'რეგისტრაცია' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-[#E8E3DB] text-center text-xs text-[#5C574F]">
            <span>{lang === 'ka' ? 'უკვე გაქვთ ანგარიში? ' : 'Already have an account? '}</span>
            <a
              href={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
              className="text-[#141311] hover:text-[#9D7B48] font-medium underline underline-offset-4 ml-1 transition-colors"
            >
              {lang === 'ka' ? 'გაიარეთ ავტორიზაცია' : 'Sign In'}
            </a>
          </div>

          <div className="mt-4 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#847E75] hover:text-[#141311] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{lang === 'ka' ? 'საიტზე დაბრუნება' : 'Back to Store'}</span>
            </a>
          </div>
        </div>
      </main>

      <Footer lang={lang} siteSettings={siteSettings} />
    </div>
  );
}

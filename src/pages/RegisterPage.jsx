// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, AlertCircle, ChevronDown } from 'lucide-react';
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

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    if (!fullName || !email.trim() || !password) {
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

    setLoading(true);
    try {
      await register(email, password, fullName);
      navigateTo(redirectTarget);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, lang));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F4F1EA] text-[#1F1C18]">
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

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-[100px] sm:pt-[115px] pb-16 sm:pb-20">
        {/* Top Brand Name - Exact Mockup Style */}
        <div className="text-center mb-6 sm:mb-8">
          <span className="font-serif text-2xl sm:text-3xl tracking-[0.22em] font-medium text-[#1F1C18] uppercase">
            {siteSettings?.brandName || (lang === 'ka' ? 'მატარე' : 'MATARE')}
          </span>
        </div>

        {/* Center Card */}
        <div className="w-full max-w-[420px] sm:max-w-[440px] bg-white rounded-3xl p-8 sm:p-10 shadow-[0_12px_45px_rgba(31,28,24,0.06)] border border-[#EAE4DB]">
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F1C18] text-center mb-7 sm:mb-8">
            {lang === 'ka' ? 'რეგისტრაცია' : 'Create Account'}
          </h1>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-[#FDF6F6] border border-[#E8C8C8] text-[#8E2424] text-xs flex items-start gap-2.5 rounded-xl animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-[#787168] font-normal">
                  {lang === 'ka' ? 'სახელი' : 'First Name'}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  placeholder=""
                  className="w-full pb-2 pt-1 text-sm bg-transparent border-b border-[#DCD6CC] focus:border-[#1F1C18] outline-none text-[#1F1C18] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#787168] font-normal">
                  {lang === 'ka' ? 'გვარი' : 'Last Name'}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  placeholder=""
                  className="w-full pb-2 pt-1 text-sm bg-transparent border-b border-[#DCD6CC] focus:border-[#1F1C18] outline-none text-[#1F1C18] transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Email Address */}
            <div className="space-y-1">
              <label className="block text-xs text-[#787168] font-normal">
                {lang === 'ka' ? 'ელფოსტა' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder=""
                className="w-full pb-2 pt-1 text-sm bg-transparent border-b border-[#DCD6CC] focus:border-[#1F1C18] outline-none text-[#1F1C18] transition-colors"
              />
            </div>

            {/* Row 3: Phone Number */}
            <div className="space-y-1">
              <label className="block text-xs text-[#787168] font-normal">
                {lang === 'ka' ? 'ტელეფონის ნომერი' : 'Phone Number'}
              </label>
              <div className="flex items-center border-b border-[#DCD6CC] focus-within:border-[#1F1C18] transition-colors">
                <div className="flex items-center gap-1 pr-2.5 pb-2 pt-1 text-xs font-medium text-[#1F1C18] select-none cursor-default">
                  <span>+995</span>
                  <ChevronDown className="w-3 h-3 text-[#787168]" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder=""
                  className="w-full pb-2 pt-1 text-sm bg-transparent outline-none text-[#1F1C18]"
                />
              </div>
            </div>

            {/* Row 4: Password */}
            <div className="space-y-1">
              <label className="block text-xs text-[#787168] font-normal">
                {lang === 'ka' ? 'პაროლი' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder=""
                  className="w-full pb-2 pt-1 pr-8 text-sm bg-transparent border-b border-[#DCD6CC] focus:border-[#1F1C18] outline-none text-[#1F1C18] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-0 top-1/2 -translate-y-1/2 pb-1 text-[#8C8275] hover:text-[#1F1C18] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                </button>
              </div>
              {password && <PasswordStrengthIndicator password={password} lang={lang} darkMode={false} />}
            </div>

            {/* Primary Action: CREATE ACCOUNT */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-full bg-[#1F1C18] hover:bg-black text-white font-medium text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-[1.5px] border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{lang === 'ka' ? 'რეგისტრაცია' : 'CREATE ACCOUNT'}</span>
                )}
              </button>
            </div>
          </form>

          {/* Google Sign Up */}
          <div className="mt-3">
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading || googleLoading}
              aria-label={lang === 'ka' ? 'Google-ით რეგისტრაცია' : 'Sign up with Google'}
              className="w-full py-3 px-4 rounded-full border border-[#DCD6CC] bg-white hover:bg-[#FAF8F5] text-[#1F1C18] flex items-center justify-center gap-3 text-xs tracking-[0.14em] font-medium transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-[1.5px] border-[#1F1C18] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.36 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.43l4.02-3.14z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.26 6.57l4.02 3.14c.95-2.83 3.6-4.96 6.72-4.96z" />
                  </svg>
                  <span>{lang === 'ka' ? 'Google-ით რეგისტრაცია' : 'Continue with Google'}</span>
                </>
              )}
            </button>
          </div>

          {/* Switch to Login Link */}
          <div className="mt-7 text-center text-xs text-[#787168]">
            <span>{lang === 'ka' ? 'უკვე გაქვთ ანგარიში?' : 'Already have an account?'}</span>
            <a
              href={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
              className="text-[#1F1C18] font-medium hover:underline ml-1.5"
            >
              {lang === 'ka' ? 'შესვლა' : 'Sign In'}
            </a>
          </div>

          {/* Back to store */}
          <div className="mt-4 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#8C8275] hover:text-[#1F1C18] transition-colors"
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

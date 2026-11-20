// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, AlertCircle, CheckCircle2, Send, ShieldCheck } from 'lucide-react';
import { useAuth, getAuthErrorMessage } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { navigateTo } from '../utils/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import { isStrongPassword, getPasswordValidationMessage } from '../utils/passwordValidation';

export default function LoginPage({ initialMode = 'login' }) {
  const { user, loading: authLoading, login, loginWithGoogle, resetPassword, verifyResetCode, confirmReset } = useAuth();
  const { darkMode, setDarkMode, lang, setLang, siteSettings, favorites, setShowFavoritesModal } = useStore();

  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const redirectTarget = params.get('redirect') || '/';
  const oobCode = params.get('oobCode');
  const actionParam = params.get('mode');

  useEffect(() => {
    if (!authLoading && user && !oobCode) {
      const prefix = lang === 'en' ? '/en' : '';
      const target = redirectTarget && redirectTarget !== '/' ? redirectTarget : `${prefix}/profile`;
      navigateTo(target);
    }
  }, [user, authLoading, oobCode, redirectTarget, lang]);

  const resolvedInitialMode = (oobCode || actionParam === 'resetPassword') ? 'new-password' : initialMode;
  const [mode, setMode] = useState(resolvedInitialMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(!!oobCode);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [codeValid, setCodeValid] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  useEffect(() => {
    if (oobCode) {
      setVerifyingCode(true);
      verifyResetCode(oobCode)
        .then((userEmail) => {
          setVerifiedEmail(userEmail);
          setCodeValid(true);
          setVerifyingCode(false);
        })
        .catch((err) => {
          setCodeValid(false);
          setErrorMessage(getAuthErrorMessage(err, lang, 'reset'));
          setVerifyingCode(false);
        });
    }
  }, [oobCode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage(lang === 'ka' ? 'გთხოვთ შეავსოთ ყველა ველი' : 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigateTo(redirectTarget);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, lang, 'login'));
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigateTo(redirectTarget);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, lang, 'login'));
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage(lang === 'ka' ? 'გთხოვთ მიუთითოთ თქვენი ელფოსტა' : 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setResetSuccess(true);
      setLoading(false);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, lang, 'reset'));
      setLoading(false);
    }
  };

  const handleConfirmNewPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isStrongPassword(newPassword)) {
      setErrorMessage(
        getPasswordValidationMessage(newPassword, lang) ||
        (lang === 'ka'
          ? 'ახალი პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს, დიდ და პატარა ასოებს, და ციფრს ან სიმბოლოს.'
          : 'Password must contain at least 8 characters, uppercase and lowercase letters, and a number or symbol.')
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage(lang === 'ka' ? 'პაროლები ერთმანეთს არ ემთხვევა' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await confirmReset(oobCode, newPassword);
      if (verifiedEmail) {
        try {
          await fetch('/api/activate-admin-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: verifiedEmail })
          });
        } catch (actErr) {
          console.warn('Admin activation check error:', actErr);
        }
      }
      setPasswordResetSuccess(true);
      setLoading(false);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, lang, 'reset'));
      setLoading(false);
    }
  };

  if (!authLoading && user && !oobCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
        <div className="w-7 h-7 rounded-full border-2 border-[#9A7742] border-t-transparent animate-spin" />
      </div>
    );
  }

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

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pt-[100px] sm:pt-[110px] pb-16 sm:pb-20">
        {mode === 'login' ? (
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_12px_45px_rgba(31,28,24,0.07)] border border-[#EAE4DB] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
            {/* Left Image Side (Mockup 1-to-1) */}
            <div className="md:col-span-5 relative hidden md:block min-h-[580px] bg-[#EAE4DB]">
              <img
                src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85"
                alt="Fine Jewelry Solitaire Diamond Ring"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
              <div className="absolute bottom-10 left-8 right-8 text-white space-y-2">
                <p className="font-serif text-2xl lg:text-[27px] font-normal leading-[1.3] text-white/95 drop-shadow-sm">
                  {lang === 'ka' ? (
                    <>
                      შედით რჩეულების,<br />
                      შედარებისა<br />
                      და VIP პრივილეგიებისთვის
                    </>
                  ) : (
                    <>
                      Sign in for Wishlist,<br />
                      Comparison<br />
                      & VIP Privileges
                    </>
                  )}
                </p>
                <p className="text-xs text-white/70 font-light">
                  {lang === 'ka' ? 'საიუველირო სახლი „მატარე“' : 'Fine Jewelry Collection'}
                </p>
              </div>
            </div>

            {/* Right Form Side */}
            <div className="md:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-white">
              <div className="text-center mb-8">
                <span className="font-serif text-2xl sm:text-3xl tracking-[0.22em] font-medium text-[#1F1C18] uppercase block">
                  {siteSettings?.brandName || (lang === 'ka' ? 'მატარე' : 'MATARE')}
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F1C18] mt-4">
                  {lang === 'ka' ? 'ავტორიზაცია' : 'Welcome Back'}
                </h1>
                <p className="text-xs text-[#787168] mt-1 font-light">
                  {lang === 'ka' ? 'შედით თქვენს ანგარიშზე' : 'Sign in to your account'}
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 bg-[#FDF6F6] border border-[#E8C8C8] text-[#8E2424] text-xs flex items-start gap-2.5 rounded-xl animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
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
                      autoComplete="current-password"
                      placeholder=""
                      className="w-full pb-2 pt-1 pr-8 text-sm bg-transparent border-b border-[#DCD6CC] focus:border-[#1F1C18] outline-none text-[#1F1C18] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-0 bottom-2 text-[#8A8278] hover:text-[#1F1C18] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-right pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setResetSuccess(false);
                        setMode('forgot');
                      }}
                      className="text-xs text-[#8A8278] hover:text-[#1F1C18] transition-colors cursor-pointer"
                    >
                      {lang === 'ka' ? 'დაგავიწყდათ პაროლი?' : 'Forgot password?'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-3.5 rounded-full bg-[#1F1C18] hover:bg-[#35302A] text-white text-xs tracking-wider uppercase font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    <span>{lang === 'ka' ? 'შესვლა' : 'SIGN IN'}</span>
                  )}
                </button>
              </form>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                  aria-label={lang === 'ka' ? 'Google-ით შესვლა' : 'Sign in with Google'}
                  className="w-full py-3 rounded-full border border-[#DCD6CC] bg-white hover:bg-[#FAF8F4] text-[#1F1C18] text-xs font-medium transition-all flex items-center justify-center gap-2.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {googleLoading ? (
                    <div className="w-4 h-4 border-2 border-[#1F1C18] border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.36 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.43l4.02-3.14z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.26 6.57l4.02 3.14c.95-2.83 3.6-4.96 6.72-4.96z" />
                      </svg>
                      <span>{lang === 'ka' ? 'Google-ით შესვლა' : 'Continue with Google'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-8 text-center text-xs text-[#787168]">
                <span>{lang === 'ka' ? 'არ გაქვთ ანგარიში?' : "Don't have an account?"}</span>
                <a
                  href={`/register?redirect=${encodeURIComponent(redirectTarget)}`}
                  className="font-semibold text-[#1F1C18] hover:underline cursor-pointer ml-1.5"
                >
                  {lang === 'ka' ? 'რეგისტრაცია' : 'Register'}
                </a>
              </div>
            </div>
          </div>
        ) : mode === 'forgot' ? (
          <div className="w-full max-w-md p-8 sm:p-10 bg-white rounded-3xl border border-[#EAE4DB] shadow-[0_10px_40px_rgba(31,28,24,0.06)]">
            <div className="text-center mb-8 space-y-2">
              <span className="font-serif text-2xl tracking-[0.22em] font-medium text-[#1F1C18] uppercase block">
                {siteSettings?.brandName || (lang === 'ka' ? 'მატარე' : 'MATARE')}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F1C18] mt-3">
                {lang === 'ka' ? 'პაროლის აღდგენა' : 'Reset Password'}
              </h1>
              <p className="text-xs text-[#787168]">
                {lang === 'ka'
                  ? 'შეიყვანეთ თქვენი ელფოსტა და გამოგიგზავნით აღდგენის ბმულს'
                  : 'Enter your email to receive a password reset link'}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 bg-[#FDF6F6] border border-[#E8C8C8] text-[#8E2424] text-xs flex items-start gap-2.5 rounded-xl animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {resetSuccess ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-4 bg-[#F4F8F5] border border-[#D4E2D9] text-[#2B5C40] text-xs sm:text-sm rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-medium mb-1">
                      {lang === 'ka' ? 'ბმული წარმატებით გაიგზავნა!' : 'Reset link sent successfully!'}
                    </p>
                    <p className="opacity-85">
                      {lang === 'ka'
                        ? `პაროლის აღდგენის ინსტრუქცია გაიგზავნა მისამართზე: ${email}. შეამოწმეთ Inbox და Spam.`
                        : `Instructions have been sent to ${email}. Please check your inbox and spam folder.`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResetSuccess(false);
                    setErrorMessage('');
                    setMode('login');
                  }}
                  className="w-full py-3.5 rounded-full bg-[#1F1C18] text-white text-xs tracking-wider uppercase font-semibold transition-all cursor-pointer"
                >
                  {lang === 'ka' ? 'ავტორიზაციაზე დაბრუნება' : 'Back to Sign In'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
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
                    className="w-full pb-2 pt-1 text-sm bg-transparent border-b border-[#DCD6CC] focus:border-[#1F1C18] outline-none text-[#1F1C18] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#1F1C18] hover:bg-[#35302A] text-white text-xs tracking-wider uppercase font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    <span>{lang === 'ka' ? 'ბმულის გაგზავნა' : 'Send Reset Link'}</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setMode('login');
                    }}
                    className="text-xs text-[#787168] hover:text-[#1F1C18] transition-colors cursor-pointer"
                  >
                    ← {lang === 'ka' ? 'უკან დაბრუნება' : 'Back to Sign In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="w-full max-w-md p-8 sm:p-10 bg-white rounded-3xl border border-[#EAE4DB] shadow-[0_10px_40px_rgba(31,28,24,0.06)]">
            <div className="text-center mb-8 space-y-2">
              <span className="font-serif text-2xl tracking-[0.22em] font-medium text-[#1F1C18] uppercase block">
                {siteSettings?.brandName || (lang === 'ka' ? 'მატარე' : 'MATARE')}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F1C18] mt-3">
                {lang === 'ka' ? 'ახალი პაროლი' : 'Set New Password'}
              </h1>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 bg-[#FDF6F6] border border-[#E8C8C8] text-[#8E2424] text-xs flex items-start gap-2.5 rounded-xl animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {passwordResetSuccess ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-4 bg-[#F4F8F5] border border-[#D4E2D9] text-[#2B5C40] text-xs sm:text-sm rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">
                      {lang === 'ka' ? 'პაროლი წარმატებით შეიცვალა!' : 'Password updated successfully!'}
                    </p>
                    <p className="opacity-85">
                      {lang === 'ka'
                        ? 'ახლა შეგიძლიათ გაიაროთ ავტორიზაცია ახალი პაროლით.'
                        : 'You can now sign in with your new password.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPasswordResetSuccess(false);
                    setMode('login');
                  }}
                  className="w-full py-3.5 rounded-full bg-[#1F1C18] text-white text-xs tracking-wider uppercase font-semibold transition-all cursor-pointer"
                >
                  {lang === 'ka' ? 'ავტორიზაცია' : 'Sign In'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmNewPassword} className="space-y-5">
                <div className="space-y-1">
                  <label className="block text-xs text-[#787168] font-normal">
                    {lang === 'ka' ? 'ახალი პაროლი' : 'New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full pb-2 pt-1 pr-8 text-sm bg-transparent border-b border-[#DCD6CC] focus:border-[#1F1C18] outline-none text-[#1F1C18] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label="Toggle password"
                      className="absolute right-0 bottom-2 text-[#8A8278] hover:text-[#1F1C18] cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword && <PasswordStrengthIndicator password={newPassword} lang={lang} />}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-[#787168] font-normal">
                    {lang === 'ka' ? 'გაიმეორეთ პაროლი' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pb-2 pt-1 pr-8 text-sm bg-transparent border-b border-[#DCD6CC] focus:border-[#1F1C18] outline-none text-[#1F1C18] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password"
                      className="absolute right-0 bottom-2 text-[#8A8278] hover:text-[#1F1C18] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#1F1C18] hover:bg-[#35302A] text-white text-xs tracking-wider uppercase font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    <span>{lang === 'ka' ? 'შენახვა' : 'Save New Password'}</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      <Footer lang={lang} siteSettings={siteSettings} />
    </div>
  );
}

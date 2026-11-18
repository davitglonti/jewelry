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
  const { login, loginWithGoogle, resetPassword, verifyResetCode, confirmReset } = useAuth();
  const { darkMode, setDarkMode, lang, setLang, siteSettings, favorites, setShowFavoritesModal } = useStore();

  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const redirectTarget = params.get('redirect') || '/';
  const oobCode = params.get('oobCode');
  const actionParam = params.get('mode');

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

      <main className="flex-1 flex items-center justify-center px-4 pt-[140px] pb-24">
        <div className="w-full max-w-md p-8 sm:p-10 bg-white border border-[#E8E3DB]">
          {mode === 'login' ? (
            <>
              <div className="text-center mb-8 space-y-2">
                <span className="text-[10px] uppercase tracking-[0.26em] text-[#9D7B48] font-medium block">
                  {siteSettings?.brandName || 'MATARE'}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#141311]">
                  {lang === 'ka' ? 'ავტორიზაცია' : 'Sign In'}
                </h1>
                <p className="text-xs sm:text-sm text-[#5C574F] font-light">
                  {lang === 'ka'
                    ? 'შედით თქვენს ანგარიშზე რჩეულების, შედარებისა და VIP ფასდაკლებისთვის'
                    : 'Sign in to access favorites, comparison & VIP perks'}
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
                onClick={handleGoogleLogin}
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
                    <span>{lang === 'ka' ? 'Google-ით შესვლა' : 'Sign in with Google'}</span>
                  </>
                )}
              </button>

              <div className="relative mb-6 flex items-center justify-center">
                <div className="border-t border-[#E8E3DB] w-full absolute" />
                <span className="relative px-3 text-[10px] uppercase tracking-[0.18em] bg-white text-[#847E75]">
                  {lang === 'ka' ? 'ან ელფოსტით' : 'or with email'}
                </span>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] uppercase tracking-[0.16em] text-[#5C574F] font-medium">
                      {lang === 'ka' ? 'პაროლი' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setResetSuccess(false);
                        setMode('forgot');
                      }}
                      className="text-[11px] text-[#9D7B48] hover:text-[#141311] transition-colors cursor-pointer"
                    >
                      {lang === 'ka' ? 'დაგავიწყდათ პაროლი?' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847E75] stroke-[1.5]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
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
                      <LogIn className="w-4 h-4 stroke-[1.5]" />
                      <span>{lang === 'ka' ? 'შესვლა' : 'Sign In'}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 pt-5 border-t border-[#E8E3DB] text-center text-xs text-[#5C574F]">
                <span>{lang === 'ka' ? 'არ გაქვთ ანგარიში? ' : "Don't have an account? "}</span>
                <a
                  href={`/register?redirect=${encodeURIComponent(redirectTarget)}`}
                  className="text-[#141311] hover:text-[#9D7B48] font-medium underline underline-offset-4 ml-1 transition-colors"
                >
                  {lang === 'ka' ? 'დარეგისტრირდით' : 'Create an Account'}
                </a>
              </div>

              <div className="mt-4 text-center">
                <a href="/" className="inline-flex items-center gap-1.5 text-xs text-[#847E75] hover:text-[#141311] transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{lang === 'ka' ? 'საიტზე დაბრუნება' : 'Back to Store'}</span>
                </a>
              </div>
            </>
          ) : mode === 'forgot' ? (
            <>
              <div className="text-center mb-8 space-y-2">
                <span className="text-[10px] uppercase tracking-[0.26em] text-[#9D7B48] font-medium block">
                  {lang === 'ka' ? 'ანგარიშის აღდგენა' : 'Account Recovery'}
                </span>
                <h1 className="font-serif text-3xl font-light text-[#141311]">
                  {lang === 'ka' ? 'პაროლის აღდგენა' : 'Reset Password'}
                </h1>
                <p className="text-xs sm:text-sm text-[#5C574F] font-light">
                  {lang === 'ka'
                    ? 'შეიყვანეთ თქვენი ელფოსტა და გამოგიგზავნით პაროლის აღდგენის ბმულს'
                    : 'Enter your email to receive a password reset link'}
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 bg-[#FDF6F6] border border-[#E8C8C8] text-[#8E2424] text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {resetSuccess ? (
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-4 bg-[#F4F8F5] border border-[#D4E2D9] text-[#2B5C40] text-xs sm:text-sm flex items-start gap-3">
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
                    className="w-full py-3.5 px-4 bg-[#141311] text-white text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 stroke-[1.5]" />
                    <span>{lang === 'ka' ? 'ავტორიზაციაზე დაბრუნება' : 'Back to Sign In'}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#5C574F] font-medium mb-1.5">
                      {lang === 'ka' ? 'თქვენი ელფოსტა' : 'Your Email Address'}
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-[#141311] hover:bg-[#2C2A26] text-white text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-[1.5px] border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 stroke-[1.5]" />
                        <span>{lang === 'ka' ? 'აღდგენის ბმულის გაგზავნა' : 'Send Reset Link'}</span>
                      </>
                    )}
                  </button>

                  <div className="pt-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setMode('login');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-[#9D7B48] hover:text-[#141311] transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>{lang === 'ka' ? 'ავტორიზაციაზე დაბრუნება' : 'Back to Sign In'}</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-[#E8E3DB] text-center">
                <a href="/" className="inline-flex items-center gap-1.5 text-xs text-[#847E75] hover:text-[#141311] transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{lang === 'ka' ? 'საიტზე დაბრუნება' : 'Back to Store'}</span>
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8 space-y-2">
                <span className="text-[10px] uppercase tracking-[0.26em] text-[#9D7B48] font-medium block">
                  {lang === 'ka' ? 'უსაფრთხოება' : 'Security'}
                </span>
                <h1 className="font-serif text-3xl font-light text-[#141311]">
                  {lang === 'ka' ? 'ახალი პაროლის დაყენება' : 'Set New Password'}
                </h1>
                {verifiedEmail ? (
                  <div className="mt-2">
                    <span className="text-xs px-3 py-1 bg-[#F8F6F2] border border-[#E8E3DB] text-[#4A4640] font-mono inline-flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-[#9D7B48]" />
                      <span>{verifiedEmail}</span>
                    </span>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-[#5C574F] font-light">
                    {lang === 'ka' ? 'შეიყვანეთ თქვენი ახალი პაროლი' : 'Enter your new password'}
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 bg-[#FDF6F6] border border-[#E8C8C8] text-[#8E2424] text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {verifyingCode ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-7 h-7 border-[1.5px] border-[#9D7B48] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-[#847E75]">
                    {lang === 'ka' ? 'მოწმდება პაროლის აღდგენის ბმული...' : 'Verifying reset link...'}
                  </p>
                </div>
              ) : passwordResetSuccess ? (
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-4 bg-[#F4F8F5] border border-[#D4E2D9] text-[#2B5C40] text-xs sm:text-sm flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <p className="font-medium mb-1">
                        {lang === 'ka' ? 'პაროლი წარმატებით შეიცვალა!' : 'Password updated successfully!'}
                      </p>
                      <p className="opacity-85">
                        {lang === 'ka'
                          ? 'თქვენი ახალი პაროლი გააქტიურებულია. შეგიძლიათ გაიაროთ ავტორიზაცია.'
                          : 'Your new password is now active. You can now sign in.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {params.get('from') === 'admin' ? (
                      <button
                        type="button"
                        onClick={() => navigateTo('/admin')}
                        className="w-full py-3.5 px-4 bg-[#141311] text-white text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
                        <span>{lang === 'ka' ? 'ადმინ პანელზე შესვლა →' : 'Go to Admin Panel →'}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => navigateTo('/login')}
                          className="w-full py-3.5 px-4 bg-[#141311] text-white text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <LogIn className="w-4 h-4 stroke-[1.5]" />
                          <span>{lang === 'ka' ? 'ავტორიზაციაზე გადასვლა' : 'Go to Sign In'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo('/admin')}
                          className="w-full py-3 px-4 border border-[#141311] text-[#141311] hover:bg-[#F8F6F2] text-xs tracking-[0.16em] uppercase flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5]" />
                          <span>{lang === 'ka' ? 'ადმინ პანელზე შესვლა' : 'Go to Admin Panel'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : !codeValid ? (
                <div className="space-y-5 text-center py-4">
                  <p className="text-xs text-[#5C574F]">
                    {!oobCode
                      ? (lang === 'ka' ? 'აღდგენის კოდი არ მოიძებნა. გთხოვთ გამოიყენოთ ელფოსტაზე მიღებული ბმული.' : 'No reset code found.')
                      : (lang === 'ka' ? 'ბმულის მოქმედების ვადა ამოიწურა ან უკვე გამოყენებულია.' : 'The link has expired or has already been used.')}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setMode('forgot');
                    }}
                    className="w-full py-3 px-4 bg-[#141311] text-white text-xs tracking-[0.18em] uppercase cursor-pointer"
                  >
                    {lang === 'ka' ? 'ახალი ბმულის მოთხოვნა' : 'Request New Link'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConfirmNewPassword} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#5C574F] font-medium mb-1.5">
                      {lang === 'ka' ? 'ახალი პაროლი (მინ. 8 სიმბოლო)' : 'New Password (min 8 chars)'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847E75] stroke-[1.5]" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#847E75] hover:text-[#141311] cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                      </button>
                    </div>
                    <PasswordStrengthIndicator password={newPassword} lang={lang} darkMode={false} />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] text-[#5C574F] font-medium mb-1.5">
                      {lang === 'ka' ? 'გაიმეორეთ ახალი პაროლი' : 'Confirm New Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847E75] stroke-[1.5]" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#847E75] hover:text-[#141311] cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-[#141311] hover:bg-[#2C2A26] text-white text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-[1.5px] border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
                        <span>{lang === 'ka' ? 'პაროლის განახლება' : 'Update Password'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-[#E8E3DB] text-center">
                <a href="/" className="inline-flex items-center gap-1.5 text-xs text-[#847E75] hover:text-[#141311] transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{lang === 'ka' ? 'საიტზე დაბრუნება' : 'Back to Store'}</span>
                </a>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer lang={lang} siteSettings={siteSettings} />
    </div>
  );
}

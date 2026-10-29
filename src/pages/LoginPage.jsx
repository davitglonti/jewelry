// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, Sparkles, AlertCircle, KeyRound, CheckCircle2, Send } from 'lucide-react';
import { useAuth, getAuthErrorMessage } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function LoginPage({ initialMode = 'login' }) {
  const { login, resetPassword } = useAuth();
  const { darkMode, setDarkMode, lang, setLang, siteSettings, favorites, setShowFavoritesModal } = useStore();

  const [mode, setMode] = useState(initialMode); // 'login' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // redirect URL პარამეტრის ამოღება
  const params = new URLSearchParams(window.location.search);
  const redirectTarget = params.get('redirect') || '/';

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
      window.location.href = redirectTarget;
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, lang, 'login'));
      setLoading(false);
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
          {mode === 'login' ? (
            <>
              {/* Header */}
              <div className="text-center mb-7">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 mb-3 shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide">
                  {lang === 'ka' ? 'ავტორიზაცია' : 'Sign In'}
                </h1>
                <p className="text-xs sm:text-sm opacity-70 mt-1.5">
                  {lang === 'ka'
                    ? 'შედით თქვენს ანგარიშზე რჩეულების, შედარებისა და VIP ფასდაკლებისთვის'
                    : 'Sign in to access favorites, comparison & VIP perks'}
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
              <form onSubmit={handleLogin} className="space-y-4">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs uppercase tracking-wider font-semibold opacity-80">
                      {lang === 'ka' ? 'პაროლი' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setResetSuccess(false);
                        setMode('forgot');
                      }}
                      className="text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors"
                    >
                      {lang === 'ka' ? 'დაგავიწყდათ პაროლი?' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{lang === 'ka' ? 'შესვლა' : 'Sign In'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Switch to Register */}
              <div className="mt-6 pt-5 border-t border-stone-500/15 text-center text-xs opacity-80">
                <span>{lang === 'ka' ? 'არ გაქვთ ანგარიში? ' : "Don't have an account? "}</span>
                <a
                  href={`/register?redirect=${encodeURIComponent(redirectTarget)}`}
                  className="text-amber-500 hover:text-amber-400 font-semibold underline underline-offset-4 ml-1 transition-colors"
                >
                  {lang === 'ka' ? 'დარეგისტრირდით' : 'Create an Account'}
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
            </>
          ) : (
            <>
              {/* Forgot Password Header */}
              <div className="text-center mb-7">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 mb-3 shadow-inner">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide">
                  {lang === 'ka' ? 'პაროლის აღდგენა' : 'Reset Password'}
                </h1>
                <p className="text-xs sm:text-sm opacity-70 mt-1.5">
                  {lang === 'ka'
                    ? 'შეიყვანეთ თქვენი ელფოსტა და გამოგიგზავნით პაროლის აღდგენის ბმულს'
                    : 'Enter your email to receive a password reset link'}
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {resetSuccess ? (
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                    <div className="leading-relaxed">
                      <p className="font-semibold mb-1">
                        {lang === 'ka' ? 'ბმული წარმატებით გაიგზავნა!' : 'Reset link sent successfully!'}
                      </p>
                      <p className="opacity-90">
                        {lang === 'ka'
                          ? `პაროლის აღდგენის ინსტრუქცია გაიგზავნა მისამართზე: ${email}. გთხოვთ შეამოწმოთ შემოსული წერილები (Inbox) და სპამ (Spam) საქაღალდე.`
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
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{lang === 'ka' ? 'ავტორიზაციაზე დაბრუნება' : 'Back to Sign In'}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold opacity-80 mb-1.5">
                      {lang === 'ka' ? 'თქვენი ელფოსტა' : 'Your Email Address'}
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
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
                      className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{lang === 'ka' ? 'ავტორიზაციაზე დაბრუნება' : 'Back to Sign In'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Back to store */}
              <div className="mt-5 pt-4 border-t border-stone-500/15 text-center">
                <a
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 hover:text-amber-500 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'საიტზე დაბრუნება' : 'Back to Store'}</span>
                </a>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />
    </div>
  );
}

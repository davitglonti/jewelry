// src/components/admin/Admin2FAGate.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Lock, Smartphone, Key, Copy, Check,
  RefreshCw, AlertCircle, Unlock, RotateCcw
} from 'lucide-react';
import { auth, getLazyAuth } from '../../lib/firebase';
import { getTotpAuthUri, generateTotpQrDataUrl } from '../../utils/totp';

export default function Admin2FAGate({
  children,
  darkMode = true,
  lang = 'ka',
  currentUser = null
}) {
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupSecret, setSetupSecret] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Setup state
  const [setupCode, setSetupCode] = useState('');
  const [setupError, setSetupError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Challenge / Unlock state
  const [challengeCode, setChallengeCode] = useState('');
  const [challengeError, setChallengeError] = useState('');
  const [remember30Mins, setRemember30Mins] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const activeUser = currentUser || auth?.currentUser || null;
  const adminEmail = (activeUser?.email || 'admin@matare.store').toLowerCase().trim();

  const call2faApi = useCallback(async (payload) => {
    const authInst = auth || (await getLazyAuth());
    const userObj = currentUser || authInst?.currentUser;
    if (!userObj || typeof userObj.getIdToken !== 'function') {
      throw new Error('საჭიროა ადმინისტრატორის ავტორიზაცია');
    }
    const idToken = await userObj.getIdToken();
    const res = await fetch('/api/admin-2fa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || '2FA სერვერული შეცდომა');
    }
    return data;
  }, [currentUser]);

  // 1. სერვერული 2FA სტატუსის შემოწმება
  useEffect(() => {
    let isCancelled = false;

    const check2FAStatus = async () => {
      setLoading(true);
      // Remove any legacy client-side 2FA storage (session is strictly HttpOnly cookie)
      try {
        localStorage.removeItem('matare_stats_2fa_unlocked_until');
        sessionStorage.removeItem('matare_stats_2fa_unlocked_until');
        sessionStorage.removeItem('matare_2fa_signed_proof');
        localStorage.removeItem(`matare_2fa_secret_${adminEmail}`);
        localStorage.removeItem(`matare_2fa_enabled_${adminEmail}`);
      } catch {}

      try {
        const data = await call2faApi({ action: 'status' });
        if (isCancelled) return;

        setTwoFactorEnabled(Boolean(data.twoFactorEnabled));
        setIsUnlocked(Boolean(data.unlocked));
        if (!data.twoFactorEnabled && data.setupSecret) {
          setSetupSecret(data.setupSecret);
          setSetupToken(data.setupToken || '');
        }
      } catch (err) {
        if (!isCancelled) {
          setChallengeError(err.message || '2FA სტატუსის შემოწმება ვერ მოხერხდა');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    check2FAStatus();
    return () => {
      isCancelled = true;
    };
  }, [adminEmail, call2faApi]);

  useEffect(() => {
    let cancelled = false;
    if ((!twoFactorEnabled || isSettingUp) && setupSecret) {
      const authUri = getTotpAuthUri(setupSecret, adminEmail, 'MATARE_STORE');
      generateTotpQrDataUrl(authUri)
        .then((url) => {
          if (!cancelled) setQrDataUrl(url);
        })
        .catch(() => {
          if (!cancelled) setQrDataUrl('');
        });
    } else {
      setQrDataUrl('');
    }
    return () => {
      cancelled = true;
    };
  }, [twoFactorEnabled, isSettingUp, setupSecret, adminEmail]);

  // 2. 2FA-ის პირველადი გააქტიურება სერვერზე
  const handleActivateSetup = async (e) => {
    e?.preventDefault();
    setSetupError('');
    setVerifying(true);

    try {
      await call2faApi({
        action: 'activate',
        setupToken,
        code: setupCode,
      });

      setTwoFactorEnabled(true);
      setIsUnlocked(true);
      setIsSettingUp(false);
      setSetupCode('');
      setSetupSecret('');
      setSetupToken('');
      setQrDataUrl('');
    } catch (err) {
      setSetupError(err.message || (lang === 'ka' ? 'არასწორი კოდია.' : 'Invalid code.'));
    } finally {
      setVerifying(false);
    }
  };

  // 3. არსებული 2FA-ის განბლოკვა სერვერზე
  const handleUnlock = async (e) => {
    e?.preventDefault();
    setChallengeError('');
    setVerifying(true);

    try {
      await call2faApi({
        action: 'verify',
        code: challengeCode,
        remember30Mins,
      });

      setIsUnlocked(true);
      setChallengeCode('');
    } catch (err) {
      setChallengeError(err.message || (lang === 'ka' ? 'განბლოკვა ვერ მოხერხდა' : 'Verification failed'));
    } finally {
      setVerifying(false);
    }
  };

  // 4. ხელით დაბლოკვა (Lock Now)
  const handleLockNow = async () => {
    setIsUnlocked(false);
    setChallengeCode('');
    setChallengeError('');
    try {
      await call2faApi({ action: 'lock' });
    } catch {}
  };

  // 5. 2FA-ის გადატვირთვა
  const handleReset2FA = async () => {
    if (!window.confirm(lang === 'ka' ? 'ნამდვილად გსურთ Google Authenticator 2FA-ის გადატვირთვა და ახალი გასაღების მიღება?' : 'Are you sure you want to reset your 2FA setup?')) return;
    setVerifying(true);
    try {
      const data = await call2faApi({ action: 'init-reset' });
      setSetupSecret(data.setupSecret || '');
      setSetupToken(data.setupToken || '');
      setSetupCode('');
      setSetupError('');
      setIsSettingUp(true);
      setIsUnlocked(false);
    } catch (err) {
      setChallengeError(err.message || '2FA გადატვირთვა ვერ მოხერხდა');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 opacity-60">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-xs">{lang === 'ka' ? '2FA უსაფრთხოების შემოწმება...' : 'Verifying 2FA security...'}</span>
      </div>
    );
  }

  // შემთხვევა 1: 2FA დაყენებულია და სერვერზე ვერიფიცირებულია
  if (isUnlocked && twoFactorEnabled && !isSettingUp) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-2.5 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {lang === 'ka'
                ? 'სტატისტიკა დაცულია სერვერული Google Authenticator 2FA-ით'
                : 'Statistics protected with Server-Verified 2FA'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset2FA}
              className="px-2.5 py-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 text-[11px] flex items-center gap-1 transition-colors"
              title={lang === 'ka' ? '2FA გასაღების თავიდან დაყენება' : 'Reset 2FA'}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{lang === 'ka' ? 'გადატვირთვა' : 'Reset'}</span>
            </button>

            <button
              type="button"
              onClick={handleLockNow}
              className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors active:scale-95 border border-stone-700"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ka' ? 'ახლავე დაბლოკვა' : 'Lock Now'}</span>
            </button>
          </div>
        </div>

        {children}
      </div>
    );
  }

  // შემთხვევა 2: 2FA ჯერ არ არის დაყენებული (Setup Mode)
  if (!twoFactorEnabled || isSettingUp) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 animate-fadeIn">
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl transition-all ${
          darkMode ? 'bg-[#141210] border-stone-800 shadow-black' : 'bg-white border-stone-200'
        }`}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto mb-3.5 shadow-inner">
              <Smartphone className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl font-normal tracking-wide">
              {lang === 'ka' ? 'Google Authenticator (2FA) დაყენება' : 'Set Up Google Authenticator (2FA)'}
            </h3>
            <p className="text-xs sm:text-sm opacity-60 mt-1.5 max-w-md mx-auto">
              {lang === 'ka'
                ? 'სტატისტიკის ცენტრის, გაყიდვებისა და კლიენტების მონაცემების სანახავად გაააქტიურეთ ორეტაპიანი დაცვა.'
                : 'Enable two-factor authentication to secure analytics, customer details and sales reports.'}
            </p>
          </div>

          {setupError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{setupError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-stone-800 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-36 h-36 bg-white p-2 rounded-xl shrink-0 shadow-md flex items-center justify-center">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="2FA QR Code" className="w-full h-full object-contain" />
                ) : (
                  <RefreshCw className="w-5 h-5 animate-spin text-stone-400" />
                )}
              </div>

              <div className="space-y-2 text-left">
                <span className="text-[11px] uppercase tracking-wider font-bold text-amber-500">
                  {lang === 'ka' ? 'ნაბიჯი 1: დასკანერება' : 'Step 1: Scan'}
                </span>
                <p className="text-xs opacity-75 leading-relaxed">
                  {lang === 'ka'
                    ? 'გახსენით Google Authenticator (ან Apple Passwords) და დაასკანერეთ ეს QR კოდი.'
                    : 'Open Google Authenticator app on your phone and scan this QR code.'}
                </p>

                <div className="pt-1">
                  <span className="text-[10px] opacity-50 block mb-0.5">
                    {lang === 'ka' ? 'ან ხელით შეიყვანეთ გასაღები:' : 'Or enter secret manually:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono font-bold text-amber-400 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-700 tracking-wider">
                      {setupSecret}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(setupSecret);
                        setCopiedSecret(true);
                        setTimeout(() => setCopiedSecret(false), 2000);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors"
                      title="Copy Secret"
                    >
                      {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleActivateSetup} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold block mb-1.5 opacity-80">
                  {lang === 'ka' ? 'ნაბიჯი 2: შეიყვანეთ აპლიკაციაში გამოსახული 6-ნიშნა კოდი' : 'Step 2: Enter 6-digit code from authenticator'}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-center text-xl font-mono font-bold tracking-[0.3em] border outline-none transition-all ${
                      darkMode
                        ? 'bg-[#181614] border-stone-700 text-amber-400 placeholder-stone-600 focus:border-amber-500'
                        : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={setupCode.length !== 6 || verifying}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'ka' ? 'მოწმდება...' : 'Verifying...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{lang === 'ka' ? '2FA-ის გააქტიურება და სტატისტიკის გახსნა' : 'Activate 2FA & Access Statistics'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // შემთხვევა 3: 2FA დაყენებულია, მაგრამ სესია დაბლოკილია
  return (
    <div className="max-w-md mx-auto py-16 px-4 animate-fadeIn">
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl transition-all ${
        darkMode ? 'bg-[#141210] border-stone-800 shadow-black' : 'bg-white border-stone-200'
      }`}>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto mb-3.5 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-normal tracking-wide">
            {lang === 'ka' ? 'სტატისტიკა დაცულია 2FA-ით' : 'Statistics Protected with 2FA'}
          </h3>
          <p className="text-xs sm:text-sm opacity-60 mt-1.5 leading-relaxed">
            {lang === 'ka'
              ? 'გთხოვთ შეიყვანოთ Google Authenticator-ის 6-ნიშნა კოდი სტატისტიკის გასახსნელად.'
              : 'Please enter the 6-digit code from Google Authenticator to unlock.'}
          </p>
        </div>

        {challengeError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{challengeError}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={challengeCode}
                onChange={(e) => setChallengeCode(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                autoFocus
                className={`w-full pl-10 pr-4 py-3.5 rounded-xl text-center text-2xl font-mono font-bold tracking-[0.35em] border outline-none transition-all ${
                  darkMode
                    ? 'bg-[#181614] border-stone-700 text-amber-400 placeholder-stone-600 focus:border-amber-500'
                    : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                }`}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs opacity-70 select-none py-1">
            <input
              type="checkbox"
              checked={remember30Mins}
              onChange={(e) => setRemember30Mins(e.target.checked)}
              className="rounded accent-amber-500 w-3.5 h-3.5"
            />
            <span>{lang === 'ka' ? 'დამიმახსოვრე 30 წუთით ამ ბრაუზერში' : 'Remember me for 30 minutes in this browser'}</span>
          </label>

          <button
            type="submit"
            disabled={challengeCode.length !== 6 || verifying}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{lang === 'ka' ? 'მოწმდება...' : 'Verifying...'}</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>{lang === 'ka' ? 'სტატისტიკის განბლოკვა' : 'Unlock Statistics'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

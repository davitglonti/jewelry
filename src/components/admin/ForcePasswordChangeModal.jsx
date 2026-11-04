import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, LogOut, Lock } from 'lucide-react';
import { completePasswordChange } from '../../lib/adminAuth';

export default function ForcePasswordChangeModal({
  user,
  db,
  onSuccess,
  onLogout,
  darkMode = true
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('შეყვანილი პაროლები ერთმანეთს არ ემთხვევა!');
      return;
    }

    setLoading(true);

    try {
      await completePasswordChange(user, db, newPassword);
      onSuccess();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setError('სესია ამოიწურა. გთხოვთ გადით და თავიდან შეხვიდეთ დროებითი პაროლით.');
      } else {
        setError(err.message || 'პაროლის განახლებისას დაფიქსირდა შეცდომა');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
          darkMode ? 'bg-[#141210] border-amber-500/30' : 'bg-white border-stone-200'
        }`}
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <KeyRound className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-medium pt-1">პირადი პაროლის დაყენება</h3>
          <p className="text-xs opacity-75 max-w-sm mx-auto leading-relaxed">
            თქვენ მოგენიჭათ წვდომა დროებითი პაროლით. უსაფრთხოების მიზნით, მუშაობის გასაგრძელებლად აუცილებელია აირჩიოთ თქვენი **პირადი საიდუმლო პაროლი**.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider font-semibold opacity-60 block mb-1.5">
              ახალი პირადი პაროლი:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="მინიმუმ 6 სიმბოლო"
                required
                disabled={loading}
                className={`w-full px-4 py-2.5 pr-10 rounded-xl text-xs border outline-none transition-all ${
                  darkMode
                    ? 'bg-stone-900 border-stone-700 text-white focus:border-amber-500'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider font-semibold opacity-60 block mb-1.5">
              გაიმეორეთ ახალი პაროლი:
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="გაიმეორეთ იგივე პაროლი"
              required
              disabled={loading}
              className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                darkMode
                  ? 'bg-stone-900 border-stone-700 text-white focus:border-amber-500'
                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
              }`}
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs tracking-wider uppercase transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-amber-500/20"
            >
              {loading ? 'პაროლი იცვლება...' : 'პაროლის შენახვა და შესვლა'}
            </button>

            <button
              type="button"
              onClick={onLogout}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-stone-700 text-stone-400 hover:text-stone-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>გასვლა (Logout)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

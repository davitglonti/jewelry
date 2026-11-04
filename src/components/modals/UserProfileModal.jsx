import React, { useState } from 'react';
import {
  X, Check, User, ShieldCheck, Sparkles, ExternalLink,
  LogOut, Save, AlertCircle, CheckCircle2
} from 'lucide-react';
import { AVATAR_PRESETS } from '../../data/avatarPresets';
import { useAuth } from '../../context/AuthContext';
import { navigateTo } from '../../utils/navigation';

export default function UserProfileModal({
  isOpen,
  onClose,
  lang = 'ka',
  darkMode = true
}) {
  const { user, userRole, updateUserProfile, logout } = useAuth();

  const [displayName, setDisplayName] = useState(() => user?.displayName || '');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(() => user?.photoURL || AVATAR_PRESETS[0].url);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !user) return null;

  const isStaff = userRole === 'superadmin' || userRole === 'admin' || userRole === 'moderator';

  const roleBadge = () => {
    if (userRole === 'superadmin') {
      return {
        label: lang === 'ka' ? 'მთავარი ადმინი' : 'Super Admin',
        cls: 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold'
      };
    }
    if (userRole === 'admin') {
      return {
        label: lang === 'ka' ? 'ადმინისტრატორი' : 'Administrator',
        cls: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      };
    }
    if (userRole === 'moderator') {
      return {
        label: lang === 'ka' ? 'მოდერატორი' : 'Moderator',
        cls: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      };
    }
    return {
      label: lang === 'ka' ? 'მომხმარებელი' : 'Member',
      cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
    };
  };

  const badge = roleBadge();

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        photoURL: selectedAvatarUrl
      });
      setSuccessMsg(lang === 'ka' ? 'პროფილი წარმატებით განახლდა!' : 'Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || (lang === 'ka' ? 'შეცდომა შენახვისას' : 'Error updating profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      onClose();
      await logout();
      navigateTo('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-6 scrollbar-none transition-all ${
          darkMode ? 'bg-[#121110] border-amber-500/30 text-[#f5f0e6]' : 'bg-white border-stone-200 text-stone-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-500/15">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-medium">
              {lang === 'ka' ? 'მომხმარებლის პროფილი' : 'User Profile'}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${badge.cls}`}>
              {badge.label}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Showcase */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
          darkMode ? 'bg-stone-900/70 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="relative shrink-0">
            <img
              src={selectedAvatarUrl || AVATAR_PRESETS[0].url}
              alt="Selected Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-md shadow-amber-500/20"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-base font-semibold truncate">
              {displayName.trim() || user.displayName || user.email?.split('@')[0]}
            </h4>
            <p className="text-xs opacity-60 font-mono truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[11px] text-amber-500 font-medium">
              {lang === 'ka' ? 'საიუველირო სახლი «მატარე»' : 'MATARE Fine Jewelry'}
            </span>
          </div>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar Presets Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                {lang === 'ka' ? 'აირჩიეთ თქვენი ფოტო (ავატარი):' : 'Choose Profile Icon:'}
              </label>
              <span className="text-[11px] text-amber-500 opacity-80">
                {lang === 'ka' ? '8 ექსკლუზიური სიმბოლო' : '8 Luxury Presets'}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedAvatarUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAvatarUrl(preset.url)}
                    className={`relative p-2 rounded-2xl border text-center transition-all group flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/40 shadow-md shadow-amber-500/20 scale-105'
                        : darkMode
                        ? 'border-stone-800 bg-stone-900/50 hover:border-amber-500/40 hover:bg-stone-800/80'
                        : 'border-stone-200 bg-stone-100/70 hover:border-amber-500 hover:bg-stone-200'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={preset.url}
                        alt={lang === 'ka' ? preset.nameKa : preset.nameEn}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-medium opacity-75 line-clamp-1">
                      {lang === 'ka' ? preset.nameKa : preset.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider opacity-75 block mb-1.5">
              {lang === 'ka' ? 'თქვენი სახელი (Display Name):' : 'Display Name:'}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={lang === 'ka' ? 'მაგ: დავით გლონტი' : 'e.g. John Doe'}
              className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                darkMode
                  ? 'bg-stone-900 border-stone-700 text-white focus:border-amber-500'
                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? (lang === 'ka' ? 'ინახება...' : 'Saving...') : (lang === 'ka' ? 'პროფილის შენახვა' : 'Save Profile')}</span>
            </button>

            {/* If Admin or Moderator, show direct link to Admin Panel */}
            {isStaff && (
              <a
                href="/admin"
                className="w-full py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-400 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === 'ka' ? 'ადმინ-პანელზე გადასვლა' : 'Go to Admin Dashboard'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2 rounded-xl border border-stone-800 text-stone-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 text-xs font-medium flex items-center justify-center gap-2 transition-colors mt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'ka' ? 'სისტემიდან გასვლა' : 'Sign Out'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

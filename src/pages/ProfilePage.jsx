// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import {
  User, ShieldCheck, Sparkles, Heart, Lock, Key, LogOut,
  Save, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft,
  ExternalLink, Calendar, Mail, Phone, MessageCircle, ChevronRight
} from 'lucide-react';
import { useAuth, getAuthErrorMessage } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { AVATAR_PRESETS } from '../data/avatarPresets';
import { navigateTo } from '../utils/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FavoritesModal from '../components/modals/FavoritesModal';

export default function ProfilePage() {
  const { darkMode, setDarkMode, lang, setLang, siteSettings, favorites, inquiries } = useStore();
  const { user, userRole, loading: authLoading, updateUserProfile, changePassword, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  // Active section tab
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'favorites' | 'concierge'

  // Profile Edit State
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Sync state when user loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setSelectedAvatarUrl(user.photoURL || AVATAR_PRESETS[0].url);
    }
  }, [user]);

  // Format member creation date
  const formatCreationDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const isStaff = userRole === 'superadmin' || userRole === 'admin' || userRole === 'moderator';

  const getRoleDetails = () => {
    if (userRole === 'superadmin') {
      return {
        label: lang === 'ka' ? 'მთავარი ადმინისტრატორი' : 'Super Administrator',
        short: 'SUPER ADMIN',
        badgeClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-md shadow-amber-500/20',
        desc: lang === 'ka' ? 'სისტემის სრული და ულიმიტო წვდომა (Root)' : 'Full System Access & Ownership'
      };
    }
    if (userRole === 'admin') {
      return {
        label: lang === 'ka' ? 'ადმინისტრატორი' : 'Store Administrator',
        short: 'ADMIN',
        badgeClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
        desc: lang === 'ka' ? 'საიტის მართვა და პარამეტრების რედაქტირება' : 'Catalog, Settings & Inquiries Management'
      };
    }
    if (userRole === 'moderator') {
      return {
        label: lang === 'ka' ? 'კონტენტ-მოდერატორი' : 'Content Moderator',
        short: 'MODERATOR',
        badgeClass: 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
        desc: lang === 'ka' ? 'პროდუქციისა და ბლოგების რედაქტირების უფლება' : 'Products & Blog Management Access'
      };
    }
    return {
      label: lang === 'ka' ? 'კლიენტი (VIP წევრი)' : 'VIP Member',
      short: 'MEMBER',
      badgeClass: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      desc: lang === 'ka' ? 'საიუველირო სახლ «მატარეს» რეგისტრირებული წევრი' : 'Registered Member of MATARE Fine Jewelry'
    };
  };

  const roleInfo = getRoleDetails();

  // Save profile info (Display Name & Avatar)
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        photoURL: selectedAvatarUrl
      });
      setProfileSuccessMsg(
        lang === 'ka'
          ? 'პროფილის მონაცემები წარმატებით შეინახა!'
          : 'Profile details saved successfully!'
      );
      setTimeout(() => setProfileSuccessMsg(''), 3500);
    } catch (err) {
      console.error(err);
      setProfileErrorMsg(getAuthErrorMessage(err, lang));
    } finally {
      setSavingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordErrorMsg(
        lang === 'ka'
          ? 'ახალი პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg(
        lang === 'ka'
          ? 'შეყვანილი პაროლები ერთმანეთს არ ემთხვევა.'
          : 'Passwords do not match.'
      );
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(newPassword);
      setPasswordSuccessMsg(
        lang === 'ka'
          ? 'თქვენი პაროლი წარმატებით შეიცვალა!'
          : 'Your password has been updated successfully!'
      );
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(''), 4500);
    } catch (err) {
      console.error(err);
      setPasswordErrorMsg(getAuthErrorMessage(err, lang));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigateTo(lang === 'en' ? '/en' : '/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // User's own inquiries (if any match phone/email)
  const userInquiries = (inquiries || []).filter((inq) => {
    if (!user) return false;
    if (inq.clientEmail && inq.clientEmail.toLowerCase() === user.email?.toLowerCase()) return true;
    if (user.displayName && inq.clientName && inq.clientName.toLowerCase() === user.displayName.toLowerCase()) return true;
    return false;
  });

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${darkMode ? 'bg-[#0c0b0a] text-[#f5f0e6]' : 'bg-[#faf7f2] text-[#1c1917]'}`}>
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

      <main id="main-content" className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs opacity-60 mb-6">
          <a
            href={lang === 'en' ? '/en' : '/'}
            className="hover:text-amber-500 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'ka' ? 'მთავარი' : 'Home'}</span>
          </a>
          <span>/</span>
          <span className="text-amber-500 font-medium">
            {lang === 'ka' ? 'ჩემი პროფილი' : 'My Profile'}
          </span>
        </div>

        {/* Auth Check: If not logged in */}
        {!authLoading && !user ? (
          <div className={`p-8 sm:p-14 rounded-3xl border text-center space-y-6 max-w-xl mx-auto ${
            darkMode ? 'bg-stone-900/60 border-amber-500/20' : 'bg-white border-stone-200 shadow-xl'
          }`}>
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold">
                {lang === 'ka' ? 'ავტორიზაცია აუცილებელია' : 'Authentication Required'}
              </h2>
              <p className="text-xs sm:text-sm opacity-70 leading-relaxed">
                {lang === 'ka'
                  ? 'თქვენი პირადი პროფილის, ავატარის, პაროლისა და რჩეული სამკაულების სანახავად გთხოვთ გაიაროთ ავტორიზაცია.'
                  : 'Please sign in to access your profile settings, avatar, password, and saved wishlist.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={lang === 'en' ? '/en/login?redirect=/en/profile' : '/login?redirect=/profile'}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-md shadow-amber-500/20 text-center"
              >
                {lang === 'ka' ? 'სისტემაში შესვლა' : 'Sign In'}
              </a>
              <a
                href={lang === 'en' ? '/en/register' : '/register'}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-stone-500/30 hover:border-amber-500 text-xs font-semibold tracking-wider uppercase transition-all text-center"
              >
                {lang === 'ka' ? 'რეგისტრაცია' : 'Create Account'}
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Luxury Profile Hero Banner */}
            <section className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
              darkMode
                ? 'bg-gradient-to-br from-[#151413] via-[#121110] to-[#0d0c0b] border-amber-500/30 shadow-2xl'
                : 'bg-gradient-to-br from-white via-[#faf7f2] to-[#f4eee4] border-amber-500/30 shadow-xl'
            }`}>
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5 sm:gap-6">
                  {/* Current Avatar with badge */}
                  <div className="relative shrink-0">
                    <img
                      src={selectedAvatarUrl || user?.photoURL || AVATAR_PRESETS[0].url}
                      alt="Avatar"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-amber-500 shadow-xl shadow-amber-500/20 bg-stone-900"
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md"
                      title={lang === 'ka' ? 'საიუველირო ავატარი' : 'Luxury Avatar'}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Name, Email, Role */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide truncate">
                        {displayName.trim() || user?.displayName || user?.email?.split('@')[0]}
                      </h1>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${roleInfo.badgeClass}`}>
                        {roleInfo.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs opacity-75">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Mail className="w-3.5 h-3.5 text-amber-500" />
                        {user?.email}
                      </span>
                      {user?.metadata?.creationTime && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>{lang === 'ka' ? 'წევრი:' : 'Joined:'} {formatCreationDate(user.metadata.creationTime)}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-amber-500/90 font-serif italic pt-0.5">
                      {roleInfo.desc}
                    </p>
                  </div>
                </div>

                {/* Right Quick Actions */}
                <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto justify-end">
                  {isStaff && (
                    <a
                      href="/admin"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{lang === 'ka' ? 'ადმინ პანელი' : 'Admin Panel'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                      darkMode
                        ? 'border-stone-800 bg-stone-900/80 text-stone-300 hover:text-red-400 hover:border-red-500/40'
                        : 'border-stone-200 bg-white text-stone-700 hover:text-red-600 hover:border-red-400 shadow-sm'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{lang === 'ka' ? 'გასვლა' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 mt-8 pt-5 border-t border-stone-500/15 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'profile'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : darkMode
                      ? 'text-stone-300 hover:bg-stone-800/80'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'პროფილი & ავატარი' : 'Profile & Avatar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'security'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : darkMode
                      ? 'text-stone-300 hover:bg-stone-800/80'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'უსაფრთხოება & პაროლი' : 'Security & Password'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('favorites')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'favorites'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : darkMode
                      ? 'text-stone-300 hover:bg-stone-800/80'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? `რჩეული (${favorites.length})` : `Favorites (${favorites.length})`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('concierge')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'concierge'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : darkMode
                      ? 'text-stone-300 hover:bg-stone-800/80'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'კონსიერჟი & სერვისები' : 'Concierge & Services'}</span>
                </button>
              </div>
            </section>

            {/* TAB 1: PROFILE & AVATAR EDIT */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-7 ${
                  darkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-white border-stone-200 shadow-md'
                }`}>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold">
                      {lang === 'ka' ? 'პროფილის რედაქტირება' : 'Edit Profile'}
                    </h3>
                    <p className="text-xs opacity-70 mt-1">
                      {lang === 'ka'
                        ? 'აირჩიეთ თქვენი საიუველირო ავატარი და განაახლეთ თქვენი სახელი.'
                        : 'Choose your signature luxury avatar preset and update your display name.'}
                    </p>
                  </div>

                  {/* Feedback toasts */}
                  {profileSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}
                  {profileErrorMsg && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{profileErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-7">
                    {/* 8 Luxury Avatar Presets Grid */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{lang === 'ka' ? 'აირჩიეთ ფოტო (საიუველირო სიმბოლოები):' : 'Choose Luxury Avatar Preset:'}</span>
                        </label>
                        <span className="text-[11px] opacity-60">
                          {lang === 'ka' ? '8 ექსკლუზიური სიმბოლო' : '8 Exclusive Icons'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {AVATAR_PRESETS.map((preset) => {
                          const isSelected = selectedAvatarUrl === preset.url;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setSelectedAvatarUrl(preset.url)}
                              className={`relative p-3.5 sm:p-4 rounded-2xl border text-center transition-all group flex flex-col items-center gap-2.5 ${
                                isSelected
                                  ? 'border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/20 scale-[1.02]'
                                  : darkMode
                                  ? 'border-stone-800 bg-stone-900/60 hover:border-amber-500/40 hover:bg-stone-800/70'
                                  : 'border-stone-200 bg-stone-50 hover:border-amber-500/50 hover:bg-stone-100'
                              }`}
                            >
                              <div className="relative">
                                <img
                                  src={preset.url}
                                  alt={lang === 'ka' ? preset.nameKa : preset.nameEn}
                                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover transition-transform group-hover:scale-105"
                                />
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md">
                                    <Sparkles className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-medium line-clamp-1">
                                {lang === 'ka' ? preset.nameKa : preset.nameEn}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Display Name Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider opacity-80 block">
                        {lang === 'ka' ? 'თქვენი სახელი (Display Name):' : 'Your Display Name:'}
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={lang === 'ka' ? 'მაგ: დავით გლონტი' : 'e.g. David Glonti'}
                        className={`w-full max-w-md px-4 py-3 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                          darkMode
                            ? 'bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                            : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
                        }`}
                      />
                      <p className="text-[11px] opacity-60">
                        {lang === 'ka'
                          ? 'ეს სახელი გამოჩნდება საიტის ზედა პანელში და თქვენს პირად შეკვეთებში.'
                          : 'This name will appear on the navigation bar and your personal inquiries.'}
                      </p>
                    </div>

                    {/* Email (Readonly) */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider opacity-80 block">
                        {lang === 'ka' ? 'ელფოსტის მისამართი (ავტორიზაცია):' : 'Registered Email Address:'}
                      </label>
                      <input
                        type="text"
                        value={user?.email || ''}
                        disabled
                        className={`w-full max-w-md px-4 py-3 rounded-xl text-xs sm:text-sm border opacity-60 cursor-not-allowed font-mono ${
                          darkMode ? 'bg-stone-950 border-stone-800 text-stone-400' : 'bg-stone-200 border-stone-300 text-stone-600'
                        }`}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        <span>{savingProfile ? (lang === 'ka' ? 'ინახება...' : 'Saving...') : (lang === 'ka' ? 'ცვლილებების შენახვა' : 'Save Changes')}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: SECURITY & PASSWORD CHANGE */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-7 ${
                  darkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-white border-stone-200 shadow-md'
                }`}>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-500" />
                      <span>{lang === 'ka' ? 'პაროლის შეცვლა' : 'Change Password'}</span>
                    </h3>
                    <p className="text-xs opacity-70 mt-1">
                      {lang === 'ka'
                        ? 'განაახლეთ თქვენი ანგარიშის პაროლი პირდაპირ ამ გვერდიდან. პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან.'
                        : 'Update your account password securely. It must contain at least 6 characters.'}
                    </p>
                  </div>

                  {/* Feedback toasts */}
                  {passwordSuccessMsg && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{passwordSuccessMsg}</span>
                    </div>
                  )}
                  {passwordErrorMsg && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider opacity-80 block">
                        {lang === 'ka' ? 'ახალი პაროლი:' : 'New Password:'}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3 pr-11 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                            darkMode
                              ? 'bg-stone-900 border-stone-700 text-white focus:border-amber-500'
                              : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                          aria-label="Toggle password visibility"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider opacity-80 block">
                        {lang === 'ka' ? 'გაიმეორეთ ახალი პაროლი:' : 'Confirm New Password:'}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full px-4 py-3 pr-11 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                            darkMode
                              ? 'bg-stone-900 border-stone-700 text-white focus:border-amber-500'
                              : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                          aria-label="Toggle password visibility"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={savingPassword || !newPassword || !confirmPassword}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 active:scale-95"
                      >
                        <Key className="w-4 h-4" />
                        <span>{savingPassword ? (lang === 'ka' ? 'იცვლება...' : 'Updating...') : (lang === 'ka' ? 'პაროლის განახლება' : 'Update Password')}</span>
                      </button>
                    </div>
                  </form>

                  {/* Security Notice */}
                  <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                    darkMode ? 'bg-amber-500/5 border-amber-500/20 text-stone-300' : 'bg-amber-50/70 border-amber-200 text-stone-700'
                  }`}>
                    <div className="flex items-center gap-2 font-semibold text-amber-500">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{lang === 'ka' ? 'უსაფრთხოების გარანტია' : 'Security Assurance'}</span>
                    </div>
                    <p>
                      {lang === 'ka'
                        ? 'პაროლები დაცულია Google Cloud Firebase Authentication-ის ენკრიფციით. თუ დიდი ხნის წინ ხართ შესული და სისტემა მოითხოვს თავიდან ავტორიზაციას, გთხოვთ გამოიყენოთ გასვლის ღილაკი და თავიდან შეხვიდეთ.'
                        : 'Your credentials are encrypted via Google Cloud Firebase Authentication. If required by security policy, you may be asked to log in again.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FAVORITES SHORTCUT */}
            {activeTab === 'favorites' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                  darkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-white border-stone-200 shadow-md'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-semibold flex items-center gap-2">
                        <Heart className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span>{lang === 'ka' ? `თქვენი რჩეული სამკაულები (${favorites.length})` : `Your Saved Jewelry (${favorites.length})`}</span>
                      </h3>
                      <p className="text-xs opacity-70 mt-1">
                        {lang === 'ka'
                          ? 'შენახული სამკაულები ხელმისაწვდომია თქვენი ანგარიშიდან ნებისმიერ მოწყობილობაზე.'
                          : 'Your wishlist is saved with your account and synced across devices.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowFavoritesModal(true)}
                      className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
                    >
                      <span>{lang === 'ka' ? 'რჩეულების გახსნა' : 'Open Wishlist'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {favorites.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl border border-dashed border-stone-500/25 space-y-3">
                      <Heart className="w-10 h-10 opacity-30 mx-auto text-amber-500" />
                      <p className="text-xs opacity-60">
                        {lang === 'ka' ? 'თქვენს რჩეულებში ჯერ სამკაულები არ არის დამატებული.' : 'You have no saved jewelry in your wishlist yet.'}
                      </p>
                      <a
                        href={lang === 'en' ? '/en/catalog' : '/catalog'}
                        className="inline-block px-5 py-2 rounded-full border border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-black text-xs font-semibold uppercase tracking-wider transition-all"
                      >
                        {lang === 'ka' ? 'კოლექციის დათვალიერება' : 'Browse Collection'}
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs flex items-center justify-between">
                      <span>
                        {lang === 'ka'
                          ? `თქვენ მონიშნული გაქვთ ${favorites.length} სამკაული.`
                          : `You have ${favorites.length} item(s) saved in your collection.`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowFavoritesModal(true)}
                        className="text-amber-500 font-semibold hover:underline"
                      >
                        {lang === 'ka' ? 'დათვალიერება →' : 'View →'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: CONCIERGE & SUPPORT */}
            {activeTab === 'concierge' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                  darkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-white border-stone-200 shadow-md'
                }`}>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <span>{lang === 'ka' ? 'პერსონალური საიუველირო კონსიერჟი' : 'Bespoke Jewelry Concierge'}</span>
                    </h3>
                    <p className="text-xs opacity-70 mt-1">
                      {lang === 'ka'
                        ? 'ინდივიდუალური კონსულტაცია, ზომის მორგება და ექსკლუზიური შეკვეთები ჩვენი ოსტატებისგან.'
                        : 'Personal consultations, custom ring sizing, and bespoke commissions directly with our master jeweller.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* WhatsApp Direct Chat */}
                    {siteSettings.whatsapp && (
                      <a
                        href={`https://wa.me/${siteSettings.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all hover:scale-[1.01] ${
                          darkMode ? 'bg-stone-900/70 border-emerald-500/30 hover:border-emerald-500' : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-500'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                            WhatsApp VIP Concierge
                          </span>
                          <h4 className="font-serif text-base font-semibold">
                            {lang === 'ka' ? 'პირადი კონსულტანტი' : 'Personal Consultant'}
                          </h4>
                          <p className="text-xs opacity-65 font-mono">
                            {siteSettings.whatsapp}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                      </a>
                    )}

                    {/* Phone direct */}
                    {siteSettings.phone && (
                      <a
                        href={`tel:${siteSettings.phone}`}
                        className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all hover:scale-[1.01] ${
                          darkMode ? 'bg-stone-900/70 border-amber-500/30 hover:border-amber-500' : 'bg-amber-50/50 border-amber-200 hover:border-amber-500'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                            {lang === 'ka' ? 'პირდაპირი ზარი' : 'Direct Call'}
                          </span>
                          <h4 className="font-serif text-base font-semibold">
                            {lang === 'ka' ? 'შოურუმის ცხელი ხაზი' : 'Showroom Hotline'}
                          </h4>
                          <p className="text-xs opacity-65 font-mono">
                            {siteSettings.phone}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-md">
                          <Phone className="w-5 h-5" />
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Size guide shortcut */}
                  <div className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 ${
                    darkMode ? 'bg-stone-900/40 border-stone-800' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div>
                      <h4 className="text-sm font-semibold">
                        {lang === 'ka' ? 'თითის ზომის დადგენა (ინტერაქტიული ხელსაწყო)' : 'Ring Size Calculator'}
                      </h4>
                      <p className="text-xs opacity-60 mt-0.5">
                        {lang === 'ka'
                          ? 'გამოიყენეთ მონეტის ან სახაზავის კალიბრაცია თქვენი ზუსტი ზომის გასაგებად.'
                          : 'Use screen coin or millimeter calibration to measure your exact ring size.'}
                      </p>
                    </div>
                    <a
                      href={lang === 'en' ? '/en/size-guide' : '/size-guide'}
                      className="px-4 py-2 rounded-full border border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-black text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0"
                    >
                      {lang === 'ka' ? 'ზომის გიდი' : 'Size Guide'}
                    </a>
                  </div>

                  {/* User's recent inquiries (if any) */}
                  {userInquiries.length > 0 && (
                    <div className="space-y-3 pt-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                        {lang === 'ka' ? 'თქვენი გაგზავნილი მოთხოვნები:' : 'Your Consultation Inquiries:'}
                      </h4>
                      <div className="space-y-2">
                        {userInquiries.map((inq) => (
                          <div
                            key={inq.id}
                            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                              darkMode ? 'bg-stone-900/80 border-stone-800' : 'bg-stone-50 border-stone-200'
                            }`}
                          >
                            <div>
                              <span className="font-semibold">{inq.productName} ({inq.sku})</span>
                              {inq.size && <span className="opacity-60"> • ზომა: {inq.size}</span>}
                            </div>
                            <span className="opacity-50 text-[11px] font-mono">{inq.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer
        lang={lang}
        darkMode={darkMode}
        siteSettings={siteSettings}
      />

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        favorites={favorites}
      />
    </div>
  );
}

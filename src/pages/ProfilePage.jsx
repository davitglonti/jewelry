// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  User, ShieldCheck, Heart, Key, LogOut,
  Save, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft,
  ExternalLink, Calendar, Mail, Phone, MessageCircle, ChevronRight, Check, Gem
} from 'lucide-react';
import { useAuth, getAuthErrorMessage } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { AVATAR_PRESETS } from '../data/avatarPresets';
import { navigateTo } from '../utils/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FavoritesModal from '../components/modals/FavoritesModal';
import ProductCard from '../components/store/ProductCard';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import { isStrongPassword, getPasswordValidationMessage } from '../utils/passwordValidation';

export default function ProfilePage() {
  const { darkMode, setDarkMode, lang, setLang, siteSettings, favorites, inquiries, products } = useStore();
  const { user, userRole, loading: authLoading, updateUserProfile, changePassword, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  // Active navigation tab: 'profile' | 'security' | 'favorites' | 'concierge'
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Edit State
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Favorite products filtered from all store products
  const favoriteProducts = useMemo(() => {
    if (!products || !favorites || favorites.length === 0) return [];
    return products.filter((p) => favorites.includes(p.id) || (p.sku && favorites.includes(p.sku)));
  }, [products, favorites]);

  // Synchronize state when user loads
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
        badgeClass: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
        desc: lang === 'ka' ? 'სისტემის სრული წვდომა' : 'Full System Access'
      };
    }
    if (userRole === 'admin') {
      return {
        label: lang === 'ka' ? 'ადმინისტრატორი' : 'Store Administrator',
        short: 'ADMIN',
        badgeClass: 'border-blue-400/40 bg-blue-400/10 text-blue-300',
        desc: lang === 'ka' ? 'მაღაზიის მართვა' : 'Store Management'
      };
    }
    if (userRole === 'moderator') {
      return {
        label: lang === 'ka' ? 'მოდერატორი' : 'Content Moderator',
        short: 'MODERATOR',
        badgeClass: 'border-purple-400/40 bg-purple-400/10 text-purple-300',
        desc: lang === 'ka' ? 'კონტენტის რედაქტორი' : 'Content Management'
      };
    }
    return {
      label: lang === 'ka' ? 'კლიენტი' : 'Client Member',
      short: 'MEMBER',
      badgeClass: 'border-stone-500/30 bg-stone-500/10 text-stone-300',
      desc: lang === 'ka' ? 'რეგისტრირებული მომხმარებელი' : 'Registered Member'
    };
  };

  const roleInfo = getRoleDetails();

  // Selected avatar object
  const currentSelectedPreset = AVATAR_PRESETS.find((p) => p.url === selectedAvatarUrl) || AVATAR_PRESETS[0];

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
          ? 'პროფილის მონაცემები წარმატებით განახლდა.'
          : 'Profile details updated successfully.'
      );
      setTimeout(() => setProfileSuccessMsg(''), 3500);
    } catch (err) {
      console.error(err);
      setProfileErrorMsg(getAuthErrorMessage(err, lang));
    } finally {
      setSavingProfile(false);
    }
  };

  // Change password with required current password verification
  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!currentPassword || !currentPassword.trim()) {
      setPasswordErrorMsg(
        lang === 'ka'
          ? 'გთხოვთ შეიყვანოთ მიმდინარე (ძველი) პაროლი.'
          : 'Please enter your current password.'
      );
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setPasswordErrorMsg(
        getPasswordValidationMessage(newPassword, lang) ||
        (lang === 'ka'
          ? 'ახალი პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს, დიდ და პატარა ასოებს, და ციფრს ან სიმბოლოს.'
          : 'Password must be at least 8 characters and contain uppercase, lowercase letters, and a number or symbol.')
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg(
        lang === 'ka'
          ? 'შეყვანილი ახალი პაროლები ერთმანეთს არ ემთხვევა.'
          : 'New passwords do not match.'
      );
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordErrorMsg(
        lang === 'ka'
          ? 'ახალი პაროლი უნდა განსხვავდებოდეს ძველი პაროლისგან.'
          : 'New password must be different from current password.'
      );
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(newPassword, currentPassword);
      setPasswordSuccessMsg(
        lang === 'ka'
          ? 'თქვენი პაროლი წარმატებით განახლდა.'
          : 'Your password has been updated successfully.'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(''), 4500);
    } catch (err) {
      console.error(err);
      setPasswordErrorMsg(getAuthErrorMessage(err, lang, 'change-password'));
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

  // User's own inquiries
  const userInquiries = (inquiries || []).filter((inq) => {
    if (!user) return false;
    if (inq.clientEmail && inq.clientEmail.toLowerCase() === user.email?.toLowerCase()) return true;
    if (user.displayName && inq.clientName && inq.clientName.toLowerCase() === user.displayName.toLowerCase()) return true;
    return false;
  });

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${
      darkMode ? 'bg-[#0f0e0d] text-[#e6e2dd]' : 'bg-[#faf8f5] text-[#22201e]'
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

      <main id="main-content" className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Minimal Breadcrumb */}
        <div className="flex items-center gap-2 text-xs opacity-50 mb-8">
          <a
            href={lang === 'en' ? '/en' : '/'}
            className="hover:opacity-100 hover:text-stone-100 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'ka' ? 'მთავარი' : 'Home'}</span>
          </a>
          <span className="opacity-30">/</span>
          <span className="font-medium text-stone-300">
            {lang === 'ka' ? 'პირადი პროფილი' : 'Account'}
          </span>
        </div>

        {/* Auth Check: If not logged in */}
        {!authLoading && !user ? (
          <div className={`p-10 sm:p-14 rounded-3xl border text-center space-y-6 max-w-md mx-auto ${
            darkMode ? 'bg-[#141312] border-white/5 shadow-2xl' : 'bg-white border-stone-200 shadow-xl'
          }`}>
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 text-stone-300 flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-normal">
                {lang === 'ka' ? 'ავტორიზაცია აუცილებელია' : 'Authentication Required'}
              </h2>
              <p className="text-xs opacity-60 leading-relaxed">
                {lang === 'ka'
                  ? 'თქვენი პროფილის, ავატარის და შენახული ნივთების სანახავად გთხოვთ გაიაროთ ავტორიზაცია.'
                  : 'Please sign in to access your profile, avatar preset, and wishlist.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={lang === 'en' ? '/en/login?redirect=/en/profile' : '/login?redirect=/profile'}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-stone-100 hover:bg-white text-stone-950 font-medium text-xs tracking-wider uppercase transition-all shadow-sm"
              >
                {lang === 'ka' ? 'შესვლა' : 'Sign In'}
              </a>
              <a
                href={lang === 'en' ? '/en/register' : '/register'}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-stone-700 hover:border-stone-500 text-xs font-medium tracking-wider uppercase transition-all"
              >
                {lang === 'ka' ? 'რეგისტრაცია' : 'Register'}
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header: Clean, Elegant, Uncluttered Profile Header */}
            <section className={`p-6 sm:p-8 rounded-3xl border transition-all ${
              darkMode
                ? 'bg-[#151413] border-white/5 shadow-lg'
                : 'bg-white border-stone-200 shadow-md'
            }`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5 sm:gap-6">
                  {/* Avatar Display */}
                  <div className="relative shrink-0">
                    <img
                      src={selectedAvatarUrl || user?.photoURL || AVATAR_PRESETS[0].url}
                      alt="Avatar"
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border border-white/15 shadow-sm bg-stone-900"
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-stone-800 border border-white/20 text-stone-200 flex items-center justify-center text-[11px] shadow-sm"
                      title={currentSelectedPreset?.nameKa || 'სიმბოლო'}
                    >
                      💍
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-wide truncate">
                        {displayName.trim() || user?.displayName || user?.email?.split('@')[0]}
                      </h1>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-medium tracking-wider border ${roleInfo.badgeClass}`}>
                        {roleInfo.short}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3.5 text-xs opacity-60">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Mail className="w-3.5 h-3.5 opacity-70" />
                        {user?.email}
                      </span>
                      {user?.metadata?.creationTime && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 opacity-70" />
                          <span>{lang === 'ka' ? 'წევრი:' : 'Joined:'} {formatCreationDate(user.metadata.creationTime)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Action Buttons (Minimal & Subtle) */}
                <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
                  {isStaff && (
                    <a
                      href="/admin"
                      className={`px-4 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                        darkMode
                          ? 'border-white/10 bg-white/5 hover:bg-white/10 text-stone-200 hover:text-white'
                          : 'border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-800'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'ka' ? 'ადმინ პანელი' : 'Admin Panel'}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                      darkMode
                        ? 'border-white/5 bg-transparent text-stone-400 hover:text-red-400 hover:border-red-500/20'
                        : 'border-stone-200 bg-white text-stone-600 hover:text-red-600'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{lang === 'ka' ? 'გასვლა' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>

              {/* Minimal Line Tab Navigation */}
              <div className="flex items-center gap-1 sm:gap-2 mt-8 pt-4 border-t border-white/5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'profile'
                      ? darkMode
                        ? 'bg-white/10 text-stone-100 font-semibold'
                        : 'bg-stone-200 text-stone-900 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5 opacity-70" />
                  <span>{lang === 'ka' ? 'პროფილი & ავატარი' : 'Profile & Avatar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'security'
                      ? darkMode
                        ? 'bg-white/10 text-stone-100 font-semibold'
                        : 'bg-stone-200 text-stone-900 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Key className="w-3.5 h-3.5 opacity-70" />
                  <span>{lang === 'ka' ? 'უსაფრთხოება & პაროლი' : 'Security'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('favorites')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'favorites'
                      ? darkMode
                        ? 'bg-white/10 text-stone-100 font-semibold'
                        : 'bg-stone-200 text-stone-900 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 opacity-70" />
                  <span>{lang === 'ka' ? `რჩეული (${favorites.length})` : `Favorites (${favorites.length})`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('concierge')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium tracking-wide transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'concierge'
                      ? darkMode
                        ? 'bg-white/10 text-stone-100 font-semibold'
                        : 'bg-stone-200 text-stone-900 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 opacity-70" />
                  <span>{lang === 'ka' ? 'კონსიერჟი' : 'Concierge'}</span>
                </button>
              </div>
            </section>

            {/* TAB 1: PROFILE & AVATAR ATELIER (Clean, Compact, Airy) */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-7 ${
                  darkMode ? 'bg-[#151413] border-white/5' : 'bg-white border-stone-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-normal">
                        {lang === 'ka' ? 'პროფილის მონაცემები' : 'Personal Details'}
                      </h3>
                      <p className="text-xs opacity-50 mt-0.5">
                        {lang === 'ka'
                          ? 'აირჩიეთ საიუველირო ავატარი და განაახლეთ თქვენი სახელი.'
                          : 'Select an atelier symbol preset and customize your name.'}
                      </p>
                    </div>
                  </div>

                  {/* Feedback toasts */}
                  {profileSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}
                  {profileErrorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{profileErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-7">
                    {/* Compact Jewelry Avatar Atelier (Original & Clean) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-wider font-medium opacity-70 block">
                          {lang === 'ka' ? 'საიუველირო სიმბოლო (ავატარი):' : 'Atelier Symbol:'}
                        </label>
                        <span className="text-[11px] opacity-40 font-mono">
                          {currentSelectedPreset ? (lang === 'ka' ? currentSelectedPreset.nameKa : currentSelectedPreset.nameEn) : ''}
                        </span>
                      </div>

                      {/* Clean 8-Symbol Tray */}
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 sm:gap-3">
                        {AVATAR_PRESETS.map((preset) => {
                          const isSelected = selectedAvatarUrl === preset.url;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setSelectedAvatarUrl(preset.url)}
                              title={lang === 'ka' ? preset.nameKa : preset.nameEn}
                              className={`relative p-2 rounded-2xl border text-center transition-all group flex flex-col items-center gap-1.5 ${
                                isSelected
                                  ? darkMode
                                    ? 'border-white/50 bg-white/10 ring-1 ring-white/30 scale-105'
                                    : 'border-stone-800 bg-stone-100 ring-1 ring-stone-800/30 scale-105'
                                  : darkMode
                                  ? 'border-white/5 bg-white/2 hover:border-white/20 hover:bg-white/5'
                                  : 'border-stone-200 bg-stone-50 hover:border-stone-400'
                              }`}
                            >
                              <div className="relative">
                                <img
                                  src={preset.url}
                                  alt={preset.nameKa}
                                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-stone-200 text-stone-900 flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-medium opacity-60 line-clamp-1">
                                {lang === 'ka' ? preset.nameKa.split(' ')[0] : preset.nameEn.split(' ')[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Display Name Input */}
                    <div className="space-y-1.5 max-w-md">
                      <label className="text-xs uppercase tracking-wider font-medium opacity-70 block">
                        {lang === 'ka' ? 'თქვენი სახელი (Display Name):' : 'Display Name:'}
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={lang === 'ka' ? 'მაგ: დავით გლონტი' : 'e.g. David Glonti'}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                          darkMode
                            ? 'bg-stone-900/60 border-stone-800 text-white focus:border-stone-500'
                            : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-600'
                        }`}
                      />
                    </div>

                    {/* Readonly Email */}
                    <div className="space-y-1.5 max-w-md">
                      <label className="text-xs uppercase tracking-wider font-medium opacity-70 block">
                        {lang === 'ka' ? 'ელფოსტა:' : 'Registered Email:'}
                      </label>
                      <input
                        type="text"
                        value={user?.email || ''}
                        disabled
                        className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border opacity-50 cursor-not-allowed font-mono ${
                          darkMode ? 'bg-stone-950 border-white/5 text-stone-400' : 'bg-stone-100 border-stone-300 text-stone-600'
                        }`}
                      />
                    </div>

                    {/* Save Button (Refined Luxury Pill) */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className={`px-7 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                          darkMode
                            ? 'bg-stone-100 hover:bg-white text-stone-950 shadow-sm'
                            : 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm'
                        }`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingProfile ? (lang === 'ka' ? 'ინახება...' : 'Saving...') : (lang === 'ka' ? 'შენახვა' : 'Save')}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: SECURITY & PASSWORD CHANGE (Light, Clean) */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                  darkMode ? 'bg-[#151413] border-white/5' : 'bg-white border-stone-200 shadow-sm'
                }`}>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-normal">
                      {lang === 'ka' ? 'პაროლის შეცვლა' : 'Password & Security'}
                    </h3>
                    <p className="text-xs opacity-50 mt-0.5">
                      {lang === 'ka'
                        ? 'განაახლეთ თქვენი ანგარიშის პაროლი (მინიმუმ 6 სიმბოლო).'
                        : 'Update your account password securely (minimum 6 characters).'}
                    </p>
                  </div>

                  {/* Feedback toasts */}
                  {passwordSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{passwordSuccessMsg}</span>
                    </div>
                  )}
                  {passwordErrorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    {/* Current / Old Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider font-medium opacity-70 block">
                        {lang === 'ka' ? 'მიმდინარე (ძველი) პაროლი:' : 'Current Password:'}
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className={`w-full px-4 py-2.5 pr-11 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                            darkMode
                              ? 'bg-stone-900/60 border-stone-800 text-white focus:border-stone-500'
                              : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-600'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                          aria-label="Toggle current password visibility"
                        >
                          {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider font-medium opacity-70 block">
                        {lang === 'ka' ? 'ახალი პაროლი (მინ. 8 სიმბოლო):' : 'New Password (min. 8 chars):'}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className={`w-full px-4 py-2.5 pr-11 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                            darkMode
                              ? 'bg-stone-900/60 border-stone-800 text-white focus:border-stone-500'
                              : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-600'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                          aria-label="Toggle new password visibility"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <PasswordStrengthIndicator password={newPassword} lang={lang} darkMode={darkMode} />
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-wider font-medium opacity-70 block">
                        {lang === 'ka' ? 'გაიმეორეთ ახალი პაროლი:' : 'Confirm New Password:'}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className={`w-full px-4 py-2.5 pr-11 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                            darkMode
                              ? 'bg-stone-900/60 border-stone-800 text-white focus:border-stone-500'
                              : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-600'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                        className={`px-7 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 ${
                          darkMode
                            ? 'bg-stone-100 hover:bg-white text-stone-950 shadow-sm'
                            : 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm'
                        }`}
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>{savingPassword ? (lang === 'ka' ? 'მოწმდება...' : 'Verifying...') : (lang === 'ka' ? 'პაროლის განახლება' : 'Update Password')}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 3: WISHLIST / SAVED */}
            {activeTab === 'favorites' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                  darkMode ? 'bg-[#151413] border-white/5' : 'bg-white border-stone-200 shadow-sm'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-500/10">
                    <div>
                      <h3 className="font-serif text-lg sm:text-2xl font-normal flex items-center gap-2.5">
                        <Heart className="w-5 h-5 text-amber-500 fill-amber-500/30" />
                        <span>
                          {lang === 'ka'
                            ? `თქვენი რჩეული სამკაულები (${favoriteProducts.length})`
                            : `Saved Jewelry (${favoriteProducts.length})`}
                        </span>
                      </h3>
                      <p className="text-xs opacity-60 mt-1">
                        {lang === 'ka'
                          ? 'შენახული სამკაულები სინქრონიზებულია თქვენს ანგარიშთან. აქედანვე შეგიძლიათ დეტალების ნახვა ან შედარება.'
                          : 'Your wishlist is saved with your account. You can explore or compare directly from here.'}
                      </p>
                    </div>

                    <a
                      href={lang === 'en' ? '/en/catalog' : '/catalog'}
                      className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-2 transition-all shadow-xs ${
                        darkMode
                          ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/10'
                          : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
                      }`}
                    >
                      <span>{lang === 'ka' ? 'კატალოგის დათვალიერება' : 'Browse Catalog'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {favoriteProducts.length === 0 ? (
                    <div className="py-14 px-6 text-center rounded-2xl border border-dashed border-stone-500/20 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                        <Gem className="w-6 h-6 opacity-75" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-base sm:text-lg font-medium">
                          {lang === 'ka' ? 'თქვენს რჩეულებში ჯერ არაფერია დამატებული' : 'Your wishlist is empty'}
                        </h4>
                        <p className="text-xs opacity-60 max-w-md mx-auto leading-relaxed">
                          {lang === 'ka'
                            ? 'დაათვალიერეთ ჩვენი ექსკლუზიური კოლექცია და შეინახეთ სასურველი სამკაული გულის ხატულაზე დაჭერით.'
                            : 'Explore our fine jewelry collection and save your favorite pieces by clicking the heart icon.'}
                        </p>
                      </div>
                      <div className="pt-2">
                        <a
                          href={lang === 'en' ? '/en/catalog' : '/catalog'}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all active:scale-95"
                        >
                          <span>{lang === 'ka' ? 'კოლექციის ნახვა' : 'Browse Collection'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Direct Grid of Saved Products */}
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                        {favoriteProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onClick={(p) => navigateTo(`/product/${p.id}`)}
                            showDetailsButton={true}
                          />
                        ))}
                      </div>

                      {/* Footer Info Strip */}
                      <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-center justify-between gap-3 ${
                        darkMode ? 'border-white/5 bg-white/2 text-stone-300' : 'border-stone-200 bg-stone-50 text-stone-700'
                      }`}>
                        <span className="font-medium">
                          {lang === 'ka'
                            ? `სულ: ${favoriteProducts.length} რჩეული სამკაული`
                            : `Total: ${favoriteProducts.length} saved item(s)`}
                        </span>
                        <a
                          href={lang === 'en' ? '/en/catalog' : '/catalog'}
                          className="text-amber-500 hover:text-amber-400 font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <span>{lang === 'ka' ? '+ სხვა სამკაულების დამატება' : '+ Add more pieces'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: CONCIERGE & SUPPORT */}
            {activeTab === 'concierge' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                  darkMode ? 'bg-[#151413] border-white/5' : 'bg-white border-stone-200 shadow-sm'
                }`}>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-normal">
                      {lang === 'ka' ? 'პერსონალური კონსიერჟი' : 'Concierge & Service'}
                    </h3>
                    <p className="text-xs opacity-50 mt-0.5">
                      {lang === 'ka'
                        ? 'ინდივიდუალური კონსულტაცია და ექსკლუზიური შეკვეთები.'
                        : 'Direct contact with our jewelry salon consultant.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* WhatsApp Direct Chat */}
                    {siteSettings.whatsapp && (
                      <a
                        href={`https://wa.me/${siteSettings.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                          darkMode
                            ? 'bg-stone-900/40 border-white/5 hover:border-white/20'
                            : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-semibold text-emerald-400">
                            WhatsApp Concierge
                          </span>
                          <h4 className="font-serif text-sm font-medium">
                            {lang === 'ka' ? 'პირადი კონსულტანტი' : 'Personal Consultant'}
                          </h4>
                          <p className="text-xs opacity-50 font-mono">
                            {siteSettings.whatsapp}
                          </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                      </a>
                    )}

                    {/* Phone direct */}
                    {siteSettings.phone && (
                      <a
                        href={`tel:${siteSettings.phone}`}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                          darkMode
                            ? 'bg-stone-900/40 border-white/5 hover:border-white/20'
                            : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-semibold text-stone-400">
                            {lang === 'ka' ? 'შოურუმი' : 'Showroom'}
                          </span>
                          <h4 className="font-serif text-sm font-medium">
                            {lang === 'ka' ? 'ცხელი ხაზი' : 'Hotline'}
                          </h4>
                          <p className="text-xs opacity-50 font-mono">
                            {siteSettings.phone}
                          </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-stone-300 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Size guide shortcut */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    darkMode ? 'bg-stone-900/30 border-white/5' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div>
                      <h4 className="text-xs font-medium">
                        {lang === 'ka' ? 'თითის ზომის დადგენა (კალკულატორი)' : 'Ring Size Guide'}
                      </h4>
                      <p className="text-[11px] opacity-50">
                        {lang === 'ka'
                          ? 'ეკრანის კალიბრაციით თქვენი ზუსტი ზომის გასაგებად.'
                          : 'Interactive on-screen ring measuring tool.'}
                      </p>
                    </div>
                    <a
                      href={lang === 'en' ? '/en/size-guide' : '/size-guide'}
                      className="px-3.5 py-1.5 rounded-full border border-stone-700 hover:border-stone-500 text-xs font-medium transition-all shrink-0"
                    >
                      {lang === 'ka' ? 'ზომის გიდი' : 'Size Guide'}
                    </a>
                  </div>

                  {/* User's recent inquiries (if any) */}
                  {userInquiries.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider opacity-60">
                        {lang === 'ka' ? 'თქვენი გაგზავნილი მოთხოვნები:' : 'Inquiries History:'}
                      </h4>
                      <div className="space-y-2">
                        {userInquiries.map((inq) => (
                          <div
                            key={inq.id}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                              darkMode ? 'bg-stone-900/40 border-white/5' : 'bg-stone-50 border-stone-200'
                            }`}
                          >
                            <div>
                              <span className="font-medium">{inq.productName} ({inq.sku})</span>
                              {inq.size && <span className="opacity-50"> • ზომა: {inq.size}</span>}
                            </div>
                            <span className="opacity-40 text-[11px] font-mono">{inq.date}</span>
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

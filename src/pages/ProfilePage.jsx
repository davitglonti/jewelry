// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  User, ShieldCheck, Heart, Key, LogOut,
  Save, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft,
  ExternalLink, Calendar, Mail, Phone, MessageCircle, ChevronRight, Check, Gem, ShoppingBag,
  Truck, Package, Sparkles
} from 'lucide-react';
import { useAuth, getAuthErrorMessage } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { AVATAR_PRESETS } from '../data/avatarPresets';
import { navigateTo } from '../utils/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FavoritesModal from '../components/modals/FavoritesModal';
import QuickBuyModal from '../components/modals/QuickBuyModal';
import ProductCard from '../components/store/ProductCard';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import OrderTrackingTimeline from '../components/order/OrderTrackingTimeline';
import { isStrongPassword, getPasswordValidationMessage } from '../utils/passwordValidation';

export default function ProfilePage() {
  const { darkMode, setDarkMode, lang, setLang, siteSettings, favorites, inquiries, products } = useStore();
  const { user, userRole, loading: authLoading, updateUserProfile, changePassword, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedForBuy, setSelectedForBuy] = useState([]);

  // Active navigation tab with URL search params synchronization
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('tab');
      if (p && ['profile', 'orders', 'security', 'favorites', 'concierge'].includes(p)) return p;
    }
    return 'profile';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (tabId === 'profile') url.searchParams.delete('tab');
      else url.searchParams.set('tab', tabId);
      window.history.pushState({ tab: tabId }, '', url.toString());
    }
  };

  useEffect(() => {
    const onPopState = () => {
      const p = new URLSearchParams(window.location.search).get('tab');
      setActiveTab(p && ['profile', 'orders', 'security', 'favorites', 'concierge'].includes(p) ? p : 'profile');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Profile Edit State
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [showAvatarTray, setShowAvatarTray] = useState(false);

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

  const isGoogleUser = Boolean(user?.providerData?.some((p) => p.providerId === 'google.com'));

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
      badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      desc: lang === 'ka' ? 'რეგისტრირებული მომხმარებელი' : 'Registered Member'
    };
  };

  const roleInfo = getRoleDetails();
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

  // User's own inquiries & orders
  const userInquiries = useMemo(() => {
    return (inquiries || []).filter((inq) => {
      if (!user) return false;
      if (inq.clientEmail && inq.clientEmail.toLowerCase() === user.email?.toLowerCase()) return true;
      if (user.displayName && inq.clientName && inq.clientName.toLowerCase() === user.displayName.toLowerCase()) return true;
      return false;
    });
  }, [inquiries, user]);

  const userOrders = useMemo(() => {
    let local = [];
    try {
      if (typeof window !== 'undefined') {
        local = JSON.parse(localStorage.getItem('matare_orders') || '[]');
      }
    } catch {
      local = [];
    }

    const map = new Map();
    userInquiries.forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });
    local.forEach((item) => {
      if (item && item.id) {
        if (!map.has(item.id)) {
          const liveMatch = (inquiries || []).find((inq) => inq.id === item.id);
          map.set(item.id, liveMatch || item);
        }
      }
    });

    return Array.from(map.values());
  }, [inquiries, user, userInquiries]);

  // Derived user primary display name
  const primaryName = displayName.trim() || user?.displayName || user?.email?.split('@')[0] || 'Member';

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${
      darkMode ? 'bg-[#0b0a09] text-[#f7f5f0]' : 'bg-[#faf8f5] text-[#1c1917]'
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
        {/* Minimal Luxury Breadcrumb */}
        <div className="flex items-center gap-2 text-xs opacity-50 mb-6">
          <a
            href={lang === 'en' ? '/en' : '/'}
            className="hover:opacity-100 hover:text-amber-500 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'ka' ? 'მთავარი' : 'Home'}</span>
          </a>
          <span className="opacity-30">/</span>
          <span className="font-medium text-stone-300">
            {lang === 'ka' ? 'პირადი კაბინეტი' : 'Client Suite'}
          </span>
        </div>

        {/* Auth Check: If not logged in */}
        {!authLoading && !user ? (
          <div className={`p-10 sm:p-14 rounded-3xl border text-center space-y-6 max-w-md mx-auto ${
            darkMode ? 'bg-[#131211] border-stone-800 shadow-2xl' : 'bg-white border-stone-200 shadow-xl'
          }`}>
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-normal">
                {lang === 'ka' ? 'ავტორიზაცია აუცილებელია' : 'Authentication Required'}
              </h2>
              <p className="text-xs opacity-60 leading-relaxed">
                {lang === 'ka'
                  ? 'თქვენი შეკვეთების, თრექინგის და რჩეული სამკაულების სანახავად გთხოვთ გაიაროთ ავტორიზაცია.'
                  : 'Please sign in to access your orders, live tracking, and saved jewelry.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={lang === 'en' ? '/en/login?redirect=/en/profile' : '/login?redirect=/profile'}
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-md"
              >
                {lang === 'ka' ? 'შესვლა' : 'Sign In'}
              </a>
              <a
                href={lang === 'en' ? '/en/register' : '/register'}
                className="w-full sm:w-auto px-7 py-3 rounded-full border border-stone-700 hover:border-stone-500 text-xs font-semibold tracking-wider uppercase transition-all"
              >
                {lang === 'ka' ? 'რეგისტრაცია' : 'Register'}
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header: Quiet Luxury Client Suite Header */}
            <section className={`p-6 sm:p-8 rounded-3xl border transition-all ${
              darkMode
                ? 'bg-[#131211] border-stone-800/90 shadow-2xl'
                : 'bg-white border-stone-200 shadow-lg'
            }`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5 sm:gap-6">
                  {/* Avatar Display */}
                  <div className="relative shrink-0">
                    <img
                      src={selectedAvatarUrl || user?.photoURL || AVATAR_PRESETS[0].url}
                      alt="Avatar"
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-500/40 shadow-lg bg-stone-900"
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1c1a17] border border-amber-500/40 text-amber-400 flex items-center justify-center text-xs shadow-md"
                      title={currentSelectedPreset?.nameKa || 'სიმბოლო'}
                    >
                      ✦
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-wide truncate">
                        {primaryName}
                      </h1>
                      <span className={`px-3 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-widest border ${roleInfo.badgeClass}`}>
                        {roleInfo.short}
                      </span>
                      {isGoogleUser && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border border-blue-500/30 bg-blue-500/10 text-blue-300">
                          <svg className="w-3 h-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.36 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.43l4.02-3.14z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.26 6.57l4.02 3.14c.95-2.83 3.6-4.96 6.72-4.96z"/>
                          </svg>
                          Google
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3.5 text-xs opacity-65">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Mail className="w-3.5 h-3.5 opacity-70" />
                        {user?.email}
                      </span>
                      {user?.metadata?.creationTime && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 opacity-70" />
                          <span>{lang === 'ka' ? 'რეგისტრაცია:' : 'Member since:'} {formatCreationDate(user.metadata.creationTime)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
                  {isStaff && (
                    <a
                      href="/admin"
                      className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all ${
                        darkMode
                          ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-400'
                          : 'border-amber-400 bg-amber-50 hover:bg-amber-500 hover:text-black text-amber-900'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{lang === 'ka' ? 'ადმინ პანელი' : 'Admin Panel'}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`px-4 py-2 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all ${
                      darkMode
                        ? 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-red-400 hover:border-red-500/30'
                        : 'border-stone-200 bg-stone-100 text-stone-600 hover:text-red-600'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{lang === 'ka' ? 'გასვლა' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-stone-800/80">
                <button
                  type="button"
                  onClick={() => handleSelectTab('orders')}
                  className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeTab === 'orders'
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : darkMode ? 'border-stone-800/60 bg-stone-900/40 hover:border-stone-700' : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider text-amber-500 block mb-1 font-medium">
                    {lang === 'ka' ? 'შეკვეთები' : 'Orders'}
                  </span>
                  <span className="font-serif text-xl sm:text-2xl font-normal block">
                    {userOrders.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('favorites')}
                  className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeTab === 'favorites'
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : darkMode ? 'border-stone-800/60 bg-stone-900/40 hover:border-stone-700' : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider text-amber-500 block mb-1 font-medium">
                    {lang === 'ka' ? 'რჩეული' : 'Wishlist'}
                  </span>
                  <span className="font-serif text-xl sm:text-2xl font-normal block">
                    {favorites.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('profile')}
                  className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : darkMode ? 'border-stone-800/60 bg-stone-900/40 hover:border-stone-700' : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider text-amber-500 block mb-1 font-medium">
                    {lang === 'ka' ? 'სტატუსი' : 'Status'}
                  </span>
                  <span className="text-xs sm:text-sm font-medium block truncate text-emerald-400">
                    {lang === 'ka' ? 'აქტიური წევრი' : 'Active Member'}
                  </span>
                </button>
              </div>

              {/* Minimal Line Tab Navigation */}
              <div className="flex items-center gap-1.5 sm:gap-2 mt-6 pt-5 border-t border-stone-800/80 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => handleSelectTab('profile')}
                  className={`px-4 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                      : darkMode
                      ? 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'პირადი პროფილი' : 'Personal Details'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('orders')}
                  className={`px-4 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                      : darkMode
                      ? 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? `ჩემი შეკვეთები (${userOrders.length})` : `Orders (${userOrders.length})`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('security')}
                  className={`px-4 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    activeTab === 'security'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                      : darkMode
                      ? 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'უსაფრთხოება' : 'Security'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('favorites')}
                  className={`px-4 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    activeTab === 'favorites'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                      : darkMode
                      ? 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? `რჩეული (${favorites.length})` : `Wishlist (${favorites.length})`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('concierge')}
                  className={`px-4 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    activeTab === 'concierge'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                      : darkMode
                      ? 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'კონსიერჟი' : 'Concierge'}</span>
                </button>
              </div>
            </section>

            {/* TAB 1: PROFILE DETAILS & AVATAR ATELIER */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-7 ${
                  darkMode ? 'bg-[#131211] border-stone-800/90' : 'bg-white border-stone-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-normal">
                        {lang === 'ka' ? 'პირადი მონაცემები' : 'Personal Details'}
                      </h3>
                      <p className="text-xs opacity-60 mt-0.5">
                        {lang === 'ka'
                          ? 'განაახლეთ თქვენი სახელი და საიუველირო ავატარი'
                          : 'Update your name and signature jewelry avatar'}
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

                  {isGoogleUser && (
                    <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] flex items-center gap-3 text-xs">
                      <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="opacity-80">
                        {lang === 'ka'
                          ? `თქვენი ანგარიში დაკავშირებულია Google-თან (${user?.email}). პროფილის მონაცემები სინქრონიზებულია.`
                          : `Your account is connected to Google (${user?.email}). Profile information is synchronized.`}
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Compact Jewelry Avatar Atelier */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-wider font-semibold opacity-70 block">
                          {lang === 'ka' ? 'საიუველირო ავატარი:' : 'Atelier Symbol:'}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAvatarTray(!showAvatarTray)}
                          className="text-xs text-amber-500 hover:text-amber-400 font-medium underline underline-offset-4"
                        >
                          {showAvatarTray ? (lang === 'ka' ? 'დახურვა' : 'Close') : (lang === 'ka' ? 'სიმბოლოს შეცვლა' : 'Change Symbol')}
                        </button>
                      </div>

                      {/* Active Avatar Badge */}
                      <div className="flex items-center gap-3 p-3 rounded-2xl border border-stone-800 bg-stone-900/40">
                        <img
                          src={selectedAvatarUrl}
                          alt="Selected"
                          className="w-12 h-12 rounded-full object-cover border border-amber-500/50"
                        />
                        <div>
                          <p className="text-xs font-semibold text-amber-400 font-serif">
                            {currentSelectedPreset ? (lang === 'ka' ? currentSelectedPreset.nameKa : currentSelectedPreset.nameEn) : 'სიმბოლო'}
                          </p>
                          <p className="text-[11px] opacity-60">
                            {lang === 'ka' ? 'ექსკლუზიური საიუველირო ემბლემა' : 'Exclusive fine jewelry signature'}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Symbols Tray */}
                      {showAvatarTray && (
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 pt-2 animate-fadeIn">
                          {AVATAR_PRESETS.map((preset) => {
                            const isSelected = selectedAvatarUrl === preset.url;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setSelectedAvatarUrl(preset.url);
                                  setShowAvatarTray(false);
                                }}
                                title={lang === 'ka' ? preset.nameKa : preset.nameEn}
                                className={`relative p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                                  isSelected
                                    ? 'border-amber-500 bg-amber-500/15 ring-2 ring-amber-500/30 scale-105'
                                    : darkMode
                                    ? 'border-stone-800 bg-stone-900/40 hover:border-stone-700'
                                    : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                                }`}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.nameKa}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="text-[9px] font-medium opacity-70 truncate max-w-full">
                                  {lang === 'ka' ? preset.nameKa.split(' ')[0] : preset.nameEn.split(' ')[0]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Display Name Input */}
                    <div className="space-y-1.5 max-w-md">
                      <label className="text-xs uppercase tracking-wider font-semibold opacity-70 block">
                        {lang === 'ka' ? 'თქვენი სახელი (Display Name):' : 'Display Name:'}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder={lang === 'ka' ? 'მაგ: დავით გლონტი' : 'e.g. David Glonti'}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                            darkMode
                              ? 'bg-stone-900/60 border-stone-800 text-white focus:border-amber-500'
                              : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Readonly Email */}
                    <div className="space-y-1.5 max-w-md">
                      <label className="text-xs uppercase tracking-wider font-semibold opacity-70 block">
                        {lang === 'ka' ? 'ელფოსტა:' : 'Registered Email:'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                        <input
                          type="text"
                          value={user?.email || ''}
                          disabled
                          className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm border opacity-60 cursor-not-allowed font-mono ${
                            darkMode ? 'bg-stone-950 border-stone-800 text-stone-400' : 'bg-stone-100 border-stone-300 text-stone-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingProfile ? (lang === 'ka' ? 'ინახება...' : 'Saving...') : (lang === 'ka' ? 'ცვლილებების შენახვა' : 'Save Changes')}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: ORDERS & TRACKING */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                  darkMode ? 'bg-[#131211] border-stone-800/90' : 'bg-white border-stone-200 shadow-sm'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
                    <div>
                      <h3 className="font-serif text-lg sm:text-2xl font-normal flex items-center gap-2">
                        <Truck className="w-5 h-5 text-amber-500" />
                        <span>{lang === 'ka' ? 'ჩემი შეკვეთები & თრექინგი' : 'My Orders & Tracking'}</span>
                      </h3>
                      <p className="text-xs opacity-60 mt-0.5">
                        {lang === 'ka'
                          ? 'აკონტროლეთ ნაკეთობის დამზადების ეტაპი, კონდიცია, კურიერის სტატუსი და მიწოდების სავარაუდო დრო რეალურ დროში.'
                          : 'Monitor atelier craftsmanship, item condition inspection, and live delivery status.'}
                      </p>
                    </div>

                    <a
                      href={lang === 'en' ? '/en/track' : '/track'}
                      className="px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>{lang === 'ka' ? 'კოდით თრექინგი' : 'Track by Code'}</span>
                    </a>
                  </div>

                  {userOrders.length === 0 ? (
                    <div className="text-center py-14 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                        <Package className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-base sm:text-lg font-normal">
                          {lang === 'ka' ? 'აქტიური შეკვეთები არ გაქვთ' : 'No Active Orders Yet'}
                        </h4>
                        <p className="text-xs opacity-50 max-w-sm mx-auto">
                          {lang === 'ka'
                            ? 'თქვენ მიერ შეძენილი სამკაულების სრული ისტორია და მიწოდების სტატუსი გამოჩნდება აქ.'
                            : 'All your jewelry orders and their delivery progress will appear here.'}
                        </p>
                      </div>
                      <a
                        href={lang === 'en' ? '/en/catalog' : '/catalog'}
                        className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{lang === 'ka' ? 'კოლექციის დათვალიერება' : 'Explore Collection'}</span>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {userOrders.map((order) => (
                        <OrderTrackingTimeline
                          key={order.id}
                          order={order}
                          darkMode={darkMode}
                          lang={lang}
                          siteSettings={siteSettings}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                  darkMode ? 'bg-[#131211] border-stone-800/90' : 'bg-white border-stone-200 shadow-sm'
                }`}>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-normal">
                      {lang === 'ka' ? 'უსაფრთხოება & პაროლი' : 'Password & Security'}
                    </h3>
                    <p className="text-xs opacity-60 mt-0.5">
                      {lang === 'ka'
                        ? 'განაახლეთ თქვენი ანგარიშის პაროლი და უსაფრთხოების პარამეტრები'
                        : 'Update your account password and security settings securely.'}
                    </p>
                  </div>

                  {isGoogleUser ? (
                    <div className="p-6 rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] space-y-3">
                      <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm">
                        <ShieldCheck className="w-5 h-5 text-amber-500" />
                        <span>{lang === 'ka' ? 'თქვენი ანგარიში დაცულია Google OAuth-ით' : 'Account Secured by Google'}</span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed">
                        {lang === 'ka'
                          ? 'თქვენი ანგარიში დაკავშირებულია Google-ის ოფიციალურ სისტემასთან. პაროლის შეცვლა არ არის საჭირო — ავტორიზაცია ყოველთვის ხორციელდება უსაფრთხოდ Google-ის ერთი დაწკაპებით.'
                          : 'Your account is authenticated via Google. Password changes are managed securely by your Google Account.'}
                      </p>
                    </div>
                  ) : (
                    <>
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
                          <label className="text-xs uppercase tracking-wider font-semibold opacity-70 block">
                            {lang === 'ka' ? 'მიმდინარე (ძველი) პაროლი:' : 'Current Password:'}
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                              className={`w-full px-4 py-3 pr-11 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                                darkMode
                                  ? 'bg-stone-900/60 border-stone-800 text-white focus:border-amber-500'
                                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                              aria-label="Toggle current password visibility"
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                          <label className="text-xs uppercase tracking-wider font-semibold opacity-70 block">
                            {lang === 'ka' ? 'ახალი პაროლი (მინ. 8 სიმბოლო):' : 'New Password:'}
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                              className={`w-full px-4 py-3 pr-11 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                                darkMode
                                  ? 'bg-stone-900/60 border-stone-800 text-white focus:border-amber-500'
                                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                              aria-label="Toggle new password visibility"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          <PasswordStrengthIndicator password={newPassword} lang={lang} darkMode={darkMode} />
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-1.5">
                          <label className="text-xs uppercase tracking-wider font-semibold opacity-70 block">
                            {lang === 'ka' ? 'გაიმეორეთ ახალი პაროლი:' : 'Confirm New Password:'}
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                              className={`w-full px-4 py-3 pr-11 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                                darkMode
                                  ? 'bg-stone-900/60 border-stone-800 text-white focus:border-amber-500'
                                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                              aria-label="Toggle confirm password visibility"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                            className="px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-40 cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>{savingPassword ? (lang === 'ka' ? 'მოწმდება...' : 'Verifying...') : (lang === 'ka' ? 'პაროლის განახლება' : 'Update Password')}</span>
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: WISHLIST / SAVED */}
            {activeTab === 'favorites' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                  darkMode ? 'bg-[#131211] border-stone-800/90' : 'bg-white border-stone-200 shadow-sm'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
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
                          ? 'შენახული სამკაულები სინქრონიზებულია თქვენს ანგარიშთან. აქედანვე შეგიძლიათ დეტალების ნახვა ან შეძენა.'
                          : 'Your wishlist is saved with your account. You can explore or purchase directly.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {favoriteProducts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const prefix = lang === 'en' ? '/en' : '';
                            navigateTo(`${prefix}/checkout?from=favorites`);
                          }}
                          className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{lang === 'ka' ? 'რჩეულების შეძენა' : 'Buy Saved Items'}</span>
                        </button>
                      )}

                      <a
                        href={lang === 'en' ? '/en/catalog' : '/catalog'}
                        className={`px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-2 transition-all ${
                          darkMode
                            ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                        }`}
                      >
                        <span>{lang === 'ka' ? 'კატალოგი' : 'Catalog'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {favoriteProducts.length === 0 ? (
                    <div className="py-14 px-6 text-center rounded-2xl border border-dashed border-stone-800 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                        <Gem className="w-6 h-6 opacity-75" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-base sm:text-lg font-normal">
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
                          className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all active:scale-95"
                        >
                          <span>{lang === 'ka' ? 'კოლექციის ნახვა' : 'Browse Collection'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
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
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: CONCIERGE & PRIVATE CONSULTATION */}
            {activeTab === 'concierge' && (
              <div className="space-y-6 animate-fadeIn">
                <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
                  darkMode ? 'bg-[#131211] border-stone-800/90' : 'bg-white border-stone-200 shadow-sm'
                }`}>
                  <div className="pb-4 border-b border-stone-800">
                    <h3 className="font-serif text-lg sm:text-2xl font-normal flex items-center gap-2.5">
                      <MessageCircle className="w-5 h-5 text-amber-500" />
                      <span>{lang === 'ka' ? 'პირადი საიუველირო კონსიერჟი' : 'Private Jewelry Concierge'}</span>
                    </h3>
                    <p className="text-xs opacity-60 mt-1">
                      {lang === 'ka'
                        ? 'ინდივიდუალური შეკვეთა, ზომის მორგება, ბუნებრივი ბრილიანტების სერტიფიკაცია და საიუველირო ექსპერტის პირდაპირი კონსულტაცია.'
                        : 'Custom bespoke pieces, resizing, certified diamond consultation, and dedicated client service.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* WhatsApp Direct */}
                    <a
                      href={`https://wa.me/${(siteSettings.whatsapp || '+995599000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('გამარჯობა, მატარეს პირადი კაბინეტიდან გიკავშირდებით კონსულტაციისთვის.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all group ${
                        darkMode ? 'border-stone-800 bg-stone-900/40 hover:border-emerald-500/50' : 'border-stone-200 bg-stone-50 hover:border-emerald-500'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-400">WhatsApp Concierge</p>
                          <p className="text-xs opacity-60 font-mono">{siteSettings.whatsapp || '+995 599 00 00 00'}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:text-emerald-400 transition-all" />
                    </a>

                    {/* Direct Call */}
                    <a
                      href={`tel:${(siteSettings.phone || '+995599000000').replace(/[^0-9+]/g, '')}`}
                      className={`p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all group ${
                        darkMode ? 'border-stone-800 bg-stone-900/40 hover:border-amber-500/50' : 'border-stone-200 bg-stone-50 hover:border-amber-500'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-400">{lang === 'ka' ? 'პირდაპირი ზარი' : 'Direct Call'}</p>
                          <p className="text-xs opacity-60 font-mono">{siteSettings.phone || '+995 599 00 00 00'}</p>
                        </div>
                      </div>
                      <Phone className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:text-amber-400 transition-all" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />

      {/* Modals */}
      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        favorites={favorites}
        products={products}
        darkMode={darkMode}
        lang={lang}
      />

      <QuickBuyModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        products={selectedForBuy}
        darkMode={darkMode}
        lang={lang}
        siteSettings={siteSettings}
      />
    </div>
  );
}

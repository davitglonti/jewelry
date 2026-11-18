// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  User, ShieldCheck, Heart, Key, LogOut,
  Save, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft,
  ExternalLink, Calendar, Mail, Phone, MessageCircle, ChevronRight, Check, Gem, ShoppingBag,
  Truck, Package
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
  const [selectedForBuy] = useState([]);

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

  const [displayName, setDisplayName] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [showAvatarTray, setShowAvatarTray] = useState(false);

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

  const favoriteProducts = useMemo(() => {
    if (!products || !favorites || favorites.length === 0) return [];
    return products.filter((p) => favorites.includes(p.id) || (p.sku && favorites.includes(p.sku)));
  }, [products, favorites]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setSelectedAvatarUrl(user.photoURL || AVATAR_PRESETS[0].url);
    }
  }, [user]);

  const formatCreationDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US', {
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
    if (userRole === 'superadmin') return { short: 'SUPER ADMIN', badgeClass: 'bg-[#141311] text-white border-[#141311]' };
    if (userRole === 'admin') return { short: 'ADMIN', badgeClass: 'bg-[#141311] text-white border-[#141311]' };
    if (userRole === 'moderator') return { short: 'MODERATOR', badgeClass: 'bg-[#F8F6F2] text-[#141311] border-[#D6CFC4]' };
    return { short: 'MEMBER', badgeClass: 'bg-[#FAF7F0] text-[#9D7B48] border-[#DFD4C2]' };
  };

  const roleInfo = getRoleDetails();
  const currentSelectedPreset = AVATAR_PRESETS.find((p) => p.url === selectedAvatarUrl) || AVATAR_PRESETS[0];

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    setProfileErrorMsg('');
    setProfileSuccessMsg('');
    try {
      await updateUserProfile({ displayName: displayName.trim(), photoURL: selectedAvatarUrl });
      setProfileSuccessMsg(lang === 'ka' ? 'პროფილის მონაცემები წარმატებით განახლდა.' : 'Profile details updated successfully.');
      setTimeout(() => setProfileSuccessMsg(''), 3500);
    } catch (err) {
      console.error(err);
      setProfileErrorMsg(getAuthErrorMessage(err, lang));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!currentPassword || !currentPassword.trim()) {
      setPasswordErrorMsg(lang === 'ka' ? 'გთხოვთ შეიყვანოთ მიმდინარე (ძველი) პაროლი.' : 'Please enter your current password.');
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setPasswordErrorMsg(
        getPasswordValidationMessage(newPassword, lang) ||
        (lang === 'ka' ? 'პაროლი არ აკმაყოფილებს უსაფრთხოების მოთხოვნებს.' : 'Password does not meet security requirements.')
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg(lang === 'ka' ? 'შეყვანილი ახალი პაროლები ერთმანეთს არ ემთხვევა.' : 'New passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordErrorMsg(lang === 'ka' ? 'ახალი პაროლი უნდა განსხვავდებოდეს ძველი პაროლისგან.' : 'New password must be different.');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(newPassword, currentPassword);
      setPasswordSuccessMsg(lang === 'ka' ? 'თქვენი პაროლი წარმატებით განახლდა.' : 'Your password has been updated successfully.');
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
    userInquiries.forEach((item) => { if (item && item.id) map.set(item.id, item); });
    local.forEach((item) => {
      if (item && item.id && !map.has(item.id)) {
        const liveMatch = (inquiries || []).find((inq) => inq.id === item.id);
        map.set(item.id, liveMatch || item);
      }
    });
    return Array.from(map.values());
  }, [inquiries, user, userInquiries]);

  const primaryName = displayName.trim() || user?.displayName || user?.email?.split('@')[0] || 'Member';
  const inputClass =
    'w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#DCD6CC] focus:border-[#141311] text-[#141311] placeholder-[#9C958B] outline-none transition-colors';

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FAF9F6] text-[#141311]">
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

      <main id="main-content" className="pt-[136px] sm:pt-[152px] pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#847E75] mb-8">
          <a href={lang === 'en' ? '/en' : '/'} className="hover:text-[#141311] transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{lang === 'ka' ? 'მთავარი' : 'Home'}</span>
          </a>
          <span>/</span>
          <span className="text-[#141311]">{lang === 'ka' ? 'პირადი კაბინეტი' : 'Client Suite'}</span>
        </div>

        {!authLoading && !user ? (
          <div className="p-10 sm:p-14 bg-white border border-[#E8E3DB] text-center space-y-6 max-w-md mx-auto">
            <User className="w-8 h-8 text-[#9D7B48] mx-auto stroke-[1.25]" />
            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-light">{lang === 'ka' ? 'ავტორიზაცია აუცილებელია' : 'Authentication Required'}</h2>
              <p className="text-xs text-[#5C574F] leading-relaxed font-light">
                {lang === 'ka'
                  ? 'თქვენი შეკვეთების, თრექინგის და რჩეული სამკაულების სანახავად გთხოვთ გაიაროთ ავტორიზაცია.'
                  : 'Please sign in to access your orders, live tracking, and saved jewelry.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={lang === 'en' ? '/en/login?redirect=/en/profile' : '/login?redirect=/profile'}
                className="w-full sm:w-auto px-7 py-3 bg-[#141311] text-white text-[11px] tracking-[0.18em] uppercase"
              >
                {lang === 'ka' ? 'შესვლა' : 'Sign In'}
              </a>
              <a
                href={lang === 'en' ? '/en/register' : '/register'}
                className="w-full sm:w-auto px-7 py-3 border border-[#141311] text-[#141311] text-[11px] tracking-[0.18em] uppercase"
              >
                {lang === 'ka' ? 'რეგისტრაცია' : 'Register'}
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Client Suite Header Card */}
            <section className="p-6 sm:p-9 bg-white border border-[#E8E3DB]">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <img
                    src={selectedAvatarUrl || user?.photoURL || AVATAR_PRESETS[0].url}
                    alt="Avatar"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-[#E8E3DB] bg-[#F4F1EC]"
                  />

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#141311] truncate">
                        {primaryName}
                      </h1>
                      <span className={`px-2.5 py-0.5 text-[9px] uppercase tracking-[0.18em] border ${roleInfo.badgeClass}`}>
                        {roleInfo.short}
                      </span>
                      {isGoogleUser && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] border border-[#E8E3DB] bg-[#FAF9F6] text-[#4A4640]">
                          Google
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#5C574F]">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Mail className="w-3.5 h-3.5 text-[#9D7B48] stroke-[1.5]" />
                        {user?.email}
                      </span>
                      {user?.metadata?.creationTime && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#9D7B48] stroke-[1.5]" />
                          <span>{lang === 'ka' ? 'რეგისტრაცია:' : 'Member since:'} {formatCreationDate(user.metadata.creationTime)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
                  {isStaff && (
                    <a
                      href="/admin"
                      className="px-4 py-2.5 bg-[#141311] text-white hover:bg-[#2C2A26] text-[10px] uppercase tracking-[0.18em] flex items-center gap-2 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>{lang === 'ka' ? 'ადმინ პანელი' : 'Admin Panel'}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2.5 border border-[#E8E3DB] text-[#5C574F] hover:border-[#8E2424] hover:text-[#8E2424] text-[10px] uppercase tracking-[0.18em] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{lang === 'ka' ? 'გასვლა' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>

              {/* 3 Metrics */}
              <div className="grid grid-cols-3 border-t border-b border-[#E8E3DB] divide-x divide-[#E8E3DB] mt-7">
                <button type="button" onClick={() => handleSelectTab('orders')} className="p-4 text-left hover:bg-[#FAF9F6] transition-colors cursor-pointer">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#9D7B48] block mb-1">{lang === 'ka' ? 'შეკვეთები' : 'Orders'}</span>
                  <span className="font-serif text-2xl font-light text-[#141311]">{userOrders.length}</span>
                </button>
                <button type="button" onClick={() => handleSelectTab('favorites')} className="p-4 text-left hover:bg-[#FAF9F6] transition-colors cursor-pointer">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#9D7B48] block mb-1">{lang === 'ka' ? 'რჩეული' : 'Wishlist'}</span>
                  <span className="font-serif text-2xl font-light text-[#141311]">{favorites.length}</span>
                </button>
                <button type="button" onClick={() => handleSelectTab('profile')} className="p-4 text-left hover:bg-[#FAF9F6] transition-colors cursor-pointer">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#9D7B48] block mb-1">{lang === 'ka' ? 'სტატუსი' : 'Status'}</span>
                  <span className="text-xs sm:text-sm font-medium text-[#2B5C40] truncate block">{lang === 'ka' ? 'აქტიური წევრი' : 'Active Member'}</span>
                </button>
              </div>

              {/* Tab Bar */}
              <div className="flex items-center gap-1 sm:gap-2 mt-6 overflow-x-auto scrollbar-none">
                {[
                  ['profile', User, lang === 'ka' ? 'პირადი პროფილი' : 'Personal Details'],
                  ['orders', Truck, lang === 'ka' ? `ჩემი შეკვეთები (${userOrders.length})` : `Orders (${userOrders.length})`],
                  ['security', Key, lang === 'ka' ? 'უსაფრთხოება' : 'Security'],
                  ['favorites', Heart, lang === 'ka' ? `რჩეული (${favorites.length})` : `Wishlist (${favorites.length})`],
                  ['concierge', MessageCircle, lang === 'ka' ? 'კონსიერჟი' : 'Concierge']
                ].map(([id, Icon, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectTab(id)}
                    className={`px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] whitespace-nowrap flex items-center gap-2 transition-colors border cursor-pointer ${
                      activeTab === id
                        ? 'bg-[#141311] text-white border-[#141311]'
                        : 'bg-white text-[#5C574F] border-[#E8E3DB] hover:border-[#141311] hover:text-[#141311]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="p-6 sm:p-9 bg-white border border-[#E8E3DB] space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-[#EFECE6]">
                  <h3 className="font-serif text-2xl font-light">{lang === 'ka' ? 'პირადი მონაცემები' : 'Personal Details'}</h3>
                  <p className="text-xs text-[#847E75] mt-1">{lang === 'ka' ? 'განაახლეთ თქვენი სახელი და საიუველირო ავატარი' : 'Update your name and signature avatar'}</p>
                </div>

                {profileSuccessMsg && (
                  <div className="p-3.5 bg-[#F4F8F5] border border-[#D4E2D9] text-[#2B5C40] text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}
                {profileErrorMsg && (
                  <div className="p-3.5 bg-[#FDF6F6] border border-[#E8C8C8] text-[#8E2424] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-[0.18em] text-[#5C574F] font-medium">
                        {lang === 'ka' ? 'საიუველირო ავატარი:' : 'Atelier Symbol:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAvatarTray(!showAvatarTray)}
                        className="text-xs text-[#9D7B48] hover:text-[#141311] underline underline-offset-4 cursor-pointer"
                      >
                        {showAvatarTray ? (lang === 'ka' ? 'დახურვა' : 'Close') : (lang === 'ka' ? 'სიმბოლოს შეცვლა' : 'Change Symbol')}
                      </button>
                    </div>

                    <div className="flex items-center gap-3.5 p-3.5 bg-[#FAF9F6] border border-[#E8E3DB]">
                      <img src={selectedAvatarUrl} alt="Selected" className="w-12 h-12 rounded-full object-cover border border-[#E8E3DB]" />
                      <div>
                        <p className="text-sm font-serif text-[#141311]">
                          {currentSelectedPreset ? (lang === 'ka' ? currentSelectedPreset.nameKa : currentSelectedPreset.nameEn) : 'სიმბოლო'}
                        </p>
                        <p className="text-[11px] text-[#847E75]">{lang === 'ka' ? 'ექსკლუზიური საიუველირო ემბლემა' : 'Exclusive fine jewelry signature'}</p>
                      </div>
                    </div>

                    {showAvatarTray && (
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 pt-2 animate-fadeIn">
                        {AVATAR_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setSelectedAvatarUrl(preset.url);
                              setShowAvatarTray(false);
                            }}
                            className={`p-2 border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                              selectedAvatarUrl === preset.url
                                ? 'border-[#141311] bg-[#F8F6F2]'
                                : 'border-[#E8E3DB] bg-white hover:border-[#9D7B48]'
                            }`}
                          >
                            <img src={preset.url} alt={preset.nameKa} className="w-10 h-10 rounded-full object-cover" />
                            <span className="text-[9px] text-[#5C574F] truncate max-w-full">
                              {lang === 'ka' ? preset.nameKa.split(' ')[0] : preset.nameEn.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-[#5C574F] font-medium block">
                      {lang === 'ka' ? 'თქვენი სახელი (Display Name):' : 'Display Name:'}
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={lang === 'ka' ? 'მაგ: დავით გლონტი' : 'e.g. David Glonti'}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <label className="text-[10px] uppercase tracking-[0.18em] text-[#5C574F] font-medium block">
                      {lang === 'ka' ? 'ელფოსტა:' : 'Registered Email:'}
                    </label>
                    <input
                      type="text"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 text-xs sm:text-sm bg-[#F8F6F2] border border-[#E8E3DB] text-[#847E75] cursor-not-allowed font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-8 py-3.5 bg-[#141311] hover:bg-[#2C2A26] text-white text-[11px] uppercase tracking-[0.18em] flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{savingProfile ? (lang === 'ka' ? 'ინახება...' : 'Saving...') : (lang === 'ka' ? 'ცვლილებების შენახვა' : 'Save Changes')}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: ORDERS */}
            {activeTab === 'orders' && (
              <div className="p-6 sm:p-9 bg-white border border-[#E8E3DB] space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFECE6]">
                  <div>
                    <h3 className="font-serif text-2xl font-light">{lang === 'ka' ? 'ჩემი შეკვეთები & თრექინგი' : 'My Orders & Tracking'}</h3>
                    <p className="text-xs text-[#847E75] mt-0.5">{lang === 'ka' ? 'აკონტროლეთ ნაკეთობის დამზადების და მიწოდების სტატუსი რეალურ დროში.' : 'Monitor atelier crafting and live delivery status.'}</p>
                  </div>
                  <a
                    href={lang === 'en' ? '/en/track' : '/track'}
                    className="px-4 py-2 border border-[#141311] text-[#141311] hover:bg-[#141311] hover:text-white text-[10px] uppercase tracking-[0.16em] flex items-center gap-1.5 transition-colors self-start"
                  >
                    <Package className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{lang === 'ka' ? 'კოდით თრექინგი' : 'Track by Code'}</span>
                  </a>
                </div>

                {userOrders.length === 0 ? (
                  <div className="text-center py-14 space-y-4">
                    <Package className="w-8 h-8 text-[#9D7B48] mx-auto stroke-[1.25]" />
                    <h4 className="font-serif text-xl font-light">{lang === 'ka' ? 'აქტიური შეკვეთები არ გაქვთ' : 'No Active Orders Yet'}</h4>
                    <a
                      href={lang === 'en' ? '/en/catalog' : '/catalog'}
                      className="inline-flex items-center gap-2 px-7 py-3 bg-[#141311] text-white text-[11px] uppercase tracking-[0.18em]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>{lang === 'ka' ? 'კოლექციის დათვალიერება' : 'Explore Collection'}</span>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userOrders.map((order) => (
                      <OrderTrackingTimeline key={order.id} order={order} lang={lang} siteSettings={siteSettings} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SECURITY */}
            {activeTab === 'security' && (
              <div className="p-6 sm:p-9 bg-white border border-[#E8E3DB] space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-[#EFECE6]">
                  <h3 className="font-serif text-2xl font-light">{lang === 'ka' ? 'უსაფრთხოება & პაროლი' : 'Password & Security'}</h3>
                </div>

                {isGoogleUser ? (
                  <div className="p-6 bg-[#FAF9F6] border border-[#E8E3DB] space-y-2">
                    <div className="flex items-center gap-2 text-[#141311] font-medium text-sm">
                      <ShieldCheck className="w-5 h-5 text-[#9D7B48] stroke-[1.5]" />
                      <span>{lang === 'ka' ? 'თქვენი ანგარიში დაცულია Google OAuth-ით' : 'Account Secured by Google'}</span>
                    </div>
                    <p className="text-xs text-[#5C574F] leading-relaxed font-light">
                      {lang === 'ka'
                        ? 'თქვენი ანგარიში დაკავშირებულია Google-ის ოფიციალურ სისტემასთან. პაროლის შეცვლა არ არის საჭირო.'
                        : 'Your account is authenticated via Google. Password changes are managed by your Google Account.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    {passwordSuccessMsg && (
                      <div className="p-3.5 bg-[#F4F8F5] border border-[#D4E2D9] text-[#2B5C40] text-xs">{passwordSuccessMsg}</div>
                    )}
                    {passwordErrorMsg && (
                      <div className="p-3.5 bg-[#FDF6F6] border border-[#E8C8C8] text-[#8E2424] text-xs">{passwordErrorMsg}</div>
                    )}

                    {[
                      [lang === 'ka' ? 'მიმდინარე პაროლი:' : 'Current Password:', currentPassword, setCurrentPassword, showCurrentPassword, setShowCurrentPassword],
                      [lang === 'ka' ? 'ახალი პაროლი (მინ. 8 სიმბოლო):' : 'New Password:', newPassword, setNewPassword, showNewPassword, setShowNewPassword],
                      [lang === 'ka' ? 'გაიმეორეთ ახალი პაროლი:' : 'Confirm New Password:', confirmPassword, setConfirmPassword, showConfirmPassword, setShowConfirmPassword]
                    ].map(([label, val, setter, shown, toggle], i) => (
                      <div key={i} className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.16em] text-[#5C574F] font-medium block">{label}</label>
                        <div className="relative">
                          <input
                            type={shown ? 'text' : 'password'}
                            value={val}
                            onChange={(e) => setter(e.target.value)}
                            placeholder="••••••••"
                            required
                            className={`${inputClass} pr-11`}
                          />
                          <button
                            type="button"
                            onClick={() => toggle(!shown)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#847E75] hover:text-[#141311] p-1 cursor-pointer"
                          >
                            {shown ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                          </button>
                        </div>
                        {i === 1 && <PasswordStrengthIndicator password={newPassword} lang={lang} darkMode={false} />}
                      </div>
                    ))}

                    <button
                      type="submit"
                      disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="px-8 py-3.5 bg-[#141311] hover:bg-[#2C2A26] text-white text-[11px] uppercase tracking-[0.18em] flex items-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>{savingPassword ? (lang === 'ka' ? 'მოწმდება...' : 'Verifying...') : (lang === 'ka' ? 'პაროლის განახლება' : 'Update Password')}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 4: WISHLIST */}
            {activeTab === 'favorites' && (
              <div className="p-6 sm:p-9 bg-white border border-[#E8E3DB] space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#EFECE6]">
                  <div>
                    <h3 className="font-serif text-2xl font-light">
                      {lang === 'ka' ? `თქვენი რჩეული სამკაულები (${favoriteProducts.length})` : `Saved Jewelry (${favoriteProducts.length})`}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {favoriteProducts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => navigateTo(`${lang === 'en' ? '/en' : ''}/checkout?from=favorites`)}
                        className="px-5 py-2.5 bg-[#141311] text-white text-[10px] uppercase tracking-[0.16em] flex items-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>{lang === 'ka' ? 'რჩეულების შეძენა' : 'Buy Saved Items'}</span>
                      </button>
                    )}
                    <a
                      href={lang === 'en' ? '/en/catalog' : '/catalog'}
                      className="px-4 py-2.5 border border-[#E8E3DB] text-[#141311] hover:border-[#141311] text-[10px] uppercase tracking-[0.16em] flex items-center gap-1"
                    >
                      <span>{lang === 'ka' ? 'კატალოგი' : 'Catalog'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {favoriteProducts.length === 0 ? (
                  <div className="py-14 px-6 text-center bg-[#FAF9F6] border border-dashed border-[#D6CFC4] space-y-4">
                    <Gem className="w-7 h-7 text-[#9D7B48] mx-auto stroke-[1.25]" />
                    <h4 className="font-serif text-xl font-light">{lang === 'ka' ? 'თქვენს რჩეულებში ჯერ არაფერია დამატებული' : 'Your wishlist is empty'}</h4>
                    <a href={lang === 'en' ? '/en/catalog' : '/catalog'} className="inline-block px-7 py-3 bg-[#141311] text-white text-[11px] uppercase tracking-[0.18em]">
                      {lang === 'ka' ? 'კოლექციის ნახვა' : 'Browse Collection'}
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {favoriteProducts.map((product) => (
                      <ProductCard key={product.id} product={product} onClick={(p) => navigateTo(`/product/${p.id}`)} showDetailsButton={true} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: CONCIERGE */}
            {activeTab === 'concierge' && (
              <div className="p-6 sm:p-9 bg-white border border-[#E8E3DB] space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-[#EFECE6]">
                  <h3 className="font-serif text-2xl font-light">{lang === 'ka' ? 'პირადი საიუველირო კონსიერჟი' : 'Private Jewelry Concierge'}</h3>
                  <p className="text-xs text-[#847E75] mt-1">
                    {lang === 'ka' ? 'ინდივიდუალური შეკვეთა, ზომის მორგება და ექსპერტის პირდაპირი კონსულტაცია.' : 'Custom bespoke pieces, resizing, and dedicated client service.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href={`https://wa.me/${(siteSettings.whatsapp || '+995599000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('გამარჯობა, მატარეს პირადი კაბინეტიდან გიკავშირდებით კონსულტაციისთვის.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-6 bg-[#FAF9F6] border border-[#E8E3DB] hover:border-[#141311] flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <MessageCircle className="w-5 h-5 text-[#9D7B48] stroke-[1.5]" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] font-medium text-[#141311]">WhatsApp Concierge</p>
                        <p className="text-xs text-[#5C574F] font-mono mt-0.5">{siteSettings.whatsapp || '+995 599 00 00 00'}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#847E75]" />
                  </a>

                  <a
                    href={`tel:${(siteSettings.phone || '+995599000000').replace(/[^0-9+]/g, '')}`}
                    className="p-6 bg-[#FAF9F6] border border-[#E8E3DB] hover:border-[#141311] flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <Phone className="w-5 h-5 text-[#9D7B48] stroke-[1.5]" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] font-medium text-[#141311]">{lang === 'ka' ? 'პირდაპირი ზარი' : 'Direct Call'}</p>
                        <p className="text-xs text-[#5C574F] font-mono mt-0.5">{siteSettings.phone || '+995 599 00 00 00'}</p>
                      </div>
                    </div>
                    <Phone className="w-4 h-4 text-[#847E75]" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={(p) => navigateTo(`/product/${p.sku || p.id}`)}
      />

      <QuickBuyModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        items={selectedForBuy}
      />
    </div>
  );
}

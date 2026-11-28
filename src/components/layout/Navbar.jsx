import React, { useState, useRef, useEffect } from 'react';
import { Globe, Heart, Menu, X, LogOut, User, Search, Package, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { navigateTo, switchLanguage } from '../../utils/navigation';
import { formatPrice } from '../../utils/i18n';

export default function Navbar({
  lang, setLang,
  favorites = [], setShowFavoritesModal,
  isMobileMenuOpen, setIsMobileMenuOpen
}) {
  const { siteSettings, products, setShowFavoritesModal: storeSetShowFavoritesModal } = useStore();
  const { user, userRole, logout } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const accountMenuRef = useRef(null);

  const handleToggleLang = () => {
    const nextLang = lang === "ka" ? "en" : "ka";
    setLang(nextLang);
    switchLanguage(nextLang);
  };

  const handleFavoritesClick = () => {
    const openFavorites = setShowFavoritesModal || storeSetShowFavoritesModal;
    openFavorites?.(true);
  };

  const handleLogout = async () => {
    try {
      setIsAccountMenuOpen(false);
      await logout();
      navigateTo('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Close search and account dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsAccountMenuOpen(false);
      }
    };
    if (isSearchOpen || isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen, isAccountMenuOpen]);

  const prefix = lang === "en" ? "/en" : "";
  const isEn = lang === "en";

  // Filter matching products with smart Georgian/English jewelry synonyms
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const getSearchTokens = (query) => {
    const tokens = [query];
    if (query.includes('ბეჭედ') || query.includes('ბეჭდ')) {
      tokens.push('ბეჭდ', 'ბეჭედ', 'ring');
    }
    if (query.includes('საყურ')) {
      tokens.push('საყურ', 'earring');
    }
    if (query.includes('სამაჯურ') || query.includes('სამაჯ')) {
      tokens.push('სამაჯურ', 'bracelet');
    }
    if (query.includes('ყელსაბამ') || query.includes('ყელს')) {
      tokens.push('ყელსაბამ', 'necklace');
    }
    if (query.includes('ring')) {
      tokens.push('ბეჭდ', 'ბეჭედ');
    }
    if (query.includes('earring')) {
      tokens.push('საყურ');
    }
    if (query.includes('bracelet')) {
      tokens.push('სამაჯურ');
    }
    if (query.includes('necklace')) {
      tokens.push('ყელსაბამ');
    }
    return tokens;
  };

  const searchTokens = trimmedQuery ? getSearchTokens(trimmedQuery) : [];

  const searchResults = trimmedQuery.length > 0
    ? (products || []).filter((p) => {
        const nameKa = (p.name || '').toLowerCase();
        const nameEn = (p.nameEn || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        const metal = (p.metal || '').toLowerCase();
        const karat = (p.karat || '').toLowerCase();
        const descKa = (p.description || '').toLowerCase();
        const descEn = (p.descriptionEn || '').toLowerCase();

        return searchTokens.some((token) => (
          nameKa.includes(token) ||
          nameEn.includes(token) ||
          sku.includes(token) ||
          category.includes(token) ||
          metal.includes(token) ||
          karat.includes(token) ||
          descKa.includes(token) ||
          descEn.includes(token)
        ));
      }).slice(0, 5)
    : [];

  const renderSearchResults = (onCloseContainer, isCompact = false) => (
    <>
      <div className={`flex items-center justify-between px-2 ${isCompact ? 'pb-1.5 border-[#EAE4DB]' : 'pb-2 mb-1 border-[#F3EFE8]'} border-b text-[11px] font-medium text-[#787168]`}>
        <span>{lang === 'ka' ? 'ნაპოვნია სამკაულები' : 'Search Results'}</span>
        <span>{searchResults.length}</span>
      </div>

      {searchResults.length > 0 ? (
        <div className={`space-y-1 ${isCompact ? 'pt-1' : ''}`}>
          {searchResults.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onCloseContainer();
                setSearchQuery('');
                navigateTo(`${prefix}/product/${encodeURIComponent(item.sku || item.id)}`);
              }}
              className={`w-full p-2 rounded-xl flex items-center gap-3 ${isCompact ? 'hover:bg-white' : 'hover:bg-[#FAF8F5]'} transition-colors text-left cursor-pointer group`}
            >
              <img
                src={item.images?.[0] || '/brand-logo.jpg'}
                alt={item.name}
                className={`${isCompact ? 'w-10 h-10 bg-white' : 'w-11 h-11 bg-[#F7F5F0]'} rounded-lg object-cover border border-[#EAE4DB] shrink-0`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#1F1C18] truncate group-hover:text-[#9A7742] transition-colors">
                  {lang === 'ka' ? item.name : (item.nameEn || item.name)}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#787168] mt-0.5">
                  <span className="font-mono text-[#9A7742]">#{item.sku}</span>
                  <span>•</span>
                  <span className="truncate">{item.category}</span>
                </div>
              </div>
              <div className="text-xs font-semibold text-[#1F1C18] shrink-0">
                {formatPrice(item.price)}
              </div>
            </button>
          ))}

          <div className={`${isCompact ? 'pt-1.5 border-[#EAE4DB]' : 'pt-2 border-[#F3EFE8]'} border-t text-center`}>
            <button
              type="button"
              onClick={() => {
                onCloseContainer();
                navigateTo(`${prefix}/catalog?search=${encodeURIComponent(trimmedQuery)}`);
              }}
              className={`text-xs font-medium text-[#9A7742] hover:text-[#1F1C18] transition-colors cursor-pointer ${isCompact ? 'py-1' : ''}`}
            >
              {lang === 'ka' ? 'ყველა შედეგის ნახვა კატალოგში →' : 'View all results in catalog →'}
            </button>
          </div>
        </div>
      ) : (
        <div className={`${isCompact ? 'py-4 space-y-0.5' : 'py-5 space-y-1'} text-center text-xs text-[#787168]`}>
          <p className="font-medium text-[#1F1C18]">
            {lang === 'ka' ? 'სამკაული ვერ მოიძებნა' : 'No pieces found'}
          </p>
          <p className="text-[11px]">
            {lang === 'ka' ? 'სცადეთ სხვა სიტყვა ან კოდი' : 'Try searching by a different term or SKU'}
          </p>
        </div>
      )}
    </>
  );

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 rounded-full bg-[#1F1C18] text-white font-medium text-xs"
      >
        {lang === "ka" ? "კონტენტზე გადასვლა" : "Skip to content"}
      </a>

      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE4DB] text-[#1F1C18] shadow-[0_1px_12px_rgba(31,28,24,0.03)]">
        {/* Main Navigation Bar */}
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-[68px] sm:h-[72px] grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: Mobile Trigger & Left Nav Links */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? (lang === "ka" ? "მენიუს დახურვა" : "Close menu") : (lang === "ka" ? "მენიუს გახსნა" : "Open menu")}
              className="lg:hidden p-2 -ml-2 rounded-full text-[#1F1C18] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 stroke-[1.75]" /> : <Menu className="w-5 h-5 stroke-[1.75]" />}
            </button>

            <nav
              className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs xl:text-[13px] font-normal text-[#1F1C18] tracking-wide"
              aria-label="Main navigation"
            >
              <a href={`${prefix}/catalog`} className="hover:text-[#9A7742] transition-colors py-1 whitespace-nowrap">
                {lang === "ka" ? "კოლექცია" : "Collection"}
              </a>
              <a href={`${prefix}/about`} className="hover:text-[#9A7742] transition-colors py-1 whitespace-nowrap">
                {lang === "ka" ? "ჩვენს შესახებ" : "About Us"}
              </a>
              <a href={`${prefix}/blog`} className="hover:text-[#9A7742] transition-colors py-1 whitespace-nowrap">
                {lang === "ka" ? "ბლოგი" : "Blog"}
              </a>
              <a href={`${prefix}/size-guide`} className="hover:text-[#9A7742] transition-colors py-1 whitespace-nowrap">
                {lang === "ka" ? "ზომის გზამკვლევი" : "Size Guide"}
              </a>
            </nav>
          </div>

          {/* Center: Iconic MATARE Wordmark */}
          <a
            href={prefix || "/"}
            className="flex items-center justify-center group text-center shrink-0"
            aria-label={siteSettings.brandName || "MATARE"}
          >
            <span className="font-serif text-2xl sm:text-[28px] font-normal text-[#1F1C18] tracking-[0.22em] uppercase leading-none group-hover:text-[#9A7742] transition-colors">
              {isEn ? (siteSettings.brandNameEn || "MATARE") : (siteSettings.brandName || "მატარე")}
            </span>
          </a>

          {/* Right: Expandable Search & Utility Icons */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 text-[#1F1C18]">
            {/* Expandable Smooth Search Bar with Dropdown - hidden on mobile (moved inside hamburger drawer) */}
            <div ref={searchContainerRef} className="relative hidden sm:flex items-center">
              <div
                className={`flex items-center transition-all duration-300 ease-out overflow-hidden ${
                  isSearchOpen
                    ? 'w-[200px] sm:w-[260px] md:w-[300px] bg-[#FAF8F5] border border-[#DCD6CC] shadow-sm rounded-full px-2.5 py-1'
                    : 'w-9 h-9 bg-transparent border border-transparent'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isSearchOpen) {
                      setIsSearchOpen(true);
                      setTimeout(() => searchInputRef.current?.focus(), 80);
                    }
                  }}
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F4EFE6] text-[#1F1C18] transition-colors cursor-pointer"
                  title={lang === "ka" ? "ძიება" : "Search"}
                  aria-label={lang === "ka" ? "ძიება" : "Search"}
                >
                  <Search className="w-[18px] h-[18px] stroke-[1.5]" />
                </button>

                {isSearchOpen && (
                  <div className="flex-1 flex items-center min-w-0 pr-1 animate-fadeIn">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        } else if (e.key === 'Enter' && searchQuery.trim()) {
                          navigateTo(`${prefix}/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
                          setIsSearchOpen(false);
                        }
                      }}
                      placeholder={lang === 'ka' ? 'მოძებნეთ სამკაული, კოდი...' : 'Search jewelry, SKU...'}
                      className="w-full bg-transparent text-xs text-[#1F1C18] outline-none px-2 placeholder-[#9E978D]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="p-1 text-[#9E978D] hover:text-[#1F1C18] cursor-pointer"
                        aria-label="Clear text"
                      >
                        <X className="w-3.5 h-3.5 stroke-[1.75]" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="p-1 text-[#787168] hover:text-[#1F1C18] cursor-pointer"
                      aria-label="Close search"
                    >
                      <X className="w-4 h-4 stroke-[1.75]" />
                    </button>
                  </div>
                )}
              </div>

              {/* Live Search Results Dropdown */}
              {isSearchOpen && trimmedQuery.length > 0 && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[290px] sm:w-[350px] bg-white rounded-2xl shadow-[0_15px_50px_rgba(31,28,24,0.12)] border border-[#EAE4DB] p-3 z-50 animate-fadeIn">
                  {renderSearchResults(() => setIsSearchOpen(false), false)}
                </div>
              )}
            </div>

            {/* Language Switcher - visible on sm+ screens */}
            <button
              type="button"
              onClick={handleToggleLang}
              aria-label={lang === "ka" ? "Switch language to English" : "ენის გადართვა ქართულზე"}
              className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center hover:bg-[#F4EFE6] transition-colors cursor-pointer"
              title={lang === "ka" ? "Switch to English" : "ქართულზე გადართვა"}
            >
              <Globe className="w-[19px] h-[19px] stroke-[1.5]" />
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={handleFavoritesClick}
              aria-label={lang === "ka" ? `რჩეული სამკაულები (${favorites.length})` : `Saved items (${favorites.length})`}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                favorites.length > 0 ? 'hover:bg-[#FDF2F4]' : 'hover:bg-[#F4EFE6]'
              }`}
              title={lang === "ka" ? "რჩეულები" : "Wishlist"}
            >
              <Heart
                className={`w-[19px] h-[19px] stroke-[1.5] transition-colors ${
                  favorites.length > 0 ? "fill-[#E25567] text-[#E25567]" : "text-[#1F1C18] hover:text-[#E25567]"
                }`}
              />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-[#E25567] text-white text-[9px] font-semibold flex items-center justify-center shadow-xs">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* User Account / Profile - visible on sm+ screens */}
            {user ? (
              <div ref={accountMenuRef} className="relative hidden sm:flex items-center">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="menu"
                  aria-label={lang === "ka" ? "ჩემი პროფილი" : "Profile"}
                  title={user.displayName || user.email || (lang === "ka" ? "ჩემი პროფილი" : "Profile")}
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isAccountMenuOpen ? 'ring-2 ring-[#9A7742]/40 bg-[#F4EFE6]' : 'hover:bg-[#F4EFE6]'
                  }`}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Profile"}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-[#DCD6CC]"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-[#F4EFE6] border border-[#9A7742]/40 text-[#1F1C18] flex items-center justify-center text-xs font-semibold tracking-wide">
                      {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span
                    className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#2E7D52] ring-2 ring-white"
                    aria-hidden="true"
                  />
                </button>

                {isAccountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+10px)] w-60 bg-white rounded-2xl shadow-[0_15px_50px_rgba(31,28,24,0.12)] border border-[#EAE4DB] p-2 z-50 animate-fadeIn text-left"
                  >
                    <div className="px-3 py-2.5 border-b border-[#F3EFE8]">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[#1F1C18] truncate">
                          {user.displayName || (user.email ? user.email.split('@')[0] : (lang === 'ka' ? 'მომხმარებელი' : 'Member'))}
                        </p>
                        {(userRole === 'admin' || userRole === 'superadmin') && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#F4EFE6] text-[#9A7742] text-[9px] font-semibold uppercase tracking-wider shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      {user.email && (
                        <p className="text-[11px] text-[#787168] truncate mt-0.5">{user.email}</p>
                      )}
                    </div>

                    <div className="py-1 space-y-0.5">
                      <a
                        role="menuitem"
                        href={`${prefix}/profile`}
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-medium text-[#1F1C18] hover:bg-[#FAF8F5] hover:text-[#9A7742] transition-colors"
                      >
                        <User className="w-4 h-4 stroke-[1.5] text-[#787168]" />
                        <span>{lang === "ka" ? "ჩემი პროფილი" : "My Profile"}</span>
                      </a>

                      <a
                        role="menuitem"
                        href={`${prefix}/track`}
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-medium text-[#1F1C18] hover:bg-[#FAF8F5] hover:text-[#9A7742] transition-colors"
                      >
                        <Package className="w-4 h-4 stroke-[1.5] text-[#787168]" />
                        <span>{lang === "ka" ? "შეკვეთის თრექინგი" : "Track Order"}</span>
                      </a>

                      {(userRole === 'admin' || userRole === 'superadmin') && (
                        <a
                          role="menuitem"
                          href="/admin"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-medium text-[#9A7742] hover:bg-[#FAF8F5] transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
                          <span>{lang === "ka" ? "ადმინ პანელი" : "Admin Panel"}</span>
                        </a>
                      )}
                    </div>

                    <div className="pt-1 border-t border-[#F3EFE8]">
                      <button
                        role="menuitem"
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-medium text-[#787168] hover:bg-[#FDF2F2] hover:text-[#9E2A2B] transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 stroke-[1.5]" />
                        <span>{lang === "ka" ? "გასვლა" : "Sign Out"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a
                href={`${prefix}/login`}
                className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center hover:bg-[#F4EFE6] transition-colors cursor-pointer"
                title={lang === "ka" ? "შესვლა" : "Sign In"}
                aria-label={lang === "ka" ? "შესვლა" : "Sign In"}
              >
                <User className="w-[19px] h-[19px] stroke-[1.5]" />
              </a>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#EAE4DB] px-5 py-6 space-y-5 animate-fadeIn shadow-xl max-h-[calc(100vh-68px)] overflow-y-auto">
            {/* Mobile Search inside Hamburger Drawer */}
            <div className="space-y-2">
              <div className="flex items-center bg-[#FAF8F5] border border-[#DCD6CC] focus-within:border-[#9A7742] rounded-full px-3.5 py-2 transition-colors">
                <Search className="w-4 h-4 text-[#787168] shrink-0 stroke-[1.75]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      setIsMobileMenuOpen(false);
                      navigateTo(`${prefix}/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  placeholder={lang === 'ka' ? 'მოძებნეთ სამკაული, კოდი...' : 'Search jewelry, SKU...'}
                  aria-label={lang === "ka" ? "ძიება" : "Search"}
                  className="w-full bg-transparent text-xs text-[#1F1C18] outline-none px-2.5 placeholder-[#9E978D]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 text-[#9E978D] hover:text-[#1F1C18] cursor-pointer"
                    aria-label={lang === 'ka' ? 'გასუფთავება' : 'Clear search'}
                  >
                    <X className="w-3.5 h-3.5 stroke-[1.75]" />
                  </button>
                )}
              </div>

              {trimmedQuery.length > 0 && (
                <div className="bg-[#FAF8F5] rounded-2xl border border-[#EAE4DB] p-2.5 space-y-1">
                  {renderSearchResults(() => setIsMobileMenuOpen(false), true)}
                </div>
              )}
            </div>

            {user ? (
              <div className="pb-4 border-b border-[#EAE4DB] flex items-center justify-between gap-3">
                <a
                  href={`${prefix}/profile`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    navigateTo(`${prefix}/profile`);
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-[#EAE4DB]" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#F4EFE6] text-[#1F1C18] flex items-center justify-center font-semibold text-sm">
                      {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1F1C18] truncate">{user.displayName || user.email}</p>
                    <p className="text-xs text-[#9A7742]">
                      {userRole === 'superadmin' || userRole === 'admin'
                        ? 'Administrator'
                        : (lang === "ka" ? "ჩემი პროფილი" : "My Account")}
                    </p>
                  </div>
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label={lang === "ka" ? "გასვლა" : "Sign out"}
                  className="p-2 text-[#5E584F] hover:text-[#9E2A2B]"
                  title={lang === "ka" ? "გასვლა" : "Sign out"}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-4 border-b border-[#EAE4DB]">
                <a
                  href={`${prefix}/login`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 px-4 rounded-full border border-[#1F1C18] text-[#1F1C18] text-center text-xs font-medium"
                >
                  {lang === "ka" ? "შესვლა" : "Sign In"}
                </a>
                <a
                  href={`${prefix}/register`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 px-4 rounded-full bg-[#1F1C18] text-white text-center text-xs font-medium"
                >
                  {lang === "ka" ? "რეგისტრაცია" : "Register"}
                </a>
              </div>
            )}

            <nav className="flex flex-col divide-y divide-[#F4EFE6] text-sm font-medium text-[#1F1C18]" aria-label="Mobile navigation">
              <a href={`${prefix}/catalog`} onClick={() => setIsMobileMenuOpen(false)} className="py-3 hover:text-[#9A7742]">
                {lang === "ka" ? "კოლექცია" : "Collection"}
              </a>
              <a href={`${prefix}/about`} onClick={() => setIsMobileMenuOpen(false)} className="py-3 hover:text-[#9A7742]">
                {lang === "ka" ? "ჩვენს შესახებ" : "About Us"}
              </a>
              <a href={`${prefix}/blog`} onClick={() => setIsMobileMenuOpen(false)} className="py-3 hover:text-[#9A7742]">
                {lang === "ka" ? "ბლოგი" : "Blog"}
              </a>
              <a href={`${prefix}/size-guide`} onClick={() => setIsMobileMenuOpen(false)} className="py-3 hover:text-[#9A7742]">
                {lang === "ka" ? "ზომის გზამკვლევი" : "Size Guide"}
              </a>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleFavoritesClick();
                }}
                className="py-3 flex items-center justify-between text-left hover:text-[#9A7742] cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Heart className={`w-4 h-4 stroke-[1.5] ${favorites.length > 0 ? 'fill-[#E25567] text-[#E25567]' : 'text-[#1F1C18]'}`} />
                  {lang === "ka" ? "რჩეული სამკაულები" : "Wishlist"}
                </span>
                {favorites.length > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#E25567] text-white text-[10px] font-semibold flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
            </nav>

            {/* Mobile Language Switcher */}
            <div className="pt-4 border-t border-[#EAE4DB] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#787168] font-medium">
                <Globe className="w-4 h-4 stroke-[1.5] text-[#9A7742]" />
                <span>{lang === 'ka' ? 'ენა / Language' : 'Language'}</span>
              </div>
              <div className="inline-flex p-1 bg-[#F4EFE6] rounded-full text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    if (lang !== 'ka') handleToggleLang();
                  }}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    lang === 'ka'
                      ? 'bg-[#1F1C18] text-white shadow-xs'
                      : 'text-[#787168] hover:text-[#1F1C18]'
                  }`}
                >
                  ქართული
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (lang !== 'en') handleToggleLang();
                  }}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    lang === 'en'
                      ? 'bg-[#1F1C18] text-white shadow-xs'
                      : 'text-[#787168] hover:text-[#1F1C18]'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

import React from 'react';
import { Globe, Heart, Menu, X, LogOut, User, Package } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { navigateTo, switchLanguage } from '../../utils/navigation';

export default function Navbar({
  lang, setLang,
  favorites = [], setShowFavoritesModal,
  isMobileMenuOpen, setIsMobileMenuOpen
}) {
  const { siteSettings } = useStore();
  const { user, userRole, logout } = useAuth();

  const handleToggleLang = () => {
    const nextLang = lang === "ka" ? "en" : "ka";
    setLang(nextLang);
    switchLanguage(nextLang);
  };

  const handleFavoritesClick = () => {
    if (!user) {
      const current = window.location.pathname + window.location.search;
      navigateTo(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }
    setShowFavoritesModal(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigateTo('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const prefix = lang === "en" ? "/en" : "";
  const isEn = lang === "en";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 rounded-full bg-[#1F1C18] text-white font-medium text-xs"
      >
        {lang === "ka" ? "კონტენტზე გადასვლა" : "Skip to content"}
      </a>

      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE4DB] text-[#1F1C18] shadow-[0_1px_12px_rgba(31,28,24,0.03)]">
        {/* Soft Champagne Announcement Bar */}
        <div className="bg-[#F4EFE6] text-[#574E42] border-b border-[#EAE4DB]">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-8 flex items-center justify-between text-[11px] font-medium">
            <span className={`truncate ${isEn ? "tracking-[0.12em] uppercase text-[10px]" : "tracking-[0.01em]"}`}>
              {lang === "ka"
                ? "უფასო დაზღვეული მიწოდება  •  სერტიფიცირებული ოქრო და ბრილიანტები"
                : "Complimentary Insured Delivery  •  Certified Gold & Diamonds"}
            </span>
            <a
              href={`${prefix}/track`}
              className="hidden sm:inline-flex items-center gap-1.5 text-[#8A6836] hover:text-[#1F1C18] transition-colors shrink-0 ml-4"
            >
              <Package className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>{lang === "ka" ? "შეკვეთის თრექინგი" : "Track Order"}</span>
            </a>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-[66px] sm:h-[70px] grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Left: Mobile Trigger or Clean Nav Links */}
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
              className={`hidden lg:flex items-center gap-5 xl:gap-7 text-[13px] font-medium text-[#4A453E] ${isEn ? "tracking-[0.1em] uppercase text-[11px]" : ""}`}
              aria-label="Main navigation"
            >
              <a href={`${prefix}/catalog`} className="hover:text-[#1F1C18] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#9A7742] hover:after:w-full after:transition-all whitespace-nowrap">
                {lang === "ka" ? "კოლექცია" : "Collection"}
              </a>
              <a href={`${prefix}/about`} className="hover:text-[#1F1C18] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#9A7742] hover:after:w-full after:transition-all whitespace-nowrap">
                {lang === "ka" ? "ჩვენს შესახებ" : "About"}
              </a>
              <a href={`${prefix}/#craftsmanship`} className="hover:text-[#1F1C18] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#9A7742] hover:after:w-full after:transition-all whitespace-nowrap">
                {lang === "ka" ? "ოსტატობა" : "Atelier"}
              </a>
              <a href={`${prefix}/blog`} className="hover:text-[#1F1C18] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#9A7742] hover:after:w-full after:transition-all whitespace-nowrap">
                {lang === "ka" ? "ბლოგი" : "Journal"}
              </a>
              <a href={`${prefix}/size-guide`} className="hidden xl:inline-block hover:text-[#1F1C18] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#9A7742] hover:after:w-full after:transition-all whitespace-nowrap">
                {lang === "ka" ? "ზომის გიდი" : "Size Guide"}
              </a>
            </nav>
          </div>

          {/* Center: Natural Balanced Brand Wordmark */}
          <a
            href={prefix || "/"}
            className="flex flex-col items-center justify-center group text-center shrink-0"
            aria-label={siteSettings.brandName || "მთავარი გვერდი"}
          >
            <span className={`font-serif text-2xl sm:text-[27px] font-semibold text-[#1F1C18] leading-none group-hover:text-[#9A7742] transition-colors ${isEn ? "tracking-[0.2em] uppercase" : "tracking-[0.06em]"}`}>
              {siteSettings.brandName || "მატარე"}
            </span>
            <span className={`text-[10px] text-[#9A7742] font-medium mt-1 ${isEn ? "tracking-[0.2em] uppercase" : "tracking-[0.04em]"}`}>
              {lang === "ka" ? siteSettings.brandSubtitle : (siteSettings.brandSubtitleEn || siteSettings.brandSubtitle)}
            </span>
          </a>

          {/* Right: Clean Tactile Utilities */}
          <div className="flex items-center justify-end gap-2 sm:gap-3.5">
            <a
              href={`${prefix}/#contact`}
              className={`hidden xl:inline-block text-[13px] font-medium text-[#4A453E] hover:text-[#1F1C18] transition-colors whitespace-nowrap mr-1 ${isEn ? "tracking-[0.1em] uppercase text-[11px]" : ""}`}
            >
              {lang === "ka" ? "კონტაქტი" : "Contact"}
            </a>

            <button
              type="button"
              onClick={handleToggleLang}
              aria-label={lang === "ka" ? "Switch language to English" : "ენის გადართვა ქართულზე"}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#4A453E] bg-[#FAF8F4] border border-[#EAE4DB] hover:border-[#9A7742] hover:text-[#1F1C18] transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 stroke-[1.75] text-[#9A7742]" />
              <span>{lang === "ka" ? "EN" : "GE"}</span>
            </button>

            <button
              type="button"
              onClick={handleFavoritesClick}
              aria-label={lang === "ka" ? `რჩეული სამკაულები (${favorites.length})` : `Saved items (${favorites.length})`}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#1F1C18] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
            >
              <Heart className={`w-[18px] h-[18px] stroke-[1.75] ${favorites.length > 0 ? "fill-[#9A7742] text-[#9A7742]" : ""}`} />
              {favorites.length > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#1F1C18] text-white text-[9px] font-semibold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            <div className="hidden lg:flex items-center gap-2.5 pl-2.5 border-l border-[#EAE4DB]">
              {user ? (
                <>
                  <a
                    href={`${prefix}/profile`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo(`${prefix}/profile`);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F4] border border-[#EAE4DB] hover:border-[#9A7742] text-xs font-medium text-[#1F1C18] transition-colors cursor-pointer"
                    title={lang === "ka" ? `პროფილი: ${user.displayName || user.email}` : `Profile: ${user.displayName || user.email}`}
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#9A7742]/15 text-[#9A7742] text-[10px] font-semibold flex items-center justify-center">
                        {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[100px] truncate hidden xl:inline">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    {(userRole === 'superadmin' || userRole === 'admin') && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-[#1F1C18] text-white">
                        ADMIN
                      </span>
                    )}
                  </a>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title={lang === "ka" ? "გასვლა" : "Logout"}
                    aria-label={lang === "ka" ? "ანგარიშიდან გასვლა" : "Sign out"}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#787168] hover:text-[#9E2A2B] hover:bg-[#FDF6F6] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 stroke-[1.75]" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2.5">
                  <a
                    href={`${prefix}/login`}
                    className="px-3 py-1.5 text-xs font-medium text-[#4A453E] hover:text-[#1F1C18] transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <User className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span>{lang === "ka" ? "შესვლა" : "Sign In"}</span>
                  </a>
                  <a
                    href={`${prefix}/register`}
                    className="hidden xl:inline-block px-4 py-2 rounded-full bg-[#1F1C18] text-white hover:bg-[#35302A] text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    {lang === "ka" ? "რეგისტრაცია" : "Register"}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#EAE4DB] px-5 py-6 space-y-5 animate-fadeIn shadow-xl">
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
                  className="p-2 text-[#787168] hover:text-[#9E2A2B]"
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
              <a href={`${prefix}/#craftsmanship`} onClick={() => setIsMobileMenuOpen(false)} className="py-3 hover:text-[#9A7742]">
                {lang === "ka" ? "ოსტატობა" : "Craftsmanship"}
              </a>
              <a href={`${prefix}/blog`} onClick={() => setIsMobileMenuOpen(false)} className="py-3 hover:text-[#9A7742]">
                {lang === "ka" ? "ბლოგი" : "Journal"}
              </a>
              <a href={`${prefix}/size-guide`} onClick={() => setIsMobileMenuOpen(false)} className="py-3 hover:text-[#9A7742]">
                {lang === "ka" ? "ზომის გზამკვლევი" : "Size Guide"}
              </a>
              <a href={`${prefix}/faq`} onClick={() => setIsMobileMenuOpen(false)} className="py-3 hover:text-[#9A7742]">
                {lang === "ka" ? "კითხვა-პასუხი (FAQ)" : "FAQ"}
              </a>
              <a href={`${prefix}/track`} onClick={() => setIsMobileMenuOpen(false)} className="py-3 hover:text-[#9A7742]">
                {lang === "ka" ? "შეკვეთის თრექინგი" : "Track Order"}
              </a>
              <a href={`${prefix}/#contact`} onClick={() => setIsMobileMenuOpen(false)} className="py-3 hover:text-[#9A7742]">
                {lang === "ka" ? "კონტაქტი" : "Contact"}
              </a>
              {user && (
                <a
                  href={`${prefix}/profile`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    navigateTo(`${prefix}/profile`);
                  }}
                  className="py-3 text-[#9A7742]"
                >
                  {lang === "ka" ? "ჩემი პროფილი & შეკვეთები" : "My Account & Orders"}
                </a>
              )}
            </nav>

            <div className="pt-1 flex items-center sm:hidden">
              <button
                type="button"
                onClick={handleToggleLang}
                aria-label={lang === "ka" ? "Switch language to English" : "ენის გადართვა ქართულზე"}
                className="px-4 py-2 rounded-full border border-[#EAE4DB] bg-[#FAF8F4] text-xs font-medium flex items-center gap-2 text-[#1F1C18]"
              >
                <Globe className="w-3.5 h-3.5 text-[#9A7742]" />
                {lang === "ka" ? "English (EN)" : "ქართული (GE)"}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

import React from 'react';
import { Sparkles, Globe, Sun, Moon, Heart, Menu, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function Navbar({
  lang, setLang,
  darkMode, setDarkMode,
  favorites, setShowFavoritesModal,
  isMobileMenuOpen, setIsMobileMenuOpen
}) {
  const { siteSettings } = useStore();

  return (
    <>
      {/* ხელმისაწვდომობის სწრაფი გადასვლა კონტენტზე (Screen Readers / Keyboard navigation) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-xl shadow-lg"
      >
        {lang === "ka" ? "კონტენტზე გადასვლა" : "Skip to content"}
      </a>

      <header className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b transition-colors shadow-lg ${darkMode ? "bg-[#0c0b0a]/95 border-amber-500/15" : "bg-white/95 border-stone-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group" aria-label={siteSettings.brandName || "მთავარი გვერდი"}>
            {siteSettings.logoUrl ? (
              <img src={siteSettings.logoUrl} alt={siteSettings.brandName} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-amber-500/40" />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-serif text-xl sm:text-3xl tracking-[0.22em] font-semibold block leading-none">
                {siteSettings.brandName}
              </span>
              <span className="text-[9px] sm:text-xs tracking-[0.18em] text-amber-500/90 uppercase block mt-1">
                {lang === "ka" ? siteSettings.brandSubtitle : (siteSettings.brandSubtitleEn || siteSettings.brandSubtitle)}
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm tracking-wider uppercase" aria-label="Main navigation">
            <a href="/#catalog" className="hover:text-amber-500 transition-colors">
              {lang === "ka" ? "კოლექცია" : "Collection"}
            </a>
            <a href="/about" className="hover:text-amber-500 transition-colors">
              {lang === "ka" ? "ჩვენს შესახებ" : "About Us"}
            </a>
            <a href="/#craftsmanship" className="hover:text-amber-500 transition-colors">
              {lang === "ka" ? "ოსტატობა" : "Craftsmanship"}
            </a>
            <a href="/#contact" className="hover:text-amber-500 transition-colors">
              {lang === "ka" ? "შოურუმი" : "Showroom"}
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLang(lang === "ka" ? "en" : "ka")}
              aria-label={lang === "ka" ? "Switch language to English" : "ენის გადართვა ქართულზე"}
              className={`px-3 py-2 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${
                darkMode ? "border-stone-800 bg-stone-900/80 hover:border-amber-500/50" : "border-stone-200 bg-stone-100 hover:border-amber-600"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              {lang === "ka" ? "EN" : "GE"}
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? (lang === "ka" ? "დღის რეჟიმზე გადართვა" : "Switch to light mode") : (lang === "ka" ? "ღამის რეჟიმზე გადართვა" : "Switch to dark mode")}
              className={`p-2.5 rounded-full border transition-all ${
                darkMode ? "border-stone-800 bg-stone-900/80 text-amber-400 hover:border-amber-500/50" : "border-stone-200 bg-stone-100 text-stone-700 hover:border-amber-600"
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setShowFavoritesModal(true)}
              aria-label={lang === "ka" ? `რჩეული სამკაულები (${favorites.length})` : `Saved items (${favorites.length})`}
              className={`relative p-2.5 rounded-full border transition-all ${
                darkMode ? "border-stone-800 bg-stone-900/80 hover:border-amber-500/50" : "border-stone-200 bg-stone-100 hover:border-amber-600"
              }`}
            >
              <Heart className={`w-4 h-4 ${favorites.length > 0 ? "fill-amber-500 text-amber-500" : ""}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFavoritesModal(true)}
              aria-label={lang === "ka" ? `რჩეული სამკაულები (${favorites.length})` : `Saved items (${favorites.length})`}
              className={`relative p-2 rounded-full border ${darkMode ? "border-stone-800 bg-stone-900" : "border-stone-200 bg-stone-100"}`}
            >
              <Heart className={`w-4 h-4 ${favorites.length > 0 ? "fill-amber-500 text-amber-500" : ""}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? (lang === "ka" ? "მენიუს დახურვა" : "Close menu") : (lang === "ka" ? "მენიუს გახსნა" : "Open menu")}
              className={`p-2 rounded-full border ${darkMode ? "border-stone-800 bg-stone-900 text-amber-400" : "border-stone-200 bg-stone-100 text-stone-800"}`}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className={`md:hidden border-b p-5 space-y-4 animate-fadeIn ${darkMode ? "bg-[#0c0b0a] border-stone-800" : "bg-white border-stone-200"}`}>
            <nav className="flex flex-col space-y-3 text-sm tracking-wider uppercase" aria-label="Mobile navigation">
              <a href="/#catalog" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-500 py-1">
                {lang === "ka" ? "კოლექცია" : "Collection"}
              </a>
              <a href="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-500 py-1">
                {lang === "ka" ? "ჩვენს შესახებ" : "About Us"}
              </a>
              <a href="/#craftsmanship" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-500 py-1">
                {lang === "ka" ? "ოსტატობა" : "Craftsmanship"}
              </a>
              <a href="/#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-500 py-1">
                {lang === "ka" ? "შოურუმი" : "Showroom"}
              </a>
            </nav>

            <div className="pt-3 border-t border-stone-500/20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLang(lang === "ka" ? "en" : "ka")}
                aria-label={lang === "ka" ? "Switch language to English" : "ენის გადართვა ქართულზე"}
                className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${
                  darkMode ? "border-stone-800 bg-stone-900" : "border-stone-200 bg-stone-100"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                {lang === "ka" ? "EN" : "GE"}
              </button>

              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? (lang === "ka" ? "დღის რეჟიმზე გადართვა" : "Switch to light mode") : (lang === "ka" ? "ღამის რეჟიმზე გადართვა" : "Switch to dark mode")}
                className={`p-2.5 rounded-xl border ${
                  darkMode ? "border-stone-800 bg-stone-900 text-amber-400" : "border-stone-200 bg-stone-100 text-stone-700"
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

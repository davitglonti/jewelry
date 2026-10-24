import React, { useState, useEffect } from 'react';
import { ArrowRight, Home, ShoppingBag, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FavoritesModal from '../components/modals/FavoritesModal';

export default function NotFoundPage() {
  const {
    darkMode, setDarkMode,
    lang, setLang,
    siteSettings,
    favorites
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  useEffect(() => {
    const brand = siteSettings?.brandName || "AURELIA";
    document.title = lang === "ka"
      ? `404 — გვერდი ვერ მოიძებნა | ${brand}`
      : `404 — Page Not Found | ${brand}`;
  }, [lang, siteSettings]);

  const whatsappPhone = (siteSettings?.whatsapp || "").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    lang === "ka"
      ? "გამარჯობა, მჭირდება დახმარება თქვენს საიტზე ნივთის პოვნაში."
      : "Hello, I need assistance finding an item on your website."
  )}`;

  const categories = siteSettings?.categories && siteSettings.categories.length > 0
    ? siteSettings.categories
    : ["ბეჭდები", "სამაჯურები", "საყურეები", "ყელსაბამები"];

  return (
    <div className={`w-full overflow-x-hidden transition-colors duration-300 ${
      darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#faf7f2] text-[#1c1917]"
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

      {/* 404 Main Section: სრულ ეკრანზე ჩანს (100vh / 100dvh), ფუტერი კი ჩამოსქროლვის შემდეგ ჩნდება */}
      <main id="main-content" className="min-h-screen min-h-[100dvh] w-full flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 relative">
        <div className="max-w-xl w-full mx-auto text-center space-y-6 sm:space-y-7 relative z-10 my-auto">
          {/* Classic Clean 404 & Heading */}
          <div className="space-y-3">
            <span className="font-serif text-6xl sm:text-8xl font-light tracking-[0.25em] text-amber-500/80 block select-none">
              404
            </span>
            <div className="w-12 h-px bg-amber-500/30 mx-auto my-3" />
            <h1 className="font-serif text-2xl sm:text-4xl font-normal tracking-wide">
              {lang === "ka" ? "გვერდი ვერ მოიძებნა" : "Page Not Found"}
            </h1>
            <p className="text-xs sm:text-sm opacity-65 leading-relaxed font-light max-w-md mx-auto pt-1">
              {lang === "ka"
                ? "თქვენ მიერ მოთხოვნილი გვერდი არ არსებობს ან მითითებული ბმული არასწორია."
                : "The page you are looking for does not exist or the link may be mistyped."}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-1">
            <a
              href="/catalog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs tracking-wider uppercase transition-all active:scale-95 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{lang === "ka" ? "სრული კოლექცია" : "Explore Collection"}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="/"
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border text-xs font-semibold tracking-wider uppercase transition-all active:scale-95 ${
                darkMode
                  ? "border-stone-700 bg-stone-900/60 text-stone-200 hover:border-amber-500/50 hover:bg-stone-800"
                  : "border-stone-300 bg-white text-stone-800 hover:border-amber-500 hover:bg-stone-50"
              }`}
            >
              <Home className="w-4 h-4 text-amber-500" />
              <span>{lang === "ka" ? "მთავარი გვერდი" : "Back to Home"}</span>
            </a>
          </div>

          {/* WhatsApp Direct Help */}
          {siteSettings?.whatsapp && (
            <div className="pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-emerald-400 transition-colors group"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span>
                  {lang === "ka"
                    ? "გჭირდებათ კონსულტაცია? მოგვწერეთ WhatsApp-ში"
                    : "Need assistance? Message us on WhatsApp"}
                </span>
              </a>
            </div>
          )}

          {/* Popular Category Shortcuts */}
          <div className="pt-5 sm:pt-6 border-t border-stone-500/15 max-w-md mx-auto">
            <span className="text-[11px] uppercase tracking-wider opacity-50 block mb-2.5 font-medium">
              {lang === "ka" ? "პოპულარული კოლექციები" : "Popular Collections"}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <a
                  key={cat}
                  href={`/catalog?category=${encodeURIComponent(cat)}`}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                    darkMode
                      ? "border-stone-800 bg-stone-900/40 text-stone-300 hover:border-amber-500/40 hover:text-amber-400 hover:bg-stone-900"
                      : "border-stone-200 bg-stone-100 text-stone-700 hover:border-amber-500 hover:text-amber-700 hover:bg-white"
                  }`}
                >
                  {cat}
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer: ჩნდება ჩამოსქროლვის შემდეგ */}
      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={(item) => {
          window.location.href = `/?item=${encodeURIComponent(item.sku || item.id)}`;
        }}
      />
    </div>
  );
}

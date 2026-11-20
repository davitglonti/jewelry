import React, { useState, useEffect } from 'react';
import { ArrowRight, Home, ShoppingBag, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { navigateTo } from '../utils/navigation';
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
    const brand = siteSettings?.brandName || "MATARE";
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
    <div className="min-h-screen flex flex-col justify-between bg-[#FBF9F5] text-[#141311]">
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

      <main id="main-content" className="flex-1 flex flex-col items-center justify-center pt-28 pb-16 px-4 sm:px-6">
        <div className="max-w-xl w-full mx-auto text-center space-y-7 my-auto">
          <div className="space-y-3">
            <span className="font-serif text-7xl sm:text-9xl font-light tracking-[0.2em] text-[#9D7B48] block select-none">
              404
            </span>
            <div className="w-12 h-[1px] bg-[#E8E3DB] mx-auto my-4" />
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#141311]">
              {lang === "ka" ? "გვერდი ვერ მოიძებნა" : "Page Not Found"}
            </h1>
            <p className="text-xs sm:text-sm text-[#5C574F] leading-relaxed font-light max-w-md mx-auto">
              {lang === "ka"
                ? "თქვენ მიერ მოთხოვნილი გვერდი არ არსებობს ან მითითებული ბმული არასწორია."
                : "The page you are looking for does not exist or the link may be mistyped."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={lang === "en" ? "/en/catalog" : "/catalog"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#141311] hover:bg-[#2C2A26] text-white text-[11px] tracking-[0.18em] uppercase transition-colors"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span>{lang === "ka" ? "სრული კოლექცია" : "Explore Collection"}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
            </a>

            <a
              href={lang === "en" ? "/en" : "/"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-white border border-[#141311] text-[#141311] hover:bg-[#F8F6F2] text-[11px] tracking-[0.18em] uppercase transition-colors"
            >
              <Home className="w-4 h-4 stroke-[1.5]" />
              <span>{lang === "ka" ? "მთავარი გვერდი" : "Back to Home"}</span>
            </a>
          </div>

          {siteSettings?.whatsapp && (
            <div className="pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs text-[#847E75] hover:text-[#141311] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#9D7B48] stroke-[1.5]" />
                <span>
                  {lang === "ka"
                    ? "გჭირდებათ კონსულტაცია? მოგვწერეთ WhatsApp-ში"
                    : "Need assistance? Message us on WhatsApp"}
                </span>
              </a>
            </div>
          )}

          <div className="pt-6 border-t border-[#E8E3DB] max-w-md mx-auto">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#847E75] block mb-3">
              {lang === "ka" ? "პოპულარული კოლექციები" : "Popular Collections"}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => {
                const prefix = lang === "en" ? "/en" : "";
                return (
                  <a
                    key={cat}
                    href={`${prefix}/catalog?category=${encodeURIComponent(cat)}`}
                    className="px-3.5 py-1.5 rounded-full border border-[#E8E3DB] bg-white text-xs text-[#4A4640] hover:border-[#141311] hover:text-[#141311] transition-colors"
                  >
                    {cat}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer lang={lang} siteSettings={siteSettings} compact={true} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={(item) => {
          const prefix = lang === "en" ? "/en" : "";
          navigateTo(`${prefix}/product/${encodeURIComponent(item.sku || item.id)}`);
        }}
      />
    </div>
  );
}

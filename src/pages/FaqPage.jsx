import React, { useState, useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { navigateTo } from '../utils/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FaqSection from '../components/store/FaqSection';
import FavoritesModal from '../components/modals/FavoritesModal';

export default function FaqPage() {
  const {
    darkMode, setDarkMode,
    lang, setLang,
    siteSettings,
    favorites
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const brand = siteSettings?.brandName || "მატარე";
    document.title = lang === "ka"
      ? `ხშირად დასმული კითხვები (FAQ) — ${brand}`
      : `Frequently Asked Questions (FAQ) — ${brand}`;
    return () => {
      document.title = `${brand} — საიუველირო სახლი`;
    };
  }, [lang, siteSettings?.brandName]);

  const prefix = lang === "en" ? "/en" : "";

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F4] text-[#1F1C18]">
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

      <main id="main-content" className="flex-1 pt-[118px] sm:pt-[128px]">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-[#787168]">
            <a href={prefix || "/"} className="hover:text-[#1F1C18] transition-colors flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>{lang === "ka" ? "მთავარი" : "Home"}</span>
            </a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1F1C18] font-medium">
              {lang === "ka" ? "კითხვა-პასუხი (FAQ)" : "FAQ"}
            </span>
          </nav>
        </div>

        <FaqSection lang={lang} siteSettings={siteSettings} standalone={true} />
      </main>

      <Footer lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={(prod) => {
          setShowFavoritesModal(false);
          navigateTo(`${prefix}/product/${encodeURIComponent(prod.sku || prod.id)}`);
        }}
      />
    </div>
  );
}

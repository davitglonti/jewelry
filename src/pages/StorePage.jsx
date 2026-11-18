import React, { useState, useEffect, Suspense, lazy } from 'react';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { useStore } from '../context/StoreContext';
import { navigateTo } from '../utils/navigation';
import InfoCards from '../components/store/InfoCards';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroCarousel from '../components/store/HeroCarousel';
import EditorialCategories from '../components/store/EditorialCategories';
import CatalogSection from '../components/store/CatalogSection';
import CraftsmanshipSection from '../components/store/CraftsmanshipSection';
import JournalPreviewSection from '../components/store/JournalPreviewSection';
import ConciergeBannerSection from '../components/store/ConciergeBannerSection';

const FavoritesModal = lazy(() => import('../components/modals/FavoritesModal'));

export default function StorePage() {
  const {
    darkMode, setDarkMode,
    lang, setLang,
    siteSettings,
    favorites,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const itemCode = params.get("item");
    if (itemCode) {
      const prefix = lang === "en" ? "/en" : "";
      window.location.replace(`${prefix}/product/${encodeURIComponent(itemCode)}`);
    }
  }, [lang]);

  const openProductModal = (product) => {
    const code = product.sku || product.id;
    const prefix = lang === "en" ? "/en" : "";
    navigateTo(`${prefix}/product/${encodeURIComponent(code)}`);
  };

  const slides = siteSettings?.heroSlides?.length > 0 ? siteSettings.heroSlides : DEFAULT_SETTINGS.heroSlides;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FAF8F4] text-[#1F1C18]">
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

      <main id="main-content">
        <HeroCarousel
          slides={slides}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          lang={lang}
        />

        <EditorialCategories />

        <CatalogSection openProductModal={openProductModal} />

        <CraftsmanshipSection lang={lang} siteSettings={siteSettings} />

        <InfoCards
          badgeKey="homeValuesBadge"
          badgeKeyEn="homeValuesBadgeEn"
          titleKey="homeValuesTitle"
          titleKeyEn="homeValuesTitleEn"
          itemsKey="homeValues"
          defaultItems={[
            { titleKa: "ბუნებრივი ქვები", titleEn: "Natural Gemstones", descKa: "ვიყენებთ მხოლოდ სერტიფიცირებულ ბრილიანტებსა და ნატურალურ ძვირფას ქვებს.", descEn: "We use only certified diamonds and 100% natural precious gemstones." },
            { titleKa: "უმაღლესი სინჯი", titleEn: "Finest Gold Purity", descKa: "ყველა ნაკეთობა მოწმდება და დადასტურებულია უმაღლესი სინჯით (585° / 750° / 925°).", descEn: "Every piece is hallmarked and verified for authentic karat purity." },
            { titleKa: "საუკუნოვანი გარანტია", titleEn: "Lifetime Warranty", descKa: "ჩვენს ყველა სამკაულს მოყვება ხარისხის სერტიფიკატი და უფასო წმენდა-განახლების სერვისი.", descEn: "Includes an authenticity certificate and complimentary professional cleaning." },
            { titleKa: "ინდივიდუალური მიდგომა", titleEn: "Bespoke Service", descKa: "შესაძლებელია ზომის მორგება და ექსკლუზიური მოდელების ინდივიდუალური შეკვეთა.", descEn: "Custom sizing and personalized consultations for your special moments." }
          ]}
        />

        <JournalPreviewSection />

        <ConciergeBannerSection />
      </main>

      <Footer lang={lang} siteSettings={siteSettings} />

      {showFavoritesModal && (
        <Suspense fallback={null}>
          <FavoritesModal
            isOpen={showFavoritesModal}
            onClose={() => setShowFavoritesModal(false)}
            onSelectProduct={openProductModal}
          />
        </Suspense>
      )}
    </div>
  );
}

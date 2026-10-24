import React, { useState, useEffect } from 'react';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { useStore } from '../context/StoreContext';
import InfoCards from '../components/store/InfoCards';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroCarousel from '../components/store/HeroCarousel';
import CatalogSection from '../components/store/CatalogSection';
import CraftsmanshipSection from '../components/store/CraftsmanshipSection';
import FavoritesModal from '../components/modals/FavoritesModal';

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

  // თუ ვინმე ძველი გაზიარებული ლინკით (?item=AUR-101) შემოვიდა, გადავამისამართოთ ახალ გვერდზე
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const itemCode = params.get("item");
    if (itemCode) {
      window.location.replace(`/product/${encodeURIComponent(itemCode)}`);
    }
  }, []);

  // პროდუქტზე დაჭერისას გადავდივართ ცალკე გვერდზე
  const openProductModal = (product) => {
    const code = product.sku || product.id;
    window.location.href = `/product/${encodeURIComponent(code)}`;
  };

  const slides = siteSettings?.heroSlides?.length > 0 ? siteSettings.heroSlides : DEFAULT_SETTINGS.heroSlides;

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#faf7f2] text-[#1c1917]"}`}>
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

      <HeroCarousel
        slides={slides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        lang={lang}
      />

      <CatalogSection openProductModal={openProductModal} />

      <CraftsmanshipSection darkMode={darkMode} lang={lang} siteSettings={siteSettings} />

      <InfoCards
        badgeKey="aboutValuesBadge"
        titleKey="aboutValuesTitle"
        itemsKey="aboutValues"
        defaultItems={[
          { titleKa: "ბუნებრივი ქვები", titleEn: "Natural Gemstones", descKa: "ვიყენებთ მხოლოდ სერტიფიცირებულ ბრილიანტებსა და ნატურალურ ძვირფას ქვებს.", descEn: "We use only certified diamonds and 100% natural precious gemstones." },
          { titleKa: "უმაღლესი სინჯი", titleEn: "Finest Gold Purity", descKa: "ყველა ნაკეთობა მოწმდება და დადასტურებულია უმაღლესი სინჯით (585° / 750° / 925°).", descEn: "Every piece is hallmarked and verified for authentic karat purity." },
          { titleKa: "საუკუნოვანი გარანტია", titleEn: "Lifetime Warranty", descKa: "ჩვენს ყველა სამკაულს მოყვება ხარისხის სერტიფიკატი და უფასო წმენდა-განახლების სერვისი.", descEn: "Includes an authenticity certificate and complimentary professional cleaning." },
          { titleKa: "ინდივიდუალური მიდგომა", titleEn: "Bespoke Service", descKa: "შესაძლებელია ზომის მორგება და ექსკლუზიური მოდელების ინდივიდუალური შეკვეთა.", descEn: "Custom sizing and personalized consultations for your special moments." }
        ]}
      />

      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={openProductModal}
      />
    </div>
  );
}

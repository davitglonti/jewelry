import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { useStore } from '../context/StoreContext';
import InfoCards from '../components/store/InfoCards';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroCarousel from '../components/store/HeroCarousel';
import CatalogSection from '../components/store/CatalogSection';
import CraftsmanshipSection from '../components/store/CraftsmanshipSection';
import ProductDetailModal from '../components/modals/ProductDetailModal';
import FavoritesModal from '../components/modals/FavoritesModal';
import LightboxModal from '../components/modals/LightboxModal';
import PageLoader from '../components/layout/PageLoader';
export default function StorePage() {
  const {
    darkMode, setDarkMode,
    lang, setLang,
    siteSettings,
    settingsLoaded,
    products,
    favorites
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);

  const initialItemCode = useRef(new URLSearchParams(window.location.search).get("item"));

  // ბმულით (?item=SKU) გახსნილი პროდუქტის პოვნა
  useEffect(() => {
    const itemCode = initialItemCode.current;
    if (!products || products.length === 0 || !itemCode) return;

    const target = decodeURIComponent(itemCode).trim().toLowerCase();
    const found = products.find((p) => {
      const pSku = p.sku?.toString().trim().toLowerCase();
      const pId = p.id?.toString().trim().toLowerCase();
      return (pSku && pSku === target) || (pId && pId === target);
    });

    if (found) {
      setSelectedProduct(found);
      setActiveImageIndex(0);
      setSelectedSize(found.sizes?.[0] || "");
      initialItemCode.current = null;
    }
  }, [products]);

  // URL-ის განახლება მოდალის გახსნა/დახურვისას
  useEffect(() => {
    if (selectedProduct) {
      const code = selectedProduct.sku || selectedProduct.id;
      window.history.replaceState(null, "", `?item=${encodeURIComponent(code)}`);
    } else {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [selectedProduct]);

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : "");
  };

  const slides = siteSettings.heroSlides?.length > 0 ? siteSettings.heroSlides : DEFAULT_SETTINGS.heroSlides;
if (!settingsLoaded) return <PageLoader />;
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

      <ProductDetailModal
        selectedProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        activeImageIndex={activeImageIndex}
        setActiveImageIndex={setActiveImageIndex}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        setLightboxImage={setLightboxImage}
      />

      <LightboxModal
        lightboxImage={lightboxImage}
        setLightboxImage={setLightboxImage}
        selectedProduct={selectedProduct}
        activeImageIndex={activeImageIndex}
        setActiveImageIndex={setActiveImageIndex}
      />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={openProductModal}
      />

   
    </div>
  );
}
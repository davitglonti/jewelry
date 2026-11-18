import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Heart, Check, Share2, ArrowLeftRight,
  Truck, ShieldCheck, Sparkles, ChevronRight, Home
} from 'lucide-react';
import { pick, formatPrice, calculateDiscountPercent } from '../utils/i18n';
import { shareProductLink } from '../utils/shareUtils';
import { navigateTo } from '../utils/navigation';
import { trackProductView } from '../lib/stats';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_PRODUCT_ASSURANCE } from '../data/defaultSettings';

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LightboxModal from '../components/modals/LightboxModal';
import FavoritesModal from '../components/modals/FavoritesModal';
import StockStatusBadge from '../components/store/StockStatusBadge';
import RingSizerModal from '../components/modals/RingSizerModal';
import ProductCard from '../components/store/ProductCard';
import ProductMediaGallery from '../components/store/ProductMediaGallery';
import ProductSpecsTable from '../components/store/ProductSpecsTable';
import ProductStoryHighlights from '../components/store/ProductStoryHighlights';
import ProductActionButtons from '../components/store/ProductActionButtons';

export default function ProductPage({ skuProp }) {
  const rawPath = window.location.pathname;
  const match = rawPath.match(/\/product\/([^/?#]+)/);
  const skuFromUrl = match
    ? decodeURIComponent(match[1])
    : new URLSearchParams(window.location.search).get('item') || '';

  const currentSku = skuProp || skuFromUrl;

  const {
    darkMode, setDarkMode,
    lang, setLang,
    siteSettings,
    products,
    favorites, toggleFavorite,
    compareList, toggleCompare,
    inquiries, setInquiries,
    syncData,
    settingsLoaded
  } = useStore();
  const { user } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [mediaViewMode, setMediaViewMode] = useState("photo");
  const [showRingSizer, setShowRingSizer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const relatedScrollRef = useRef(null);

  const selectedProduct = products?.find((p) => {
    const target = decodeURIComponent(currentSku || "").trim().toLowerCase();
    const pSku = p.sku?.toString().trim().toLowerCase();
    const pId = p.id?.toString().trim().toLowerCase();
    return (pSku && pSku === target) || (pId && pId === target);
  });

  const active360Url = selectedProduct?.video360 || (
    (selectedProduct?.sku === "AUR-101" || selectedProduct?.sku === "AUR-198")
      ? "https://cloudinary-res.cloudinary.com/video/upload/w_600,c_fill,q_auto/dpr_auto/360_demo.mp4"
      : null
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImageIndex(0);
    setMediaViewMode("photo");
    if (selectedProduct?.sizes?.length > 0) {
      setSelectedSize(selectedProduct.sizes[0]);
    } else {
      setSelectedSize("");
    }
  }, [currentSku, selectedProduct]);

  useEffect(() => {
    const targetId = selectedProduct?.id || selectedProduct?.sku || currentSku;
    if (targetId) {
      trackProductView(targetId);
    }
  }, [selectedProduct?.id, selectedProduct?.sku, currentSku]);

  useEffect(() => {
    if (!selectedProduct) return;

    const brand = siteSettings.brandName || "მატარე";
    const prodName = lang === "ka" ? selectedProduct.name : (selectedProduct.nameEn || selectedProduct.name);
    const prodDesc = lang === "ka"
      ? (selectedProduct.description || `${prodName} — ექსკლუზიური ხელნაკეთი საიუველირო ნაკეთობა.`)
      : (selectedProduct.descriptionEn || `${prodName} — handcrafted fine jewelry by ${brand}.`);

    const numericPrice = (selectedProduct.price || "").toString().replace(/[^0-9.]/g, "") || "0";
    const langPrefix = lang === "en" ? "/en" : "";
    const productUrl = `https://www.matare.store${langPrefix}/product/${encodeURIComponent(selectedProduct.sku || selectedProduct.id)}`;
    const mainImage = (selectedProduct.images && selectedProduct.images[0]) || "https://www.matare.store/brand-logo.jpg";

    document.title = `${prodName} — ${brand}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    const oldDesc = metaDesc?.getAttribute("content");
    if (metaDesc) metaDesc.setAttribute("content", prodDesc);

    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": prodName,
      "image": (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images : [mainImage],
      "description": prodDesc,
      "sku": selectedProduct.sku || selectedProduct.id,
      "brand": { "@type": "Brand", "name": brand },
      "category": selectedProduct.category || "სამკაულები",
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "GEL",
        "price": numericPrice,
        "priceValidUntil": "2027-12-31",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    };

    let scriptTag = document.getElementById("product-schema-ld");
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "product-schema-ld";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      document.title = `${brand} — საიუველირო სახლი`;
      if (metaDesc && oldDesc) metaDesc.setAttribute("content", oldDesc);
      const existingScript = document.getElementById("product-schema-ld");
      if (existingScript) existingScript.remove();
    };
  }, [selectedProduct, lang, siteSettings.brandName]);

  const prefix = lang === 'en' ? '/en' : '';
  const goToCatalog = () => navigateTo(`${prefix}/catalog`);
  const goToProduct = (code) => navigateTo(`${prefix}/product/${encodeURIComponent(code)}`);

  if (!settingsLoaded && !selectedProduct) {
    return (
      <div className="min-h-screen w-full bg-[#FAF8F4] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-[#9A7742] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F4] text-[#1F1C18]">
        <Navbar
          lang={lang} setLang={setLang}
          darkMode={darkMode} setDarkMode={setDarkMode}
          favorites={favorites} setShowFavoritesModal={setShowFavoritesModal}
          isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <div className="pt-36 pb-24 text-center space-y-5 px-4">
          <h2 className="font-serif text-3xl font-medium text-[#1F1C18]">
            {lang === "ka" ? "მოდელი ვერ მოიძებნა" : "Piece Not Found"}
          </h2>
          <p className="text-sm text-[#5C564E] max-w-md mx-auto">
            {lang === "ka" ? "სამწუხაროდ, მითითებული კოდით სამკაული არ იძებნება ან უკვე გაყიდულია." : "The requested jewelry piece could not be found."}
          </p>
          <button
            onClick={goToCatalog}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#1F1C18] text-white text-xs font-medium hover:bg-[#35302A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
            {lang === "ka" ? "კატალოგში დაბრუნება" : "Back to Catalog"}
          </button>
        </div>
        <Footer lang={lang} siteSettings={siteSettings} />
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    .slice(0, 4);

  const discountPct = calculateDiscountPercent(selectedProduct.price, selectedProduct.oldPrice);
  const isFav = favorites?.includes(selectedProduct.id);
  const isCompared = compareList?.includes(selectedProduct.id);

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

      <main id="main-content" className="pt-[82px] sm:pt-[90px] pb-20">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Compact Breadcrumb Row */}
          <div className="flex items-center justify-between gap-4 pb-5">
            <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-[#787168] truncate">
              <a href={prefix || "/"} className="hover:text-[#1F1C18] transition-colors flex items-center gap-1">
                <Home className="w-3.5 h-3.5 stroke-[1.75]" />
                <span className="hidden sm:inline">{lang === "ka" ? "მთავარი" : "Home"}</span>
              </a>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <a href={`${prefix}/catalog`} className="hover:text-[#1F1C18] transition-colors">
                {lang === "ka" ? "კოლექცია" : "Collection"}
              </a>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[#1F1C18] font-medium truncate">
                {selectedProduct.category}
              </span>
            </nav>

            <button
              onClick={goToCatalog}
              className="text-xs font-medium text-[#5C564E] hover:text-[#1F1C18] flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[1.75]" />
              <span className="hidden sm:inline">{lang === "ka" ? "კატალოგში დაბრუნება" : "Back to Catalog"}</span>
            </button>
          </div>

          {/* Balanced 2-Column Product Showcase (CTA cleanly visible above the fold!) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left 6 Cols: Gallery */}
            <div className="lg:col-span-6 lg:sticky lg:top-[116px]">
              <ProductMediaGallery
                images={selectedProduct.images}
                productName={selectedProduct.name}
                activeImageIndex={activeImageIndex}
                setActiveImageIndex={setActiveImageIndex}
                active360Url={active360Url}
                mediaViewMode={mediaViewMode}
                setMediaViewMode={setMediaViewMode}
                setLightboxImage={setLightboxImage}
                lang={lang}
              />
            </div>

            {/* Right 6 Cols: Elevated White Atelier Info Card */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE4DB] shadow-[0_4px_24px_rgba(31,28,24,0.04)] space-y-5">
              {/* Top Meta & Utility Pills */}
              <div className="space-y-3 pb-4 border-b border-[#F3EFE8]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F5EFE4] text-[#8A6836] font-medium">
                      {selectedProduct.category}
                    </span>
                    <span className="font-mono text-[#787168]">#{selectedProduct.sku}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          const current = window.location.pathname + window.location.search;
                          navigateTo(`/login?redirect=${encodeURIComponent(current)}`);
                          return;
                        }
                        toggleFavorite(selectedProduct.id);
                      }}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                        isFav
                          ? "bg-[#9E2A2B] text-white border-[#9E2A2B] hover:bg-[#822021]"
                          : "border-[#EAE4DB] bg-[#FAF8F4] text-[#4A453E] hover:bg-[#9E2A2B] hover:border-[#9E2A2B] hover:text-white"
                      }`}
                      title={isFav ? (lang === "ka" ? "რჩეულებშია" : "In Favorites") : (lang === "ka" ? "რჩეულებში დამატება" : "Add to favorites")}
                    >
                      <Heart className={`w-4 h-4 stroke-[1.75] ${isFav ? "fill-white text-white" : ""}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCompare(selectedProduct.id)}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                        isCompared
                          ? "bg-[#9E2A2B] text-white border-[#9E2A2B] hover:bg-[#822021]"
                          : "border-[#EAE4DB] bg-[#FAF8F4] text-[#4A453E] hover:bg-[#9E2A2B] hover:border-[#9E2A2B] hover:text-white"
                      }`}
                      title={lang === "ka" ? "შედარება" : "Compare"}
                    >
                      <ArrowLeftRight className="w-4 h-4 stroke-[1.75]" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        shareProductLink(selectedProduct, lang, () => {
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        })
                      }
                      className={`h-9 px-3 rounded-full border flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        copiedLink
                          ? "border-[#2E7D52] bg-[#F4F8F5] text-[#2B5C40]"
                          : "border-[#EAE4DB] bg-[#FAF8F4] text-[#4A453E] hover:border-[#1F1C18] hover:text-[#1F1C18]"
                      }`}
                      title={lang === "ka" ? "ბმულის გაზიარება" : "Share link"}
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />}
                      <span className="hidden sm:inline">{copiedLink ? (lang === "ka" ? "დაკოპირდა" : "Copied") : (lang === "ka" ? "გაზიარება" : "Share")}</span>
                    </button>
                  </div>
                </div>

                <h1 className="font-serif text-2xl sm:text-4xl font-medium text-[#1F1C18] leading-tight">
                  {lang === "ka" ? selectedProduct.name : (selectedProduct.nameEn || selectedProduct.name)}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl sm:text-3xl font-semibold text-[#1F1C18]">
                      {formatPrice(selectedProduct.price)}
                    </span>
                    {selectedProduct.oldPrice && (
                      <span className="text-base line-through text-[#9E978D]">
                        {formatPrice(selectedProduct.oldPrice)}
                      </span>
                    )}
                    {discountPct ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#9E2A2B] text-white">
                        -{discountPct}%
                      </span>
                    ) : null}
                  </div>

                  <StockStatusBadge
                    status={selectedProduct.stockStatus || 'in_stock'}
                    lang={lang}
                    size="sm"
                    showSubtext={false}
                  />
                </div>
              </div>

              {selectedProduct.description && (
                <p className="text-sm text-[#4A453E] leading-relaxed">
                  {pick(selectedProduct, "description", lang)}
                </p>
              )}

              {/* Primary Sizes & Buy Now CTA Immediately Accessible Above the Fold */}
              <ProductActionButtons
                product={selectedProduct}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                onOpenRingSizer={() => setShowRingSizer(true)}
                lang={lang}
                siteSettings={siteSettings}
                inquiries={inquiries}
                setInquiries={setInquiries}
                syncData={syncData}
                products={products}
              />

              {/* Spacious 2-Column Specs Grid (Zero Mid-Word Wrapping) */}
              <ProductSpecsTable product={selectedProduct} lang={lang} />

              {/* Delivery & Atelier Highlights */}
              <ProductStoryHighlights product={selectedProduct} lang={lang} />
            </div>
          </div>

          {/* Assurance Standards */}
          <section className="mt-16 pt-14 border-t border-[#EAE4DB]">
            <div className="text-center mb-8 space-y-1.5">
              <span className="text-xs font-medium text-[#9A7742] block">
                {lang === "ka"
                  ? `${siteSettings?.brandName || "მატარე"}-ს სტანდარტი და გარანტია`
                  : `${siteSettings?.brandName || "MATARE"} Standards & Guarantee`}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#1F1C18]">
                {lang === "ka" ? "უსაფრთხო შეძენა და უმაღლესი სერვისი" : "Secure Purchase & Exceptional Service"}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {((siteSettings?.productAssurance && siteSettings.productAssurance.length === 3)
                ? siteSettings.productAssurance
                : DEFAULT_PRODUCT_ASSURANCE
              ).map((card, idx) => {
                const Icon = idx === 0 ? Truck : idx === 1 ? ShieldCheck : Sparkles;
                const title = lang === "ka" ? card.titleKa : (card.titleEn || card.titleKa);
                const descRaw = lang === "ka" ? card.descKa : (card.descEn || card.descKa);
                const lines = (descRaw || "").split("\n").filter(Boolean);

                return (
                  <div key={card.id || idx} className="p-6 sm:p-7 rounded-2xl bg-white border border-[#EAE4DB] shadow-xs space-y-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#F5EFE4] text-[#9A7742] flex items-center justify-center">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <h4 className="font-serif text-xl font-medium text-[#1F1C18]">{title}</h4>
                    <ul className="space-y-2 text-sm text-[#4A453E] leading-relaxed">
                      {lines.map((line, lIdx) => {
                        const cleanLine = line.replace(/^[•\s-]+/, "");
                        return (
                          <li key={lIdx} className="flex items-start gap-2">
                            <span className="text-[#9A7742] mt-0.5 shrink-0">•</span>
                            <span>{cleanLine}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Similar Pieces */}
          {relatedProducts.length > 0 && (
            <section className="mt-16 pt-12 border-t border-[#EAE4DB]">
              <div className="mb-7">
                <span className="text-xs font-medium text-[#9A7742] block mb-1">
                  {lang === "ka" ? "კოლექცია" : "You May Also Like"}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#1F1C18]">
                  {lang === "ka" ? "მსგავსი მოდელები" : "Similar Pieces"}
                </h3>
              </div>

              <div
                ref={relatedScrollRef}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
              >
                {relatedProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onClick={(p) => goToProduct(p.sku || p.id)}
                    showDetailsButton={true}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer lang={lang} siteSettings={siteSettings} />

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
        onSelectProduct={(prod) => {
          setShowFavoritesModal(false);
          goToProduct(prod.sku || prod.id);
        }}
      />

      <RingSizerModal
        isOpen={showRingSizer}
        onClose={() => setShowRingSizer(false)}
        onSelectSize={(newSize) => {
          const match = selectedProduct?.sizes?.find(
            (s) => s === newSize || s.startsWith(newSize) || newSize.startsWith(s)
          );
          setSelectedSize(match || newSize);
        }}
        availableSizes={selectedProduct?.sizes || []}
        productName={lang === "ka" ? selectedProduct?.name : (selectedProduct?.nameEn || selectedProduct?.name)}
      />
    </div>
  );
}

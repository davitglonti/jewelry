import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Heart, Check, Share2, ArrowLeftRight,
  Truck, ShieldCheck, Sparkles
} from 'lucide-react';
import { pick, formatPrice, calculateDiscountPercent } from '../utils/i18n';
import { shareProductLink } from '../utils/shareUtils';
import { useStore } from '../context/StoreContext';
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
import ProductActionButtons from '../components/store/ProductActionButtons';

export default function ProductPage({ skuProp }) {
  // ვიღებთ პროდუქტის კოდს URL-იდან (მაგ: /product/AUR-102)
  const rawPath = window.location.pathname;
  const skuFromUrl = rawPath.startsWith('/product/')
    ? rawPath.replace('/product/', '').replace(/\/$/, '')
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [mediaViewMode, setMediaViewMode] = useState("photo"); // 'photo' | '360'
  const [showRingSizer, setShowRingSizer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const relatedScrollRef = useRef(null);

  // პროდუქტის მოძებნა SKU ან ID-ით
  const selectedProduct = products?.find((p) => {
    const target = decodeURIComponent(currentSku || "").trim().toLowerCase();
    const pSku = p.sku?.toString().trim().toLowerCase();
    const pId = p.id?.toString().trim().toLowerCase();
    return (pSku && pSku === target) || (pId && pId === target);
  });

  // 360° Video URL - either directly on product or demo fallback for testing
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

  // ბრაუზერის ტაბის სათაურის, OpenGraph-ისა და Product Schema JSON-LD-ის დინამიური განახლება (SEO)
  useEffect(() => {
    if (!selectedProduct) return;

    const brand = siteSettings.brandName || "AURELIA";
    const prodName = lang === "ka" ? selectedProduct.name : (selectedProduct.nameEn || selectedProduct.name);
    const prodDesc = lang === "ka"
      ? (selectedProduct.description || `${prodName} — ექსკლუზიური ხელნაკეთი საიუველირო ნაკეთობა. სინჯი: ${selectedProduct.karat || "750°"}.`)
      : (selectedProduct.descriptionEn || `${prodName} — handcrafted fine jewelry by ${brand}.`);

    const numericPrice = (selectedProduct.price || "").toString().replace(/[^0-9.]/g, "") || "0";
    const productUrl = `https://www.matare.store/product/${encodeURIComponent(selectedProduct.sku || selectedProduct.id)}`;
    const mainImage = (selectedProduct.images && selectedProduct.images[0]) || "https://www.matare.store/brand-logo.jpg";

    // 1. სათაური & Meta Description
    document.title = `${prodName} — ${brand}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    const oldDesc = metaDesc?.getAttribute("content");
    if (metaDesc) metaDesc.setAttribute("content", prodDesc);

    // 2. OpenGraph & Twitter Cards (სოციალურ ქსელებში გაზიარებისთვის)
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    const twImage = document.querySelector('meta[name="twitter:image"]');

    let imageSrcLink = document.querySelector('link[rel="image_src"]');
    if (!imageSrcLink) {
      imageSrcLink = document.createElement('link');
      imageSrcLink.setAttribute('rel', 'image_src');
      document.head.appendChild(imageSrcLink);
    }

    const prevOg = {
      title: ogTitle?.getAttribute("content"),
      desc: ogDesc?.getAttribute("content"),
      image: ogImage?.getAttribute("content"),
      url: ogUrl?.getAttribute("content")
    };

    if (ogTitle) ogTitle.setAttribute("content", `${prodName} — ${brand}`);
    if (ogDesc) ogDesc.setAttribute("content", prodDesc);
    if (ogImage && mainImage) ogImage.setAttribute("content", mainImage);
    if (ogUrl) ogUrl.setAttribute("content", productUrl);
    if (twTitle) twTitle.setAttribute("content", `${prodName} — ${brand}`);
    if (twDesc) twDesc.setAttribute("content", prodDesc);
    if (twImage && mainImage) twImage.setAttribute("content", mainImage);
    if (imageSrcLink && mainImage) imageSrcLink.setAttribute("href", mainImage);

    // 3. Google Schema.org Product JSON-LD (Rich Snippets & ფასის გამოჩენა ძიებაში)
    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": prodName,
      "image": (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images : [mainImage],
      "description": prodDesc,
      "sku": selectedProduct.sku || selectedProduct.id,
      "brand": {
        "@type": "Brand",
        "name": brand
      },
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
      if (ogTitle && prevOg.title) ogTitle.setAttribute("content", prevOg.title);
      if (ogDesc && prevOg.desc) ogDesc.setAttribute("content", prevOg.desc);
      if (ogImage && prevOg.image) ogImage.setAttribute("content", prevOg.image);
      if (ogUrl && prevOg.url) ogUrl.setAttribute("content", prevOg.url);
      if (twImage && prevOg.image) twImage.setAttribute("content", prevOg.image);
      if (imageSrcLink && prevOg.image) imageSrcLink.setAttribute("href", prevOg.image);

      const existingScript = document.getElementById("product-schema-ld");
      if (existingScript) existingScript.remove();
    };
  }, [selectedProduct, lang, siteSettings.brandName]);

  const goToHome = () => {
    window.location.href = "/";
  };

  const goToProduct = (code) => {
    window.location.href = `/product/${encodeURIComponent(code)}`;
  };

  if (!settingsLoaded && !selectedProduct) {
    return (
      <div className="min-h-screen w-full bg-[#0c0b0a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className={`min-h-screen flex flex-col justify-between ${darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#faf7f2] text-[#1c1917]"}`}>
        <Navbar
          lang={lang} setLang={setLang}
          darkMode={darkMode} setDarkMode={setDarkMode}
          favorites={favorites} setShowFavoritesModal={setShowFavoritesModal}
          isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <div className="py-24 text-center space-y-5 px-4">
          <h2 className="font-serif text-3xl text-amber-500">
            {lang === "ka" ? "მოდელი ვერ მოიძებნა" : "Piece Not Found"}
          </h2>
          <p className="text-sm opacity-70 max-w-md mx-auto">
            {lang === "ka" ? "სამწუხაროდ, მითითებული კოდით სამკაული არ იძებნება ან უკვე გაყიდულია." : "The requested jewelry piece could not be found."}
          </p>
          <button
            onClick={goToHome}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === "ka" ? "მთავარ გვერდზე დაბრუნება" : "Back to Home"}
          </button>
        </div>
        <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    .slice(0, 4);

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#fcfbf9] text-[#1c1917]"}`}>
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

      {/* უკან დაბრუნების ზოლი */}
      <div className={`px-4 sm:px-6 lg:px-8 py-3.5 border-b flex items-center justify-between ${
        darkMode ? "bg-[#121110] border-stone-800" : "bg-white border-stone-200"
      }`}>
        <button
          onClick={goToHome}
          className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all ${
            darkMode ? "bg-stone-800 hover:bg-stone-700 text-white" : "bg-stone-100 hover:bg-stone-200 text-stone-800"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === "ka" ? "კატალოგში დაბრუნება" : "Back to Catalog"}</span>
        </button>

        <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
          {selectedProduct.sku} • {selectedProduct.category}
        </span>
      </div>

      {/* ძირითადი კონტენტი */}
      <main className="w-full max-w-none px-3 sm:px-5 lg:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 xl:gap-12 items-start">
          
          {/* მარცხენა მხარე: ფოტოების გალერეა + Zoom + 360 */}
          <ProductMediaGallery
            images={selectedProduct.images}
            productName={selectedProduct.name}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
            active360Url={active360Url}
            mediaViewMode={mediaViewMode}
            setMediaViewMode={setMediaViewMode}
            setLightboxImage={setLightboxImage}
            darkMode={darkMode}
            lang={lang}
          />

          {/* მარჯვენა მხარე: ინფორმაცია და კონტაქტი */}
          <div className="space-y-5 sm:space-y-6">
            <div>
              {/* Category, SKU & Actions Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="inline-flex items-center gap-2 min-w-0">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25 font-semibold uppercase tracking-wider text-[11px] truncate">
                    {selectedProduct.category}
                  </span>
                  <span className="font-mono text-stone-400 text-xs shrink-0">
                    #{selectedProduct.sku}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Favorite Button */}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(selectedProduct.id)}
                    className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                      favorites?.includes(selectedProduct.id)
                        ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20 font-semibold"
                        : "bg-stone-500/10 border-stone-500/20 text-stone-300 hover:text-rose-400 hover:border-rose-500/40 hover:bg-stone-500/20"
                    }`}
                    title={favorites?.includes(selectedProduct.id) ? (lang === "ka" ? "რჩეულებშია" : "In Favorites") : (lang === "ka" ? "რჩეულებში დამატება" : "Add to favorites")}
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites?.includes(selectedProduct.id) ? "fill-white text-white" : ""}`} />
                    <span className="text-[11px] hidden xs:inline">
                      {favorites?.includes(selectedProduct.id)
                        ? (lang === "ka" ? "რჩეულია" : "Saved")
                        : (lang === "ka" ? "რჩეული" : "Favorite")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      shareProductLink(selectedProduct, lang, () => {
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      })
                    }
                    className={`h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                      copiedLink
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : "bg-stone-500/10 border-stone-500/20 text-stone-300 hover:text-amber-400 hover:border-amber-500/40 hover:bg-stone-500/20"
                    }`}
                    title={lang === "ka" ? "ბმულის გაზიარება" : "Share link"}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] font-semibold">{lang === "ka" ? "დაკოპირდა!" : "Copied!"}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[11px]">{lang === "ka" ? "გაზიარება" : "Share"}</span>
                      </>
                    )}
                  </button>

                  {/* Compare Button */}
                  <button
                    type="button"
                    onClick={() => toggleCompare(selectedProduct.id)}
                    className={`h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                      compareList?.includes(selectedProduct.id)
                        ? "bg-amber-500 text-black border-amber-500 font-semibold shadow-md shadow-amber-500/20"
                        : "bg-stone-500/10 border-stone-500/20 text-stone-300 hover:text-amber-400 hover:border-amber-500/40 hover:bg-stone-500/20"
                    }`}
                    title={lang === "ka" ? "შედარების სიაში დამატება" : "Compare"}
                  >
                    <ArrowLeftRight className={`w-3.5 h-3.5 ${compareList?.includes(selectedProduct.id) ? "text-black" : "text-amber-500"}`} />
                    <span className="text-[11px]">
                      {compareList?.includes(selectedProduct.id)
                        ? (lang === "ka" ? "შედარებაშია ✓" : "In Compare ✓")
                        : (lang === "ka" ? "შედარება" : "Compare")}
                    </span>
                  </button>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl mt-3 font-normal leading-tight">
                {lang === "ka" ? selectedProduct.name : (selectedProduct.nameEn || selectedProduct.name)}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-serif text-2xl sm:text-3xl text-amber-500 font-semibold">
                    {formatPrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.oldPrice && (
                    <span className="font-serif text-lg line-through opacity-40">
                      {formatPrice(selectedProduct.oldPrice)}
                    </span>
                  )}
                </div>

                {(() => {
                  const discountPct = calculateDiscountPercent(selectedProduct.price, selectedProduct.oldPrice);
                  if (!discountPct) return null;
                  return (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-red-600 text-white shadow-sm flex items-center gap-1">
                      <span>{lang === "ka" ? "ფასდაკლება" : "Sale"}</span>
                      <span className="font-mono font-bold bg-black/25 px-1 rounded">-{discountPct}%</span>
                    </span>
                  );
                })()}

                <div className="sm:ml-auto">
                  <StockStatusBadge
                    status={selectedProduct.stockStatus || 'in_stock'}
                    lang={lang}
                    showSubtext={true}
                  />
                </div>
              </div>
            </div>

            {selectedProduct.description && (
              <p className="text-sm sm:text-base opacity-80 leading-relaxed">
                {pick(selectedProduct, "description", lang)}
              </p>
            )}

            {/* Specifications Cards */}
            <ProductSpecsTable product={selectedProduct} darkMode={darkMode} lang={lang} />

            {/* Actions: Size Selector, WhatsApp/Messenger, Consultation Callback Form */}
            <ProductActionButtons
              product={selectedProduct}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              onOpenRingSizer={() => setShowRingSizer(true)}
              darkMode={darkMode}
              lang={lang}
              siteSettings={siteSettings}
              inquiries={inquiries}
              setInquiries={setInquiries}
              syncData={syncData}
              products={products}
            />
          </div>

        </div>

        {/* PRODUCT ASSURANCE CARDS */}
        <div className="mt-16 pt-12 border-t border-stone-500/15 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 px-4">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold block mb-1">
              {lang === "ka"
                ? `${siteSettings?.brandName || "MATARE"}-ს სტანდარტი და გარანტია`
                : `${siteSettings?.brandName || "MATARE"} Standards & Guarantee`}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-normal">
              {lang === "ka" ? "უსაფრთხო შეძენა და უმაღლესი სერვისი" : "Secure Purchase & Exceptional Service"}
            </h3>
          </div>

          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none">
            {((siteSettings?.productAssurance && siteSettings.productAssurance.length === 3)
              ? siteSettings.productAssurance
              : DEFAULT_PRODUCT_ASSURANCE
            ).map((card, idx) => {
              const Icon = idx === 0 ? Truck : idx === 1 ? ShieldCheck : Sparkles;
              const title = lang === "ka" ? card.titleKa : (card.titleEn || card.titleKa);
              const descRaw = lang === "ka" ? card.descKa : (card.descEn || card.descKa);
              const lines = (descRaw || "").split("\n").filter(Boolean);

              return (
                <div
                  key={card.id || idx}
                  className={`w-[82vw] min-w-[82vw] sm:w-[320px] sm:min-w-[320px] md:w-auto md:min-w-0 snap-start p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between shrink-0 md:shrink ${
                    darkMode
                      ? "bg-stone-900/60 border-stone-800 hover:border-amber-500/30"
                      : "bg-white border-stone-200/90 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif text-lg font-medium mb-3">
                      {title}
                    </h4>
                    <ul className="space-y-2.5 text-xs opacity-85 leading-relaxed">
                      {lines.map((line, lIdx) => {
                        const cleanLine = line.replace(/^[•\s-]+/, "");
                        return (
                          <li key={lIdx} className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                            <span>{cleanLine}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* მსგავსი პროდუქტების სექცია */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-stone-500/20 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 sm:mb-8 pb-4 border-b border-stone-500/15">
              <span className="text-xs uppercase tracking-[0.25em] text-amber-500 font-medium block mb-1.5">
                {lang === "ka" ? "კოლექცია" : "Collection"}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal">
                {lang === "ka" ? "მსგავსი მოდელები" : "Similar Pieces"}
              </h3>
            </div>

            <div
              ref={relatedScrollRef}
              className="-mx-4 px-4 sm:mx-0 sm:px-0 flex lg:grid lg:grid-cols-4 gap-3 sm:gap-5 xl:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 snap-x snap-mandatory scrollbar-none"
            >
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onClick={(p) => goToProduct(p.sku || p.id)}
                  className="shrink-0 lg:shrink w-[40vw] min-w-[40vw] sm:w-[220px] sm:min-w-[220px] lg:w-auto lg:min-w-0 snap-start"
                  showDetailsButton={false}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />

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

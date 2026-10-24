import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ZoomIn, ChevronLeft, ChevronRight,
  Check, Share2, MessageCircle, Send,
  Truck, ShieldCheck, Sparkles, ChevronDown
} from 'lucide-react';
import { pick, formatPrice, calculateDiscountPercent } from '../utils/i18n';
import { getWhatsAppLink, shareProductLink } from '../utils/shareUtils';
import { useStore } from '../context/StoreContext';
import { DEFAULT_PRODUCT_ASSURANCE } from '../data/defaultSettings';

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import LightboxModal from '../components/modals/LightboxModal';
import FavoritesModal from '../components/modals/FavoritesModal';

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
    favorites,
    inquiries, setInquiries,
    syncData,
    settingsLoaded
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);

  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);


  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [inquirySent, setInquirySent] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // პროდუქტის მოძებნა SKU ან ID-ით
  const selectedProduct = products?.find((p) => {
    const target = decodeURIComponent(currentSku || "").trim().toLowerCase();
    const pSku = p.sku?.toString().trim().toLowerCase();
    const pId = p.id?.toString().trim().toLowerCase();
    return (pSku && pSku === target) || (pId && pId === target);
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImageIndex(0);
    setInquirySent(false);
    setPhoneError("");
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
    const mainImage = (selectedProduct.images && selectedProduct.images[0]) || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80";

    // 1. სათაური & Meta Description
    document.title = `${prodName} — ${brand}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    const oldDesc = metaDesc?.getAttribute("content");
    if (metaDesc) metaDesc.setAttribute("content", prodDesc);

    // 2. OpenGraph (სოციალურ ქსელებში გაზიარებისთვის)
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');

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

  const handleMouseMoveZoom = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleSendInquiry = (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setPhoneError(lang === "ka" ? "გთხოვთ შეიყვანოთ თქვენი სახელი" : "Please enter your name");
      return;
    }

    const cleanedPhone = clientPhone.replace(/[\s\-()]/g, "");
    const georgianPhoneRegex = /^(\+?995)?5\d{8}$/;

    if (!cleanedPhone || !georgianPhoneRegex.test(cleanedPhone)) {
      setPhoneError(
        lang === "ka"
          ? "შეიყვანეთ სწორი ქართული ნომერი (მაგ: 555 12 34 56)"
          : "Please enter a valid Georgian number (e.g. 555 12 34 56)"
      );
      return;
    }

    setPhoneError("");

    const newInq = {
      id: Date.now().toString(),
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      size: selectedSize,
      clientName,
      clientPhone: cleanedPhone,
      date: new Date().toLocaleString("ka-GE")
    };
    const updatedInquiries = [newInq, ...inquiries];
    setInquiries(updatedInquiries);
    syncData(siteSettings, products, updatedInquiries);
    setClientName("");
    setClientPhone("");
    setInquirySent(true);
  };

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
          
          {/* მარცხენა მხარე: ფოტოების სივრცე უცვლელი პროპორციებით */}
          <div className="space-y-4">
            <div
              className={`relative w-full h-[calc(100vh-155px)] max-h-[700px] min-h-[350px] rounded-3xl overflow-hidden border flex items-center justify-center cursor-zoom-in group ${
                darkMode ? "bg-[#141210] border-stone-800" : "bg-white border-stone-200/80 shadow-sm"
              }`}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMoveZoom}
              onClick={() => setLightboxImage(selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0])}
            >
              <img
                src={selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0]}
                alt={selectedProduct.name}
                className="w-full h-full object-contain transition-transform duration-200 p-4"
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPos.x}\%${zoomPos.y}%`,
                        transform: "scale(2.35)"
                      }
                    : {}
                }
              />
              <div className="absolute bottom-4 right-4 px-3.5 py-2 rounded-full bg-black/70 text-white text-xs flex items-center gap-2 pointer-events-none backdrop-blur-sm">
                <ZoomIn className="w-4 h-4 text-amber-400" />
                {lang === "ka" ? "მაუსით მიახლოება / გადიდება" : "Hover to Zoom / Click Fullscreen"}
              </div>

              {selectedProduct.images?.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length);
                    }}
                    aria-label={lang === "ka" ? "წინა ფოტო" : "Previous photo"}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black backdrop-blur-sm transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
                    }}
                    aria-label={lang === "ka" ? "შემდეგი ფოტო" : "Next photo"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black backdrop-blur-sm transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {selectedProduct.images?.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {selectedProduct.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`${lang === "ka" ? "ფოტო" : "Photo"} ${idx + 1}`}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx ? "border-amber-500 scale-105 shadow-lg shadow-amber-500/20" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`${selectedProduct.name} - ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* მარჯვენა მხარე: ინფორმაცია და კონტაქტი */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-amber-500 uppercase tracking-widest font-medium">
                  <span>{selectedProduct.category}</span>
                  <span>•</span>
                  <span>{selectedProduct.sku}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    shareProductLink(selectedProduct, lang, () => {
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    })
                  }
                  className="px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-black text-xs font-medium flex items-center gap-2 transition-all"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{lang === "ka" ? "დაკოპირდა!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>{lang === "ka" ? "გაზიარება" : "Share"}</span>
                    </>
                  )}
                </button>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl mt-2 font-normal">
                {lang === "ka" ? selectedProduct.name : (selectedProduct.nameEn || selectedProduct.name)}
              </h1>

              <div className="flex items-baseline gap-4 mt-3">
                {selectedProduct.oldPrice && (
                  <span className="font-serif text-xl line-through opacity-40">
                    {formatPrice(selectedProduct.oldPrice)}
                  </span>
                )}
                <span className="font-serif text-3xl text-amber-500 font-semibold">
                  {formatPrice(selectedProduct.price)}
                </span>
                {(() => {
                  const discountPct = calculateDiscountPercent(selectedProduct.price, selectedProduct.oldPrice);
                  if (!discountPct) return null;
                  return (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-red-600 text-white shadow-md shadow-red-950/40 flex items-center gap-1.5">
                      <span>{lang === "ka" ? "ფასდაკლება" : "Sale"}</span>
                      <span className="font-mono font-bold bg-black/30 px-1.5 py-0.5 rounded-full text-[11px]">-{discountPct}%</span>
                    </span>
                  );
                })()}
              </div>
            </div>

            <p className="text-sm sm:text-base opacity-80 leading-relaxed">
              {pick(selectedProduct, "description", lang)}
            </p>

            <div className={`grid grid-cols-2 gap-4 p-5 rounded-3xl border text-xs sm:text-sm ${
              darkMode ? "bg-stone-900/60 border-stone-800" : "bg-white border-stone-200/80 shadow-xs"
            }`}>
              <div>
                <span className="opacity-60 block text-xs">{lang === "ka" ? "მეტალი:" : "Metal:"}</span>
                <span className="font-medium">{selectedProduct.metal}</span>
              </div>
              <div>
                <span className="opacity-60 block text-xs">{lang === "ka" ? "სინჯი:" : "Karat:"}</span>
                <span className="font-medium">{selectedProduct.karat}</span>
              </div>
              <div>
                <span className="opacity-60 block text-xs">{lang === "ka" ? "წონა:" : "Weight:"}</span>
                <span className="font-medium">{selectedProduct.weight}</span>
              </div>
              <div>
                <span className="opacity-60 block text-xs">{lang === "ka" ? "ქვები:" : "Gemstones:"}</span>
                <span className="font-medium">{selectedProduct.stones}</span>
              </div>
            </div>

            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="uppercase tracking-wider opacity-75 font-medium">
                    {lang === "ka" ? "აირჩიეთ ზომა:" : "Select Size:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-amber-500 underline hover:text-amber-600 font-medium"
                  >
                    {lang === "ka" ? "ზომის გზამკვლევი" : "Size Guide"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {selectedProduct.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium border transition-all ${
                        selectedSize === sz
                          ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20"
                          : darkMode
                          ? "border-stone-800 hover:border-amber-500/50 bg-stone-900"
                          : "border-stone-200 hover:border-amber-500 bg-white shadow-xs"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                {showSizeGuide && (
                  <div className="relative">
                    <div className={`absolute left-0 right-0 z-20 p-4 rounded-2xl border shadow-2xl backdrop-blur-md space-y-1.5 animate-fadeIn ${
                      darkMode ? "bg-[#1a1816]/95 border-amber-500/40 text-stone-200" : "bg-white/95 border-amber-500/30 text-stone-800"
                    }`}>
                      <div className="flex items-center justify-between pb-1 border-b border-stone-500/20">
                        <p className="font-semibold text-amber-500 text-xs">
                          {lang === "ka" ? "სტანდარტული ზომების ცხრილი:" : "Standard Size Reference:"}
                        </p>
                        <button type="button" onClick={() => setShowSizeGuide(false)} aria-label="Close size guide" className="text-xs opacity-60 hover:opacity-100">
                          ✕
                        </button>
                      </div>
                      <p className="text-xs">16.0 მმ ≈ თითის გარშემოწერილობა 50 მმ (US 5.5)</p>
                      <p className="text-xs">16.5 მმ ≈ თითის გარშემოწერილობა 52 მმ (US 6)</p>
                      <p className="text-xs">17.0 მმ ≈ თითის გარშემოწერილობა 53.5 მმ (US 6.5)</p>
                      <p className="text-xs">17.5 მმ ≈ თითის გარშემოწერილობა 55 მმ (US 7)</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <span className="text-xs uppercase tracking-wider opacity-70 block font-medium">
                {lang === "ka" ? "სწრაფი დაკავშირება ამ მოდელზე:" : "Instant Inquiry for this Piece:"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={getWhatsAppLink(selectedProduct, siteSettings, lang, selectedSize)}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3.5 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-700/20 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  {lang === "ka" ? "WhatsApp-ში მიწერა" : "Ask on WhatsApp"}
                </a>
                <a
                  href={siteSettings.messenger || "https://m.me/"}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3.5 px-5 rounded-2xl bg-blue-700 hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-blue-700/20 transition-all"
                >
                  <Send className="w-5 h-5" />
                  {lang === "ka" ? "Messenger-ში მიწერა" : "Ask on Messenger"}
                </a>
              </div>
            </div>


            <form onSubmit={handleSendInquiry} noValidate className={`space-y-3.5 p-6 rounded-3xl border ${
              darkMode ? "bg-stone-900/40 border-stone-800" : "bg-white border-stone-200/80 shadow-sm"
            }`}>
              <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                {lang === "ka" ? "ან დაგვიტოვეთ ნომერი კონსულტაციისთვის:" : "Or Request a Private Callback:"}
              </div>
              {inquirySent ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 text-xs sm:text-sm flex items-center gap-2.5">
                  <Check className="w-5 h-5 shrink-0" />
                  {lang === "ka" ? "მოთხოვნა მიღებულია! ჩვენი კონსულტანტი მალე დაგიკავშირდებათ." : "Request sent! Our consultant will contact you shortly."}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        if (phoneError) setPhoneError("");
                      }}
                      placeholder={lang === "ka" ? "თქვენი სახელი" : "Your Name"}
                      aria-label={lang === "ka" ? "თქვენი სახელი" : "Your Name"}
                      className={`px-4 py-3 rounded-2xl text-xs sm:text-sm border outline-none transition-all ${
                        darkMode ? "bg-stone-900 border-stone-700 text-white focus:border-amber-500" : "bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-500"
                      }`}
                    />
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => {
                        setClientPhone(e.target.value);
                        if (phoneError) setPhoneError("");
                      }}
                      placeholder={lang === "ka" ? "5XX XX XX XX" : "+995 5XX XX XX XX"}
                      aria-label={lang === "ka" ? "ტელეფონის ნომერი" : "Phone number"}
                      className={`px-4 py-3 rounded-2xl text-xs sm:text-sm border outline-none transition-all ${
                        phoneError
                          ? "border-red-500 bg-red-500/10 text-red-200"
                          : darkMode
                          ? "bg-stone-900 border-stone-700 text-white focus:border-amber-500"
                          : "bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-500"
                      }`}
                    />
                  </div>

                  {phoneError && (
                    <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-500 text-xs font-medium">
                      ⚠️ {phoneError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-xl shadow-amber-500/20"
                  >
                    {lang === "ka" ? "ზარის მოთხოვნა" : "Request Consultation"}
                  </button>
                </>
              )}
            </form>
          </div>

        </div>

        
        {/* PRODUCT ASSURANCE CARDS (Full Width 3-Column Banner on Desktop, Horizontal Swipe on Mobile) */}
        <div className="mt-16 pt-12 border-t border-stone-500/15 w-full max-w-[1720px] mx-auto">
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

          {/* Swipeable on Mobile, 3-column Grid on Desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none px-4 sm:px-0">
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
                  className={`min-w-[85%] sm:min-w-[70%] md:min-w-0 snap-center p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between shrink-0 md:shrink ${
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

          {/* Mobile Swipe Hint */}
          <div className="flex md:hidden items-center justify-center gap-1.5 mt-2 opacity-50 text-[11px]">
            <span>←</span>
            <span>{lang === "ka" ? "გადაფურცლეთ ბარათები" : "Swipe cards"}</span>
            <span>→</span>
          </div>
        </div>

        {/* მსგავსი პროდუქტების სექცია */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-stone-500/20 max-w-7xl mx-auto">
            <h3 className="font-serif text-2xl sm:text-3xl mb-8">
              {lang === "ka" ? "მსგავსი მოდელები" : "Similar Pieces"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => goToProduct(item.sku || item.id)}
                  className={`group cursor-pointer rounded-3xl overflow-hidden border transition-all ${
                    darkMode ? "bg-[#141210] border-stone-800 hover:border-amber-500/40" : "bg-white border-stone-200 shadow-xs hover:shadow-md"
                  }`}
                >
                  <div className="aspect-square overflow-hidden bg-stone-900/20">
                    <img
                      src={item.images?.[0]}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <div className="text-[11px] text-amber-500 uppercase tracking-wider">{item.sku}</div>
                    <h4 className="font-serif text-lg truncate">
                      {lang === "ka" ? item.name : (item.nameEn || item.name)}
                    </h4>
                    <div className="font-serif text-amber-500 font-semibold">{formatPrice(item.price)}</div>
                  </div>
                </div>
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
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Trash2, ChevronLeft, ChevronRight, ZoomIn, X,
  MessageCircle, Send, Check, Gem, SlidersHorizontal, Eye, Share2, ArrowLeft
} from 'lucide-react';
import { pick } from './utils/i18n';
import { DEFAULT_SETTINGS } from './data/defaultSettings';
import { ALL, SLIDE_INTERVAL_MS } from './constants';
import { useStore } from './context/StoreContext';
import { getWhatsAppLink, shareProductLink } from './utils/shareUtils';
import AdminPage from './pages/AdminPage';

// ახალი გამოყოფილი კომპონენტები:
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroCarousel from './components/store/HeroCarousel';
import CraftsmanshipSection from './components/store/CraftsmanshipSection';

export default function App() {
  const {
    darkMode, setDarkMode,
    lang, setLang,
    siteSettings,
    products,
    favorites, toggleFavorite,
    inquiries, setInquiries,
    syncData
  } = useStore();

  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    const path = window.location.pathname.replace(/\/+$/, "");
    return path === "/admin";
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/\/+$/, "");
      setIsAdminRoute(path === "/admin");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState(ALL);
  const [selectedMetal, setSelectedMetal] = useState(ALL);
  const [onlyExclusive, setOnlyExclusive] = useState(false);
  const [onlyOnSale, setOnlyOnSale] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientNote, setClientNote] = useState("");
  const [inquirySent, setInquirySent] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (!lightboxImage || !selectedProduct?.images) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length);
      } else if (e.key === "Escape") {
        setLightboxImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, selectedProduct]);

  const initialItemCode = useRef(new URLSearchParams(window.location.search).get("item"));

  useEffect(() => {
    if (isAdminRoute) return;
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
  }, [products, isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute) return;
    if (selectedProduct) {
      const code = selectedProduct.sku || selectedProduct.id;
      window.history.replaceState(null, "", `?item=${encodeURIComponent(code)}`);
    } else {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [selectedProduct, isAdminRoute]);

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : "");
    setInquirySent(false);
    setPhoneError("");
  };

  const handleMouseMoveZoom = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleSendInquiry = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

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
      clientNote,
      date: new Date().toLocaleString("ka-GE")
    };
    const updatedInquiries = [newInq, ...inquiries];
    setInquiries(updatedInquiries);
    syncData(siteSettings, products, updatedInquiries);
    setClientName("");
    setClientPhone("");
    setClientNote("");
    setInquirySent(true);
  };

  const filteredProducts = products.filter((item) => {
    const matchesCat = selectedCategory === ALL || item.category === selectedCategory;
    const matchesMetal = selectedMetal === ALL || item.metal === selectedMetal;
    const matchesExcl = !onlyExclusive || item.exclusive;
    const matchesSale = !onlyOnSale || (item.oldPrice && item.oldPrice.trim() !== "");
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.nameEn?.toLowerCase().includes(q) ||
      item.sku?.toLowerCase().includes(q) ||
      item.stones?.toLowerCase().includes(q);
    return matchesCat && matchesMetal && matchesExcl && matchesSale && matchesSearch;
  });

  const slides = siteSettings.heroSlides?.length > 0 ? siteSettings.heroSlides : DEFAULT_SETTINGS.heroSlides;

  if (isAdminRoute) {
    return <AdminPage />;
  }

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#faf7f2] text-[#1c1917]"}`}>
      
      {/* Navbar კომპონენტი */}
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

      {/* Hero კარუსელის კომპონენტი */}
      <HeroCarousel
        slides={slides}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        lang={lang}
      />

      {/* კატალოგის სექცია */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-amber-500 block mb-2">
              {lang === "ka" ? "საიუველირო ვიტრინა" : "Fine Jewelry Showcase"}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl">
              {lang === "ka" ? "ჩვენი კოლექცია" : "Our Collection"}
            </h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "ka" ? "ძიება სახელით ან კოდით (AUR-101)..." : "Search by name or SKU..."}
              className={`w-full pl-11 pr-4 py-3 rounded-full text-sm border outline-none transition-all ${
                darkMode
                  ? "bg-stone-900/90 border-stone-800 focus:border-amber-500 text-white"
                  : "bg-white border-stone-200 focus:border-amber-600 text-stone-900"
              }`}
            />
          </div>
        </div>

        <div className={`p-5 rounded-3xl border mb-10 space-y-4 ${darkMode ? "bg-stone-900/50 border-stone-800/80" : "bg-white border-stone-200 shadow-sm"}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider opacity-60 mr-2 flex items-center gap-1">
              <Gem className="w-3.5 h-3.5 text-amber-500" />
              {lang === "ka" ? "კატეგორია:" : "Category:"}
            </span>
            {[ALL, ...(siteSettings.categories || [])].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : darkMode
                    ? "bg-stone-800/80 text-stone-300 hover:bg-stone-800"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {cat === ALL && lang === "en" ? "All" : cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-500/15">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider opacity-60 mr-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                {lang === "ka" ? "მეტალი:" : "Metal:"}
              </span>
              {[ALL, ...(siteSettings.metals || [])].map((metal) => (
                <button
                  key={metal}
                  onClick={() => setSelectedMetal(metal)}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all border ${
                    selectedMetal === metal
                      ? "border-amber-500 bg-amber-500/15 text-amber-400 font-medium"
                      : darkMode
                      ? "border-stone-800 text-stone-400 hover:border-stone-700"
                      : "border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {metal === ALL && lang === "en" ? "All" : metal}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={onlyExclusive}
                  onChange={(e) => setOnlyExclusive(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <span className="text-amber-500 font-medium">
                  {lang === "ka" ? "ექსკლუზიური მოდელები" : "Exclusive pieces only"}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={onlyOnSale}
                  onChange={(e) => setOnlyOnSale(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <span className="text-amber-500 font-medium">
                  {lang === "ka" ? "ფასდაკლებები" : "On Sale only"}
                </span>
              </label>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <p className="text-lg">{lang === "ka" ? "არჩეული ფილტრით სამკაული ვერ მოიძებნა." : "No jewelry found matching your criteria."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {filteredProducts.map((product) => {
              const mainImg = product.images?.[0] || product.image || "https://via.placeholder.com/600";
              return (
                <div
                  key={product.id}
                  className={`group rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col ${
                    darkMode
                      ? "bg-[#141210] border-stone-800/80 hover:border-amber-500/40"
                      : "bg-white border-stone-200/90 hover:border-amber-500 shadow-sm hover:shadow-xl"
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden bg-stone-900">
                    <img
                      src={mainImg}
                      alt={product.name}
                      onClick={() => openProductModal(product)}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {product.exclusive && (
                        <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest bg-black/80 text-amber-400 border border-amber-500/40 backdrop-blur-md">
                          {lang === "ka" ? "ექსკლუზივი" : "Exclusive"}
                        </span>
                      )}
                      {product.oldPrice && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-red-600/90 text-white backdrop-blur-md shadow-md">
                          {lang === "ka" ? "ფასდაკლება" : "Sale"}
                        </span>
                      )}
                    </div>
                    {product.images?.length > 1 && (
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] bg-black/70 text-white backdrop-blur-sm">
                        +{product.images.length} {lang === "ka" ? "ფოტო" : "photos"}
                      </span>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-black transition-all"
                    >
                      <Gem className={`w-4 h-4 ${favorites.includes(product.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-[11px] opacity-60 mb-1">
                        <span>{product.category}</span>
                        <span>{product.sku}</span>
                      </div>
                      <h3
                        onClick={() => openProductModal(product)}
                        className="font-serif text-xl font-medium cursor-pointer hover:text-amber-500 transition-colors"
                      >
                        {pick(product, "name", lang)}
                      </h3>
                      <p className="text-xs opacity-70 mt-1">
                        {product.metal} • {product.karat}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-500/15 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        {product.oldPrice && (
                          <span className="text-xs line-through opacity-50 font-normal">
                            {product.oldPrice}
                          </span>
                        )}
                        <span className="font-serif text-xl text-amber-500 font-semibold leading-tight">
                          {product.price}
                        </span>
                      </div>
                      <button
                        onClick={() => openProductModal(product)}
                        className="px-4 py-2 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {lang === "ka" ? "დეტალურად" : "Details"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ოსტატობის სექციის კომპონენტი */}
      <CraftsmanshipSection darkMode={darkMode} lang={lang} siteSettings={siteSettings} />

      {/* Footer კომპონენტი */}
      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />

      {/* დეტალური მოდალი */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-[#0c0b0a] overflow-y-auto animate-fadeIn">
          <div className={`sticky top-0 z-40 px-6 py-4 border-b backdrop-blur-md flex items-center justify-between ${darkMode ? "bg-[#121110]/95 border-stone-800" : "bg-white/95 border-stone-200"}`}>
            <button
              onClick={() => setSelectedProduct(null)}
              className="px-4 py-2 rounded-full bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === "ka" ? "კატალოგში დაბრუნება" : "Back to Catalog"}</span>
            </button>

            <span className="text-xs uppercase tracking-widest text-amber-500 font-medium">
              {selectedProduct.sku} • {selectedProduct.category}
            </span>

            <button
              onClick={() => setSelectedProduct(null)}
              className={`p-2.5 rounded-full border transition-all ${
                darkMode ? "border-stone-800 bg-stone-900 text-white hover:bg-stone-800" : "border-stone-200 bg-stone-100 text-stone-800"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full max-w-none px-3 sm:px-5 lg:px-6 py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 xl:gap-12 items-start">
              <div className="space-y-4">
                <div
                  className={`relative w-full h-[calc(100vh-155px)] max-h-[700px] min-h-[350px] rounded-3xl overflow-hidden border flex items-center justify-center cursor-zoom-in group ${
                    darkMode ? "bg-stone-900/90 border-stone-800" : "bg-stone-100 border-stone-200"
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
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black backdrop-blur-sm transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
                        }}
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
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          activeImageIndex === idx ? "border-amber-500 scale-105 shadow-lg shadow-amber-500/20" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-amber-500 uppercase tracking-widest">
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
                      className="px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black text-xs font-medium flex items-center gap-2 transition-all"
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

                  <h1 className="font-serif text-3xl sm:text-4xl mt-2">
                    {lang === "ka" ? selectedProduct.name : (selectedProduct.nameEn || selectedProduct.name)}
                  </h1>

                  <div className="flex items-baseline gap-4 mt-3">
                    {selectedProduct.oldPrice && (
                      <span className="font-serif text-xl line-through opacity-50">
                        {selectedProduct.oldPrice}
                      </span>
                    )}
                    <span className="font-serif text-3xl text-amber-500 font-semibold">
                      {selectedProduct.price}
                    </span>
                    {selectedProduct.oldPrice && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-red-600/20 text-red-400 border border-red-500/30">
                        {lang === "ka" ? "ფასდაკლება" : "Sale"}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm sm:text-base opacity-85 leading-relaxed">
                  {pick(selectedProduct, "description", lang)}
                </p>

                <div className={`grid grid-cols-2 gap-4 p-5 rounded-3xl border text-xs sm:text-sm ${darkMode ? "bg-stone-900/60 border-stone-800" : "bg-white border-stone-200"}`}>
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
                      <span className="uppercase tracking-wider opacity-75">
                        {lang === "ka" ? "აირჩიეთ ზომა:" : "Select Size:"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSizeGuide(!showSizeGuide)}
                        className="text-amber-500 underline hover:text-amber-400 font-medium"
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
                              : "border-stone-300 hover:border-amber-600 bg-stone-50"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                    {showSizeGuide && (
                      <div className="relative">
                        <div className={`absolute left-0 right-0 z-20 p-4 rounded-2xl border shadow-2xl backdrop-blur-md space-y-1.5 animate-fadeIn ${
                          darkMode ? "bg-[#1a1816]/95 border-amber-500/40 text-stone-200" : "bg-white/95 border-amber-500/50 text-stone-800"
                        }`}>
                          <div className="flex items-center justify-between pb-1 border-b border-stone-500/20">
                            <p className="font-semibold text-amber-400 text-xs">
                              {lang === "ka" ? "სტანდარტული ზომების ცხრილი:" : "Standard Size Reference:"}
                            </p>
                            <button
                              onClick={() => setShowSizeGuide(false)}
                              className="text-xs opacity-60 hover:opacity-100"
                            >
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
                  <span className="text-xs uppercase tracking-wider opacity-70 block">
                    {lang === "ka" ? "სწრაფი დაკავშირება ამ მოდელზე:" : "Instant Inquiry for this Piece:"}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={getWhatsAppLink(selectedProduct, siteSettings, lang, selectedSize)}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {lang === "ka" ? "WhatsApp-ში მიწერა" : "Ask on WhatsApp"}
                    </a>
                    <a
                      href={siteSettings.messenger || "https://m.me/"}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/20 transition-all"
                    >
                      <Send className="w-5 h-5" />
                      {lang === "ka" ? "Messenger-ში მიწერა" : "Ask on Messenger"}
                    </a>
                  </div>
                </div>

                <form onSubmit={handleSendInquiry} noValidate className="space-y-3.5 pt-6 border-t border-stone-500/20">
                  <div className="text-xs font-medium text-amber-500 uppercase tracking-wider">
                    {lang === "ka" ? "ან დაგვიტოვეთ ნომერი კონსულტაციისთვის:" : "Or Request a Private Callback:"}
                  </div>
                  {inquirySent ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5">
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
                          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm border outline-none ${darkMode ? "bg-stone-900 border-stone-800" : "bg-stone-50 border-stone-300"}`}
                        />
                        <input
                          type="tel"
                          value={clientPhone}
                          onChange={(e) => {
                            setClientPhone(e.target.value);
                            if (phoneError) setPhoneError("");
                          }}
                          placeholder={lang === "ka" ? "5XX XX XX XX" : "+995 5XX XX XX XX"}
                          className={`px-4 py-3 rounded-2xl text-xs sm:text-sm border outline-none transition-colors ${
                            phoneError
                              ? "border-red-500 bg-red-500/10 text-red-200"
                              : darkMode
                              ? "bg-stone-900 border-stone-800 focus:border-amber-500"
                              : "bg-stone-50 border-stone-300 focus:border-amber-600"
                          }`}
                        />
                      </div>

                      {phoneError && (
                        <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-medium">
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
          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white">
            <X className="w-6 h-6" />
          </button>
          <img src={selectedProduct?.images?.[activeImageIndex] || lightboxImage} alt="Fullscreen" className="max-w-full max-h-[80vh] object-contain rounded-xl mb-4" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-60 flex flex-col items-center gap-4 w-full max-w-xs">
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev - 1 + (selectedProduct.images?.length || 1)) % (selectedProduct.images?.length || 1));
                }}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-xs text-white/70 font-medium tracking-widest">
                {activeImageIndex + 1} / {selectedProduct.images?.length || 0}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev + 1) % (selectedProduct.images?.length || 1));
                }}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {selectedProduct.images?.length > 1 && (
              <div className="flex items-center justify-center gap-2 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                {selectedProduct.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(idx);
                    }}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? "border-amber-500 scale-110" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* რჩეულების მოდალი */}
      {showFavoritesModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 ${darkMode ? "bg-[#141210] border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"}`}>
            <div className="flex items-center justify-between pb-4 border-b border-stone-500/20">
              <h3 className="font-serif text-2xl">{lang === "ka" ? "რჩეული სამკაულები" : "Saved Jewelry"}</h3>
              <button onClick={() => setShowFavoritesModal(false)} className="p-2 rounded-full hover:bg-stone-500/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 max-h-96 overflow-y-auto space-y-3">
              {favorites.length === 0 ? (
                <p className="text-center py-8 opacity-60 text-sm">{lang === "ka" ? "რჩეულების სია ცარიელია." : "No saved items yet."}</p>
              ) : (
                products
                  .filter((p) => favorites.includes(p.id))
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-stone-500/15">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img src={item.images?.[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-serif font-medium truncate">{item.name}</div>
                          <div className="flex items-center gap-2">
                            {item.oldPrice && (
                              <span className="text-xs line-through opacity-50">{item.oldPrice}</span>
                            )}
                            <span className="text-xs text-amber-500 font-semibold">{item.price}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setShowFavoritesModal(false);
                            openProductModal(item);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-medium"
                        >
                          {lang === "ka" ? "ნახვა" : "View"}
                        </button>
                        <button onClick={() => toggleFavorite(item.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
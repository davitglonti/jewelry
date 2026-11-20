import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Heart, Check, Share2, ArrowLeftRight,
  Truck, ShieldCheck, Sparkles, ChevronRight, Home, Package, ShoppingBag
} from 'lucide-react';
import { pick, formatPrice, calculateDiscountPercent } from '../utils/i18n';
import { shareProductLink } from '../utils/shareUtils';
import { navigateTo } from '../utils/navigation';
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
      import('../lib/stats').then(({ trackProductView }) => {
        trackProductView(targetId);
      }).catch(() => {});
    }
  }, [selectedProduct?.id, selectedProduct?.sku, currentSku]);

  useEffect(() => {
    if (!selectedProduct) return;

    const brand = siteSettings.brandName || "MATARE";
    const prodName = lang === "ka" ? selectedProduct.name : (selectedProduct.nameEn || selectedProduct.name);
    const seoTitle = selectedProduct.metaTitle || `${prodName} — ${brand}`;
    const seoDesc = selectedProduct.metaDescription || (lang === "ka"
      ? (selectedProduct.description || `${prodName} — ექსკლუზიური ხელნაკეთი საიუველირო ნაკეთობა.`)
      : (selectedProduct.descriptionEn || `${prodName} — handcrafted fine jewelry by ${brand}.`));

    const numericPrice = (selectedProduct.price || "").toString().replace(/[^0-9.]/g, "") || "0";
    const langPrefix = lang === "en" ? "/en" : "";
    const productUrl = `https://www.matare.store${langPrefix}/product/${encodeURIComponent(selectedProduct.sku || selectedProduct.id)}`;
    const mainImage = selectedProduct.ogImage || (selectedProduct.images && selectedProduct.images[0]) || "https://www.matare.store/brand-logo.jpg";

    document.title = seoTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    const oldDesc = metaDesc?.getAttribute("content");
    if (metaDesc) metaDesc.setAttribute("content", seoDesc);

    const setMetaTag = (attrName, attrVal, contentVal) => {
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentVal);
    };

    if (selectedProduct.metaKeywords) {
      setMetaTag('name', 'keywords', selectedProduct.metaKeywords);
    }
    setMetaTag('property', 'og:title', seoTitle);
    setMetaTag('property', 'og:description', seoDesc);
    setMetaTag('property', 'og:image', mainImage);
    setMetaTag('property', 'og:url', productUrl);
    setMetaTag('property', 'og:type', 'product');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', seoTitle);
    setMetaTag('name', 'twitter:description', seoDesc);
    setMetaTag('name', 'twitter:image', mainImage);

    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": prodName,
      "image": (selectedProduct.images && selectedProduct.images.length > 0) ? selectedProduct.images : [mainImage],
      "description": seoDesc,
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
      <div className="min-h-screen flex flex-col justify-between bg-[#FBF9F5] text-[#1F1C18]">
        <Navbar
          lang={lang} setLang={setLang}
          darkMode={darkMode} setDarkMode={setDarkMode}
          favorites={favorites} setShowFavoritesModal={setShowFavoritesModal}
          isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main className="flex-1 flex flex-col items-center justify-center pt-32 sm:pt-36 pb-16 px-4 sm:px-6 w-full max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-[#F3EEE6] border border-[#E3DBCE] flex items-center justify-center text-[#9A7742] shadow-[0_4px_20px_rgba(154,119,66,0.08)] mb-6">
            <Sparkles className="w-7 h-7 stroke-[1.5]" />
          </div>

          <span className="text-[11px] uppercase tracking-[0.25em] text-[#9A7742] font-medium block mb-2">
            {lang === "ka" ? "საიუველირო კოლექცია" : "Jewelry Collection"}
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#1F1C18] tracking-tight">
            {lang === "ka" ? "სამკაული ვერ მოიძებნა" : "Piece Not Found"}
          </h1>

          <p className="text-sm text-[#6B6357] max-w-md mx-auto leading-relaxed mt-3">
            {lang === "ka"
              ? "სამწუხაროდ, მითითებული კოდით სამკაული არ იძებნება. შესაძლოა ბმული არაზუსტია ან ეს ექსკლუზივი უკვე გაიყიდა."
              : "The requested jewelry piece could not be found. It may have been sold or the link may have changed."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 w-full sm:w-auto">
            <button
              onClick={goToCatalog}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#1F1C18] hover:bg-[#35302A] text-white text-xs uppercase tracking-[0.16em] font-medium transition-all shadow-[0_4px_16px_rgba(31,28,24,0.12)] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span>{lang === "ka" ? "კოლექციის დათვალიერება" : "Explore Collection"}</span>
            </button>
            <a
              href={prefix || "/"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white border border-[#D9D1C5] hover:border-[#1F1C18] text-[#1F1C18] text-xs uppercase tracking-[0.16em] font-medium transition-all"
            >
              <Home className="w-4 h-4 stroke-[1.5]" />
              <span>{lang === "ka" ? "მთავარი გვერდი" : "Back to Home"}</span>
            </a>
          </div>

          {products && products.length > 0 && (
            <div className="mt-14 w-full border-t border-[#EAE4DB] pt-8">
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#8A847C] font-medium block mb-6">
                {lang === "ka" ? "რჩეული სამკაულები ჩვენი კოლექციიდან" : "Featured Pieces From Our Collection"}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
                {products.slice(0, 4).map((item) => (
                  <a
                    key={item.id || item.sku}
                    href={`${prefix}/product/${encodeURIComponent(item.sku || item.id)}`}
                    className="group block bg-white rounded-lg p-2.5 border border-[#EAE4DB] hover:border-[#9A7742] hover:shadow-md transition-all"
                  >
                    <div className="aspect-square w-full rounded overflow-hidden bg-[#FAF8F5] mb-2.5">
                      <img
                        src={item.image || (item.images && item.images[0])}
                        alt={pick(item, "name", lang)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs font-serif text-[#1F1C18] line-clamp-1 group-hover:text-[#9A7742] transition-colors">
                      {pick(item, "name", lang)}
                    </p>
                    <p className="text-xs font-medium text-[#9A7742] mt-0.5">
                      {formatPrice(item.price)}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </main>
        <Footer lang={lang} siteSettings={siteSettings} compact={true} />
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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FBF9F5] text-[#1F1C18]">
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

      <main id="main-content" className="pt-[78px] sm:pt-[86px] pb-20">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          {/* Breadcrumb Row (Mockup 1-to-1) */}
          <div className="flex items-center justify-between gap-4 py-4 sm:py-5 text-xs text-[#787168]">
            <nav aria-label="Breadcrumbs" className="flex items-center gap-2 truncate">
              <a href={prefix || "/"} className="hover:text-[#1F1C18] transition-colors">
                {lang === "ka" ? "მთავარი" : "Home"}
              </a>
              <span className="text-[#A8A196]">›</span>
              <a href={`${prefix}/catalog`} className="hover:text-[#1F1C18] transition-colors">
                {lang === "ka" ? "კოლექცია" : "Collection"}
              </a>
              <span className="text-[#A8A196]">›</span>
              <span className="text-[#1F1C18] font-normal truncate">
                {selectedProduct.category}
              </span>
            </nav>

            <button
              onClick={goToCatalog}
              className="text-xs text-[#1F1C18] hover:text-[#9A7742] flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[1.75]" />
              <span className="hidden sm:inline">{lang === "ka" ? "კატალოგში დაბრუნება" : "Back to Catalog"}</span>
            </button>
          </div>

          {/* 2-Column Split Showcase (Exact Mockup Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Left 6 Cols: Product Gallery & Guarantee Standard */}
            <div className="lg:col-span-6 lg:sticky lg:top-[106px] space-y-6">
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

              {/* Matare Standard & Guarantee (Under gallery in yellow marked area) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4DB] shadow-xs">
                <h3 className="font-serif text-base font-normal text-[#1F1C18] tracking-wide mb-3.5">
                  {lang === 'ka' ? 'მატარეს სტანდარტი და გარანტია' : 'Matare Standard & Guarantee'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium text-[#4A453E]">
                  <div className="flex items-center gap-2.5">
                    <ArrowLeftRight className="w-4 h-4 text-[#9A7742] shrink-0 stroke-[1.5]" />
                    <span>{lang === 'ka' ? 'მიწოდება და გადაცვლა' : 'Delivery & Exchange'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#9A7742] shrink-0 stroke-[1.5]" />
                    <span>{lang === 'ka' ? 'სერტიფიცირებული სინჯი' : 'Certified Purity'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-[#9A7742] shrink-0 stroke-[1.5]" />
                    <span>{lang === 'ka' ? 'უვადო მოვლა' : 'Lifetime Care'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Product Details */}
            <div className="lg:col-span-6 space-y-6 pt-1">
              {/* Category & SKU row with Action Icons on right */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold tracking-widest uppercase text-[#1F1C18]">
                    {selectedProduct.category}
                  </span>
                  <span className="text-xs text-[#9D7B48] font-mono">
                    #{selectedProduct.sku}
                  </span>
                </div>

                {/* Right Action Icons: Heart, Compare, Share */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(selectedProduct.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isFav
                        ? 'bg-[#FDF2F4] text-[#E25567] hover:bg-[#FCE7EB] shadow-xs'
                        : 'hover:bg-[#FDF2F4] text-[#1F1C18] hover:text-[#E25567]'
                    }`}
                    title={isFav ? (lang === "ka" ? "რჩეულებშია" : "In Favorites") : (lang === "ka" ? "რჩეულებში დამატება" : "Add to favorites")}
                  >
                    <Heart className={`w-[19px] h-[19px] stroke-[1.5] transition-colors ${isFav ? "fill-[#E25567] text-[#E25567]" : ""}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCompare(selectedProduct.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F4EFE6] text-[#1F1C18] transition-colors cursor-pointer"
                    title={lang === "ka" ? "შედარება" : "Compare"}
                  >
                    <ArrowLeftRight className={`w-[19px] h-[19px] stroke-[1.5] ${isCompared ? "text-[#16A34A]" : ""}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      shareProductLink(selectedProduct, lang, () => {
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      })
                    }
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F4EFE6] text-[#1F1C18] transition-colors cursor-pointer"
                    title={lang === "ka" ? "გაზიარება" : "Share"}
                  >
                    {copiedLink ? <Check className="w-[19px] h-[19px] text-[#16A34A]" /> : <Share2 className="w-[19px] h-[19px] stroke-[1.5]" />}
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#1F1C18] leading-[1.2]">
                {lang === "ka" ? selectedProduct.name : (selectedProduct.nameEn || selectedProduct.name)}
              </h1>

              {/* Price & Stock Badge */}
              <div className="flex items-center gap-3.5">
                <span className="text-2xl sm:text-3xl font-serif font-medium text-[#1F1C18]">
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

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF7EE] text-[#166534] text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  <span>{lang === "ka" ? "მარაგშია" : "In Stock"}</span>
                </span>
              </div>

              {selectedProduct.description && (
                <p className="text-xs sm:text-sm text-[#5C564E] leading-relaxed">
                  {pick(selectedProduct, "description", lang)}
                </p>
              )}

              {/* Size Selector and ADD TO BAG / BUY NOW Buttons */}
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

              {/* Specifications Card (Exact Mockup Box) */}
              <ProductSpecsTable product={selectedProduct} lang={lang} />

              {/* Delivery and Atelier Packaging Badges */}
              <ProductStoryHighlights product={selectedProduct} lang={lang} />
            </div>
          </div>



          {/* Similar Pieces Carousel/Grid */}
          {relatedProducts.length > 0 && (
            <section className="mt-6 pt-10 border-t border-[#EAE4DB]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#9A7742] block mb-1">
                    {lang === "ka" ? "კოლექცია" : "You May Also Like"}
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-[#1F1C18]">
                    {lang === "ka" ? "მსგავსი მოდელები" : "Similar Pieces"}
                  </h3>
                </div>
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

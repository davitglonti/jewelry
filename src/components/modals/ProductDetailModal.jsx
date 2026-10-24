import React, { useState } from 'react';
import {
  ArrowLeft, X, ZoomIn, ChevronLeft, ChevronRight,
  Check, Share2, MessageCircle, Send, ArrowLeftRight, Ruler
} from 'lucide-react';
import { pick, formatPrice, calculateDiscountPercent } from '../../utils/i18n';
import { getWhatsAppLink, shareProductLink } from '../../utils/shareUtils';
import { useStore } from '../../context/StoreContext';
import StockStatusBadge from '../store/StockStatusBadge';
import RingSizerModal from './RingSizerModal';

export default function ProductDetailModal({
  selectedProduct,
  onClose,
  activeImageIndex,
  setActiveImageIndex,
  selectedSize,
  setSelectedSize,
  setLightboxImage
}) {
  const { darkMode, lang, siteSettings, products, inquiries, setInquiries, syncData, compareList, toggleCompare } = useStore();

  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showRingSizer, setShowRingSizer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [inquirySent, setInquirySent] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  if (!selectedProduct) return null;

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

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto animate-fadeIn ${darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#fcfbf9] text-[#1c1917]"}`}>
      
      {/* ზედა ნავიგაცია */}
      <div className={`sticky top-0 z-40 px-6 py-4 border-b backdrop-blur-md flex items-center justify-between ${
        darkMode ? "bg-[#121110]/90 border-stone-800" : "bg-white/90 border-stone-200"
      }`}>
        <button
          onClick={onClose}
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

        <button
          onClick={onClose}
          className={`p-2.5 rounded-full border transition-all ${
            darkMode ? "border-stone-800 bg-stone-900 text-white hover:bg-stone-800" : "border-stone-200 bg-stone-100 text-stone-800 hover:bg-stone-200"
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full max-w-none px-3 sm:px-5 lg:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 xl:gap-12 items-start">
          
          {/* მარცხენა მხარე: ფოტოების სივრცე უცვლელად შენარჩუნებული */}
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

          {/* მარჯვენა მხარე: ტექსტები, ფასი, ზომები და ფორმები */}
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

            {/* Specifications Cards: Only render valid non-empty specs */}
            {(() => {
              const specs = [
                { label: lang === "ka" ? "მეტალი" : "Metal", value: selectedProduct.metal },
                { label: lang === "ka" ? "სინჯი" : "Karat", value: selectedProduct.karat },
                { label: lang === "ka" ? "წონა" : "Weight", value: selectedProduct.weight ? `${selectedProduct.weight} ${lang === "ka" ? "გრ" : "g"}` : null },
                { label: lang === "ka" ? "ქვები" : "Gemstones", value: selectedProduct.stones },
              ].filter((s) => s.value && String(s.value).trim());

              if (specs.length === 0) return null;

              return (
                <div className={`grid ${specs.length > 2 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"} gap-2.5 p-3 sm:p-4 rounded-2xl border ${
                  darkMode ? "bg-stone-900/60 border-stone-800" : "bg-white border-stone-200/80 shadow-xs"
                }`}>
                  {specs.map((item, i) => (
                    <div
                      key={i}
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                        darkMode
                          ? "bg-stone-800/60 border-stone-700/60"
                          : "bg-stone-50 border-stone-200/80"
                      }`}
                    >
                      <span className={`block text-[10px] sm:text-[11px] uppercase tracking-wider font-medium mb-0.5 ${
                        darkMode ? "text-amber-400/90" : "text-amber-600/90"
                      }`}>
                        {item.label}
                      </span>
                      <span className={`font-semibold text-xs sm:text-sm block truncate ${
                        darkMode ? "text-stone-100" : "text-stone-900"
                      }`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="uppercase tracking-wider opacity-75 font-medium flex items-center gap-1.5">
                    <span>{lang === "ka" ? "აირჩიეთ ზომა:" : "Select Size:"}</span>
                    {selectedSize && (
                      <span className="font-mono text-amber-500 font-bold text-xs">({selectedSize})</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRingSizer(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors group cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5 text-amber-500/80 group-hover:rotate-12 transition-transform" />
                    <span className="underline underline-offset-4 decoration-amber-500/40 hover:decoration-amber-400">
                      {lang === "ka" ? "ზომის ონლაინ საზომი" : "Ring Size Guide"}
                    </span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {selectedProduct.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-[44px] h-10 px-3.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center justify-center ${
                        selectedSize === sz
                          ? "bg-amber-500 text-black border-amber-500 font-bold shadow-md shadow-amber-500/20 scale-105"
                          : darkMode
                          ? "border-stone-800 hover:border-amber-500/50 bg-stone-900/80 text-stone-300"
                          : "border-stone-200 hover:border-amber-500 bg-white text-stone-800 shadow-xs"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
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
                        <button onClick={() => setShowSizeGuide(false)} className="text-xs opacity-60 hover:opacity-100">
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
      </div>

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
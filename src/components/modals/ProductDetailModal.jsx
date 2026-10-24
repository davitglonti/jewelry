import React, { useState } from 'react';
import {
  ArrowLeft, X, ZoomIn, ChevronLeft, ChevronRight,
  Check, Share2, MessageCircle, Send
} from 'lucide-react';
import { pick, formatPrice, calculateDiscountPercent } from '../../utils/i18n';
import { getWhatsAppLink, shareProductLink } from '../../utils/shareUtils';
import { useStore } from '../../context/StoreContext';

export default function ProductDetailModal({
  selectedProduct,
  onClose,
  activeImageIndex,
  setActiveImageIndex,
  selectedSize,
  setSelectedSize,
  setLightboxImage
}) {
  const { darkMode, lang, siteSettings, products, inquiries, setInquiries, syncData } = useStore();

  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showSizeGuide, setShowSizeGuide] = useState(false);
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

          {/* მარჯვენა მხარე: ტექსტები, ფასი, ზომები და ფორმები გასწორებული ფერებით */}
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
    </div>
  );
}
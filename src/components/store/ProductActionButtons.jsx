import React, { useState } from 'react';
import { Ruler, MessageCircle, Send, Check, Lock, Tag, Sparkles, Copy } from 'lucide-react';
import { getWhatsAppLink } from '../../utils/shareUtils';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/i18n';

export default function ProductActionButtons({
  product,
  selectedSize,
  setSelectedSize,
  onOpenRingSizer,
  darkMode = true,
  lang = 'ka',
  siteSettings = {},
  inquiries = [],
  setInquiries,
  syncData,
  products = []
}) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [promoCopied, setPromoCopied] = useState(false);
  const { user } = useAuth();

  const PROMO_CODE = 'VIP-AURELIA10';

  const rawPrice = typeof product?.price === 'number'
    ? product.price
    : parseFloat(String(product?.price || '0').replace(/[^0-9.]/g, '')) || 0;
  const discountAmount = Math.round(rawPrice * 0.1);
  const discountedPrice = Math.max(0, rawPrice - discountAmount);

  const handleCopyPromo = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    navigator.clipboard?.writeText(PROMO_CODE);
    setPromoCopied(true);
    setTimeout(() => setPromoCopied(false), 2500);
  };

  if (!product) return null;

  const handleSendInquiry = (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setPhoneError(lang === 'ka' ? 'გთხოვთ შეიყვანოთ თქვენი სახელი' : 'Please enter your name');
      return;
    }

    const cleanedPhone = clientPhone.replace(/[\s\-()]/g, '');
    const georgianPhoneRegex = /^(\+?995)?5\d{8}$/;

    if (!cleanedPhone || !georgianPhoneRegex.test(cleanedPhone)) {
      setPhoneError(
        lang === 'ka'
          ? 'შეიყვანეთ სწორი ქართული ნომერი (მაგ: 555 12 34 56)'
          : 'Please enter a valid Georgian number (e.g. 555 12 34 56)'
      );
      return;
    }

    setPhoneError('');

    const newInq = {
      id: Date.now().toString(),
      productName: product.name,
      sku: product.sku,
      size: selectedSize,
      clientName,
      clientPhone: cleanedPhone,
      date: new Date().toLocaleString('ka-GE')
    };
    const updatedInquiries = [newInq, ...(inquiries || [])];
    if (setInquiries) setInquiries(updatedInquiries);
    if (syncData) syncData(siteSettings, products, updatedInquiries);
    setClientName('');
    setClientPhone('');
    setInquirySent(true);
  };

  return (
    <div className="space-y-5">
      {/* Sizes Section */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="uppercase tracking-wider opacity-75 font-medium flex items-center gap-1.5">
              <span>{lang === 'ka' ? 'აირჩიეთ ზომა:' : 'Select Size:'}</span>
              {selectedSize && (
                <span className="font-mono text-amber-500 font-bold text-xs">({selectedSize})</span>
              )}
            </span>
            <button
              type="button"
              onClick={onOpenRingSizer}
              className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors group cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-500/80 group-hover:rotate-12 transition-transform" />
              <span className="underline underline-offset-4 decoration-amber-500/40 hover:decoration-amber-400">
                {lang === 'ka' ? 'ზომის ონლაინ საზომი' : 'Ring Size Guide'}
              </span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-0.5">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize?.(sz)}
                className={`min-w-[44px] h-10 px-3.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center justify-center ${
                  selectedSize === sz
                    ? 'bg-amber-500 text-black border-amber-500 font-bold shadow-md shadow-amber-500/20 scale-105'
                    : darkMode
                    ? 'border-stone-800 hover:border-amber-500/50 bg-stone-900/80 text-stone-300'
                    : 'border-stone-200 hover:border-amber-500 bg-white text-stone-800 shadow-xs'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          {showSizeGuide && (
            <div className="relative">
              <div
                className={`absolute left-0 right-0 z-20 p-4 rounded-2xl border shadow-2xl backdrop-blur-md space-y-1.5 animate-fadeIn ${
                  darkMode ? 'bg-[#1a1816]/95 border-amber-500/40 text-stone-200' : 'bg-white/95 border-amber-500/30 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between pb-1 border-b border-stone-500/20">
                  <p className="font-semibold text-amber-500 text-xs">
                    {lang === 'ka' ? 'სტანდარტული ზომების ცხრილი:' : 'Standard Size Reference:'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(false)}
                    aria-label="Close size guide"
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

      {/* VIP Promo Code Section */}
      {!user ? (
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all shadow-md ${
          darkMode
            ? 'bg-gradient-to-r from-amber-950/20 via-[#181614] to-amber-950/15 border-amber-500/25'
            : 'bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs sm:text-sm">
                    {lang === 'ka' ? 'VIP პრომო კოდი (-10%)' : 'VIP Promo Code (-10%)'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    VIP
                  </span>
                </div>
                <p className="text-[11px] opacity-75 truncate">
                  {lang === 'ka'
                    ? 'ავტორიზებული მომხმარებლის ექსკლუზივი ამ მოდელზე'
                    : 'Registered members exclusive discount'}
                </p>
              </div>
            </div>
            <a
              href={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black flex items-center justify-center gap-2 shrink-0 shadow-md shadow-amber-500/20 transition-all text-center"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{lang === 'ka' ? 'კოდის მიღება' : 'Unlock Code'}</span>
            </a>
          </div>
        </div>
      ) : (
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all shadow-lg ${
          promoCopied
            ? 'bg-emerald-950/20 border-emerald-500/40'
            : darkMode
            ? 'bg-gradient-to-r from-amber-950/30 via-[#181614] to-amber-950/20 border-amber-500/40'
            : 'bg-gradient-to-r from-amber-50 via-white to-amber-50 border-amber-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-xs sm:text-sm text-amber-400">
                  {lang === 'ka' ? 'თქვენი VIP პრომო კოდი:' : 'Your VIP Promo Code:'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black">
                  -10% VIP
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="opacity-70">{lang === 'ka' ? 'ფასი პრომო კოდით:' : 'VIP Price:'}</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{formatPrice(discountedPrice)}</span>
                <span className="text-[10px] opacity-50 line-through">{formatPrice(rawPrice)}</span>
                <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                  (-{formatPrice(discountAmount)})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-xl border border-dashed border-amber-500/50 bg-black/40 font-mono font-bold text-amber-400 text-xs tracking-wider select-all">
                {PROMO_CODE}
              </div>
              <button
                type="button"
                onClick={handleCopyPromo}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                  promoCopied
                    ? 'bg-emerald-500 text-black'
                    : 'bg-amber-500 hover:bg-amber-400 text-black'
                }`}
              >
                {promoCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'ka' ? 'დაკოპირდა!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === 'ka' ? 'კოპირება' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Messaging Inquiry */}
      <div className="space-y-3 pt-2">
        <span className="text-xs uppercase tracking-wider opacity-70 block font-medium">
          {lang === 'ka' ? 'სწრაფი დაკავშირება ამ მოდელზე:' : 'Instant Inquiry for this Piece:'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={getWhatsAppLink(product, siteSettings, lang, selectedSize, user ? PROMO_CODE : '')}
            target="_blank"
            rel="noreferrer"
            className="py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{lang === 'ka' ? 'WhatsApp-ში მიწერა' : 'Ask on WhatsApp'}</span>
          </a>
          <a
            href={siteSettings?.messenger || 'https://m.me/'}
            target="_blank"
            rel="noreferrer"
            className="py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Send className="w-5 h-5" />
            <span>{lang === 'ka' ? 'Messenger-ში მიწერა' : 'Ask on Messenger'}</span>
          </a>
        </div>
      </div>

      {/* Consultation Callback Form */}
      <form
        onSubmit={handleSendInquiry}
        noValidate
        className={`space-y-3.5 p-6 rounded-3xl border ${
          darkMode ? 'bg-stone-900/40 border-stone-800' : 'bg-white border-stone-200/80 shadow-sm'
        }`}
      >
        <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
          {lang === 'ka' ? 'ან დაგვიტოვეთ ნომერი კონსულტაციისთვის:' : 'Or Request a Private Callback:'}
        </div>
        {inquirySent ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 text-xs sm:text-sm flex items-center gap-2.5">
            <Check className="w-5 h-5 shrink-0" />
            {lang === 'ka'
              ? 'მოთხოვნა მიღებულია! ჩვენი კონსულტანტი მალე დაგიკავშირდებათ.'
              : 'Request sent! Our consultant will contact you shortly.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (phoneError) setPhoneError('');
                }}
                placeholder={lang === 'ka' ? 'თქვენი სახელი' : 'Your Name'}
                aria-label={lang === 'ka' ? 'თქვენი სახელი' : 'Your Name'}
                className={`px-4 py-3 rounded-2xl text-xs sm:text-sm border outline-none transition-all ${
                  darkMode
                    ? 'bg-stone-900 border-stone-700 text-white focus:border-amber-500'
                    : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-500'
                }`}
              />
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => {
                  setClientPhone(e.target.value);
                  if (phoneError) setPhoneError('');
                }}
                placeholder={lang === 'ka' ? '5XX XX XX XX' : '+995 5XX XX XX XX'}
                aria-label={lang === 'ka' ? 'ტელეფონის ნომერი' : 'Phone number'}
                className={`px-4 py-3 rounded-2xl text-xs sm:text-sm border outline-none transition-all ${
                  phoneError
                    ? 'border-red-500 bg-red-500/10 text-red-200'
                    : darkMode
                    ? 'bg-stone-900 border-stone-700 text-white focus:border-amber-500'
                    : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-500'
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
              {lang === 'ka' ? 'ზარის მოთხოვნა' : 'Request Consultation'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

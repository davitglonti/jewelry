import React, { useState } from 'react';
import { Ruler, MessageCircle, Send, Check } from 'lucide-react';
import { getWhatsAppLink } from '../../utils/shareUtils';

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

      {/* Direct Messaging Inquiry */}
      <div className="space-y-3 pt-2">
        <span className="text-xs uppercase tracking-wider opacity-70 block font-medium">
          {lang === 'ka' ? 'სწრაფი დაკავშირება ამ მოდელზე:' : 'Instant Inquiry for this Piece:'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={getWhatsAppLink(product, siteSettings, lang, selectedSize)}
            target="_blank"
            rel="noreferrer"
            className="py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            {lang === 'ka' ? 'WhatsApp-ში მიწერა' : 'Ask on WhatsApp'}
          </a>
          <a
            href={siteSettings?.messenger || 'https://m.me/'}
            target="_blank"
            rel="noreferrer"
            className="py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Send className="w-5 h-5" />
            {lang === 'ka' ? 'Messenger-ში მიწერა' : 'Ask on Messenger'}
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

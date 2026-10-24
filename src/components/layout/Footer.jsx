import React from 'react';
import { Instagram, Facebook, MapPin, Phone, Clock, MessageCircle, Send } from 'lucide-react';
import { pick } from '../../utils/i18n';

export default function Footer({ darkMode, lang, siteSettings }) {
  const isDark = darkMode !== false;
  const textColor = isDark ? "text-stone-300" : "text-stone-700";
  const subtextColor = isDark ? "text-stone-400" : "text-stone-600";
  const linkHover = isDark ? "hover:text-amber-400" : "hover:text-amber-600";

  return (
    <footer id="contact" className={`pt-16 pb-12 border-t ${isDark ? "bg-[#090807] text-[#f5f0e6] border-stone-800" : "bg-stone-100 text-stone-900 border-stone-200"}`}>
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-stone-500/15">
          <div className="space-y-3">
            <div className="font-serif text-2xl tracking-[0.2em] font-semibold">
              {siteSettings.brandName}
            </div>
            <p className={`text-sm leading-relaxed ${textColor}`}>
              {lang === "ka" ? siteSettings.footerDesc : (siteSettings.footerDescEn || siteSettings.footerDesc)}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {siteSettings.instagram && (
                <a
                  href={siteSettings.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="p-2.5 rounded-full bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black transition-all"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {siteSettings.facebook && (
                <a
                  href={siteSettings.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="p-2.5 rounded-full bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black transition-all"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h4 className="font-serif text-base text-amber-400 uppercase tracking-wider">
              {lang === "ka" ? "ნავიგაცია" : "Navigation"}
            </h4>
            <ul className={`space-y-2 text-xs ${textColor}`}>
              <li>
                <a href="/" className={`${linkHover} transition-colors`}>
                  {lang === "ka" ? "მთავარი" : "Home"}
                </a>
              </li>
              <li>
                <a href="/catalog" className={`${linkHover} transition-colors`}>
                  {lang === "ka" ? "კოლექცია" : "Collection"}
                </a>
              </li>
              <li>
                <a href="/about" className={`${linkHover} transition-colors`}>
                  {lang === "ka" ? "ჩვენ შესახებ" : "About Us"}
                </a>
              </li>
              <li>
                <a href="/blog" className={`transition-colors font-medium ${isDark ? "text-amber-400 hover:text-amber-300" : "text-amber-700 hover:text-amber-800"}`}>
                  {lang === "ka" ? "ბლოგი / რჩევები" : "Blog / Journal"}
                </a>
              </li>
              <li>
                <a href="/size-guide" className={`transition-colors flex items-center gap-1.5 font-medium ${isDark ? "text-amber-400 hover:text-amber-300" : "text-amber-700 hover:text-amber-800"}`}>
                  <span>{lang === "ka" ? "ზომის გზამკვლევი" : "Size Guide"}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 uppercase font-semibold">
                    {lang === "ka" ? "საზომი" : "Guide"}
                  </span>
                </a>
              </li>
              <li>
                <a href="/#faq" className={`${linkHover} transition-colors`}>
                  {lang === "ka" ? "კითხვა-პასუხი (FAQ)" : "FAQ"}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-sm">
            <h4 className="font-serif text-base text-amber-400 uppercase tracking-wider">
              {lang === "ka" ? "შოურუმი და კონტაქტი" : "Showroom & Contact"}
            </h4>
            <p className={`flex items-center gap-2.5 ${textColor}`}>
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              {pick(siteSettings, "address", lang)}
            </p>
            <p className={`flex items-center gap-2.5 ${textColor}`}>
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <a href={`tel:${siteSettings.phone || "+995555000000"}`} className={`${linkHover} transition-colors`}>
                {siteSettings.phone}
              </a>
            </p>
            <p className={`flex items-center gap-2.5 ${textColor}`}>
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              {lang === "ka" ? siteSettings.hours : (siteSettings.hoursEn || siteSettings.hours)}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-base text-amber-400 uppercase tracking-wider">
              {lang === "ka" ? "სწრაფი კონსულტაცია" : "Quick Consultation"}
            </h4>
            <p className={`text-xs ${textColor}`}>
              {lang === "ka" ? "მოგვწერეთ პირდაპირ WhatsApp-ში ან Messenger-ში:" : "Message us directly via WhatsApp or Messenger:"}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href={`https://wa.me/${(siteSettings.whatsapp || "").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp კონსულტაცია"
                className="px-4 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={siteSettings.messenger || "https://m.me/"}
                target="_blank"
                rel="noreferrer"
                aria-label="Messenger კონსულტაცია"
                className="px-4 py-2.5 rounded-full bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
              >
                <Send className="w-4 h-4" />
                Messenger
              </a>
            </div>
          </div>
        </div>

        <div className={`pt-8 text-center text-xs ${subtextColor}`}>
          {siteSettings.copyright}
        </div>
      </div>
    </footer>
  );
}

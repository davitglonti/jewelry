import React from 'react';
import { Instagram, Facebook, MapPin, Phone, Clock, MessageCircle, Send, ArrowUpRight } from 'lucide-react';
import { pick } from '../../utils/i18n';

export default function Footer({ lang, siteSettings = {} }) {
  const prefix = lang === "en" ? "/en" : "";

  return (
    <footer id="contact" className="bg-[#F3EEE6] text-[#1F1C18] border-t border-[#E6DFD3]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-[#E3DBCE]">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#1F1C18] tracking-[0.06em]">
                {siteSettings.brandName || "მატარე"}
              </div>
              <div className="text-xs text-[#9A7742] font-medium mt-1">
                {lang === "ka" ? siteSettings.brandSubtitle : (siteSettings.brandSubtitleEn || siteSettings.brandSubtitle)}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#4A453E] max-w-sm">
              {lang === "ka" ? siteSettings.footerDesc : (siteSettings.footerDescEn || siteSettings.footerDesc)}
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              {siteSettings.instagram && (
                <a
                  href={siteSettings.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-white border border-[#E3DBCE] text-[#1F1C18] hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white hover:border-transparent hover:shadow-[0_4px_14px_rgba(221,42,123,0.38)] flex items-center justify-center transition-all duration-300"
                >
                  <Instagram className="w-4 h-4 stroke-[1.75]" />
                </a>
              )}
              {siteSettings.facebook && (
                <a
                  href={siteSettings.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-white border border-[#E3DBCE] text-[#1F1C18] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] hover:shadow-[0_4px_14px_rgba(24,119,242,0.38)] flex items-center justify-center transition-all duration-300"
                >
                  <Facebook className="w-4 h-4 stroke-[1.75]" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-semibold text-[#9A7742]">
              {lang === "ka" ? "ნავიგაცია" : "Navigation"}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#4A453E]">
              <li><a href={prefix || "/"} className="hover:text-[#1F1C18] transition-colors">{lang === "ka" ? "მთავარი" : "Home"}</a></li>
              <li><a href={`${prefix}/catalog`} className="hover:text-[#1F1C18] transition-colors">{lang === "ka" ? "კოლექცია" : "Collection"}</a></li>
              <li><a href={`${prefix}/about`} className="hover:text-[#1F1C18] transition-colors">{lang === "ka" ? "ჩვენ შესახებ" : "About Us"}</a></li>
              <li><a href={`${prefix}/blog`} className="hover:text-[#1F1C18] transition-colors">{lang === "ka" ? "ბლოგი / რჩევები" : "Journal"}</a></li>
              <li><a href={`${prefix}/size-guide`} className="hover:text-[#1F1C18] transition-colors">{lang === "ka" ? "ზომის გზამკვლევი" : "Size Guide"}</a></li>
              <li><a href={`${prefix}/faq`} className="hover:text-[#1F1C18] transition-colors">{lang === "ka" ? "კითხვა-პასუხი" : "FAQ"}</a></li>
              <li className="pt-1">
                <a href={`${prefix}/track`} className="inline-flex items-center gap-1 text-[#1F1C18] font-medium hover:text-[#9A7742] transition-colors">
                  <span>{lang === "ka" ? "შეკვეთის თრექინგი" : "Track Order"}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-semibold text-[#9A7742]">
              {lang === "ka" ? "საკონტაქტო ინფორმაცია" : "Boutique & Contact"}
            </h4>
            <div className="space-y-3 text-sm text-[#4A453E]">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#9A7742] shrink-0 mt-0.5 stroke-[1.75]" />
                <span>{pick(siteSettings, "address", lang)}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#9A7742] shrink-0 stroke-[1.75]" />
                <a href={`tel:${siteSettings.phone || "+995555000000"}`} className="hover:text-[#1F1C18] transition-colors">
                  {siteSettings.phone}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#9A7742] shrink-0 stroke-[1.75]" />
                <span>{lang === "ka" ? siteSettings.hours : (siteSettings.hoursEn || siteSettings.hours)}</span>
              </p>
            </div>
          </div>

          {/* Concierge Column */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-semibold text-[#9A7742]">
              {lang === "ka" ? "სწრაფი კონსულტაცია" : "Private Concierge"}
            </h4>
            <p className="text-sm text-[#4A453E] leading-relaxed">
              {lang === "ka"
                ? "მოგვწერეთ პირდაპირ WhatsApp-ში ან Messenger-ში ზომისა და მოდელის შერჩევაზე:"
                : "Message us directly via WhatsApp or Messenger for personalized sizing and bespoke inquiries:"}
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <a
                href={`https://wa.me/${(siteSettings.whatsapp || "").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp კონსულტაცია"
                className="px-5 py-2.5 rounded-full bg-[#1F1C18] hover:bg-[#25D366] text-white hover:shadow-[0_4px_16px_rgba(37,211,102,0.38)] text-xs font-medium flex items-center gap-2 transition-all duration-300"
              >
                <MessageCircle className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>WhatsApp</span>
              </a>
              <a
                href={siteSettings.messenger || "https://m.me/"}
                target="_blank"
                rel="noreferrer"
                aria-label="Messenger კონსულტაცია"
                className="px-5 py-2.5 rounded-full bg-white border border-[#D9D1C5] text-[#1F1C18] hover:bg-gradient-to-r hover:from-[#00B2FF] hover:via-[#006AFF] hover:to-[#A033FF] hover:text-white hover:border-transparent hover:shadow-[0_4px_16px_rgba(0,106,255,0.35)] text-xs font-medium flex items-center gap-2 transition-all duration-300"
              >
                <Send className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Messenger</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#787168]">
          <span>{siteSettings.copyright}</span>
          <span>Tbilisi • Fine Jewelry House</span>
        </div>
      </div>
    </footer>
  );
}

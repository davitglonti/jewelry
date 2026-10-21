import React from 'react';
import { Instagram, Facebook, MapPin, Phone, Clock, MessageCircle, Send } from 'lucide-react';
import { pick } from '../../utils/i18n';

export default function Footer({ darkMode, lang, siteSettings }) {
  return (
    <footer id="contact" className={`pt-16 pb-12 border-t ${darkMode ? "bg-[#090807] border-stone-800" : "bg-stone-100 border-stone-200"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-stone-500/15">
          <div className="space-y-3">
            <div className="font-serif text-2xl tracking-[0.2em] font-semibold">
              {siteSettings.brandName}
            </div>
            <p className="text-sm opacity-75 leading-relaxed">
              {lang === "ka" ? siteSettings.footerDesc : (siteSettings.footerDescEn || siteSettings.footerDesc)}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {siteSettings.instagram && (
                <a href={siteSettings.instagram} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {siteSettings.facebook && (
                <a href={siteSettings.facebook} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h4 className="font-serif text-lg text-amber-500 uppercase tracking-wider">
              {lang === "ka" ? "შოურუმი და კონტაქტი" : "Showroom & Contact"}
            </h4>
            <p className="flex items-center gap-2.5 opacity-80">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
              {pick(siteSettings, "address", lang)}
            </p>
            <p className="flex items-center gap-2.5 opacity-80">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              {siteSettings.phone}
            </p>
            <p className="flex items-center gap-2.5 opacity-80">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              {lang === "ka" ? siteSettings.hours : (siteSettings.hoursEn || siteSettings.hours)}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-lg text-amber-500 uppercase tracking-wider">
              {lang === "ka" ? "სწრაფი კონსულტაცია" : "Quick Consultation"}
            </h4>
            <p className="text-xs opacity-75">
              {lang === "ka" ? "მოგვწერეთ პირდაპირ WhatsApp-ში ან Messenger-ში:" : "Message us directly via WhatsApp or Messenger:"}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href={`https://wa.me/${(siteSettings.whatsapp || "").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={siteSettings.messenger || "https://m.me/"}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                Messenger
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 text-center text-xs opacity-60">
          {siteSettings.copyright}
        </div>
      </div>
    </footer>
  );
}
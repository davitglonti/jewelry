import React from 'react';
import { Gift, MessageCircle, Ruler, HelpCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function ConciergeBannerSection() {
  const { lang, siteSettings = {} } = useStore();
  const prefix = lang === "en" ? "/en" : "";
  const whatsappNumber = (siteSettings?.whatsapp || "995555000000").replace(/[^0-9]/g, "");

  return (
    <section className="py-14 sm:py-18 bg-[#FAF8F4] border-t border-[#EAE4DB] text-[#1F1C18]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#EAE4DB] shadow-[0_4px_24px_rgba(31,28,24,0.04)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5EFE4] text-[#8A6836] text-xs font-medium">
              <Gift className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>{lang === "ka" ? "პერსონალური სერვისი & სასაჩუქრე შეფუთვა" : "Private Concierge & Signature Packaging"}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-medium text-[#1F1C18] leading-snug">
              {lang === "ka"
                ? "ეძებთ განსაკუთრებულ საჩუქარს ან გჭირდებათ ზომის რჩევა?"
                : "Looking for a special gift or personal sizing guidance?"}
            </h2>

            <p className="text-sm sm:text-base text-[#4A453E] leading-relaxed max-w-2xl">
              {lang === "ka"
                ? "ჩვენი საიუველირო ექსპერტები დაგეხმარებიან იდეალური მოდელისა და ზომის შერჩევაში. ყველა სამკაულს მოყვება საფირმო ხავერდის ყუთი და სერტიფიკატი."
                : "Our jewelry specialists are ready to help you choose the perfect piece and size. Every creation arrives in our signature velvet box with a purity certificate."}
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-wrap lg:justify-end items-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                lang === "ka"
                  ? "გამარჯობა, მჭირდება კონსულტაცია სამკაულის შერჩევაზე..."
                  : "Hello, I would like personal consultation on choosing a jewelry piece..."
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#1F1C18] hover:bg-[#25D366] text-white hover:shadow-[0_0_20px_rgba(37,211,102,0.45)] text-xs sm:text-sm font-medium transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4 stroke-[1.75]" />
              <span>{lang === "ka" ? "WhatsApp კონსულტაცია" : "WhatsApp Concierge"}</span>
            </a>

            <a
              href={`${prefix}/size-guide`}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#FAF8F4] border border-[#D9D1C5] hover:border-[#1F1C18] text-[#1F1C18] text-xs sm:text-sm font-medium transition-colors"
            >
              <Ruler className="w-4 h-4 text-[#9A7742] stroke-[1.75]" />
              <span>{lang === "ka" ? "ზომის გიდი" : "Size Guide"}</span>
            </a>

            <a
              href={`${prefix}/faq`}
              className="inline-flex items-center gap-1.5 px-4 py-3 text-xs sm:text-sm font-medium text-[#5C564E] hover:text-[#1F1C18] transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-[#9A7742] stroke-[1.75]" />
              <span>{lang === "ka" ? "კითხვა-პასუხი (FAQ)" : "FAQ"}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

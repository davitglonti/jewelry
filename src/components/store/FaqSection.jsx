import React, { useState, useEffect } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { DEFAULT_FAQ_ITEMS } from '../../data/defaultSettings';

export default function FaqSection({ lang, siteSettings, standalone = false }) {
  const faqList = (siteSettings?.faqItems && siteSettings.faqItems.length > 0)
    ? siteSettings.faqItems
    : DEFAULT_FAQ_ITEMS;

  const [openId, setOpenId] = useState(faqList[0]?.id || "faq-1");

  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqList.map((item) => ({
        "@type": "Question",
        "name": lang === "ka" ? item.questionKa : (item.questionEn || item.questionKa),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": lang === "ka" ? item.answerKa : (item.answerEn || item.answerKa)
        }
      }))
    };

    let scriptTag = document.getElementById("faq-schema-ld");
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "faq-schema-ld";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById("faq-schema-ld");
      if (el) el.remove();
    };
  }, [lang, faqList]);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const whatsappNumber = (siteSettings?.whatsapp || "995555000000").replace(/[^0-9]/g, "");

  const HeadingTag = standalone ? "h1" : "h2";

  return (
    <section
      id="faq"
      aria-label={lang === "ka" ? "ხშირად დასმული კითხვები" : "Frequently Asked Questions"}
      className={
        standalone
          ? "pt-6 pb-20 bg-[#FAF8F4] text-[#1F1C18]"
          : "py-16 sm:py-22 bg-white border-t border-[#EAE4DB] text-[#1F1C18]"
      }
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2.5 mb-10 sm:mb-12">
          <span className="text-xs font-medium text-[#9A7742] block">
            {lang === "ka" ? "ხშირად დასმული კითხვები" : "Client Care & Guidance"}
          </span>

          <HeadingTag className="font-serif text-3xl sm:text-4xl font-medium text-[#1F1C18]">
            {lang === "ka"
              ? "ყველაფერი, რაც ჩვენს სამკაულებზე უნდა იცოდეთ"
              : "Everything You Need to Know"}
          </HeadingTag>

          <p className="text-sm text-[#5C564E] max-w-xl mx-auto leading-relaxed">
            {lang === "ka"
              ? "პასუხები ყველაზე მნიშვნელოვან კითხვებზე ზომის შერჩევის, სერტიფიკატების, მიწოდებისა და გარანტიის შესახებ."
              : "Answers to common questions regarding sizing, certification, insured delivery, and our lifetime guarantee."}
          </p>
        </div>

        {/* Clean Elevated Accordion Cards */}
        <div className="space-y-3">
          {faqList.map((item, idx) => {
            const isOpen = openId === item.id;
            const q = lang === "ka" ? item.questionKa : (item.questionEn || item.questionKa);
            const a = lang === "ka" ? item.answerKa : (item.answerEn || item.answerKa);

            return (
              <div
                key={item.id || idx}
                className={`rounded-2xl border transition-all ${
                  isOpen
                    ? (standalone ? "bg-white border-[#C8B28E] shadow-[0_6px_20px_rgba(31,28,24,0.05)]" : "bg-[#FAF8F4] border-[#D9D1C5]")
                    : "bg-white border-[#EAE4DB] hover:border-[#D9D1C5]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id || String(idx))}
                  aria-expanded={isOpen}
                  className="w-full text-left px-5 sm:px-6 py-4.5 sm:py-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-serif text-base sm:text-lg font-medium text-[#1F1C18] flex items-baseline gap-3">
                    <span className="text-xs font-mono text-[#9A7742]">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>
                    <span>{q}</span>
                  </span>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isOpen ? "rotate-180 bg-[#1F1C18] text-white" : "bg-[#F4EFE6] text-[#5C564E]"
                  }`}>
                    <ChevronDown className="w-4 h-4 stroke-[1.75]" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-0 text-sm text-[#4A453E] leading-relaxed">
                    <div className="pt-3 border-t border-[#EAE4DB]">{a}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Private Concierge Box */}
        <div className={`mt-10 p-6 sm:p-8 rounded-2xl border border-[#EAE4DB] flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left ${standalone ? "bg-white shadow-[0_4px_20px_rgba(31,28,24,0.04)]" : "bg-[#FAF8F4]"}`}>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-medium text-[#1F1C18]">
              {lang === "ka" ? "ვერ იპოვეთ პასუხი თქვენს კითხვაზე?" : "Need Personal Assistance?"}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C564E]">
              {lang === "ka"
                ? "ჩვენი საიუველირო ექსპერტები მზად არიან გაგიწიონ პერსონალური კონსულტაცია."
                : "Our jewelry specialists are available to assist you personally in real time."}
            </p>
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              lang === "ka"
                ? "გამარჯობა, მაქვს კითხვა სამკაულთან დაკავშირებით..."
                : "Hello, I have a question regarding jewelry..."
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1F1C18] hover:bg-[#25D366] hover:shadow-[0_0_20px_rgba(37,211,102,0.45)] text-white text-xs sm:text-sm font-medium transition-all duration-300 shrink-0"
          >
            <MessageCircle className="w-4 h-4 stroke-[1.75]" />
            <span>{lang === "ka" ? "მოგვწერეთ WhatsApp-ში" : "Message on WhatsApp"}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

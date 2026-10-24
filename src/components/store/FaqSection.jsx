import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { DEFAULT_FAQ_ITEMS } from '../../data/defaultSettings';

export default function FaqSection({ darkMode, lang, siteSettings }) {
  const faqList = (siteSettings?.faqItems && siteSettings.faqItems.length > 0)
    ? siteSettings.faqItems
    : DEFAULT_FAQ_ITEMS;

  const [openId, setOpenId] = useState(faqList[0]?.id || "faq-1");

  // Injects FAQPage Schema.org JSON-LD for Google rich snippets
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

  return (
    <section
      id="faq"
      aria-label={lang === "ka" ? "ხშირად დასმული კითხვები" : "Frequently Asked Questions"}
      className={`py-20 sm:py-24 border-t transition-colors ${
        darkMode ? "bg-[#0c0b0a] border-stone-800/80" : "bg-[#faf7f2] border-stone-200"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs tracking-wider uppercase font-medium">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lang === "ka" ? "ხშირად დასმული კითხვები" : "FAQ & Guidance"}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl tracking-wide font-normal">
            {lang === "ka"
              ? "ყველაფერი, რაც ჩვენს სამკაულებზე უნდა იცოდეთ"
              : "Everything You Need to Know About Our Jewelry"}
          </h2>

          <p className="text-xs sm:text-sm opacity-70 max-w-xl mx-auto leading-relaxed">
            {lang === "ka"
              ? "პასუხები ყველაზე მნიშვნელოვან კითხვებზე ზომის შერჩევის, ხარისხის სერტიფიკატების, მიწოდებისა და გარანტიის შესახებ."
              : "Answers to the most common questions regarding sizing, certification, delivery, and our lifetime guarantee."}
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3.5">
          {faqList.map((item, idx) => {
            const isOpen = openId === item.id;
            const q = lang === "ka" ? item.questionKa : (item.questionEn || item.questionKa);
            const a = lang === "ka" ? item.answerKa : (item.answerEn || item.answerKa);

            return (
              <div
                key={item.id || idx}
                className={`rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? darkMode
                      ? "bg-stone-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5"
                      : "bg-white border-amber-500/50 shadow-md shadow-stone-200/50"
                    : darkMode
                    ? "bg-stone-900/40 border-stone-800 hover:border-stone-700"
                    : "bg-white/70 border-stone-200 hover:border-stone-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id || String(idx))}
                  aria-expanded={isOpen}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-serif text-sm sm:text-base font-medium flex items-center gap-3">
                    <span className="text-xs font-mono text-amber-500/70 font-normal">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>
                    <span>{q}</span>
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "rotate-180 bg-amber-500 text-black"
                        : darkMode
                        ? "bg-stone-800 text-stone-400"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm opacity-80 leading-relaxed border-t border-stone-500/10 mt-1">
                    <p className="pt-3">{a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions CTA */}
        <div
          className={`mt-12 p-6 sm:p-8 rounded-3xl border text-center space-y-3 ${
            darkMode
              ? "bg-gradient-to-b from-stone-900/60 to-stone-900/20 border-stone-800"
              : "bg-white border-stone-200 shadow-sm"
          }`}
        >
          <h3 className="font-serif text-lg sm:text-xl">
            {lang === "ka" ? "ვერ იპოვეთ პასუხი თქვენს კითხვაზე?" : "Have a question not listed here?"}
          </h3>
          <p className="text-xs opacity-70 max-w-md mx-auto">
            {lang === "ka"
              ? "ჩვენი საიუველირო ექსპერტები მზად არიან გაგიწიონ პერსონალური კონსულტაცია რეალურ დროში."
              : "Our jewelry consultants are ready to assist you personally in real-time."}
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                lang === "ka"
                  ? "გამარჯობა, მაქვს კითხვა სამკაულთან დაკავშირებით..."
                  : "Hello, I have a question regarding jewelry..."
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{lang === "ka" ? "მოგვწერეთ WhatsApp-ში" : "Message on WhatsApp"}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

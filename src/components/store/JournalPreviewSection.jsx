import React, { useState, useRef } from 'react';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { navigateTo } from '../../utils/navigation';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

export default function JournalPreviewSection() {
  const { lang, articles = [] } = useStore();
  const previewArticles = articles.slice(0, 3);
  const prefix = lang === "en" ? "/en" : "";
  const [activeIdx, setActiveIdx] = useState(0);
  const sliderRef = useRef(null);

  if (previewArticles.length === 0) return null;

  const openArticle = (art) => {
    navigateTo(`${prefix}/blog/${encodeURIComponent(art.slug || art.id)}`);
  };

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const cardWidth = el.firstElementChild?.offsetWidth || 280;
    const newIdx = Math.round(el.scrollLeft / (cardWidth + 16));
    setActiveIdx(Math.max(0, Math.min(newIdx, previewArticles.length - 1)));
  };

  const scrollToSlide = (idx) => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const cardWidth = el.firstElementChild?.offsetWidth || 280;
    el.scrollTo({ left: idx * (cardWidth + 16), behavior: 'smooth' });
    setActiveIdx(idx);
  };

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-[#EAE4DB] text-[#1F1C18]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <span className="text-xs font-medium text-[#9A7742] block mb-1.5">
              {lang === "ka" ? "საიუველირო ჟურნალი" : "Fine Jewelry Journal"}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1F1C18]">
              {lang === "ka" ? "ექსპერტის რჩევები და გზამკვლევი" : "Guides & Atelier Stories"}
            </h2>
          </div>

          <a
            href={`${prefix}/blog`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF8F4] border border-[#D9D1C5] hover:border-[#1F1C18] hover:bg-[#1F1C18] hover:text-white text-xs sm:text-sm font-medium text-[#1F1C18] transition-all self-end sm:self-auto group whitespace-nowrap shadow-xs"
          >
            <span>{lang === "ka" ? "ყველა სტატია" : "Read Journal"}</span>
            <ArrowRight className="w-4 h-4 stroke-[1.75] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="-mx-4 px-4 sm:mx-0 sm:px-0 flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 snap-x snap-mandatory scrollbar-none"
        >
          {previewArticles.map((art) => {
            const title = lang === "ka" ? art.titleKa : (art.titleEn || art.titleKa);
            const excerpt = lang === "ka" ? art.excerptKa : (art.excerptEn || art.excerptKa);
            const readTime = lang === "ka" ? art.readTime : (art.readTimeEn || art.readTime);

            return (
              <article
                key={art.id}
                onClick={() => openArticle(art)}
                className="w-[84vw] min-w-[280px] max-w-[360px] shrink-0 md:w-auto md:min-w-0 md:max-w-none snap-center group cursor-pointer rounded-2xl overflow-hidden bg-[#FAF8F4] border border-[#EAE4DB] hover:border-[#D4C9B8] hover:shadow-[0_12px_28px_rgba(31,28,24,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#EFEAE0]">
                    <img
                      src={getOptimizedImageUrl(art.image, 500, 70)}
                      alt={title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { e.currentTarget.src = "/brand-logo.jpg"; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {art.category && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-medium bg-white/95 text-[#1F1C18] shadow-xs">
                        {art.category}
                      </span>
                    )}
                  </div>

                  <div className="p-5 sm:p-6 space-y-2.5">
                    <div className="flex items-center gap-3 text-xs text-[#787168]">
                      {art.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#9A7742]" />
                          {art.date}
                        </span>
                      )}
                      {readTime && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#9A7742]" />
                            {readTime}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#1F1C18] group-hover:text-[#9A7742] transition-colors leading-snug line-clamp-2">
                      {title}
                    </h3>

                    <p className="text-sm text-[#4A453E] leading-relaxed line-clamp-2">
                      {excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-5 pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1F1C18] group-hover:text-[#9A7742] transition-colors">
                    <span>{lang === "ka" ? "სრულად წაკითხვა" : "Read Story"}</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[1.75] group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Mobile Swipe Indicators (dots) */}
        {previewArticles.length > 1 && (
          <div className="flex md:hidden items-center justify-center gap-1.5 pt-3">
            {previewArticles.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToSlide(idx)}
                aria-label={`Go to article slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeIdx === idx ? "w-5 bg-[#9A7742]" : "w-1.5 bg-[#D9D1C5]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import React from 'react';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { navigateTo } from '../../utils/navigation';

export default function JournalPreviewSection() {
  const { lang, articles = [] } = useStore();
  const previewArticles = articles.slice(0, 3);
  const prefix = lang === "en" ? "/en" : "";

  if (previewArticles.length === 0) return null;

  const openArticle = (art) => {
    navigateTo(`${prefix}/blog/${encodeURIComponent(art.slug || art.id)}`);
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF8F4] border border-[#D9D1C5] hover:border-[#1F1C18] hover:bg-[#1F1C18] hover:text-white text-xs sm:text-sm font-medium text-[#1F1C18] transition-all self-start sm:self-auto group whitespace-nowrap"
          >
            <span>{lang === "ka" ? "ყველა სტატია" : "Read Journal"}</span>
            <ArrowRight className="w-4 h-4 stroke-[1.75] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {previewArticles.map((art) => {
            const title = lang === "ka" ? art.titleKa : (art.titleEn || art.titleKa);
            const excerpt = lang === "ka" ? art.excerptKa : (art.excerptEn || art.excerptKa);
            const readTime = lang === "ka" ? art.readTime : (art.readTimeEn || art.readTime);

            return (
              <article
                key={art.id}
                onClick={() => openArticle(art)}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-[#FAF8F4] border border-[#EAE4DB] hover:border-[#D4C9B8] hover:shadow-[0_12px_28px_rgba(31,28,24,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#EFEAE0]">
                    <img
                      src={art.image}
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
      </div>
    </section>
  );
}

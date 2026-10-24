import React, { useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { pick } from '../../utils/i18n';
import { SLIDE_INTERVAL_MS } from '../../constants';
import { getOptimizedImageUrl, getUnsplashSrcSet, sanitizeImageUrl } from '../../utils/imageUtils';

export default function HeroCarousel({ slides, currentSlide, setCurrentSlide, lang }) {
  const activeSlide = slides[currentSlide % slides.length] || slides[0];
  const slideImage = sanitizeImageUrl(activeSlide?.image);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length, setCurrentSlide]);

  if (!activeSlide) return null;

  return (
    <section className="relative h-[500px] sm:h-[640px] overflow-hidden flex items-center bg-black">
      <div className="absolute inset-0">
        <img
          src={getOptimizedImageUrl(slideImage, 1200, 75)}
          srcSet={getUnsplashSrcSet(slideImage)}
          sizes="100vw"
          alt={pick(activeSlide, "title", lang) || "მატარე — საიუველირო კოლექცია"}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width="1200"
          height="640"
          className="w-full h-full object-cover object-center transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12 sm:pt-0">
        <div className="max-w-xl space-y-3 sm:space-y-5">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] bg-amber-500/20 border border-amber-400/40 text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            {pick(activeSlide, "badge", lang)}
          </span>

          <h1 className="font-serif text-2xl sm:text-5xl lg:text-6xl font-normal text-white leading-[1.2] sm:leading-[1.15]">
            {pick(activeSlide, "title", lang)}
          </h1>

          <p className="text-stone-300 text-xs sm:text-base lg:text-lg leading-relaxed line-clamp-3 sm:line-clamp-none">
            {lang === "ka" ? activeSlide?.subtitle : (activeSlide?.subtitleEn || activeSlide?.subtitle)}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="#catalog"
              className="px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-amber-500/25 hover:brightness-110 transition-all"
            >
              {lang === "ka" ? (activeSlide?.buttonText || "კოლექციის ნახვა") : (activeSlide?.buttonTextEn || "Explore Collection")}
            </a>
            <a
              href="#contact"
              className="px-6 py-3 sm:px-7 sm:py-3.5 rounded-full border border-white/30 text-white hover:bg-white/10 text-xs sm:text-sm tracking-wider uppercase transition-all"
            >
              {lang === "ka" ? "შოურუმში ვიზიტი" : "Visit Showroom"}
            </a>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            aria-label={lang === "ka" ? "წინა სლაიდი" : "Previous slide"}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/15 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            aria-label={lang === "ka" ? "შემდეგი სლაიდი" : "Next slide"}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/15 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((s, idx) => {
              const isActive = currentSlide % slides.length === idx;
              return (
                <button
                  key={s.id || idx}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className="relative h-2 rounded-full bg-white/40 overflow-hidden transition-all cursor-pointer"
                  style={{ width: isActive ? "36px" : "10px" }}
                >
                  {isActive && (
                    <div
                      className="absolute top-0 left-0 w-full h-full bg-amber-400 origin-left"
                      style={{
                        animation: `fillProgress ${SLIDE_INTERVAL_MS}ms linear forwards`
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

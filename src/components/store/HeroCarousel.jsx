import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { pick } from '../../utils/i18n';
import { SLIDE_INTERVAL_MS } from '../../constants';
import { getOptimizedImageUrl, getUnsplashSrcSet, sanitizeImageUrl } from '../../utils/imageUtils';

const HERO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80";

export default function HeroCarousel({ slides, currentSlide, setCurrentSlide, lang }) {
  const activeSlide = slides[currentSlide % slides.length] || slides[0];
  const rawSlideImage = sanitizeImageUrl(activeSlide?.image);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [rawSlideImage]);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length, setCurrentSlide]);

  if (!activeSlide) return null;

  const activeIdx = currentSlide % slides.length;
  const displayImg = !imgFailed && rawSlideImage ? getOptimizedImageUrl(rawSlideImage, 720, 60) : HERO_FALLBACK_IMAGE;

  return (
    <section className="w-full pt-[78px] sm:pt-[86px] pb-6 bg-[#FAF8F4]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="bg-white rounded-3xl border border-[#EAE4DB] shadow-[0_4px_28px_rgba(31,28,24,0.05)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:h-[500px]">
          {/* Left Editorial Copy Panel */}
          <div className="lg:col-span-6 flex flex-col justify-between px-6 sm:px-10 lg:px-14 py-9 sm:py-11 lg:py-12 order-2 lg:order-1 min-h-[300px] lg:min-h-0 lg:h-full overflow-hidden">
            <div className="space-y-4 sm:space-y-5 my-auto">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#F5EFE4] text-[#6B4E23] text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A5B2C]" />
                <span>{pick(activeSlide, "badge", lang)}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-medium text-[#1F1C18] leading-[1.2] line-clamp-2">
                {pick(activeSlide, "title", lang)}
              </h1>

              <p className="text-sm sm:text-[15px] text-[#4A453E] leading-relaxed max-w-lg line-clamp-3">
                {lang === "ka" ? activeSlide?.subtitle : (activeSlide?.subtitleEn || activeSlide?.subtitle)}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5 sm:gap-4">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#1F1C18] text-white hover:bg-[#35302A] text-xs sm:text-sm font-medium transition-all shadow-sm group"
                >
                  <span>{lang === "ka" ? (activeSlide?.buttonText || "კოლექციის ნახვა") : (activeSlide?.buttonTextEn || "Explore Collection")}</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75] group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#contact"
                  className="inline-flex items-center px-6 py-3.5 rounded-full border border-[#D9D1C5] text-[#1F1C18] hover:border-[#1F1C18] hover:bg-[#FAF8F4] text-xs sm:text-sm font-medium transition-colors"
                >
                  {lang === "ka" ? "შოურუმში ვიზიტი" : "Visit Showroom"}
                </a>
              </div>
            </div>

            {/* Clean Slide Progress Indicators */}
            {slides.length > 1 && (
              <div className="pt-6 flex items-center gap-1.5">
                {slides.map((s, idx) => {
                  const isActive = activeIdx === idx;
                  return (
                    <button
                      key={s.id || idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className="min-h-[28px] px-1 flex items-center cursor-pointer"
                    >
                      <span
                        className="relative block h-1.5 rounded-full bg-[#EAE4DB] overflow-hidden transition-all"
                        style={{ width: isActive ? "40px" : "12px" }}
                      >
                        {isActive && (
                          <span
                            className="absolute inset-0 bg-[#7A5B2C] origin-left rounded-full"
                            style={{ animation: `fillProgress ${SLIDE_INTERVAL_MS}ms linear forwards` }}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
                <span className="ml-2 text-xs font-mono text-[#5E584F]">
                  {String(activeIdx + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          {/* Right Framed Editorial Photography — Fully Contained (Zero Cropping, Zero Layout Shift) */}
          <div className="lg:col-span-6 relative h-[280px] sm:h-[360px] lg:h-full bg-gradient-to-br from-[#FAF8F4] via-[#F5EFE4]/35 to-[#FAF8F4] order-1 lg:order-2 overflow-hidden flex items-center justify-center">
            {/* Primary uncropped photography that fully fits inside the space */}
            <img
              src={displayImg}
              srcSet={!imgFailed && rawSlideImage ? getUnsplashSrcSet(rawSlideImage) : undefined}
              sizes="(max-width: 1024px) 92vw, 50vw"
              width="720"
              height="500"
              alt={pick(activeSlide, "title", lang) || "მატარე — საიუველირო კოლექცია"}
              loading="eager"
              ref={(el) => { if (el) el.setAttribute('fetchpriority', 'high'); }}
              decoding="sync"
              onError={() => setImgFailed(true)}
              className="relative z-1 w-full h-full object-contain object-center p-2 sm:p-4"
            />

            {slides.length > 1 && (
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  aria-label={lang === "ka" ? "წინა სლაიდი" : "Previous slide"}
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-[#1F1C18] text-[#1F1C18] hover:text-white border border-[#EAE4DB] flex items-center justify-center shadow-sm transition-colors cursor-pointer backdrop-blur-sm"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[1.75]" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  aria-label={lang === "ka" ? "შემდეგი სლაიდი" : "Next slide"}
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-[#1F1C18] text-[#1F1C18] hover:text-white border border-[#EAE4DB] flex items-center justify-center shadow-sm transition-colors cursor-pointer backdrop-blur-sm"
                >
                  <ChevronRight className="w-4 h-4 stroke-[1.75]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

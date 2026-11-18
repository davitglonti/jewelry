import React from 'react';
import { ArrowRight, Award, Sparkles, Gem } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getOptimizedImageUrl, getUnsplashSrcSet } from '../../utils/imageUtils';

export default function CraftsmanshipSection({
  reverseLayout = false,
  showStats = true,
  showCtaButton = false,
  showExtraStory = false
}) {
  const { lang, siteSettings } = useStore();

  const extraParagraph = lang === "ka"
    ? (siteSettings.aboutExtraText || "ჩვენს სახელოსნოში თითოეული ქვა და მეტალი გადის უმკაცრეს შერჩევას. ჩვენ არ ვქმნით უბრალოდ სამკაულს — ჩვენ ვქმნით ოჯახურ რელიქვიას, რომელიც თაობიდან თაობას გადაეცემა და დროსთან ერთად კიდევ უფრო მეტ ღირებულებას იძენს.")
    : (siteSettings.aboutExtraTextEn || "In our atelier, every gemstone and precious metal undergoes rigorous selection. We don't just create jewelry — we craft family heirlooms passed down through generations.");

  return (
    <section id="craftsmanship" className="py-16 sm:py-22 bg-white border-y border-[#EAE4DB] text-[#1F1C18]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Story Column */}
        <div className={`lg:col-span-6 space-y-5 ${reverseLayout ? "lg:order-2" : "lg:order-1"}`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5EFE4] text-[#8A6836] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9A7742]" />
            <span>{lang === "ka" ? siteSettings.craftBadge : (siteSettings.craftBadgeEn || siteSettings.craftBadge)}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-medium leading-[1.24] text-[#1F1C18]">
            {lang === "ka" ? siteSettings.craftTitle : (siteSettings.craftTitleEn || siteSettings.craftTitle)}
          </h2>

          <p className="text-[#4A453E] leading-relaxed text-sm sm:text-base max-w-xl">
            {lang === "ka" ? siteSettings.craftDesc : (siteSettings.craftDescEn || siteSettings.craftDesc)}
          </p>

          {showExtraStory && (
            <p className="text-[#5C564E] leading-relaxed text-sm sm:text-base max-w-xl">
              {extraParagraph}
            </p>
          )}

          {showStats && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3">
              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAF8F4] border border-[#EAE4DB] space-y-1 sm:space-y-1.5 min-w-0 overflow-hidden">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9A7742] stroke-[1.75]" />
                <div className="font-serif text-sm sm:text-2xl font-semibold text-[#1F1C18] truncate">100%</div>
                <div className="text-[10px] sm:text-xs text-[#6B645B] leading-tight break-words sm:leading-snug">
                  {lang === "ka" ? "სერტიფიცირებული" : "Certified Gems"}
                </div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAF8F4] border border-[#EAE4DB] space-y-1 sm:space-y-1.5 min-w-0 overflow-hidden">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9A7742] stroke-[1.75]" />
                <div className="font-serif text-xs sm:text-2xl font-semibold text-[#1F1C18] truncate sm:whitespace-normal">18K / 750°</div>
                <div className="text-[10px] sm:text-xs text-[#6B645B] leading-tight break-words sm:leading-snug">
                  {lang === "ka" ? "უმაღლესი სინჯი" : "Finest Gold"}
                </div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#FAF8F4] border border-[#EAE4DB] space-y-1 sm:space-y-1.5 min-w-0 overflow-hidden">
                <Gem className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9A7742] stroke-[1.75]" />
                <div className="font-serif text-xs sm:text-2xl font-semibold text-[#1F1C18] truncate">
                  {lang === "ka" ? "ხელნაკეთი" : "Handmade"}
                </div>
                <div className="text-[10px] sm:text-xs text-[#6B645B] leading-tight break-words sm:leading-snug">
                  {lang === "ka" ? "საფირმო დიზაინი" : "Atelier Design"}
                </div>
              </div>
            </div>
          )}

          {showCtaButton && (
            <div className="pt-2">
              <a
                href={lang === "en" ? "/en/catalog" : "/catalog"}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#1F1C18] text-white hover:bg-[#35302A] text-xs sm:text-sm font-medium transition-colors group"
              >
                <span>{lang === "ka" ? "კოლექციის დათვალიერება" : "Explore Collection"}</span>
                <ArrowRight className="w-4 h-4 stroke-[1.75] group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          )}
        </div>

        {/* Balanced Diptych Photography */}
        <div className={`lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-5 items-center ${reverseLayout ? "lg:order-1" : "lg:order-2"}`}>
          <div className="h-[260px] sm:h-[360px] rounded-2xl overflow-hidden bg-[#F3EFE8] border border-[#EAE4DB] shadow-xs">
            <img
              src={getOptimizedImageUrl(siteSettings.craftImg1, 600, 75)}
              srcSet={getUnsplashSrcSet(siteSettings.craftImg1)}
              sizes="(max-width: 640px) 46vw, 380px"
              alt={lang === "ka" ? "საიუველირო ოსტატობა — ხელნაკეთი პროცესი" : "Jewelry craftsmanship process"}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="h-[260px] sm:h-[360px] rounded-2xl overflow-hidden bg-[#F3EFE8] border border-[#EAE4DB] shadow-xs sm:mt-8">
            <img
              src={getOptimizedImageUrl(siteSettings.craftImg2, 600, 75)}
              srcSet={getUnsplashSrcSet(siteSettings.craftImg2)}
              sizes="(max-width: 640px) 46vw, 380px"
              alt={lang === "ka" ? "საიუველირო ხელოვნება და დეტალები" : "Jewelry craftsmanship and fine details"}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

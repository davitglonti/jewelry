import React from 'react';
import { Award, Sparkles, Gem } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getOptimizedImageUrl, getUnsplashSrcSet } from '../../utils/imageUtils';

export default function CraftsmanshipSection({
  reverseLayout = false, // About გვერდზე სურათები მარცხნივ დადგება
  showStats = true,      // მთავარ გვერდზე ჩანს 3 პატარა ბარათი
  showCtaButton = false, // About გვერდზე ჩანს ღილაკი "კოლექციის დათვალიერება"
  showExtraStory = false // About გვერდზე ჩანს დამატებითი აბზაცი
}) {
  const { darkMode, lang, siteSettings } = useStore();

  const extraParagraph = lang === "ka"
    ? (siteSettings.aboutExtraText || "ჩვენს სახელოსნოში თითოეული ქვა და მეტალი გადის უმკაცრეს შერჩევას. ჩვენ არ ვქმნით უბრალოდ სამკაულს — ჩვენ ვქმნით ოჯახურ რელიქვიას, რომელიც თაობიდან თაობას გადაეცემა და დროსთან ერთად კიდევ უფრო მეტ ღირებულებას იძენს.")
    : (siteSettings.aboutExtraTextEn || "In our atelier, every gemstone and precious metal undergoes rigorous selection. We don't just create jewelry — we craft family heirlooms passed down through generations.");

  return (
    <section id="craftsmanship" className={`py-20 border-y ${darkMode ? "bg-[#12100e] border-stone-800/70" : "bg-stone-900 text-white border-stone-800"}`}>
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* ტექსტური მხარე */}
        <div className={`space-y-6 ${reverseLayout ? "lg:order-2" : "lg:order-1"}`}>
          <span className="text-xs uppercase tracking-[0.25em] text-amber-500 block">
            {lang === "ka" ? siteSettings.craftBadge : (siteSettings.craftBadgeEn || siteSettings.craftBadge)}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl leading-tight text-white">
            {lang === "ka" ? siteSettings.craftTitle : (siteSettings.craftTitleEn || siteSettings.craftTitle)}
          </h2>
          <p className="text-stone-300 leading-relaxed text-base sm:text-lg">
            {lang === "ka" ? siteSettings.craftDesc : (siteSettings.craftDescEn || siteSettings.craftDesc)}
          </p>

          {/* დამატებითი აბზაცი (მხოლოდ About გვერდისთვის) */}
          {showExtraStory && (
            <p className="text-stone-400 leading-relaxed text-sm sm:text-base">
              {extraParagraph}
            </p>
          )}

          {/* 3 სტატისტიკის ბარათი (მთავარი გვერდისთვის) */}
          {showStats && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
              <div className="p-2.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center sm:items-start text-center sm:text-left overflow-hidden">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mb-1.5 sm:mb-2 shrink-0" />
                <div className="text-sm sm:text-xl font-serif font-bold text-white leading-tight">100%</div>
                <div className="text-[10px] sm:text-xs text-stone-400 mt-1 leading-tight break-words w-full">
                  {lang === "ka" ? "სერტიფიცირებული" : "Certified Gems"}
                </div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center sm:items-start text-center sm:text-left overflow-hidden">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mb-1.5 sm:mb-2 shrink-0" />
                <div className="text-sm sm:text-xl font-serif font-bold text-white leading-tight">18K / 750°</div>
                <div className="text-[10px] sm:text-xs text-stone-400 mt-1 leading-tight break-words w-full">
                  {lang === "ka" ? "უმაღლესი სინჯი" : "Finest Gold"}
                </div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center sm:items-start text-center sm:text-left overflow-hidden">
                <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mb-1.5 sm:mb-2 shrink-0" />
                <div className="text-sm sm:text-xl font-serif font-bold text-white leading-tight">
                  {lang === "ka" ? "ხელნაკეთი" : "Handmade"}
                </div>
                <div className="text-[10px] sm:text-xs text-stone-400 mt-1 leading-tight break-words w-full">
                  {lang === "ka" ? "ექსკლუზიური დიზაინი" : "Exclusive Design"}
                </div>
              </div>
            </div>
          )}

          {/* ღილაკი "კოლექციის დათვალიერება" (About გვერდისთვის) */}
          {showCtaButton && (
            <div className="pt-2">
              <a
                href="/#catalog"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-500 text-black font-semibold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
              >
                <Sparkles className="w-4 h-4" />
                {lang === "ka" ? "კოლექციის დათვალიერება" : "Explore Collection"}
              </a>
            </div>
          )}
        </div>

        {/* ფოტოების მხარე */}
        <div className={`grid grid-cols-2 gap-4 sm:gap-6 ${reverseLayout ? "lg:order-1" : "lg:order-2"}`}>
          <img
            src={getOptimizedImageUrl(siteSettings.craftImg1, 450, 68)}
            srcSet={getUnsplashSrcSet(siteSettings.craftImg1)}
            sizes="(max-width: 640px) 46vw, 380px"
            alt={lang === "ka" ? "საიუველირო ოსტატობა — ხელნაკეთი პროცესი" : "Jewelry craftsmanship process"}
            loading="lazy"
            decoding="async"
            width="400"
            height="320"
            className="w-full h-72 sm:h-80 object-cover rounded-3xl border border-amber-500/20 shadow-2xl"
          />
          <img
            src={getOptimizedImageUrl(siteSettings.craftImg2, 450, 68)}
            srcSet={getUnsplashSrcSet(siteSettings.craftImg2)}
            sizes="(max-width: 640px) 46vw, 380px"
            alt={lang === "ka" ? "საიუველირო ხელოვნება და დეტალები" : "Jewelry craftsmanship and fine details"}
            loading="lazy"
            decoding="async"
            width="400"
            height="320"
            className="w-full h-72 sm:h-80 object-cover rounded-3xl border border-amber-500/20 shadow-2xl mt-8"
          />
        </div>

      </div>
    </section>
  );
}

import React from 'react';
import { Award, Sparkles, Gem } from 'lucide-react';

export default function CraftsmanshipSection({ darkMode, lang, siteSettings }) {
  return (
    <section id="craftsmanship" className={`py-20 border-y ${darkMode ? "bg-[#12100e] border-stone-800/70" : "bg-stone-900 text-white border-stone-800"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-500 block">
            {lang === "ka" ? siteSettings.craftBadge : (siteSettings.craftBadgeEn || siteSettings.craftBadge)}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl leading-tight text-white">
            {lang === "ka" ? siteSettings.craftTitle : (siteSettings.craftTitleEn || siteSettings.craftTitle)}
          </h2>
          <p className="text-stone-300 leading-relaxed text-base sm:text-lg">
            {lang === "ka" ? siteSettings.craftDesc : (siteSettings.craftDescEn || siteSettings.craftDesc)}
          </p>

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
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <img
            src={siteSettings.craftImg1}
            alt="Craftsmanship 1"
            className="w-full h-72 sm:h-80 object-cover rounded-3xl border border-amber-500/20 shadow-2xl"
          />
          <img
            src={siteSettings.craftImg2}
            alt="Craftsmanship 2"
            className="w-full h-72 sm:h-80 object-cover rounded-3xl border border-amber-500/20 shadow-2xl mt-8"
          />
        </div>
      </div>
    </section>
  );
}
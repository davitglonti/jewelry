import React from 'react';
import { Sparkles, Truck } from 'lucide-react';

const DEFAULT_HIGHLIGHTS_KA = [
  {
    title: 'ავთენტური სინჯი და სერტიფიკატი:',
    desc: 'დამოწმებულია ოფიციალური სინჯის ბეჭდით და თან ახლავს ხარისხის პასპორტი.'
  },
  {
    title: 'ხელით დამუშავებული ოსტატობა:',
    desc: 'თითოეული ქვა და დეტალი დამაგრებულია ინდივიდუალურად ჩვენს საიუველირო ატელიეში.'
  },
  {
    title: 'სრული სასაჩუქრე კომპლექტი:',
    desc: 'მოყვება საფირმო ხავერდის ყუთი, აბრეშუმის ლენტი, სასაჩუქრე ჩანთა და მილოცვის ბარათი.'
  }
];

const DEFAULT_HIGHLIGHTS_EN = [
  {
    title: 'Certified Purity & Passport:',
    desc: 'Hallmarked with official assay stamp and includes certified jewelry passport.'
  },
  {
    title: 'Master Handcraft:',
    desc: 'Each stone and setting is meticulously hand-placed in our fine atelier.'
  },
  {
    title: 'Complete Gift Presentation:',
    desc: 'Includes signature velvet box, silk ribbon, luxury bag and gift card.'
  }
];

export default function ProductStoryHighlights({ product, darkMode = true, lang = 'ka' }) {
  if (!product) return null;

  const defaultList = lang === 'ka' ? DEFAULT_HIGHLIGHTS_KA : DEFAULT_HIGHLIGHTS_EN;
  const highlights = (Array.isArray(product.highlights) && product.highlights.length > 0)
    ? product.highlights.map((h, i) => ({
        title: (lang === 'ka' ? h.title : (h.titleEn || h.title)) || defaultList[i]?.title || '',
        desc: (lang === 'ka' ? h.desc : (h.descEn || h.desc)) || defaultList[i]?.desc || ''
      })).filter(h => h.title || h.desc)
    : defaultList;

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Alternative A: Guaranteed Express Delivery Banner */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
          darkMode
            ? 'bg-gradient-to-r from-amber-500/10 via-stone-900/40 to-transparent border-amber-500/20'
            : 'bg-gradient-to-r from-amber-50 via-white to-amber-50/30 border-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <Truck className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold flex items-center gap-2">
              <span className="text-stone-100">
                {lang === 'ka' ? 'დაზღვეული ექსპრეს მიწოდება' : 'Guaranteed Express Delivery'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider">
                {lang === 'ka' ? 'უფასო' : 'Free'}
              </span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">
              {lang === 'ka'
                ? 'თბილისში დღესვე • რეგიონებში 24-48 საათში დაზღვეული კურიერით'
                : 'Same day in Tbilisi • 24-48h nationwide via insured courier'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Luxury Craftsmanship & Unboxing Box (Configurable Per-Product) */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-all ${
          darkMode ? 'bg-stone-900/40 border-stone-800' : 'bg-white border-stone-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-500/15 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase tracking-wider font-semibold text-stone-300">
              {lang === 'ka' ? 'ატელიეს სტანდარტი და შეფუთვა' : 'Atelier Standard & Packaging'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500/80">
            Matare Atelier
          </span>
        </div>

        <ul className="space-y-2.5 text-xs sm:text-[13px] text-stone-300">
          {highlights.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="text-amber-500 font-bold mt-0.5">✦</span>
              <span>
                {item.title && (
                  <strong className="text-stone-100 font-medium mr-1.5">
                    {item.title}
                  </strong>
                )}
                {item.desc}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

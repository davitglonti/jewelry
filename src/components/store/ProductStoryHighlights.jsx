import React from 'react';
import { Truck, Sparkles } from 'lucide-react';

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

export default function ProductStoryHighlights({ product, lang = 'ka' }) {
  if (!product) return null;

  const defaultList = lang === 'ka' ? DEFAULT_HIGHLIGHTS_KA : DEFAULT_HIGHLIGHTS_EN;
  const highlights = (Array.isArray(product.highlights) && product.highlights.length > 0)
    ? product.highlights.map((h, i) => ({
        title: (lang === 'ka' ? h.title : (h.titleEn || h.title)) || defaultList[i]?.title || '',
        desc: (lang === 'ka' ? h.desc : (h.descEn || h.desc)) || defaultList[i]?.desc || ''
      })).filter(h => h.title || h.desc)
    : defaultList;

  return (
    <div className="space-y-3 pt-1">
      <div className="p-3.5 rounded-2xl bg-[#FAF8F4] border border-[#EAE4DB] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#F4EFE6] text-[#9A7742] flex items-center justify-center shrink-0">
          <Truck className="w-4 h-4 stroke-[1.75]" />
        </div>
        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-medium text-[#1F1C18] flex items-center gap-2 flex-wrap">
            <span>{lang === 'ka' ? 'დაზღვეული ექსპრეს მიწოდება' : 'Guaranteed Express Delivery'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1F1C18] text-white">
              {lang === 'ka' ? 'უფასო' : 'Free'}
            </span>
          </div>
          <div className="text-xs text-[#5C564E] mt-0.5">
            {lang === 'ka'
              ? 'თბილისში დღესვე • რეგიონებში 24-48 საათში დაზღვეული კურიერით'
              : 'Same day in Tbilisi • 24-48h nationwide via insured courier'}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE4DB] space-y-3">
        <div className="flex items-center justify-between border-b border-[#F3EFE8] pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#9A7742]" />
            <span className="text-xs font-semibold text-[#1F1C18]">
              {lang === 'ka' ? 'ატელიეს სტანდარტი და შეფუთვა' : 'Atelier Standard & Packaging'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#9A7742]">Matare Atelier</span>
        </div>

        <ul className="space-y-2 text-xs sm:text-[13px] text-[#4A453E] leading-relaxed">
          {highlights.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#9A7742] mt-0.5 text-[10px]">✦</span>
              <span>
                {item.title && (
                  <strong className="text-[#1F1C18] font-medium mr-1">
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

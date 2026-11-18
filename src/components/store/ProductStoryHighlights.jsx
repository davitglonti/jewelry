import React from 'react';
import { Truck, Package } from 'lucide-react';

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
    <div className="space-y-2.5 pt-2">
      {/* Pill 1: Free Insured Express Delivery */}
      <div className="p-3.5 px-5 rounded-2xl bg-white border border-[#EAE4DB] shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <Truck className="w-4 h-4 text-[#787168] stroke-[1.5]" />
          <span className="font-medium text-[#1F1C18]">
            {lang === 'ka' ? 'დაზღვეული ექსპრეს მიწოდება' : 'Guaranteed Express Delivery'}
          </span>
          <span className="text-[#166534] font-semibold">
            {lang === 'ka' ? 'უფასო' : 'Free'}
          </span>
        </div>
        <span className="text-[11px] text-[#787168] hidden sm:inline">
          {lang === 'ka' ? 'თბილისში დღესვე • რეგიონებში 24-48 საათში' : 'Same day in Tbilisi • 24-48h nationwide'}
        </span>
      </div>

      {/* Pill 2: Matare Atelier Packaging */}
      <div className="p-3.5 px-5 rounded-2xl bg-white border border-[#EAE4DB] shadow-xs flex items-center gap-3 text-xs">
        <Package className="w-4 h-4 text-[#787168] stroke-[1.5]" />
        <span className="font-medium text-[#1F1C18]">
          {lang === 'ka' ? 'მატარეს საფირმო შეფუთვა' : 'Matare Atelier Packaging'}
        </span>
      </div>

      {/* Atelier Highlights */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE4DB] shadow-xs space-y-2.5 text-xs text-[#4A453E]">
        {highlights.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-[#9A7742] text-[10px] mt-0.5">✦</span>
            <span>
              {item.title && <strong className="text-[#1F1C18] font-medium mr-1">{item.title}</strong>}
              {item.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

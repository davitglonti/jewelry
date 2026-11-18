import React from 'react';
import { Award, Shield, Gem, HeartHandshake } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const ICONS = [Gem, Award, Shield, HeartHandshake];

export default function InfoCards({
  badgeKey,
  badgeKeyEn,
  titleKey,
  titleKeyEn,
  itemsKey,
  defaultItems
}) {
  const { lang, siteSettings } = useStore();

  const rawItems = siteSettings[itemsKey];
  const currentItems = Array.isArray(rawItems) && rawItems.length > 0
    ? rawItems
    : (Array.isArray(siteSettings.aboutValues) && siteSettings.aboutValues.length > 0 ? siteSettings.aboutValues : defaultItems);

  const badgeText = lang === "en"
    ? (siteSettings[badgeKeyEn] || siteSettings[badgeKey] || "Why Choose Us")
    : (siteSettings[badgeKey] || "რატომ გვირჩევენ ჩვენ");

  const titleText = lang === "en"
    ? (siteSettings[titleKeyEn] || siteSettings[titleKey] || "Our Standards & Values")
    : (siteSettings[titleKey] || "ჩვენი სტანდარტი და ღირებულებები");

  return (
    <section className="py-16 sm:py-20 bg-[#FAF8F4] text-[#1F1C18]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-medium text-[#9A7742] block">
            {badgeText}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1F1C18]">
            {titleText}
          </h2>
        </div>

        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto sm:overflow-x-visible pb-3 sm:pb-0 snap-x snap-mandatory scrollbar-none">
          {Array.isArray(currentItems) && currentItems.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div
                key={i}
                className="w-[82vw] min-w-[270px] max-w-[340px] sm:w-auto sm:min-w-0 sm:max-w-none shrink-0 sm:shrink snap-center p-6 sm:p-7 rounded-2xl bg-white border border-[#EAE4DB] shadow-[0_2px_14px_rgba(31,28,24,0.03)] space-y-3.5"
              >
                <div className="w-11 h-11 rounded-full bg-[#F5EFE4] text-[#9A7742] flex items-center justify-center">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#1F1C18]">
                  {lang === "ka" ? item.titleKa : (item.titleEn || item.titleKa)}
                </h3>
                <p className="text-sm text-[#4A453E] leading-relaxed">
                  {lang === "ka" ? item.descKa : (item.descEn || item.descKa)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mobile Scroll Hint Dots */}
        {Array.isArray(currentItems) && currentItems.length > 1 && (
          <div className="flex sm:hidden items-center justify-center gap-1.5 -mt-4">
            {currentItems.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className="w-1.5 h-1.5 rounded-full bg-[#D9D1C5]"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

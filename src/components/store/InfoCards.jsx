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
  const { darkMode, lang, siteSettings } = useStore();

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
    <section className={`py-16 sm:py-20 border-b ${darkMode ? "bg-[#0c0b0a] border-stone-800" : "bg-stone-100 border-stone-200"}`}>
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-10 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-500 block font-medium">
            {badgeText}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl">
            {titleText}
          </h2>
        </div>

        {/* Swipeable Shelf on Mobile with Visual Peek, 4-Column Grid on Desktop */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex lg:grid lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 snap-x snap-mandatory scrollbar-none">
          {Array.isArray(currentItems) && currentItems.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div
                key={i}
                className={`p-6 sm:p-7 rounded-3xl border transition-all shrink-0 lg:shrink w-[75vw] min-w-[75vw] sm:w-[280px] sm:min-w-[280px] lg:w-auto lg:min-w-0 snap-start flex flex-col justify-between ${
                  darkMode ? "bg-[#171513] border-stone-800 hover:border-amber-500/40 shadow-md hover:shadow-xl hover:shadow-amber-500/5" : "bg-white border-stone-200 shadow-sm hover:shadow-md"
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-medium mb-2">
                    {lang === "ka" ? item.titleKa : (item.titleEn || item.titleKa)}
                  </h3>
                  <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                    {lang === "ka" ? item.descKa : (item.descEn || item.descKa)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

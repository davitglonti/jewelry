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
    <section className={`py-20 border-b ${darkMode ? "bg-[#0c0b0a] border-stone-800" : "bg-stone-100 border-stone-200"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-500 block">
            {badgeText}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl">
            {titleText}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.isArray(currentItems) && currentItems.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div
                key={i}
                className={`p-6 rounded-3xl border space-y-4 transition-all ${
                  darkMode ? "bg-[#171513] border-stone-800 hover:border-amber-500/40" : "bg-white border-stone-200 shadow-sm"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-medium">
                  {lang === "ka" ? item.titleKa : (item.titleEn || item.titleKa)}
                </h3>
                <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                  {lang === "ka" ? item.descKa : (item.descEn || item.descKa)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

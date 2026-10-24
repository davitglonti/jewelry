import React from 'react';

export const DEFAULT_VALUE_CARDS = [
  {
    titleKa: "ბუნებრივი ქვები",
    titleEn: "Natural Gemstones",
    descKa: "ვიყენებთ მხოლოდ სერტიფიცირებულ ბრილიანტებსა და ნატურალურ ძვირფას ქვებს.",
    descEn: "We use only certified diamonds and 100% natural precious gemstones."
  },
  {
    titleKa: "უმაღლესი სინჯი",
    titleEn: "Finest Gold Purity",
    descKa: "ყველა ნაკეთობა მოწმდება და დადასტურებულია უმაღლესი სინჯით (585° / 750° / 925°).",
    descEn: "Every piece is hallmarked and verified for authentic karat purity."
  },
  {
    titleKa: "საუკუნოვანი გარანტია",
    titleEn: "Lifetime Warranty",
    descKa: "ჩვენს ყველა სამკაულს მოყვება ხარისხის სერტიფიკატი და უფასო წმენდა-განახლების სერვისი.",
    descEn: "Includes an authenticity certificate and complimentary professional cleaning."
  },
  {
    titleKa: "ინდივიდუალური მიდგომა",
    titleEn: "Bespoke Service",
    descKa: "შესაძლებელია ზომის მორგება და ექსკლუზიური მოდელების ინდივიდუალური შეკვეთა.",
    descEn: "Custom sizing and personalized consultations for your special moments."
  }
];

export default function ValueCardsEditor({
  darkMode,
  sectionTitle,
  sectionSubtitle,
  badgeKa,
  badgeEn,
  onBadgeKaChange,
  onBadgeEnChange,
  titleKa,
  titleEn,
  onTitleKaChange,
  onTitleEnChange,
  cards,
  onCardChange
}) {
  const currentCards = Array.isArray(cards) && cards.length === 4 ? cards : DEFAULT_VALUE_CARDS;

  return (
    <div className="pt-6 border-t border-stone-500/20 space-y-4">
      <div>
        <h4 className="font-serif text-lg text-amber-500">{sectionTitle}</h4>
        {sectionSubtitle && <p className="text-xs opacity-75 mt-0.5">{sectionSubtitle}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] opacity-70">პატარა წარწერა (ქართულად):</label>
          <input
            type="text"
            value={badgeKa || ""}
            onChange={(e) => onBadgeKaChange(e.target.value)}
            placeholder="რატომ გვირჩევენ ჩვენ"
            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] opacity-70">პატარა წარწერა (ინგლისურად):</label>
          <input
            type="text"
            value={badgeEn || ""}
            onChange={(e) => onBadgeEnChange(e.target.value)}
            placeholder="Why Choose Us"
            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] opacity-70">მთავარი სათაური (ქართულად):</label>
          <input
            type="text"
            value={titleKa || ""}
            onChange={(e) => onTitleKaChange(e.target.value)}
            placeholder="ჩვენი სტანდარტი და ღირებულებები"
            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] opacity-70">მთავარი სათაური (ინგლისურად):</label>
          <input
            type="text"
            value={titleEn || ""}
            onChange={(e) => onTitleEnChange(e.target.value)}
            placeholder="Our Standards & Values"
            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {currentCards.map((card, idx) => (
          <div key={idx} className="p-4 rounded-2xl border border-stone-500/20 space-y-2">
            <span className="text-amber-400 font-semibold block">ღირებულების ბარათი #{idx + 1}</span>
            <input
              type="text"
              value={card.titleKa || ""}
              onChange={(e) => onCardChange(idx, "titleKa", e.target.value)}
              placeholder="სათაური (ქართულად)"
              className={`w-full p-2 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
            />
            <textarea
              rows={2}
              value={card.descKa || ""}
              onChange={(e) => onCardChange(idx, "descKa", e.target.value)}
              placeholder="აღწერა (ქართულად)"
              className={`w-full p-2 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
            />
            <input
              type="text"
              value={card.titleEn || ""}
              onChange={(e) => onCardChange(idx, "titleEn", e.target.value)}
              placeholder="Title (English)"
              className={`w-full p-2 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
            />
            <textarea
              rows={2}
              value={card.descEn || ""}
              onChange={(e) => onCardChange(idx, "descEn", e.target.value)}
              placeholder="Description (English)"
              className={`w-full p-2 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  X, ArrowLeftRight, Trash2, ExternalLink, MessageCircle,
  Sparkles, Check, Heart, ChevronRight, ChevronLeft
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../utils/i18n';

export default function CompareModal() {
  const {
    products,
    favorites,
    toggleFavorite,
    compareList,
    toggleCompare,
    clearCompare,
    showCompareModal,
    setShowCompareModal,
    darkMode,
    lang,
    siteSettings
  } = useStore();

  // მობილურზე წყვილის შედარების აქტიური ინდექსები (როცა 3 ან 4 ნივთია)
  const [mobilePair, setMobilePair] = useState([0, 1]);
  // მობილურის რეჟიმი: "duo" (2 ნივთი გვერდიგვერდ სქროლვის გარეშე) ან "all" (ყველა ნივთი ჰორიზონტალური სვაიპით)
  const [mobileMode, setMobileMode] = useState("duo");

  if (!showCompareModal) return null;

  const comparedProducts = products.filter((p) => compareList.includes(p.id));

  // ინდექსების უსაფრთხო ვალიდაცია
  const idxA = Math.min(mobilePair[0], Math.max(0, comparedProducts.length - 1));
  let idxB = Math.min(mobilePair[1], Math.max(0, comparedProducts.length - 1));
  if (idxB === idxA && comparedProducts.length >= 2) {
    idxB = idxA === 0 ? 1 : 0;
  }

  // მობილურზე duo რეჟიმში ნაჩვენები პროდუქტები
  const activeMobileProducts =
    comparedProducts.length <= 2 || mobileMode === "all"
      ? comparedProducts
      : [comparedProducts[idxA], comparedProducts[idxB]];

  const cleanPhone = (siteSettings?.whatsapp || "995555000000").replace(/[^0-9]/g, "");

  const getWaLink = (product) => {
    const text = lang === "ka"
      ? `გამარჯობა! მაინტერესებს სამკაული: ${product.name} (კოდი: ${product.sku}), ფასი: ${product.price}.`
      : `Hello! I am interested in: ${product.nameEn || product.name} (SKU: ${product.sku}), Price: ${product.price}.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // დესკტოპზე დინამიური სიგანე
  const modalWidthClass =
    comparedProducts.length >= 4
      ? "max-w-[98vw] 2xl:max-w-[1550px]"
      : comparedProducts.length === 3
      ? "max-w-[95vw] xl:max-w-6xl"
      : "max-w-4xl";

  const desktopGridColsClass =
    comparedProducts.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : comparedProducts.length === 3
      ? "sm:grid-cols-3"
      : "sm:grid-cols-2";

  // პროდუქტის ერთიანი ბარათის რენდერი
  const renderProductCard = (p, isCompact = false) => {
    if (!p) return null;
    const prodName = lang === "ka" ? p.name : (p.nameEn || p.name);
    const code = p.sku || p.id;
    const link = `/product/${encodeURIComponent(code)}`;
    const isFav = favorites?.includes(p.id);

    return (
      <div
        key={p.id}
        className={`rounded-2xl border flex flex-col justify-between transition-all min-w-0 ${
          isCompact ? "p-2.5 sm:p-4 space-y-3" : "p-3 sm:p-4 space-y-4"
        } ${
          darkMode ? "bg-stone-900/70 border-stone-800" : "bg-stone-50 border-stone-200"
        }`}
      >
        {/* სურათი & სათაური */}
        <div className="space-y-2">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-950/40">
            <img
              src={p.images?.[0] || "/brand-logo.jpg"}
              alt={prodName}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            {/* მოქმედებები: რჩეულები & შედარებიდან წაშლა */}
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(p.id);
                }}
                title={isFav ? (lang === "ka" ? "რჩეულებიდან ამოშლა" : "Remove") : (lang === "ka" ? "რჩეულებში დამატება" : "Favorite")}
                aria-label="რჩეულებში დამატება"
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow ${
                  isFav ? "bg-rose-500 text-white" : "bg-black/75 text-white hover:text-rose-400"
                }`}
              >
                <Heart className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${isFav ? "fill-white" : ""}`} />
              </button>

              <button
                type="button"
                onClick={() => toggleCompare(p.id)}
                title={lang === "ka" ? "შედარებიდან ამოშლა" : "Remove"}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/75 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow"
              >
                <X className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </button>
            </div>

            {p.exclusive && (
              <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold bg-amber-500 text-black shadow z-10">
                {lang === "ka" ? "ექსკლუზივი" : "Exclusive"}
              </span>
            )}
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-amber-500 font-semibold block font-mono">
              #{p.sku}
            </span>
            <a
              href={link}
              className="font-serif text-xs sm:text-base font-semibold hover:text-amber-500 transition-colors block line-clamp-1"
              title={prodName}
            >
              {prodName}
            </a>
            <div className="flex items-center gap-1.5 pt-0.5">
              {p.oldPrice && (
                <span className="text-[10px] sm:text-xs line-through opacity-40">
                  {formatPrice(p.oldPrice)}
                </span>
              )}
              <span className="text-xs sm:text-base font-bold text-amber-500 font-serif">
                {formatPrice(p.price)}
              </span>
            </div>
          </div>
        </div>

        {/* მახასიათებლების ცხრილი */}
        <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs divide-y divide-stone-500/10 pt-1.5 border-t border-stone-500/15">
          <div className="pt-1.5 flex justify-between items-center gap-1.5">
            <span className="opacity-60 shrink-0 text-[10px] sm:text-xs">{lang === "ka" ? "კატეგორია" : "Category"}</span>
            <span className="font-semibold truncate text-[11px] sm:text-xs">{p.category || "სამკაული"}</span>
          </div>

          <div className="pt-1.5 flex justify-between items-center gap-1.5">
            <span className="opacity-60 shrink-0 text-[10px] sm:text-xs">{lang === "ka" ? "სინჯი" : "Karat"}</span>
            <span className="font-semibold text-amber-500 truncate text-[11px] sm:text-xs">{p.karat || "750° (18K)"}</span>
          </div>

          <div className="pt-1.5 flex justify-between items-center gap-1.5">
            <span className="opacity-60 shrink-0 text-[10px] sm:text-xs">{lang === "ka" ? "მეტალი" : "Metal"}</span>
            <span className="font-semibold truncate text-[11px] sm:text-xs">{p.metal || "ყვითელი ოქრო"}</span>
          </div>

          <div className="pt-1.5 flex justify-between items-center gap-1.5">
            <span className="opacity-60 shrink-0 text-[10px] sm:text-xs">{lang === "ka" ? "წონა" : "Weight"}</span>
            <span className="font-semibold text-[11px] sm:text-xs">{p.weight ? `${p.weight} გრ` : "—"}</span>
          </div>

          <div className="pt-1.5 flex justify-between items-center gap-1.5">
            <span className="opacity-60 shrink-0 text-[10px] sm:text-xs">{lang === "ka" ? "ქვები" : "Stones"}</span>
            <span className="font-semibold text-right truncate max-w-[100px] sm:max-w-[130px] text-[11px] sm:text-xs" title={p.stones}>
              {p.stones || "—"}
            </span>
          </div>

          <div className="pt-1.5 flex justify-between items-center gap-1.5">
            <span className="opacity-60 shrink-0 text-[10px] sm:text-xs">{lang === "ka" ? "ზომები" : "Sizes"}</span>
            <span className="font-semibold text-right truncate max-w-[100px] sm:max-w-[130px] text-[11px] sm:text-xs">
              {p.sizes && p.sizes.length > 0 ? p.sizes.join(", ") : "სტანდარტული"}
            </span>
          </div>

          <div className="pt-1.5 flex justify-between items-center gap-1.5">
            <span className="opacity-60 shrink-0 text-[10px] sm:text-xs">{lang === "ka" ? "360° ხედი" : "360° View"}</span>
            <span className="font-semibold text-[11px] sm:text-xs">
              {p.video360 || p.sku === "AUR-101" || p.sku === "AUR-198" ? (
                <span className="text-emerald-500 flex items-center gap-0.5">
                  <Check className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> {lang === "ka" ? "კი" : "Yes"}
                </span>
              ) : (
                <span className="opacity-40">—</span>
              )}
            </span>
          </div>
        </div>

        {/* მოქმედების ღილაკები */}
        <div className="space-y-1.5 pt-1">
          <a
            href={link}
            className="w-full py-1.5 sm:py-2 px-2 rounded-xl border border-stone-500/25 hover:border-amber-500/50 hover:bg-stone-500/10 text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
          >
            <ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>{lang === "ka" ? "დეტალურად" : "Details"}</span>
          </a>

          <a
            href={getWaLink(p)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1.5 sm:py-2 px-2 rounded-xl bg-amber-500 text-black font-semibold text-[10px] sm:text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1 shadow"
          >
            <MessageCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-black" />
            <span>{lang === "ka" ? "შეკვეთა" : "Order"}</span>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${modalWidthClass} max-h-[94vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all ${
          darkMode ? "bg-[#121110] border-amber-500/20 text-[#f5f0e6]" : "bg-white border-stone-200 text-stone-900"
        }`}
      >
        {/* Header - ჩამაგრებული ზედა ზოლი */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-7 py-3 sm:py-4 border-b border-stone-500/15">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-2xl font-medium tracking-wide leading-tight">
                {lang === "ka" ? "სამკაულების შედარება" : "Compare Jewelry"}
              </h3>
              <p className="text-[10px] sm:text-xs opacity-60">
                {lang === "ka"
                  ? `შედარებულია ${comparedProducts.length} მოდელი`
                  : `Comparing ${comparedProducts.length} pieces`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs opacity-60 hover:opacity-100 hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1.5 rounded-lg hover:bg-stone-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "ka" ? "გასუფთავება" : "Clear all"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCompareModal(false)}
              aria-label={lang === "ka" ? "დახურვა" : "Close"}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-stone-500/10 transition-colors opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* შედარების შიგთავსი */}
        {comparedProducts.length === 0 ? (
          <div className="py-20 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
              <ArrowLeftRight className="w-7 h-7" />
            </div>
            <h4 className="font-serif text-xl font-medium">
              {lang === "ka" ? "შედარების სია ცარიელია" : "No items to compare"}
            </h4>
            <p className="text-xs opacity-60 max-w-sm mx-auto">
              {lang === "ka"
                ? "დააჭირეთ სამკაულის ბარათებზე შედარების ღილაკს (⇄), რათა შეადაროთ მოდელები გვერდიგვერდ."
                : "Click the compare icon on any jewelry piece to compare models side-by-side."}
            </p>
            <button
              type="button"
              onClick={() => setShowCompareModal(false)}
              className="px-6 py-2.5 rounded-full bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all"
            >
              {lang === "ka" ? "კოლექციის დათვალიერება" : "Browse Collection"}
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 p-3 sm:p-5 lg:p-6">
            {/* მობილურის ნავიგაცია და წყვილის ამრჩევი (როცა 3 ან მეტი ნივთია) */}
            {comparedProducts.length >= 3 && (
              <div className="sm:hidden mb-3.5 p-2.5 rounded-2xl bg-stone-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-amber-500 font-semibold uppercase tracking-wider text-[10px]">
                    {lang === "ka" ? "მობილური ხედი:" : "Mobile View:"}
                  </span>
                  <div className="flex items-center gap-1 bg-stone-500/20 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setMobileMode("duo")}
                      className={`px-2 py-0.5 rounded-md transition-all font-medium ${
                        mobileMode === "duo"
                          ? "bg-amber-500 text-black font-semibold shadow-xs"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {lang === "ka" ? "გვერდიგვერდ (2)" : "Duo (2)"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileMode("all")}
                      className={`px-2 py-0.5 rounded-md transition-all font-medium ${
                        mobileMode === "all"
                          ? "bg-amber-500 text-black font-semibold shadow-xs"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {lang === "ka" ? `ყველა (${comparedProducts.length})` : `All (${comparedProducts.length})`}
                    </button>
                  </div>
                </div>

                {mobileMode === "duo" && (
                  <div className="pt-1">
                    <p className="text-[10px] opacity-70 mb-1.5">
                      {lang === "ka"
                        ? "შეარჩიეთ ნებისმიერი 2 მოდელი გვერდიგვერდ სანახავად:"
                        : "Tap any item to swap into side-by-side comparison:"}
                    </p>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {comparedProducts.map((p, idx) => {
                        const isA = idx === idxA;
                        const isB = idx === idxB;
                        const isSelected = isA || isB;

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              if (isA) return;
                              if (isB) {
                                // თუ B-ს დააწკაპა, არაფერი
                                return;
                              }
                              // სვოპი: Slot B-ში ჩაჯდეს ახალი
                              setMobilePair([idxA, idx]);
                            }}
                            className={`px-2.5 py-1 rounded-lg shrink-0 text-[11px] flex items-center gap-1 transition-all border ${
                              isA
                                ? "bg-amber-500 text-black border-amber-500 font-bold shadow-xs"
                                : isB
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold"
                                : "bg-stone-500/10 border-stone-500/20 text-stone-300 hover:border-amber-500/40"
                            }`}
                          >
                            <span className="font-mono text-[9px]">{idx + 1}.</span>
                            <span className="truncate max-w-[80px]">
                              {lang === "ka" ? p.name : (p.nameEn || p.name)}
                            </span>
                            {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* მობილური ეკრანზე (< sm): როცა 2 ნივთია ან duo რეჟიმია -> 2 სვეტი ერთდროულად ეტევა ეკრანზე სქროლვის გარეშე! */}
            <div className="sm:hidden">
              {mobileMode === "all" && comparedProducts.length >= 3 ? (
                /* ჰორიზონტალური სვაიპი ყველა ნივთისთვის */
                <div className="flex gap-2.5 overflow-x-auto pb-3 snap-x snap-mandatory">
                  {comparedProducts.map((p) => (
                    <div key={p.id} className="w-[165px] shrink-0 snap-start">
                      {renderProductCard(p, true)}
                    </div>
                  ))}
                </div>
              ) : (
                /* 2 ნივთი გვერდიგვერდ - სრულად ეტევა ტელეფონზე! */
                <div className="grid grid-cols-2 gap-2 w-full">
                  {activeMobileProducts.map((p) => renderProductCard(p, true))}
                </div>
              )}
            </div>

            {/* დესკტოპის ეკრანზე (>= sm): ყველა ნივთი ჩანს გვერდიგვერდ სრულფასოვან ბადეში */}
            <div className={`hidden sm:grid gap-4 lg:gap-5 w-full ${desktopGridColsClass}`}>
              {comparedProducts.map((p) => renderProductCard(p, false))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

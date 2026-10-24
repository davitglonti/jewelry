import React from 'react';
import {
  X, ArrowLeftRight, Trash2, ExternalLink, MessageCircle,
  Sparkles, Check, Plus, Heart
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

  if (!showCompareModal) return null;

  const comparedProducts = products.filter((p) => compareList.includes(p.id));

  const cleanPhone = (siteSettings?.whatsapp || "995555000000").replace(/[^0-9]/g, "");

  const getWaLink = (product) => {
    const text = lang === "ka"
      ? `გამარჯობა! მაინტერესებს სამკაული: ${product.name} (კოდი: ${product.sku}), ფასი: ${product.price}.`
      : `Hello! I am interested in: ${product.nameEn || product.name} (SKU: ${product.sku}), Price: ${product.price}.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  // დინამიური სიგანე ნივთების რაოდენობის მიხედვით, რათა 4-ვე მოდელი სრულად ჩანდეს
  const modalWidthClass =
    comparedProducts.length >= 4
      ? "max-w-[98vw] 2xl:max-w-[1550px]"
      : comparedProducts.length === 3
      ? "max-w-[94vw] xl:max-w-6xl"
      : "max-w-4xl";

  const gridColsClass =
    comparedProducts.length >= 4
      ? "grid-cols-2 lg:grid-cols-4"
      : comparedProducts.length === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${modalWidthClass} rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all ${
          darkMode ? "bg-[#121110] border-amber-500/20 text-[#f5f0e6]" : "bg-white border-stone-200 text-stone-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-stone-500/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-2xl font-medium tracking-wide">
                {lang === "ka" ? "სამკაულების შედარება" : "Compare Jewelry"}
              </h3>
              <p className="text-xs opacity-60">
                {lang === "ka"
                  ? `შედარებულია ${comparedProducts.length} მოდელი (ყველა ჩანს გვერდიგვერდ)`
                  : `Comparing ${comparedProducts.length} pieces side-by-side`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {comparedProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs opacity-60 hover:opacity-100 hover:text-red-400 flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-stone-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "ka" ? "გასუფთავება" : "Clear all"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCompareModal(false)}
              aria-label={lang === "ka" ? "დახურვა" : "Close"}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-stone-500/10 transition-colors opacity-70 hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
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
          <div className="p-3 sm:p-5 lg:p-6">
            {/* Grid Columns: 4 columns fit side-by-side with zero cut-off */}
            <div className={`grid gap-3 sm:gap-4 lg:gap-5 w-full ${gridColsClass}`}>
              {comparedProducts.map((p) => {
                const prodName = lang === "ka" ? p.name : (p.nameEn || p.name);
                const code = p.sku || p.id;
                const link = `/product/${encodeURIComponent(code)}`;

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border p-3 sm:p-4 flex flex-col justify-between space-y-4 transition-all min-w-0 ${
                      darkMode ? "bg-stone-900/60 border-stone-800" : "bg-stone-50 border-stone-200"
                    }`}
                  >
                    {/* Image & Header */}
                    <div className="space-y-2.5">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-950/40">
                        <img
                          src={p.images?.[0] || "/brand-logo.jpg"}
                          alt={prodName}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        {/* Action buttons: Favorite & Remove */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(p.id);
                            }}
                            title={
                              favorites?.includes(p.id)
                                ? (lang === "ka" ? "რჩეულებიდან ამოშლა" : "Remove from favorites")
                                : (lang === "ka" ? "რჩეულებში დამატება" : "Add to favorites")
                            }
                            aria-label="რჩეულებში დამატება"
                            className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow ${
                              favorites?.includes(p.id)
                                ? "bg-rose-500 text-white"
                                : "bg-black/75 text-white hover:text-rose-400 hover:bg-black"
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${favorites?.includes(p.id) ? "fill-white" : ""}`} />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleCompare(p.id)}
                            title={lang === "ka" ? "შედარებიდან ამოშლა" : "Remove"}
                            className="w-7 h-7 rounded-full bg-black/75 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {p.exclusive && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold bg-amber-500 text-black shadow z-10">
                            {lang === "ka" ? "ექსკლუზივი" : "Exclusive"}
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold block">
                          {p.sku}
                        </span>
                        <a
                          href={link}
                          className="font-serif text-base sm:text-lg font-semibold hover:text-amber-500 transition-colors block line-clamp-1"
                          title={prodName}
                        >
                          {prodName}
                        </a>
                        <div className="flex items-center gap-2 pt-0.5">
                          {p.oldPrice && (
                            <span className="text-xs line-through opacity-40">
                              {formatPrice(p.oldPrice)}
                            </span>
                          )}
                          <span className="text-base sm:text-lg font-bold text-amber-500 font-serif">
                            {formatPrice(p.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Specification Table */}
                    <div className="space-y-2 text-xs divide-y divide-stone-500/10 pt-2 border-t border-stone-500/15">
                      <div className="pt-2 flex justify-between items-center gap-2">
                        <span className="opacity-60 shrink-0">{lang === "ka" ? "კატეგორია" : "Category"}</span>
                        <span className="font-semibold truncate">{p.category || "სამკაული"}</span>
                      </div>

                      <div className="pt-2 flex justify-between items-center gap-2">
                        <span className="opacity-60 shrink-0">{lang === "ka" ? "ოქროს სინჯი" : "Karat"}</span>
                        <span className="font-semibold text-amber-500 truncate">{p.karat || "750° (18K)"}</span>
                      </div>

                      <div className="pt-2 flex justify-between items-center gap-2">
                        <span className="opacity-60 shrink-0">{lang === "ka" ? "მეტალი" : "Metal"}</span>
                        <span className="font-semibold truncate">{p.metal || "ყვითელი ოქრო"}</span>
                      </div>

                      <div className="pt-2 flex justify-between items-center gap-2">
                        <span className="opacity-60 shrink-0">{lang === "ka" ? "წონა" : "Weight"}</span>
                        <span className="font-semibold">{p.weight ? `${p.weight} გრ` : "—"}</span>
                      </div>

                      <div className="pt-2 flex justify-between items-center gap-2">
                        <span className="opacity-60 shrink-0">{lang === "ka" ? "ქვები" : "Stones"}</span>
                        <span className="font-semibold text-right truncate max-w-[130px]" title={p.stones}>
                          {p.stones || "—"}
                        </span>
                      </div>

                      <div className="pt-2 flex justify-between items-center gap-2">
                        <span className="opacity-60 shrink-0">{lang === "ka" ? "ზომები" : "Sizes"}</span>
                        <span className="font-semibold text-right truncate max-w-[130px]">
                          {p.sizes && p.sizes.length > 0 ? p.sizes.join(", ") : "სტანდარტული"}
                        </span>
                      </div>

                      <div className="pt-2 flex justify-between items-center gap-2">
                        <span className="opacity-60 shrink-0">{lang === "ka" ? "360° ხედი" : "360° View"}</span>
                        <span className="font-semibold">
                          {p.video360 || p.sku === "AUR-101" || p.sku === "AUR-198" ? (
                            <span className="text-emerald-500 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> {lang === "ka" ? "კი" : "Yes"}
                            </span>
                          ) : (
                            <span className="opacity-40">—</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-1">
                      <a
                        href={link}
                        className="w-full py-2 px-2.5 rounded-xl border border-stone-500/25 hover:border-amber-500/50 hover:bg-stone-500/10 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{lang === "ka" ? "დეტალურად" : "Details"}</span>
                      </a>

                      <a
                        href={getWaLink(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-2.5 rounded-xl bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-black" />
                        <span>{lang === "ka" ? "შეკვეთა" : "Order"}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

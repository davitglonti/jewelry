import React, { useState } from 'react';
import {
  X, ArrowLeftRight, Trash2, ExternalLink, MessageCircle, Check, Heart
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
    lang,
    siteSettings
  } = useStore();

  const [mobilePair, setMobilePair] = useState([0, 1]);
  const [mobileMode, setMobileMode] = useState("duo");

  if (!showCompareModal) return null;

  const comparedProducts = products.filter((p) => compareList.includes(p.id));

  const idxA = Math.min(mobilePair[0], Math.max(0, comparedProducts.length - 1));
  let idxB = Math.min(mobilePair[1], Math.max(0, comparedProducts.length - 1));
  if (idxB === idxA && comparedProducts.length >= 2) {
    idxB = idxA === 0 ? 1 : 0;
  }

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

  const modalWidthClass =
    comparedProducts.length >= 4
      ? "max-w-[96vw] 2xl:max-w-[1480px]"
      : comparedProducts.length === 3
      ? "max-w-[95vw] xl:max-w-6xl"
      : "max-w-4xl";

  const desktopGridColsClass =
    comparedProducts.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : comparedProducts.length === 3
      ? "sm:grid-cols-3"
      : "sm:grid-cols-2";

  const renderProductCard = (p, isCompact = false) => {
    if (!p) return null;
    const prodName = lang === "ka" ? p.name : (p.nameEn || p.name);
    const code = p.sku || p.id;
    const prefix = lang === "en" ? "/en" : "";
    const link = `${prefix}/product/${encodeURIComponent(code)}`;
    const isFav = favorites?.includes(p.id);

    return (
      <div
        key={p.id}
        className={`bg-[#FAF9F6] border border-[#E8E3DB] flex flex-col justify-between min-w-0 ${
          isCompact ? "p-3 space-y-3" : "p-4 space-y-4"
        }`}
      >
        <div className="space-y-3">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#F2EFE9]">
            <img
              src={p.images?.[0] || "/brand-logo.jpg"}
              alt={prodName}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(p.id);
                }}
                aria-label="რჩეულებში დამატება"
                className={`w-7 h-7 border flex items-center justify-center transition-colors cursor-pointer ${
                  isFav ? "bg-[#E25567] text-white border-[#E25567]" : "bg-white/90 text-[#141311] border-[#E8E3DB] hover:bg-[#E25567] hover:text-white hover:border-[#E25567]"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 stroke-[1.5] ${isFav ? "fill-white" : ""}`} />
              </button>

              <button
                type="button"
                onClick={() => toggleCompare(p.id)}
                title={lang === "ka" ? "შედარებიდან ამოშლა" : "Remove"}
                className="w-7 h-7 bg-white/90 text-[#141311] border border-[#E8E3DB] hover:bg-[#8E2424] hover:text-white hover:border-[#8E2424] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>

            {p.exclusive && (
              <span className="absolute top-2 left-2 px-2 py-0.5 text-[8px] uppercase tracking-[0.16em] bg-[#141311] text-white z-10">
                {lang === "ka" ? "ექსკლუზივი" : "Exclusive"}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#9D7B48] font-mono block">
              #{p.sku}
            </span>
            <a href={link} className="font-serif text-base text-[#141311] hover:text-[#9D7B48] transition-colors block line-clamp-1" title={prodName}>
              {prodName}
            </a>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-sm font-medium text-[#141311]">{formatPrice(p.price)}</span>
              {p.oldPrice && (
                <span className="text-xs line-through text-[#9C958B]">{formatPrice(p.oldPrice)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs divide-y divide-[#E8E3DB] pt-2 border-t border-[#E8E3DB]">
          {[
            [lang === "ka" ? "კატეგორია" : "Category", p.category || "სამკაული"],
            [lang === "ka" ? "სინჯი" : "Karat", p.karat || "750° (18K)"],
            [lang === "ka" ? "მეტალი" : "Metal", p.metal || "ყვითელი ოქრო"],
            [lang === "ka" ? "წონა" : "Weight", p.weight ? `${p.weight} გრ` : "—"],
            [lang === "ka" ? "ქვები" : "Stones", p.stones || "—"],
            [lang === "ka" ? "ზომები" : "Sizes", p.sizes && p.sizes.length > 0 ? p.sizes.join(", ") : "სტანდარტული"]
          ].map(([label, val], idx) => (
            <div key={idx} className="pt-2 flex justify-between items-center gap-2">
              <span className="text-[#847E75] shrink-0 text-[11px]">{label}</span>
              <span className="text-[#141311] font-medium truncate text-right">{val}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          <a
            href={link}
            className="w-full py-2.5 px-3 border border-[#141311] text-[#141311] hover:bg-white text-[10px] uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{lang === "ka" ? "დეტალურად" : "Details"}</span>
          </a>
          <a
            href={getWaLink(p)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 bg-[#141311] text-white hover:bg-[#2C2A26] text-[10px] uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{lang === "ka" ? "შეკვეთა" : "Order"}</span>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className={`w-full ${modalWidthClass} max-h-[92vh] flex flex-col bg-white border border-[#E8E3DB] text-[#141311] shadow-2xl overflow-hidden my-auto`}>
        <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-[#E8E3DB]">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-4 h-4 text-[#9D7B48] stroke-[1.5]" />
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-light text-[#141311]">
                {lang === "ka" ? "სამკაულების შედარება" : "Compare Jewelry"}
              </h3>
              <p className="text-[11px] text-[#847E75]">
                {lang === "ka" ? `შედარებულია ${comparedProducts.length} მოდელი` : `Comparing ${comparedProducts.length} pieces`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="text-xs text-[#847E75] hover:text-[#8E2424] flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                <span className="hidden sm:inline">{lang === "ka" ? "გასუფთავება" : "Clear all"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowCompareModal(false)}
              aria-label={lang === "ka" ? "დახურვა" : "Close"}
              className="w-8 h-8 flex items-center justify-center text-[#847E75] hover:text-[#141311] cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {comparedProducts.length === 0 ? (
          <div className="py-20 px-6 text-center space-y-4">
            <ArrowLeftRight className="w-8 h-8 text-[#9D7B48] mx-auto stroke-[1.25]" />
            <h4 className="font-serif text-2xl font-light">{lang === "ka" ? "შედარების სია ცარიელია" : "No items to compare"}</h4>
            <button
              type="button"
              onClick={() => setShowCompareModal(false)}
              className="px-7 py-3 bg-[#141311] text-white text-[11px] uppercase tracking-[0.18em] cursor-pointer"
            >
              {lang === "ka" ? "კოლექციის დათვალიერება" : "Browse Collection"}
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 p-4 sm:p-6">
            {comparedProducts.length >= 3 && (
              <div className="sm:hidden mb-4 p-3 bg-[#FAF9F6] border border-[#E8E3DB] space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em]">
                  <span className="text-[#9D7B48]">{lang === "ka" ? "მობილური ხედი:" : "Mobile View:"}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setMobileMode("duo")} className={`px-2 py-1 ${mobileMode === "duo" ? "bg-[#141311] text-white" : "text-[#847E75]"}`}>
                      {lang === "ka" ? "2" : "Duo"}
                    </button>
                    <button type="button" onClick={() => setMobileMode("all")} className={`px-2 py-1 ${mobileMode === "all" ? "bg-[#141311] text-white" : "text-[#847E75]"}`}>
                      {lang === "ka" ? `ყველა (${comparedProducts.length})` : `All (${comparedProducts.length})`}
                    </button>
                  </div>
                </div>
                {mobileMode === "duo" && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {comparedProducts.map((p, idx) => {
                      const isA = idx === idxA;
                      const isB = idx === idxB;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { if (!isA && !isB) setMobilePair([idxA, idx]); }}
                          className={`px-2.5 py-1 shrink-0 text-[11px] flex items-center gap-1 border ${
                            isA || isB ? "bg-[#141311] text-white border-[#141311]" : "bg-white border-[#E8E3DB] text-[#4A4640]"
                          }`}
                        >
                          <span className="truncate max-w-[80px]">{lang === "ka" ? p.name : (p.nameEn || p.name)}</span>
                          {(isA || isB) && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="sm:hidden">
              {mobileMode === "all" && comparedProducts.length >= 3 ? (
                <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory">
                  {comparedProducts.map((p) => (
                    <div key={p.id} className="w-[175px] shrink-0 snap-start">{renderProductCard(p, true)}</div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 w-full">
                  {activeMobileProducts.map((p) => renderProductCard(p, true))}
                </div>
              )}
            </div>

            <div className={`hidden sm:grid gap-5 w-full ${desktopGridColsClass}`}>
              {comparedProducts.map((p) => renderProductCard(p, false))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

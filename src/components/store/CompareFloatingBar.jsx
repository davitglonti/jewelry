import React from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function CompareFloatingBar() {
  const { products, compareList, clearCompare, setShowCompareModal, lang } = useStore();

  if (!compareList || compareList.length === 0) return null;

  const comparedProducts = products.filter((p) => compareList.includes(p.id));

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-2rem)] pointer-events-auto">
      <div className="rounded-full bg-white/95 backdrop-blur-md border border-[#DFD5C5] text-[#1F1C18] px-4 py-2.5 shadow-[0_12px_36px_rgba(31,28,24,0.14)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex -space-x-2 shrink-0">
            {comparedProducts.slice(0, 4).map((p) => (
              <img
                key={p.id}
                src={p.images?.[0] || "/brand-logo.jpg"}
                alt={p.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-xs"
              />
            ))}
          </div>

          <div className="min-w-0">
            <span className="text-xs font-semibold block leading-tight truncate text-[#1F1C18]">
              {lang === "ka" ? "შედარება" : "Compare"} ({compareList.length}/4)
            </span>
            <span className="text-[11px] text-[#9A7742] font-medium block leading-none mt-0.5 truncate">
              {compareList.length < 2
                ? (lang === "ka" ? "დაამატეთ მეორე ნივთი" : "Add another piece")
                : (lang === "ka" ? "მზადაა შესადარებლად" : "Ready to compare")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowCompareModal(true)}
            disabled={compareList.length < 2}
            className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
              compareList.length >= 2
                ? "bg-[#9E2A2B] text-white hover:bg-[#822021] cursor-pointer"
                : "bg-[#F4EFE6] text-[#9C958B] cursor-not-allowed"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>{lang === "ka" ? "შედარება" : "Compare"}</span>
          </button>

          <button
            type="button"
            onClick={clearCompare}
            title={lang === "ka" ? "სიის გასუფთავება" : "Clear all"}
            aria-label={lang === "ka" ? "სიის გასუფთავება" : "Clear all"}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#787168] hover:text-[#9E2A2B] hover:bg-[#FDF6F6] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>
      </div>
    </div>
  );
}

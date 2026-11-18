import React from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

export default function CompareFloatingBar() {
  const { products, compareList, clearCompare, setShowCompareModal, lang } = useStore();
  const { user } = useAuth();

  if (!user || !compareList || compareList.length === 0) return null;

  const comparedProducts = products.filter((p) => compareList.includes(p.id));

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-2rem)] pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-md border border-[#141311] text-[#141311] px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex -space-x-2 shrink-0">
            {comparedProducts.slice(0, 4).map((p) => (
              <img
                key={p.id}
                src={p.images?.[0] || "/brand-logo.jpg"}
                alt={p.name}
                className="w-8 h-8 rounded-full object-cover border border-[#141311]"
              />
            ))}
          </div>

          <div className="min-w-0">
            <span className="text-xs font-medium block leading-tight truncate">
              {lang === "ka" ? "შედარება" : "Compare"} ({compareList.length}/4)
            </span>
            <span className="text-[10px] text-[#9D7B48] uppercase tracking-[0.12em] block leading-none mt-0.5">
              {compareList.length < 2
                ? (lang === "ka" ? "დაამატეთ მეორე ნივთი" : "Add another piece")
                : (lang === "ka" ? "მზადაა შესადარებლად" : "Ready to compare")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCompareModal(true)}
            disabled={compareList.length < 2}
            className={`px-4 py-2 text-[10px] uppercase tracking-[0.16em] flex items-center gap-1.5 transition-colors ${
              compareList.length >= 2
                ? "bg-[#141311] text-white hover:bg-[#2C2A26] cursor-pointer"
                : "bg-[#EFECE6] text-[#9C958B] cursor-not-allowed"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{lang === "ka" ? "შედარება" : "Compare"}</span>
          </button>

          <button
            type="button"
            onClick={clearCompare}
            title={lang === "ka" ? "სიის გასუფთავება" : "Clear all"}
            className="w-7 h-7 flex items-center justify-center text-[#847E75] hover:text-[#141311] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}

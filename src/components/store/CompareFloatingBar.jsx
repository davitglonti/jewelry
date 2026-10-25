import React from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function CompareFloatingBar() {
  const { products, compareList, clearCompare, setShowCompareModal, lang } = useStore();

  if (!compareList || compareList.length === 0) return null;

  const comparedProducts = products.filter((p) => compareList.includes(p.id));

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-2rem)] animate-slideUp pointer-events-auto">
      <div className="bg-[#141210]/95 backdrop-blur-md border border-amber-500/40 text-[#f5f0e6] rounded-full px-4 py-2.5 shadow-2xl shadow-black/80 flex items-center justify-between gap-3">
        {/* მარცხენა მხარე: თამბნეილები და რაოდენობა */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex -space-x-2 shrink-0">
            {comparedProducts.slice(0, 4).map((p) => (
              <img
                key={p.id}
                src={p.images?.[0] || "/brand-logo.jpg"}
                alt={p.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-amber-500/60 shadow"
              />
            ))}
          </div>

          <div className="min-w-0">
            <span className="text-xs font-semibold block leading-tight truncate">
              {lang === "ka" ? "შედარება" : "Compare"} ({compareList.length}/4)
            </span>
            <span className="text-[10px] text-amber-400 font-medium block leading-none">
              {compareList.length < 2
                ? (lang === "ka" ? "დაამატეთ მეორე ნივთი" : "Add another piece")
                : (lang === "ka" ? "მზადაა შესადარებლად" : "Ready to compare")}
            </span>
          </div>
        </div>

        {/* მარჯვენა მხარე: ღილაკები */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCompareModal(true)}
            disabled={compareList.length < 2}
            className={`px-4 py-2 rounded-full font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
              compareList.length >= 2
                ? "bg-amber-500 text-black hover:brightness-110 active:scale-95 shadow-amber-500/20"
                : "bg-stone-800 text-stone-500 cursor-not-allowed"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{lang === "ka" ? "შედარება" : "Compare"}</span>
          </button>

          <button
            type="button"
            onClick={clearCompare}
            title={lang === "ka" ? "სიის გასუფთავება" : "Clear all"}
            className="w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

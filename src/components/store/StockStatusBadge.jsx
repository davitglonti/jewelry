import React from 'react';

export default function StockStatusBadge({
  status = 'in_stock',
  lang = 'ka',
  size = 'md',
  showSubtext = true
}) {
  const normalizedStatus = status || 'in_stock';

  if (normalizedStatus === 'sold_out') {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-stone-500/30 bg-stone-500/10 text-stone-400 select-none ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3.5 py-1.5 text-xs'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0"></span>
        <span className="font-semibold tracking-wide">
          {lang === 'ka' ? 'გაყიდულია / ამოიწურა' : 'Sold Out'}
        </span>
        {showSubtext && (
          <span className="text-[11px] opacity-75 hidden sm:inline">
            • {lang === 'ka' ? 'ამჟამად მიუწვდომელია' : 'Currently unavailable'}
          </span>
        )}
      </div>
    );
  }

  if (normalizedStatus === 'preorder') {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-amber-500/10 text-amber-500 dark:text-amber-400 select-none ${
          size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3.5 py-1.5 text-xs'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
        <span className="font-semibold tracking-wide">
          {lang === 'ka' ? 'შეკვეთით' : 'Made to Order'}
        </span>
        {showSubtext && (
          <span className="text-[11px] opacity-85 hidden sm:inline">
            • {lang === 'ka' ? '3-5 სამუშაო დღე (დამზადება / ჩამოტანა)' : 'Ships in 3-5 business days'}
          </span>
        )}
      </div>
    );
  }

  // Default: in_stock
  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 select-none ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3.5 py-1.5 text-xs'
      }`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="font-semibold tracking-wide">
        {lang === 'ka' ? 'მარაგშია' : 'In Stock'}
      </span>
      {showSubtext && (
        <span className="text-[11px] opacity-85 hidden sm:inline">
          • {lang === 'ka' ? 'ადგილზეა, მიწოდება 24-48 საათში' : 'On hand, delivery in 24-48h'}
        </span>
      )}
    </div>
  );
}

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
        className={`inline-flex items-center gap-2 rounded-full border border-[#E6DFD3] bg-[#F4EFE6] text-[#787168] select-none ${
          size === 'sm' ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-xs'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#787168] shrink-0"></span>
        <span className="font-medium">
          {lang === 'ka' ? 'გაყიდულია / ამოიწურა' : 'Sold Out'}
        </span>
        {showSubtext && (
          <span className="opacity-80 hidden sm:inline">
            • {lang === 'ka' ? 'ამჟამად მიუწვდომელია' : 'Currently unavailable'}
          </span>
        )}
      </div>
    );
  }

  if (normalizedStatus === 'preorder') {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-[#E2D4BC] bg-[#FAF6ED] text-[#8A6836] select-none ${
          size === 'sm' ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-xs'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#9A7742] shrink-0"></span>
        <span className="font-medium">
          {lang === 'ka' ? 'შეკვეთით' : 'Made to Order'}
        </span>
        {showSubtext && (
          <span className="opacity-85 hidden sm:inline">
            • {lang === 'ka' ? '3-5 სამუშაო დღე' : 'Ships in 3-5 business days'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-[#D4E6DB] bg-[#F2F9F5] text-[#24603E] select-none ${
        size === 'sm' ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-xs'
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-[#2E7D52] shrink-0"></span>
      <span className="font-medium">
        {lang === 'ka' ? 'მარაგშია' : 'In Stock'}
      </span>
      {showSubtext && (
        <span className="opacity-85 hidden sm:inline">
          • {lang === 'ka' ? 'ადგილზეა, მიწოდება 24-48 საათში' : 'Ready to ship in 24-48h'}
        </span>
      )}
    </div>
  );
}

import React, { useMemo, useEffect } from 'react';
import { X, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../utils/i18n';
import { navigateTo } from '../../utils/navigation';

export default function FavoritesModal({ isOpen, onClose, onSelectProduct }) {
  const { lang, products, favorites, toggleFavorite } = useStore();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const favoriteProducts = useMemo(() => {
    return (products || []).filter((p) => favorites?.includes(p.id));
  }, [products, favorites]);

  const totalValue = useMemo(() => {
    return favoriteProducts.reduce((sum, item) => {
      const p = typeof item.price === 'number'
        ? item.price
        : parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0;
      return sum + p;
    }, 0);
  }, [favoriteProducts]);

  const freeShippingThreshold = 500;
  const progressPercent = Math.min(100, Math.round((totalValue / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - totalValue);

  const prefix = lang === 'en' ? '/en' : '';
  const isEn = lang === 'en';

  const handleCheckout = () => {
    if (!favoriteProducts || favoriteProducts.length === 0) return;
    onClose?.();
    navigateTo(`${prefix}/checkout?from=favorites`);
  };

  const handleItemClick = (item) => {
    onClose?.();
    if (onSelectProduct) {
      onSelectProduct(item);
    } else {
      navigateTo(`${prefix}/product/${encodeURIComponent(item.sku || item.id)}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Right Drawer */}
      <aside
        className="relative z-10 w-full max-w-[440px] sm:max-w-[460px] h-full bg-white shadow-2xl flex flex-col justify-between animate-slide-left overflow-hidden border-l border-[#EAE4DB]"
        aria-label={isEn ? "Wishlist Drawer" : "რჩეულების პანელი"}
      >
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-[#EAE4DB]">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-[26px] font-normal text-[#1F1C18] tracking-tight">
              {isEn ? `Wishlist (${favoriteProducts.length})` : `რჩეულები (${favoriteProducts.length})`}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={isEn ? "Close wishlist" : "დახურვა"}
              className="p-1.5 -mr-1.5 text-[#787168] hover:text-[#1F1C18] rounded-full hover:bg-[#F4EFE6] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator (mockup style) */}
          <div className="mt-4 pt-3 border-t border-[#F3EFE8] space-y-1.5">
            <p className="text-xs text-[#787168]">
              {totalValue >= freeShippingThreshold ? (
                <span className="text-[#2D6A4F] font-medium">
                  {isEn ? "✓ Your order qualifies for Free Insured Shipping" : "✓ თქვენ გაქვთ უფასო დაზღვეული მიწოდება"}
                </span>
              ) : (
                <span>
                  {isEn
                    ? `You are ${formatPrice(amountToFreeShipping)} away from free insured shipping`
                    : `დაგრჩათ ${formatPrice(amountToFreeShipping)} უფასო დაზღვეულ მიწოდებამდე`}
                </span>
              )}
            </p>
            <div className="w-full h-1.5 bg-[#EAE4DB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#9A7742] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[#9E978D]">
              {isEn
                ? "Your order qualifies for Free Insured Shipping"
                : "უფასო დაზღვეული ექსპრეს მიწოდება საქართველოს მასშტაბით"}
            </p>
          </div>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#F3EFE8] space-y-4">
          {favoriteProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF8F5] border border-[#EAE4DB] flex items-center justify-center text-[#9A7742]">
                <X className="w-7 h-7 stroke-[1.25] opacity-40" />
              </div>
              <p className="font-serif text-lg text-[#1F1C18]">
                {isEn ? "Your wishlist is empty" : "რჩეულების სია ცარიელია"}
              </p>
              <p className="text-xs text-[#787168] max-w-xs mx-auto">
                {isEn
                  ? "Browse the collection and tap the heart icon to save pieces here."
                  : "დაათვალიერეთ კოლექცია და დააჭირეთ გულის ხატულას სამკაულის შესანახად."}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  navigateTo(`${prefix}/catalog`);
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#9A7742] hover:text-[#1F1C18] transition-colors cursor-pointer"
              >
                <span>{isEn ? "Explore Collection →" : "კოლექციის ნახვა →"}</span>
              </button>
            </div>
          ) : (
            favoriteProducts.map((item) => {
              const defaultSize = item.sizes?.[0] || '17.0';
              return (
                <div key={item.id} className="pt-4 first:pt-0 flex items-center gap-4">
                  {/* Thumbnail */}
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="shrink-0 cursor-pointer group"
                    title={item.name}
                  >
                    <img
                      src={item.images?.[0] || item.image || '/brand-logo.jpg'}
                      alt={item.name || "Jewelry"}
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover bg-[#FAF8F5] border border-[#EAE4DB] group-hover:opacity-90 transition-opacity"
                    />
                  </button>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className="text-left cursor-pointer group block w-full"
                    >
                      <h3 className="font-serif text-sm sm:text-base font-normal text-[#1F1C18] truncate group-hover:text-[#9A7742] transition-colors">
                        {isEn ? (item.nameEn || item.name) : item.name}
                      </h3>
                      <p className="text-xs text-[#787168] mt-0.5">
                        {isEn ? `Size: ${defaultSize}` : `ზომა: ${defaultSize}`}
                      </p>
                    </button>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-serif text-sm sm:text-base font-normal text-[#1F1C18]">
                        {formatPrice(item.price)}
                      </span>

                      {/* Remove action matching mockup (trash + text) */}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(item.id)}
                        className="flex items-center gap-1 text-xs text-[#787168] hover:text-[#B91C1C] transition-colors cursor-pointer"
                        title={isEn ? "Remove from wishlist" : "რჩეულებიდან ამოშლა"}
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>{isEn ? "remove" : "წაშლა"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Footer */}
        {favoriteProducts.length > 0 && (
          <div className="p-6 border-t border-[#EAE4DB] bg-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#787168]">
                {isEn ? "Subtotal" : "ჯამური ღირებულება"}
              </span>
              <span className="font-serif text-xl sm:text-2xl font-normal text-[#1F1C18]">
                {formatPrice(totalValue)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-4 px-6 rounded-full bg-[#1F1C18] hover:bg-black text-white text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isEn ? "PROCEED TO CHECKOUT" : "შეკვეთის გაფორმება"}</span>
              <ArrowRight className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

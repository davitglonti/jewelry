import React from 'react';
import {
  Ruler,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { navigateTo } from '../../utils/navigation';

export default function ProductActionButtons({
  product,
  selectedSize,
  setSelectedSize,
  onOpenRingSizer,
  darkMode = true,
  lang = 'ka'
}) {
  if (!product) return null;

  const categoryStr = String(product?.category || '').toLowerCase();
  const nameStr = String(product?.name || '').toLowerCase();
  const isRing =
    categoryStr.includes('ბეჭ') ||
    categoryStr.includes('ring') ||
    nameStr.includes('ბეჭ') ||
    nameStr.includes('ring');

  const hasSizes = Array.isArray(product?.sizes) && product.sizes.length > 0;
  const isOnlyStandardSize =
    hasSizes &&
    product.sizes.length === 1 &&
    (/სტანდარტ/i.test(product.sizes[0]) ||
      /standard/i.test(product.sizes[0]) ||
      /one\s*size/i.test(product.sizes[0]));

  return (
    <div className="space-y-4 pt-1">
      {/* 1. Sizes Selector (Only when real selectable sizes exist) */}
      {hasSizes && !isOnlyStandardSize && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="uppercase tracking-wider opacity-75 font-medium flex items-center gap-1.5">
              <span>{lang === 'ka' ? 'აირჩიეთ ზომა:' : 'Select Size:'}</span>
              {selectedSize && (
                <span className="font-mono text-amber-500 font-bold text-xs">({selectedSize})</span>
              )}
            </span>
            {isRing && onOpenRingSizer && (
              <button
                type="button"
                onClick={onOpenRingSizer}
                className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors group cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5 text-amber-500/80 group-hover:rotate-12 transition-transform" />
                <span className="underline underline-offset-4 decoration-amber-500/40 hover:decoration-amber-400">
                  {lang === 'ka' ? 'ზომის ონლაინ საზომი' : 'Ring Size Guide'}
                </span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-0.5">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize?.(sz)}
                className={`min-w-[46px] h-11 px-3.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center justify-center cursor-pointer ${
                  selectedSize === sz
                    ? 'bg-amber-500 text-black border-amber-500 font-bold shadow-md shadow-amber-500/20 scale-105'
                    : darkMode
                    ? 'border-stone-800 hover:border-amber-500/50 bg-stone-900/80 text-stone-300'
                    : 'border-stone-200 hover:border-amber-500 bg-white text-stone-800 shadow-xs'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Primary Action Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => {
            const prefix = lang === 'en' ? '/en' : '';
            const query = new URLSearchParams();
            if (product.id) query.set('productId', product.id);
            else if (product.sku) query.set('sku', product.sku);
            if (selectedSize) query.set('size', selectedSize);
            navigateTo(`${prefix}/checkout?${query.toString()}`);
          }}
          className="w-full py-4.5 sm:py-5 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:via-amber-300 hover:to-amber-500 text-black font-bold text-sm sm:text-base md:text-lg tracking-wide flex items-center justify-center gap-3 shadow-xl shadow-amber-500/25 active:scale-[0.99] transition-all cursor-pointer group"
        >
          <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-black group-hover:scale-110 transition-transform" />
          <span>{lang === 'ka' ? 'ახლავე შეძენა (ონლაინ შეკვეთა)' : 'Buy Now (Instant Checkout)'}</span>
          {selectedSize && !isOnlyStandardSize && (
            <span className="text-xs sm:text-sm px-3 py-0.5 rounded-full bg-black/15 font-mono font-bold">
              {lang === 'ka' ? `ზომა: ${selectedSize}` : `Size: ${selectedSize}`}
            </span>
          )}
          <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1.5 transition-transform ml-auto hidden sm:block" />
        </button>
      </div>
    </div>
  );
}

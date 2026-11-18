import React from 'react';
import { Ruler, ShoppingBag, ArrowRight } from 'lucide-react';
import { navigateTo } from '../../utils/navigation';

export default function ProductActionButtons({
  product,
  selectedSize,
  setSelectedSize,
  onOpenRingSizer,
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
    <div className="space-y-4">
      {hasSizes && !isOnlyStandardSize && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#4A453E] font-medium flex items-center gap-1.5">
              <span>{lang === 'ka' ? 'აირჩიეთ ზომა:' : 'Select Size:'}</span>
              {selectedSize && (
                <span className="font-mono text-[#1F1C18] font-semibold">({selectedSize})</span>
              )}
            </span>
            {isRing && onOpenRingSizer && (
              <button
                type="button"
                onClick={onOpenRingSizer}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9A7742] hover:text-[#1F1C18] transition-colors cursor-pointer underline underline-offset-4 decoration-[#9A7742]/40"
              >
                <Ruler className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>{lang === 'ka' ? 'ზომის ონლაინ საზომი' : 'Ring Size Guide'}</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize?.(sz)}
                className={`min-w-[50px] h-10 px-3.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center justify-center cursor-pointer ${
                  selectedSize === sz
                    ? 'bg-[#1F1C18] text-white border-[#1F1C18] shadow-xs'
                    : 'border-[#DCD5C9] hover:border-[#1F1C18] bg-white text-[#1F1C18]'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

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
          className="w-full py-4 px-7 rounded-full bg-[#1F1C18] hover:bg-[#35302A] text-white font-medium text-sm flex items-center justify-center gap-3 shadow-md shadow-[#1F1C18]/10 active:scale-[0.995] transition-all cursor-pointer group"
        >
          <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
          <span>{lang === 'ka' ? 'ახლავე შეძენა (ონლაინ შეკვეთა)' : 'Buy Now (Instant Checkout)'}</span>
          {selectedSize && !isOnlyStandardSize && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/15 font-mono">
              {lang === 'ka' ? `ზომა: ${selectedSize}` : `Size: ${selectedSize}`}
            </span>
          )}
          <ArrowRight className="w-4 h-4 stroke-[1.75] group-hover:translate-x-1 transition-transform ml-auto hidden sm:block" />
        </button>
      </div>
    </div>
  );
}

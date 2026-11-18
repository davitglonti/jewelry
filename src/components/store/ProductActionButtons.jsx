import React from 'react';
import { Ruler } from 'lucide-react';
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
    <div className="space-y-5">
      {/* Size Selection Section */}
      {hasSizes && !isOnlyStandardSize && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-wider uppercase text-[#1F1C18] text-xs">
                {lang === 'ka' ? 'აირჩიეთ ზომა:' : 'SIZE'}
              </span>
              {selectedSize && (
                <span className="font-mono text-[#787168] text-xs">({selectedSize})</span>
              )}
            </div>

            {isRing && onOpenRingSizer && (
              <button
                type="button"
                onClick={onOpenRingSizer}
                className="text-xs text-[#787168] hover:text-[#1F1C18] transition-colors cursor-pointer underline underline-offset-4"
              >
                <span>{lang === 'ka' ? 'ზომის ონლაინ საზომი' : 'Interactive Size Guide'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize?.(sz)}
                className={`min-w-[54px] h-10 px-4 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center justify-center cursor-pointer ${
                  selectedSize === sz
                    ? 'bg-[#1F1C18] text-white border-[#1F1C18] shadow-xs'
                    : 'border-[#DCD6CC] hover:border-[#1F1C18] bg-white text-[#1F1C18]'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Action Button: BUY NOW */}
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
          className="w-full py-4 px-8 rounded-full bg-[#1F1C18] hover:bg-black text-white text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{lang === 'ka' ? 'ახლავე შეძენა' : 'BUY NOW'}</span>
          <span className="sr-only">
            {lang === 'ka'
              ? (selectedSize ? `(ონლაინ შეკვეთა) ზომა: ${selectedSize}` : '(ონლაინ შეკვეთა)')
              : (selectedSize ? `(Instant Checkout) Size: ${selectedSize}` : '(Instant Checkout)')}
          </span>
        </button>
      </div>
    </div>
  );
}

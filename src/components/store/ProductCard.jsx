import React, { useState } from 'react';
import { Heart, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { pick, formatPrice, calculateDiscountPercent } from '../../utils/i18n';
import { getOptimizedImageUrl, getProductCardSrcSet } from '../../utils/imageUtils';
import { navigateTo } from '../../utils/navigation';

export default function ProductCard({
  product,
  onClick,
  className = "",
  compact = false,
  showDetailsButton = true,
  imageSizes = "(max-width: 640px) 220px, (max-width: 1024px) 280px, 340px"
}) {
  const { lang, favorites, toggleFavorite, compareList, toggleCompare } = useStore();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const mainImg = product.images?.[0] || product.image || "/brand-logo.jpg";
  const secondaryImg = product.images?.[1] || null;
  const productName = pick(product, "name", lang);
  const discountPct = calculateDiscountPercent(product.price, product.oldPrice || product.originalPrice);
  const isFav = favorites?.includes(product.id) || (product.sku && favorites?.includes(product.sku));
  const isCompared = compareList?.includes(product.id);

  return (
    <article
      onClick={() => onClick && onClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group cursor-pointer rounded-2xl bg-white border border-[#EAE4DB] hover:border-[#D4C9B8] shadow-[0_2px_14px_rgba(31,28,24,0.03)] hover:shadow-[0_12px_30px_rgba(31,28,24,0.08)] hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between transition-all duration-300 ${className}`}
    >
      {/* Balanced Portrait-Square Image Frame */}
      <div className="relative aspect-[4/4.2] overflow-hidden bg-[#F3EFE8]">
        <img
          src={getOptimizedImageUrl(mainImg, 480, 75)}
          srcSet={getProductCardSrcSet(mainImg)}
          sizes={imageSizes}
          alt={productName || "სამკაული"}
          loading="eager"
          decoding="async"
          width="400"
          height="420"
          onError={(e) => { e.currentTarget.src = "/brand-logo.jpg"; }}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            secondaryImg && isHovered ? "opacity-0 scale-105" : "group-hover:scale-105"
          }`}
        />

        {secondaryImg && (
          <img
            src={getOptimizedImageUrl(secondaryImg, 480, 75)}
            srcSet={getProductCardSrcSet(secondaryImg)}
            sizes={imageSizes}
            alt={`${productName || "სამკაული"} - ხედი 2`}
            loading="lazy"
            decoding="async"
            width="400"
            height="420"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out pointer-events-none ${
              isHovered ? "opacity-100 scale-105" : "opacity-0"
            }`}
          />
        )}

        {/* Clean Soft-Pill Top-Left Badges */}
        <div className={`absolute ${compact ? "top-1.5 left-1.5 gap-1 max-w-[62%]" : "top-2.5 left-2.5 gap-1.5 max-w-[68%]"} flex flex-col items-start z-10 pointer-events-none`}>
          {product.exclusive && (
            <span className={`${compact ? "px-1.5 py-0.5 text-[8px]" : "px-2.5 py-0.5 text-[10px]"} rounded-full font-medium bg-[#1F1C18]/90 text-white backdrop-blur-xs truncate max-w-full`}>
              {lang === "ka" ? "ექსკლუზივი" : "Exclusive"}
            </span>
          )}
          {discountPct ? (
            <span className={`${compact ? "px-1.5 py-0.5 text-[8px]" : "px-2.5 py-0.5 text-[10px]"} rounded-full font-semibold bg-[#9E2A2B] text-white`}>
              -{discountPct}%
            </span>
          ) : null}
          {product.stockStatus === 'preorder' && !compact && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/95 text-[#8A6836] border border-[#E5DDCE]">
              {lang === 'ka' ? 'შეკვეთით' : 'Pre-order'}
            </span>
          )}
          {product.stockStatus === 'sold_out' && (
            <span className={`${compact ? "px-1.5 py-0.5 text-[8px]" : "px-2.5 py-0.5 text-[10px]"} rounded-full font-medium bg-white/90 text-[#787168] border border-[#E5DDCE]`}>
              {lang === 'ka' ? 'ამოიწურა' : 'Sold out'}
            </span>
          )}
        </div>

        {/* Soft Frosted Circular Action Pills */}
        <div className={`absolute ${compact ? "top-1.5 right-1.5 gap-1" : "top-2.5 right-2.5 gap-1.5"} flex flex-col items-end z-10`}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                const current = window.location.pathname + window.location.search;
                navigateTo(`/login?redirect=${encodeURIComponent(current)}`);
                return;
              }
              toggleFavorite(product.id);
            }}
            aria-label={
              isFav
                ? (lang === "ka" ? `${productName} — რჩეულებიდან ამოშლა` : `Remove ${productName} from favorites`)
                : (lang === "ka" ? `${productName} — რჩეულებში დამატება` : `Add ${productName} to favorites`)
            }
            className={`${compact ? "w-6 h-6" : "w-8 h-8"} rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              isFav
                ? "bg-[#9E2A2B] text-white hover:bg-[#822021]"
                : "bg-white/90 text-[#1F1C18] hover:bg-[#9E2A2B] hover:text-white backdrop-blur-xs"
            }`}
          >
            <Heart className={`${compact ? "w-3 h-3" : "w-3.5 h-3.5"} stroke-[1.75] ${isFav ? "fill-white text-white" : ""}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product.id);
            }}
            title={
              isCompared
                ? (lang === "ka" ? "შედარებიდან ამოშლა" : "Remove from compare")
                : (lang === "ka" ? "შედარებაში დამატება" : "Add to compare")
            }
            className={`${compact ? "w-6 h-6" : "w-8 h-8"} rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              isCompared
                ? "bg-[#9E2A2B] text-white hover:bg-[#822021]"
                : "bg-white/90 text-[#1F1C18] hover:bg-[#9E2A2B] hover:text-white backdrop-blur-xs"
            }`}
          >
            <ArrowLeftRight className={`${compact ? "w-3 h-3" : "w-3.5 h-3.5"} stroke-[1.75]`} />
          </button>
        </div>
      </div>

      {/* Crisp Readable Card Body */}
      <div className={`${compact ? "p-2 sm:p-3 space-y-1" : "p-3 sm:p-5 space-y-1.5 sm:space-y-2"} flex-1 flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] text-[#787168]">
            <span className="truncate font-medium">{product.category || "სამკაული"}</span>
            {product.sku && <span className="font-mono shrink-0 text-[#9A7742] text-[9px] sm:text-[10px]">#{product.sku}</span>}
          </div>

          <h3
            className={`font-serif font-medium text-[#1F1C18] group-hover:text-[#9A7742] transition-colors line-clamp-1 mt-0.5 leading-snug ${
              compact ? "text-xs" : "text-base sm:text-[17px]"
            }`}
            title={productName}
          >
            {productName}
          </h3>

          {(product.metal || product.karat) && (
            <p className="text-xs text-[#787168] truncate hidden sm:block mt-0.5">
              {[product.metal, product.karat].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>

        <div className={`${compact ? "pt-1.5 mt-0.5" : "pt-2 sm:pt-2.5 mt-1"} border-t border-[#F3EFE8] flex flex-col gap-1.5`}>
          <div className="flex items-baseline justify-between gap-1.5 min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
              <span className={`${compact ? "text-xs font-semibold" : "text-sm sm:text-base font-semibold"} text-[#1F1C18] whitespace-nowrap`}>
                {formatPrice(product.price)}
              </span>
              {discountPct ? (
                <span className={`${compact ? "text-[10px]" : "text-xs"} line-through text-[#857D73] whitespace-nowrap`}>
                  {formatPrice(product.oldPrice || product.originalPrice)}
                </span>
              ) : null}
            </div>

            {showDetailsButton && !compact && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick && onClick(product);
                }}
                aria-label={`${lang === "ka" ? "დეტალურად ნახვა" : "View details"}: ${productName}`}
                className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#FAF8F4] text-[#1F1C18] border border-[#D9D1C5] group-hover:bg-[#1F1C18] group-hover:text-white group-hover:border-[#1F1C18] transition-colors cursor-pointer shrink-0"
              >
                {lang === "ka" ? "დეტალურად" : "View"}
              </button>
            )}
          </div>

          {showDetailsButton && !compact && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick && onClick(product);
              }}
              aria-label={`${lang === "ka" ? "დეტალურად ნახვა" : "View details"}: ${productName}`}
              className="sm:hidden w-full py-1.5 rounded-full text-xs font-medium bg-[#FAF8F4] text-[#1F1C18] border border-[#D9D1C5] active:bg-[#1F1C18] active:text-white transition-colors cursor-pointer text-center"
            >
              {lang === "ka" ? "დეტალურად" : "View"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

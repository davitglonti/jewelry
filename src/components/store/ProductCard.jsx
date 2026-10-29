import React, { useState } from 'react';
import { Heart, Eye, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { pick, formatPrice, calculateDiscountPercent } from '../../utils/i18n';
import { getOptimizedImageUrl, getProductCardSrcSet } from '../../utils/imageUtils';

export default function ProductCard({
  product,
  onClick,
  className = "",
  compact = false,
  showDetailsButton = true,
  imageSizes = "(max-width: 640px) 200px, (max-width: 1024px) 240px, 260px"
}) {
  const { darkMode, lang, favorites, toggleFavorite, compareList, toggleCompare } = useStore();
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
      className={`group cursor-pointer rounded-xl sm:rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
        darkMode
          ? "bg-[#141210] border-stone-800/80 hover:border-amber-500/40 shadow-xs hover:shadow-xl hover:shadow-amber-500/5"
          : "bg-white border-stone-200/90 hover:border-amber-500 shadow-xs hover:shadow-xl"
      } ${className}`}
    >
      {/* 1:1 Aspect Ratio Image Container */}
      <div className="relative aspect-square overflow-hidden bg-stone-900">
        {/* Primary Image */}
        <img
          src={getOptimizedImageUrl(mainImg, 380, 68)}
          srcSet={getProductCardSrcSet(mainImg)}
          sizes={imageSizes}
          alt={productName || "სამკაული"}
          loading="lazy"
          decoding="async"
          width="400"
          height="400"
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            secondaryImg && isHovered ? "opacity-0 scale-105" : "group-hover:scale-105"
          }`}
        />

        {/* Secondary Image on Hover */}
        {secondaryImg && (
          <img
            src={getOptimizedImageUrl(secondaryImg, 380, 68)}
            srcSet={getProductCardSrcSet(secondaryImg)}
            sizes={imageSizes}
            alt={`${productName || "სამკაული"} - ხედი 2`}
            loading="lazy"
            decoding="async"
            width="400"
            height="400"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out pointer-events-none ${
              isHovered ? "opacity-100 scale-105" : "opacity-0"
            }`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-col items-start gap-1 z-10 pointer-events-none max-w-[65%]">
          {product.exclusive && (
            <span className="self-start px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[9px] uppercase tracking-wider font-semibold bg-black/80 text-amber-400 border border-amber-500/40 backdrop-blur-md truncate max-w-full">
              {lang === "ka" ? "ექსკლუზივი" : "Exclusive"}
            </span>
          )}
          {discountPct ? (
            <span className="self-start px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-red-600 text-white backdrop-blur-md shadow-md">
              -{discountPct}%
            </span>
          ) : null}
          {product.stockStatus === 'preorder' && (
            <span className="self-start px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[9px] font-semibold bg-amber-950/90 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-md">
              {lang === 'ka' ? '🟡 შეკვეთით' : 'Pre-order'}
            </span>
          )}
          {product.stockStatus === 'sold_out' && (
            <span className="self-start px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[9px] font-semibold bg-stone-900/90 text-stone-300 border border-stone-600 backdrop-blur-md shadow-md">
              {lang === 'ka' ? '⚪ ამოიწურა' : 'Sold out'}
            </span>
          )}
        </div>

        {/* Action Buttons: Favorite & Compare */}
        <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex sm:flex-col items-center sm:items-end gap-1 sm:gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                const current = window.location.pathname + window.location.search;
                window.location.href = `/login?redirect=${encodeURIComponent(current)}`;
                return;
              }
              toggleFavorite(product.id);
            }}
            aria-label={
              isFav
                ? (lang === "ka" ? `${productName} — რჩეულებიდან ამოშლა` : `Remove ${productName} from favorites`)
                : (lang === "ka" ? `${productName} — რჩეულებში დამატება` : `Add ${productName} to favorites`)
            }
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-md ${
              isFav
                ? "bg-rose-500 text-white shadow-rose-500/30"
                : "bg-black/65 text-white hover:text-rose-400 hover:bg-black"
            }`}
          >
            <Heart className={`w-3 sm:w-4 h-3 sm:h-4 ${isFav ? "fill-white text-white" : ""}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                const current = window.location.pathname + window.location.search;
                window.location.href = `/login?redirect=${encodeURIComponent(current)}`;
                return;
              }
              toggleCompare(product.id);
            }}
            title={
              isCompared
                ? (lang === "ka" ? "შედარებიდან ამოშლა" : "Remove from compare")
                : (lang === "ka" ? "შედარებაში დამატება" : "Add to compare")
            }
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-md border ${
              isCompared
                ? "bg-amber-500 text-black border-amber-400 font-semibold shadow-amber-500/30 scale-105"
                : "bg-black/65 text-white border-transparent hover:bg-black hover:text-amber-400"
            }`}
          >
            <ArrowLeftRight className="w-3 sm:w-4 h-3 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className={`p-2 sm:p-4 flex-1 flex flex-col justify-between ${compact ? "space-y-1 sm:space-y-2" : "space-y-2 sm:space-y-3"}`}>
        <div>
          <div className="flex items-center justify-between text-[8px] sm:text-[10px] opacity-80 mb-0.5 sm:mb-1 gap-1">
            <span className="truncate uppercase tracking-wider font-medium">{product.category || "სამკაული"}</span>
            <span className="font-mono text-amber-400 font-medium shrink-0">#{product.sku}</span>
          </div>
          <h3
            className={`font-serif font-normal hover:text-amber-500 transition-colors line-clamp-1 leading-snug ${
              compact ? "text-[11px] sm:text-base" : "text-xs sm:text-base font-medium"
            }`}
            title={productName}
          >
            {productName}
          </h3>
          {(product.metal || product.karat) && (
            <p className="text-[10px] sm:text-xs opacity-70 truncate hidden sm:block mt-1">
              {[product.metal, product.karat].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>

        {/* Price Row & Desktop Details Pill */}
        <div className="pt-1.5 sm:pt-2.5 border-t border-stone-500/15 flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex flex-col">
            {discountPct ? (
              <span className="text-[9px] sm:text-[11px] line-through opacity-50 font-normal">
                {formatPrice(product.oldPrice || product.originalPrice)}
              </span>
            ) : null}
            <span className="font-serif text-xs sm:text-base lg:text-lg text-amber-500 font-semibold leading-tight whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Details button on desktop */}
          {showDetailsButton && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick && onClick(product);
              }}
              aria-label={`${lang === "ka" ? "დეტალურად ნახვა" : "View details"}: ${productName}`}
              className="hidden sm:flex px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all items-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === "ka" ? "დეტალურად" : "Details"}</span>
            </button>
          )}

          {/* Discount tag on mobile where button is hidden */}
          {discountPct ? (
            <span className="sm:hidden text-[8px] font-bold text-red-400 font-mono">
              -{discountPct}%
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

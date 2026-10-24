import React from 'react';
import { Heart, Eye, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { pick, formatPrice, calculateDiscountPercent } from '../../utils/i18n';
import { useStore } from '../../context/StoreContext';
import { getOptimizedImageUrl, getProductCardSrcSet } from '../../utils/imageUtils';

export default function CatalogSection({ openProductModal }) {
  const { darkMode, lang, products, favorites, toggleFavorite, compareList, toggleCompare } = useStore();

  // Featured pieces for the home page showcase:
  // Filter products explicitly selected in Admin (showOnHome); fallback to first 5 if none configured
  const featured = products.filter((p, idx) =>
    typeof p.showOnHome === "boolean" ? p.showOnHome : idx < 5
  );
  // Strictly cap at maximum 5 pieces so all items sit on 1 single row on desktop
  const showcaseProducts = featured.slice(0, 5);

  return (
    <section id="catalog" className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-16 sm:py-20">
      {/* Header with Luxury Title on Left and "View Full Collection" Button on Right */}
      <div className="flex flex-row items-end justify-between mb-4 sm:mb-6 gap-2 sm:gap-6 pb-3 sm:pb-4 border-b border-stone-500/15">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-amber-500 block mb-1.5 font-medium">
            {lang === "ka" ? "საიუველირო ვიტრინა" : "Fine Jewelry Showcase"}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl xl:text-5xl font-normal tracking-wide">
            {lang === "ka" ? "ჩვენი კოლექცია" : "Our Collection"}
          </h2>
        </div>

        {/* "View Full Collection" button placed at the top-right (both on mobile & desktop) */}
        <a
          href="/catalog"
          className="inline-flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-6 py-1.5 sm:py-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black font-semibold text-[11px] sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow-amber-500/20 hover:scale-105 shrink-0 whitespace-nowrap"
        >
          <span>{lang === "ka" ? `სრული კოლექცია (${products.length})` : `Explore All (${products.length})`}</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </a>
      </div>

      {/* Grid of showcase pieces (Horizontal Luxury Shelf: 2 visible + 3rd peek on mobile, 5-column grid on desktop) */}
      {showcaseProducts.length === 0 ? (
        <div className="text-center py-20 opacity-60">
          <p className="text-lg">{lang === "ka" ? "სამკაულები მალე დაემატება." : "Jewelry pieces coming soon."}</p>
        </div>
      ) : (
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex xl:grid xl:grid-cols-5 gap-3 sm:gap-4 xl:gap-5 overflow-x-auto xl:overflow-x-visible pb-4 xl:pb-0 snap-x snap-mandatory scrollbar-none">
          {showcaseProducts.map((product) => {
            const mainImg = product.images?.[0] || product.image || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80";
            const secondaryImg = product.images?.[1] || null;
            const productName = pick(product, "name", lang);
            const discountPct = calculateDiscountPercent(product.price, product.oldPrice);

            return (
              <article
                key={product.id}
                onClick={() => openProductModal(product)}
                className={`group cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shrink-0 xl:shrink w-[40vw] min-w-[40vw] sm:w-[220px] sm:min-w-[220px] xl:w-auto xl:min-w-0 snap-start ${
                  darkMode
                    ? "bg-[#141210] border-stone-800/80 hover:border-amber-500/40 shadow-md hover:shadow-xl hover:shadow-amber-500/5"
                    : "bg-white border-stone-200/90 hover:border-amber-500 shadow-sm hover:shadow-xl"
                }`}
              >
                {/* Image Container with 1:1 Aspect Ratio */}
                <div className="relative aspect-square overflow-hidden bg-stone-900">
                  {/* Primary Photo */}
                  <img
                    src={getOptimizedImageUrl(mainImg, 380, 68)}
                    srcSet={getProductCardSrcSet(mainImg)}
                    sizes="(max-width: 640px) 200px, (max-width: 1024px) 240px, 260px"
                    alt={productName || "სამკაული"}
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="400"
                    className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                      secondaryImg ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
                    }`}
                  />

                  {/* Secondary Photo on Hover */}
                  {secondaryImg && (
                    <img
                      src={getOptimizedImageUrl(secondaryImg, 380, 68)}
                      srcSet={getProductCardSrcSet(secondaryImg)}
                      sizes="(max-width: 640px) 200px, (max-width: 1024px) 240px, 260px"
                      alt={`${productName || "სამკაული"} - ხედი 2`}
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="400"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out pointer-events-none"
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col items-start gap-1 z-10 pointer-events-none">
                    {product.exclusive && (
                      <span className="self-start px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] uppercase tracking-widest bg-black/80 text-amber-400 border border-amber-500/40 backdrop-blur-md">
                        {lang === "ka" ? "ექსკლუზივი" : "Exclusive"}
                      </span>
                    )}
                    {discountPct ? (
                      <span className="self-start px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white backdrop-blur-md shadow-md">
                        -{discountPct}%
                      </span>
                    ) : null}
                  </div>

                  {/* Action Buttons: Favorite & Compare */}
                  <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex flex-col gap-1.5 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      aria-label={
                        favorites.includes(product.id)
                          ? (lang === "ka" ? `${productName} — რჩეულებიდან ამოშლა` : `Remove ${productName} from favorites`)
                          : (lang === "ka" ? `${productName} — რჩეულებში დამატება` : `Add ${productName} to favorites`)
                      }
                      className="p-1.5 sm:p-2 rounded-full bg-black/65 text-white hover:bg-black transition-all shadow-md backdrop-blur-sm"
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${favorites.includes(product.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(product.id);
                      }}
                      title={
                        compareList?.includes(product.id)
                          ? (lang === "ka" ? "შედარებიდან ამოშლა" : "Remove from compare")
                          : (lang === "ka" ? "შედარებაში დამატება" : "Add to compare")
                      }
                      className={`p-1.5 sm:p-2 rounded-full transition-all shadow-md backdrop-blur-sm ${
                        compareList?.includes(product.id)
                          ? "bg-amber-500 text-black shadow-amber-500/30 scale-105"
                          : "bg-black/65 text-white hover:bg-black hover:text-amber-400"
                      }`}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] opacity-60 mb-1">
                      <span className="truncate max-w-[60%]">{product.category}</span>
                      <span className="font-mono">{product.sku}</span>
                    </div>
                    <h3
                      className="font-serif text-xs sm:text-base font-medium hover:text-amber-500 transition-colors line-clamp-1"
                    >
                      {productName}
                    </h3>
                    <p className="text-[10px] sm:text-xs opacity-70 truncate hidden sm:block">
                      {product.metal} • {product.karat}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-500/15 flex items-center justify-between gap-1">
                    <div className="flex flex-col">
                      {discountPct ? (
                        <span className="text-[10px] sm:text-[11px] line-through opacity-50 font-normal">
                          {formatPrice(product.oldPrice)}
                        </span>
                      ) : null}
                      <span className="font-serif text-sm sm:text-lg text-amber-500 font-semibold leading-tight">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductModal(product);
                      }}
                      aria-label={`${lang === "ka" ? "დეტალურად ნახვა" : "View details"}: ${productName}`}
                      className="flex px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all items-center gap-1 shrink-0 whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{lang === "ka" ? "დეტალურად" : "Details"}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

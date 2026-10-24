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
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-amber-500 block mb-1 font-medium">
            {lang === "ka" ? "საიუველირო ვიტრინა" : "Fine Jewelry Showcase"}
          </span>
          <h2 className="font-serif text-xl sm:text-4xl xl:text-5xl font-normal tracking-wide">
            {lang === "ka" ? "ჩვენი კოლექცია" : "Our Collection"}
          </h2>
        </div>

        {/* "View Full Collection" button placed at the top-right */}
        <a
          href="/catalog"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black font-semibold text-[10px] sm:text-xs tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow-amber-500/20 active:scale-95 shrink-0 whitespace-nowrap"
        >
          <span>{lang === "ka" ? `სრული კოლექცია (${products.length})` : `Explore All (${products.length})`}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Grid of showcase pieces */}
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
                className={`group cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shrink-0 xl:shrink w-[43vw] min-w-[155px] max-w-[185px] sm:w-[220px] sm:min-w-[220px] xl:w-auto xl:min-w-0 snap-start ${
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
                  <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-10 pointer-events-none max-w-[65%]">
                    {product.exclusive && (
                      <span className="self-start px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold bg-black/80 text-amber-400 border border-amber-500/40 backdrop-blur-md truncate max-w-full">
                        {lang === "ka" ? "ექსკლუზივი" : "Exclusive"}
                      </span>
                    )}
                    {discountPct ? (
                      <span className="self-start px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-red-600 text-white backdrop-blur-md shadow-md">
                        -{discountPct}%
                      </span>
                    ) : null}
                  </div>

                  {/* Action Buttons: Favorite & Compare Side-by-Side */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
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
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow ${
                        favorites.includes(product.id)
                          ? "bg-rose-500 text-white shadow-rose-500/30"
                          : "bg-black/60 text-white hover:text-rose-400 hover:bg-black/80"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${favorites.includes(product.id) ? "fill-white" : ""}`} />
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
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow border ${
                        compareList?.includes(product.id)
                          ? "bg-amber-500 text-black border-amber-400 font-semibold shadow-amber-500/30 scale-105"
                          : "bg-black/60 text-white border-transparent hover:bg-black/80 hover:text-amber-400"
                      }`}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-[10px] opacity-60 mb-1 gap-1">
                      <span className="truncate uppercase tracking-wider text-[9px] font-medium">{product.category || "სამკაული"}</span>
                      <span className="font-mono text-[9px] shrink-0 text-amber-500/80">#{product.sku}</span>
                    </div>
                    <h3
                      className="font-serif text-xs sm:text-base font-normal hover:text-amber-500 transition-colors line-clamp-1 leading-snug"
                      title={productName}
                    >
                      {productName}
                    </h3>
                  </div>

                  {/* Price & Details Space */}
                  <div className="pt-2 border-t border-stone-500/15 space-y-1.5">
                    <div className="flex items-baseline justify-between gap-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-serif text-xs sm:text-base text-amber-500 font-bold leading-tight whitespace-nowrap">
                          {formatPrice(product.price)}
                        </span>
                        {discountPct ? (
                          <span className="text-[10px] sm:text-[11px] line-through text-stone-500 font-normal leading-none whitespace-nowrap">
                            {formatPrice(product.oldPrice)}
                          </span>
                        ) : null}
                      </div>

                      {discountPct ? (
                        <span className="text-[9px] font-bold text-red-500 font-mono">
                          -{discountPct}%
                        </span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductModal(product);
                      }}
                      aria-label={`${lang === "ka" ? "დეტალურად ნახვა" : "View details"}: ${productName}`}
                      className="w-full py-1.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 transition-all duration-300 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-semibold tracking-wider uppercase group/btn shadow-xs active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400 group-hover/btn:text-black transition-colors" />
                      <span>{lang === "ka" ? "დეტალურად" : "Details"}</span>
                      <ArrowRight className="w-3 h-3 text-amber-400 group-hover/btn:text-black group-hover/btn:translate-x-0.5 transition-all" />
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

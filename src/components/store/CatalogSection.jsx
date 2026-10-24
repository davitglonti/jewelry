import React from 'react';
import { Heart, Eye, ArrowRight } from 'lucide-react';
import { pick, formatPrice, calculateDiscountPercent } from '../../utils/i18n';
import { useStore } from '../../context/StoreContext';
import { getOptimizedImageUrl, getProductCardSrcSet } from '../../utils/imageUtils';

export default function CatalogSection({ openProductModal }) {
  const { darkMode, lang, products, favorites, toggleFavorite } = useStore();

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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-6 pb-6 border-b border-stone-500/15">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-amber-500 block mb-2 font-medium">
            {lang === "ka" ? "საიუველირო ვიტრინა" : "Fine Jewelry Showcase"}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-wide">
            {lang === "ka" ? "ჩვენი კოლექცია" : "Our Collection"}
          </h2>
        </div>

        {/* "View Full Collection" button placed at the top-right above the grid */}
        <a
          href="/catalog"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow-amber-500/20 hover:scale-105 shrink-0 self-start sm:self-end"
        >
          <span>{lang === "ka" ? `სრული კოლექცია (${products.length})` : `Explore All (${products.length})`}</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Grid of showcase pieces */}
      {showcaseProducts.length === 0 ? (
        <div className="text-center py-20 opacity-60">
          <p className="text-lg">{lang === "ka" ? "სამკაულები მალე დაემატება." : "Jewelry pieces coming soon."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 xl:gap-5">
          {showcaseProducts.map((product) => {
            const mainImg = product.images?.[0] || product.image || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80";
            const secondaryImg = product.images?.[1] || null;
            const productName = pick(product, "name", lang);
            const discountPct = calculateDiscountPercent(product.price, product.oldPrice);

            return (
              <article
                key={product.id}
                className={`group rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col ${
                  darkMode
                    ? "bg-[#141210] border-stone-800/80 hover:border-amber-500/40"
                    : "bg-white border-stone-200/90 hover:border-amber-500 shadow-sm hover:shadow-xl"
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-stone-900 cursor-pointer" onClick={() => openProductModal(product)}>
                  {/* Primary Photo */}
                  <img
                    src={getOptimizedImageUrl(mainImg, 380, 68)}
                    srcSet={getProductCardSrcSet(mainImg)}
                    sizes="(max-width: 640px) 360px, (max-width: 1024px) 300px, 260px"
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
                      sizes="(max-width: 640px) 360px, (max-width: 1024px) 300px, 260px"
                      alt={`${productName || "სამკაული"} - ხედი 2`}
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="400"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out pointer-events-none"
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                    {product.exclusive && (
                      <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest bg-black/80 text-amber-400 border border-amber-500/40 backdrop-blur-md">
                        {lang === "ka" ? "ექსკლუზივი" : "Exclusive"}
                      </span>
                    )}
                    {discountPct ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white backdrop-blur-md shadow-md shadow-red-950/40 flex items-center gap-1">
                        <span>{lang === "ka" ? "ფასდაკლება" : "Sale"}</span>
                        <span className="font-mono bg-black/35 px-1 py-0.2 rounded text-[10px]">-{discountPct}%</span>
                      </span>
                    ) : null}
                  </div>

                  {product.images?.length > 1 && (
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] bg-black/70 text-white backdrop-blur-sm z-10 pointer-events-none">
                      +{product.images.length} {lang === "ka" ? "ფოტო" : "photos"}
                    </span>
                  )}

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
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-black transition-all z-10"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                  </button>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between text-[11px] opacity-60 mb-1">
                      <span>{product.category}</span>
                      <span className="font-mono">{product.sku}</span>
                    </div>
                    <h3
                      onClick={() => openProductModal(product)}
                      className="font-serif text-lg sm:text-xl font-medium cursor-pointer hover:text-amber-500 transition-colors line-clamp-1"
                    >
                      {productName}
                    </h3>
                    <p className="text-xs opacity-70 mt-1 truncate">
                      {product.metal} • {product.karat}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-500/15 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      {discountPct ? (
                        <span className="text-[11px] line-through opacity-50 font-normal">
                          {formatPrice(product.oldPrice)}
                        </span>
                      ) : null}
                      <span className="font-serif text-lg sm:text-xl text-amber-500 font-semibold leading-tight">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openProductModal(product)}
                      aria-label={`${lang === "ka" ? "დეტალურად ნახვა" : "View details"}: ${productName}`}
                      className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1.5 shrink-0"
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

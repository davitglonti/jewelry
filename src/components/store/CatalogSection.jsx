import React from 'react';
import { Heart, Eye, ArrowRight } from 'lucide-react';
import { pick, formatPrice } from '../../utils/i18n';
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
            const productName = pick(product, "name", lang);

            return (
              <article
                key={product.id}
                className={`group rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col ${
                  darkMode
                    ? "bg-[#141210] border-stone-800/80 hover:border-amber-500/40"
                    : "bg-white border-stone-200/90 hover:border-amber-500 shadow-sm hover:shadow-xl"
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-stone-900">
                  <img
                    src={getOptimizedImageUrl(mainImg, 380, 68)}
                    srcSet={getProductCardSrcSet(mainImg)}
                    sizes="(max-width: 640px) 360px, (max-width: 1024px) 300px, 280px"
                    alt={productName || "სამკაული"}
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="400"
                    onClick={() => openProductModal(product)}
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.exclusive && (
                      <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest bg-black/80 text-amber-400 border border-amber-500/40 backdrop-blur-md">
                        {lang === "ka" ? "ექსკლუზივი" : "Exclusive"}
                      </span>
                    )}
                    {(() => {
                      if (!product.oldPrice) return null;
                      const p1 = parseFloat(product.price?.toString().replace(/,/g, '').replace(/[^\d.]/g, ''));
                      const p2 = parseFloat(product.oldPrice?.toString().replace(/,/g, '').replace(/[^\d.]/g, ''));
                      if (!isNaN(p1) && !isNaN(p2) && p1 >= p2) return null;
                      return (
                        <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-red-600/90 text-white backdrop-blur-md shadow-md">
                          {lang === "ka" ? "ფასდაკლება" : "Sale"}
                        </span>
                      );
                    })()}
                  </div>

                  {product.images?.length > 1 && (
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] bg-black/70 text-white backdrop-blur-sm">
                      +{product.images.length} {lang === "ka" ? "ფოტო" : "photos"}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleFavorite(product.id)}
                    aria-label={
                      favorites.includes(product.id)
                        ? (lang === "ka" ? `${productName} — რჩეულებიდან ამოშლა` : `Remove ${productName} from favorites`)
                        : (lang === "ka" ? `${productName} — რჩეულებში დამატება` : `Add ${productName} to favorites`)
                    }
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-black transition-all"
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
                      {product.oldPrice && (
                        <span className="text-xs line-through opacity-50 font-normal">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
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

      {/* Bottom Button if more items exist in full catalog */}
      {products.length > showcaseProducts.length && (
        <div className="mt-14 text-center">
          <a
            href="/catalog"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
          >
            <span>{lang === "ka" ? `სრული კოლექციის ნახვა (${products.length} სამკაული)` : `View All ${products.length} Pieces`}</span>
            <span className="text-base">→</span>
          </a>
        </div>
      )}
    </section>
  );
}

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import ProductCard from './ProductCard';

export default function CatalogSection({ openProductModal }) {
  const { lang, products } = useStore();

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
          <h2 className="font-serif text-xl sm:text-4xl xl:text-5xl font-normal tracking-wide">
            {lang === "ka" ? "ჩვენი კოლექცია" : "Our Collection"}
          </h2>
        </div>

        {/* "View Full Collection" button placed at the top-right */}
        <a
          href="/catalog"
          className="inline-flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-6 py-1.5 sm:py-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black font-semibold text-[11px] sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow-amber-500/20 hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
        >
          <span>{lang === "ka" ? `სრული კოლექცია (${products.length})` : `Explore All (${products.length})`}</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </a>
      </div>

      {/* Grid of showcase pieces (Horizontal Luxury Shelf on mobile, 5-column grid on desktop) */}
      {showcaseProducts.length === 0 ? (
        <div className="text-center py-20 opacity-60">
          <p className="text-lg">{lang === "ka" ? "სამკაულები მალე დაემატება." : "Jewelry pieces coming soon."}</p>
        </div>
      ) : (
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex xl:grid xl:grid-cols-5 gap-3 sm:gap-4 xl:gap-5 overflow-x-auto xl:overflow-x-visible pb-4 xl:pb-0 snap-x snap-mandatory scrollbar-none">
          {showcaseProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={openProductModal}
              className="shrink-0 xl:shrink w-[43vw] min-w-[155px] max-w-[185px] sm:w-[220px] sm:min-w-[220px] sm:max-w-none xl:w-auto xl:min-w-0 snap-start"
              showDetailsButton={true}
            />
          ))}
        </div>
      )}
    </section>
  );
}

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import ProductCard from './ProductCard';

export default function CatalogSection({ openProductModal }) {
  const { lang, products } = useStore();

  const featured = products.filter((p, idx) =>
    typeof p.showOnHome === "boolean" ? p.showOnHome : idx < 5
  );

  const isExclusive = (p) => p.exclusive === true || p.exclusive === 'true';
  const sortedFeatured = [...featured].sort((a, b) => {
    const aEx = isExclusive(a);
    const bEx = isExclusive(b);
    if (aEx === bEx) return 0;
    return aEx ? -1 : 1;
  });

  const showcaseProducts = sortedFeatured.slice(0, 5);
  const desktopGridClass = showcaseProducts.length <= 4 ? "xl:grid-cols-4" : "xl:grid-cols-5";

  return (
    <section id="catalog" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
        <div>
          <span className="text-xs font-medium text-[#9A7742] block mb-1.5">
            {lang === "ka" ? "საიუველირო ვიტრინა" : "Fine Jewelry Showcase"}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1F1C18]">
            {lang === "ka" ? "ჩვენი კოლექცია" : "Our Collection"}
          </h2>
        </div>

        <a
          href={lang === "en" ? "/en/catalog" : "/catalog"}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#D9D1C5] hover:border-[#1F1C18] hover:bg-[#1F1C18] hover:text-white text-xs sm:text-sm font-medium text-[#1F1C18] transition-all self-end sm:self-auto group whitespace-nowrap shadow-xs"
        >
          <span>{lang === "ka" ? `სრული კოლექცია (${products.length})` : `Explore All (${products.length})`}</span>
          <ArrowRight className="w-4 h-4 stroke-[1.75] group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      {showcaseProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#EAE4DB] text-[#787168]">
          <p className="font-serif text-xl">{lang === "ka" ? "სამკაულები მალე დაემატება." : "Jewelry pieces coming soon."}</p>
        </div>
      ) : (
        <div className={`-mx-4 px-4 sm:mx-0 sm:px-0 flex xl:grid ${desktopGridClass} gap-4 sm:gap-5 overflow-x-auto xl:overflow-x-visible pb-4 xl:pb-0 snap-x snap-mandatory scrollbar-none`}>
          {showcaseProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={openProductModal}
              className="shrink-0 xl:shrink w-[64vw] min-w-[210px] max-w-[260px] sm:w-[250px] sm:min-w-[250px] sm:max-w-none xl:w-auto xl:min-w-0 snap-start"
              showDetailsButton={true}
            />
          ))}
        </div>
      )}
    </section>
  );
}

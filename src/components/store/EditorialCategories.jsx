import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

const FALLBACK_CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80",
];

export default function EditorialCategories() {
  const { lang, products = [], siteSettings = {} } = useStore();
  const rawCats = siteSettings.categories || ["ბეჭდები", "ყელსაბამები", "საყურეები", "სამაჯურები"];
  const populatedCats = rawCats.filter((c) => products.some((p) => p.category === c));
  const categories = (populatedCats.length > 0 ? populatedCats : rawCats).slice(0, 4);
  const prefix = lang === "en" ? "/en" : "";

  if (categories.length === 0) return null;

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
      <div className="flex items-end justify-between mb-6 sm:mb-8">
        <div>
          <span className="text-xs font-medium text-[#9A7742] block mb-1">
            {lang === "ka" ? "კატეგორიები" : "Shop By Category"}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1F1C18]">
            {lang === "ka" ? "შეარჩიეთ სტილის მიხედვით" : "Curated Silhouettes"}
          </h2>
        </div>
      </div>

      <div className={`grid gap-4 sm:gap-5 ${
        categories.length === 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"
      }`}>
        {categories.map((cat, idx) => {
          const matchingProd = products.find((p) => p.category === cat && p.images?.[0]);
          const count = products.filter((p) => p.category === cat).length;
          const imgUrl = matchingProd?.images?.[0] || FALLBACK_CATEGORY_IMAGES[idx % FALLBACK_CATEGORY_IMAGES.length];

          return (
            <a
              key={cat}
              href={`${prefix}/catalog?category=${encodeURIComponent(cat)}`}
              className="group block rounded-2xl overflow-hidden bg-white border border-[#EAE4DB] shadow-[0_2px_14px_rgba(31,28,24,0.04)] hover:shadow-[0_10px_28px_rgba(31,28,24,0.09)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F2EDE4]">
                <img
                  src={getOptimizedImageUrl(imgUrl, 600, 75)}
                  alt={cat}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { e.currentTarget.src = FALLBACK_CATEGORY_IMAGES[idx % FALLBACK_CATEGORY_IMAGES.length]; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

                {/* Elegant Top-Right Corner Arrow Action Pill */}
                <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 text-[#1F1C18] flex items-center justify-center group-hover:bg-[#1F1C18] group-hover:text-white transition-colors shrink-0 shadow-xs z-10">
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.75]" />
                </span>

                {/* Full-Width Uncramped Category Labeling */}
                <div className="absolute bottom-2.5 sm:bottom-3.5 left-3 sm:left-4 right-3 sm:right-4 text-white z-10">
                  <span className="text-[10px] sm:text-[11px] opacity-90 block">
                    {count > 0 ? `${count} ${lang === "ka" ? "მოდელი" : "Pieces"}` : (lang === "ka" ? "კოლექცია" : "Collection")}
                  </span>
                  <h3 className="font-serif text-base sm:text-xl font-medium leading-tight mt-0.5 truncate" title={cat}>
                    {cat}
                  </h3>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

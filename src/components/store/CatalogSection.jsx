import React, { useState } from 'react';
import { Search, Gem, SlidersHorizontal, Heart, Eye } from 'lucide-react';
import { ALL } from '../../constants';
import { pick } from '../../utils/i18n';
import { useStore } from '../../context/StoreContext';
import { getOptimizedImageUrl, getUnsplashSrcSet } from '../../utils/imageUtils';

export default function CatalogSection({ openProductModal }) {
  const { darkMode, lang, siteSettings, products, favorites, toggleFavorite } = useStore();

  const [selectedCategory, setSelectedCategory] = useState(ALL);
  const [selectedMetal, setSelectedMetal] = useState(ALL);
  const [onlyExclusive, setOnlyExclusive] = useState(false);
  const [onlyOnSale, setOnlyOnSale] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((item) => {
    const matchesCat = selectedCategory === ALL || item.category === selectedCategory;
    const matchesMetal = selectedMetal === ALL || item.metal === selectedMetal;
    const matchesExcl = !onlyExclusive || item.exclusive;
    const matchesSale = !onlyOnSale || (item.oldPrice && item.oldPrice.trim() !== "");
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.nameEn?.toLowerCase().includes(q) ||
      item.sku?.toLowerCase().includes(q) ||
      item.stones?.toLowerCase().includes(q);
    return matchesCat && matchesMetal && matchesExcl && matchesSale && matchesSearch;
  });

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-amber-500 block mb-2">
            {lang === "ka" ? "საიუველირო ვიტრინა" : "Fine Jewelry Showcase"}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl">
            {lang === "ka" ? "ჩვენი კოლექცია" : "Our Collection"}
          </h2>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "ka" ? "ძიება სახელით ან კოდით (AUR-101)..." : "Search by name or SKU..."}
            className={`w-full pl-11 pr-4 py-3 rounded-full text-sm border outline-none transition-all ${
              darkMode
                ? "bg-stone-900/90 border-stone-800 focus:border-amber-500 text-white"
                : "bg-white border-stone-200 focus:border-amber-600 text-stone-900"
            }`}
          />
        </div>
      </div>

      {/* ფილტრები */}
      <div className={`p-5 rounded-3xl border mb-10 space-y-4 ${darkMode ? "bg-stone-900/50 border-stone-800/80" : "bg-white border-stone-200 shadow-sm"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider opacity-60 mr-2 flex items-center gap-1">
            <Gem className="w-3.5 h-3.5 text-amber-500" />
            {lang === "ka" ? "კატეგორია:" : "Category:"}
          </span>
          {[ALL, ...(siteSettings.categories || [])].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : darkMode
                  ? "bg-stone-800/80 text-stone-300 hover:bg-stone-800"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {cat === ALL && lang === "en" ? "All" : cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-500/15">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider opacity-60 mr-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              {lang === "ka" ? "მეტალი:" : "Metal:"}
            </span>
            {[ALL, ...(siteSettings.metals || [])].map((metal) => (
              <button
                key={metal}
                onClick={() => setSelectedMetal(metal)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all border ${
                  selectedMetal === metal
                    ? "border-amber-500 bg-amber-500/15 text-amber-400 font-medium"
                    : darkMode
                    ? "border-stone-800 text-stone-400 hover:border-stone-700"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                {metal === ALL && lang === "en" ? "All" : metal}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={onlyExclusive}
                onChange={(e) => setOnlyExclusive(e.target.checked)}
                className="accent-amber-500 w-4 h-4 rounded"
              />
              <span className="text-amber-500 font-medium">
                {lang === "ka" ? "ექსკლუზიური მოდელები" : "Exclusive pieces only"}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={onlyOnSale}
                onChange={(e) => setOnlyOnSale(e.target.checked)}
                className="accent-amber-500 w-4 h-4 rounded"
              />
              <span className="text-amber-500 font-medium">
                {lang === "ka" ? "ფასდაკლებები" : "On Sale only"}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* პროდუქტების ბადე */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 opacity-60">
          <p className="text-lg">{lang === "ka" ? "არჩეული ფილტრით სამკაული ვერ მოიძებნა." : "No jewelry found matching your criteria."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {filteredProducts.map((product) => {
            const mainImg = product.images?.[0] || product.image || "https://via.placeholder.com/600";
            return (
              <div
                key={product.id}
                className={`group rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col ${
                  darkMode
                    ? "bg-[#141210] border-stone-800/80 hover:border-amber-500/40"
                    : "bg-white border-stone-200/90 hover:border-amber-500 shadow-sm hover:shadow-xl"
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-stone-900">
                  <img
                    src={getOptimizedImageUrl(mainImg, 400, 70)}
                    srcSet={getUnsplashSrcSet(mainImg)}
                    sizes="(max-width: 640px) 360px, (max-width: 1024px) 300px, 280px"
                    alt={product.name}
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
                    {product.oldPrice && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-red-600/90 text-white backdrop-blur-md shadow-md">
                        {lang === "ka" ? "ფასდაკლება" : "Sale"}
                      </span>
                    )}
                  </div>
                  {product.images?.length > 1 && (
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] bg-black/70 text-white backdrop-blur-sm">
                      +{product.images.length} {lang === "ka" ? "ფოტო" : "photos"}
                    </span>
                  )}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-black transition-all"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] opacity-60 mb-1">
                      <span>{product.category}</span>
                      <span>{product.sku}</span>
                    </div>
                    <h3
                      onClick={() => openProductModal(product)}
                      className="font-serif text-xl font-medium cursor-pointer hover:text-amber-500 transition-colors"
                    >
                      {pick(product, "name", lang)}
                    </h3>
                    <p className="text-xs opacity-70 mt-1">
                      {product.metal} • {product.karat}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-500/15 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      {product.oldPrice && (
                        <span className="text-xs line-through opacity-50 font-normal">
                          {product.oldPrice}
                        </span>
                      )}
                      <span className="font-serif text-xl text-amber-500 font-semibold leading-tight">
                        {product.price}
                      </span>
                    </div>
                    <button
                      onClick={() => openProductModal(product)}
                      className="px-4 py-2 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {lang === "ka" ? "დეტალურად" : "Details"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

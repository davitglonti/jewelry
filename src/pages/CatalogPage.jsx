import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Gem, SlidersHorizontal, Heart, Eye, ArrowUpDown,
  X, Sparkles, Filter, ChevronRight, Home, ArrowLeftRight, PlusCircle
} from 'lucide-react';
import { ALL } from '../constants';
import { pick, formatPrice, calculateDiscountPercent } from '../utils/i18n';
import { useStore } from '../context/StoreContext';
import { getOptimizedImageUrl, getProductCardSrcSet } from '../utils/imageUtils';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FavoritesModal from '../components/modals/FavoritesModal';
import ProductCard from '../components/store/ProductCard';

export default function CatalogPage() {
  const {
    darkMode, setDarkMode,
    lang, setLang,
    siteSettings,
    products,
    favorites, toggleFavorite,
    compareList, toggleCompare
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  // Initialize from URL query params (e.g. ?category=ბეჭდები)
  const initialParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const [selectedCategory, setSelectedCategory] = useState(initialParams.get("category") || ALL);
  const [selectedMetal, setSelectedMetal] = useState(initialParams.get("metal") || ALL);
  const [onlyExclusive, setOnlyExclusive] = useState(initialParams.get("exclusive") === "true");
  const [onlyOnSale, setOnlyOnSale] = useState(initialParams.get("sale") === "true");
  const [searchQuery, setSearchQuery] = useState(initialParams.get("q") || "");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "price-asc", "price-desc"

  // მობილურის ბადის ხედი: 3 სვეტი (ნაგულისხმევი, მინიმალური სქროლვისთვის) ან 2 სვეტი
  const [mobileCols, setMobileCols] = useState(() => {
    try {
      const saved = localStorage.getItem("aurelia_catalog_cols");
      return saved ? Number(saved) : 3;
    } catch {
      return 3;
    }
  });

  const handleMobileColsChange = (cols) => {
    setMobileCols(cols);
    try {
      localStorage.setItem("aurelia_catalog_cols", String(cols));
    } catch {}
  };

  // Update document title & CollectionPage Schema
  useEffect(() => {
    const brand = siteSettings.brandName || "AURELIA";
    const title = lang === "ka"
      ? `საიუველირო კოლექცია & კატალოგი — ${brand}`
      : `Fine Jewelry Collection & Catalog — ${brand}`;
    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    const oldDesc = metaDesc?.getAttribute("content");
    const catalogDesc = lang === "ka"
      ? `${brand}-ს საიუველირო კატალოგი: ექსკლუზიური ოქროს ბეჭდები, საყურეები, ყელსაბამები და სამაჯურები ბრილიანტებით.`
      : `${brand} Jewelry Catalog: Exclusive gold rings, earrings, necklaces, and diamond bracelets.`;
    if (metaDesc) metaDesc.setAttribute("content", catalogDesc);

    // Schema.org CollectionPage
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": catalogDesc,
      "url": "https://www.matare.store/catalog",
      "isPartOf": {
        "@type": "WebSite",
        "name": brand,
        "url": "https://www.matare.store"
      }
    };

    let script = document.getElementById("catalog-schema-ld");
    if (!script) {
      script = document.createElement("script");
      script.id = "catalog-schema-ld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaData);

    return () => {
      document.title = `${brand} — საიუველირო სახლი`;
      if (metaDesc && oldDesc) metaDesc.setAttribute("content", oldDesc);
      const el = document.getElementById("catalog-schema-ld");
      if (el) el.remove();
    };
  }, [lang, siteSettings.brandName]);

  // Sync category or search with URL without full page reload
  const updateFilterParam = (key, val) => {
    const url = new URL(window.location.href);
    if (!val || val === ALL || val === false) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(val));
    }
    window.history.replaceState({}, "", url.pathname + url.search);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    updateFilterParam("category", cat);
  };

  const handleMetalChange = (metal) => {
    setSelectedMetal(metal);
    updateFilterParam("metal", metal);
  };

  // Helper to parse price number for sorting
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const cleaned = priceStr.toString().replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { [ALL]: products.length };
    (siteSettings.categories || []).forEach((c) => {
      counts[c] = products.filter((p) => p.category === c).length;
    });
    return counts;
  }, [products, siteSettings.categories]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter((item) => {
      const matchesCat = selectedCategory === ALL || item.category === selectedCategory;
      const matchesMetal = selectedMetal === ALL || item.metal === selectedMetal;
      const matchesExcl = !onlyExclusive || item.exclusive;
      const matchesSale = !onlyOnSale || (() => {
      if (!item.oldPrice || !item.oldPrice.trim()) return false;
      const p1 = parseFloat(item.price?.toString().replace(/,/g, '').replace(/[^\d.]/g, ''));
      const p2 = parseFloat(item.oldPrice?.toString().replace(/,/g, '').replace(/[^\d.]/g, ''));
      return isNaN(p1) || isNaN(p2) ? true : p2 > p1;
    })();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.nameEn?.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q) ||
        item.stones?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.metal?.toLowerCase().includes(q);
      return matchesCat && matchesMetal && matchesExcl && matchesSale && matchesSearch;
    });

    if (sortBy === "price-asc") {
      result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else {
      // Default: newest (by createdAt or id)
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return result;
  }, [products, selectedCategory, selectedMetal, onlyExclusive, onlyOnSale, searchQuery, sortBy]);

  const openProduct = (item) => {
    const code = item.sku || item.id;
    window.location.href = `/product/${encodeURIComponent(code)}`;
  };

  const hasActiveFilters =
    selectedCategory !== ALL ||
    selectedMetal !== ALL ||
    onlyExclusive ||
    onlyOnSale ||
    searchQuery.trim() !== "";

  const resetFilters = () => {
    setSelectedCategory(ALL);
    setSelectedMetal(ALL);
    setOnlyExclusive(false);
    setOnlyOnSale(false);
    setSearchQuery("");
    window.history.replaceState({}, "", window.location.pathname);
  };

  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${
        darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#faf7f2] text-[#1c1917]"
      }`}
    >
      <Navbar
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        favorites={favorites}
        setShowFavoritesModal={setShowFavoritesModal}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main id="main-content" className="pt-28 sm:pt-32 pb-24">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumbs"
            className="flex items-center gap-2 text-xs opacity-60 mb-6"
          >
            <a href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>{lang === "ka" ? "მთავარი" : "Home"}</span>
            </a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-500 font-medium">
              {lang === "ka" ? "კოლექცია" : "Collection"}
            </span>
          </nav>

          {/* Page Hero Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-500/15 mb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs uppercase tracking-widest font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === "ka" ? "საიუველირო კოლექცია" : "Fine Jewelry Collection"}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-normal tracking-wide">
                {lang === "ka" ? "სრული კატალოგი" : "All Creations"}
              </h1>
              <p className="text-xs sm:text-sm opacity-70 max-w-xl leading-relaxed">
                {lang === "ka"
                  ? "ხელნაკეთი სამკაულები უმაღლესი სინჯის ოქროთი და სერტიფიცირებული ბრილიანტებით."
                  : "Handcrafted fine jewelry in verified gold purity and certified diamonds."}
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  updateFilterParam("q", e.target.value);
                }}
                placeholder={lang === "ka" ? "ძიება სახელით ან კოდით (AUR-101)..." : "Search by name or SKU..."}
                className={`w-full pl-11 pr-10 py-3 rounded-full text-xs sm:text-sm border outline-none transition-all ${
                  darkMode
                    ? "bg-stone-900 border-stone-800 focus:border-amber-500 text-white"
                    : "bg-white border-stone-200 focus:border-amber-500 text-stone-900 shadow-sm"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    updateFilterParam("q", "");
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* FILTER PANEL */}
          <div
            className={`p-5 sm:p-6 rounded-3xl border mb-10 space-y-4 ${
              darkMode ? "bg-stone-900/40 border-stone-800" : "bg-white border-stone-200 shadow-sm"
            }`}
          >
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider opacity-60 mr-2 flex items-center gap-1.5 shrink-0">
                <Gem className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === "ka" ? "კატეგორია:" : "Category:"}</span>
              </span>
              {[ALL, ...(siteSettings.categories || [])].map((cat) => {
                const count = categoryCounts[cat] ?? 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 font-semibold"
                        : darkMode
                        ? "bg-stone-800/80 text-stone-300 hover:bg-stone-800"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    <span>{cat === ALL ? (lang === "ka" ? "ყველა" : "All") : cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-black/20 text-black" : "opacity-60"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Metal & Toggles & Sorting */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-500/15 text-xs">
              {/* Metal Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider opacity-60 mr-2 flex items-center gap-1.5 shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === "ka" ? "მეტალი:" : "Metal:"}</span>
                </span>
                {[ALL, ...(siteSettings.metals || [])].map((metal) => {
                  const isSelected = selectedMetal === metal;
                  return (
                    <button
                      key={metal}
                      type="button"
                      onClick={() => handleMetalChange(metal)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/15 text-amber-400 font-medium"
                          : darkMode
                          ? "border-stone-800 text-stone-400 hover:border-stone-700"
                          : "border-stone-200 text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      {metal === ALL ? (lang === "ka" ? "ყველა" : "All") : metal}
                    </button>
                  );
                })}
              </div>

              {/* Toggles + Sorting */}
              <div className="flex flex-wrap items-center gap-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyExclusive}
                    onChange={(e) => {
                      setOnlyExclusive(e.target.checked);
                      updateFilterParam("exclusive", e.target.checked);
                    }}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span className="text-amber-500 font-medium">
                    {lang === "ka" ? "ექსკლუზივი" : "Exclusive"}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyOnSale}
                    onChange={(e) => {
                      setOnlyOnSale(e.target.checked);
                      updateFilterParam("sale", e.target.checked);
                    }}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span className="text-red-400 font-medium">
                    {lang === "ka" ? "ფასდაკლება" : "On Sale"}
                  </span>
                </label>

                {/* Sorter */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`p-2 rounded-xl border outline-none text-xs cursor-pointer ${
                      darkMode ? "bg-stone-800 border-stone-700 text-white" : "bg-white border-stone-300 text-stone-900"
                    }`}
                  >
                    <option value="newest">{lang === "ka" ? "უახლესი პირველად" : "Newest first"}</option>
                    <option value="price-asc">{lang === "ka" ? "ფასი: ზრდადობით" : "Price: Low to High"}</option>
                    <option value="price-desc">{lang === "ka" ? "ფასი: კლებადობით" : "Price: High to Low"}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active filters status / Clear all */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t border-stone-500/10 text-xs">
                <span className="opacity-70">
                  {lang === "ka" ? `მოიძებნა ${filteredProducts.length} სამკაული` : `Found ${filteredProducts.length} pieces`}
                </span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-amber-500 hover:underline flex items-center gap-1 font-medium"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{lang === "ka" ? "ფილტრების გასუფთავება" : "Clear filters"}</span>
                </button>
              </div>
            )}
          </div>

          {/* PRODUCTS GRID */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Gem className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl">
                {lang === "ka" ? "არჩეული ფილტრით სამკაული ვერ მოიძებნა" : "No jewelry matches your search"}
              </h3>
              <p className="text-xs sm:text-sm opacity-60 max-w-md mx-auto">
                {lang === "ka"
                  ? "სცადეთ სხვა კატეგორიის არჩევა ან გაასუფთავეთ ფილტრები."
                  : "Try selecting a different category or clearing active filters."}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-amber-500 text-black font-semibold text-xs hover:brightness-110 transition-all shadow-md"
              >
                {lang === "ka" ? "ყველა სამკაულის ნახვა" : "View all pieces"}
              </button>
            </div>
          ) : (
            <div>
              {/* Toolbar: Counter on Left & Mobile Columns Switcher (2 vs 3) on Right */}
              <div className="flex items-center justify-between mb-3.5 px-1 text-xs">
                <span className="opacity-70 font-medium text-[11px] sm:text-xs">
                  {lang === "ka" ? `სულ: ${filteredProducts.length} სამკაული` : `Total: ${filteredProducts.length} pieces`}
                </span>

                {/* Mobile View Switcher (2 vs 3 columns) */}
                <div className="flex sm:hidden items-center gap-1 bg-stone-500/10 p-0.5 rounded-xl border border-stone-500/20">
                  <span className="text-[10px] opacity-60 px-1 font-medium">{lang === "ka" ? "ხედი:" : "View:"}</span>
                  <button
                    type="button"
                    onClick={() => handleMobileColsChange(2)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                      mobileCols === 2
                        ? "bg-amber-500 text-black shadow-xs"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    title="2 სვეტი"
                  >
                    <span>2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMobileColsChange(3)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                      mobileCols === 3
                        ? "bg-amber-500 text-black shadow-xs"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    title="3 სვეტი"
                  >
                    <span>3</span>
                  </button>
                </div>
              </div>

              {/* Responsive Grid */}
              <div className={`grid gap-2 sm:gap-4 xl:gap-5 ${
                mobileCols === 3
                  ? "grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5"
                  : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5"
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={openProduct}
                    compact={mobileCols === 3}
                    showDetailsButton={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={(item) => openProduct(item)}
      />
    </div>
  );
}

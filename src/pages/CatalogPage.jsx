import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Gem, ArrowUpDown, X, ChevronRight, Home
} from 'lucide-react';
import { ALL } from '../constants';
import { useStore } from '../context/StoreContext';
import { navigateTo } from '../utils/navigation';
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
    favorites
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const initialParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const [selectedCategory, setSelectedCategory] = useState(initialParams.get("category") || ALL);
  const [selectedMetal, setSelectedMetal] = useState(initialParams.get("metal") || ALL);
  const [onlyExclusive, setOnlyExclusive] = useState(initialParams.get("exclusive") === "true");
  const [onlyOnSale, setOnlyOnSale] = useState(initialParams.get("sale") === "true");
  const [searchQuery, setSearchQuery] = useState(initialParams.get("q") || "");
  const [sortBy, setSortBy] = useState(initialParams.get("sort") || "newest");
  const [popularityMap, setPopularityMap] = useState({});

  useEffect(() => {
    let isMounted = true;
    fetch('/api/product-popularity')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.popularity) {
          setPopularityMap(data.popularity);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const [mobileCols, setMobileCols] = useState(() => {
    try {
      const saved = localStorage.getItem("aurelia_catalog_cols");
      return saved ? Number(saved) : 2;
    } catch {
      return 2;
    }
  });

  const handleMobileColsChange = (cols) => {
    setMobileCols(cols);
    try {
      localStorage.setItem("aurelia_catalog_cols", String(cols));
    } catch {}
  };

  useEffect(() => {
    const brand = siteSettings.brandName || "მატარე";
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

    return () => {
      document.title = `${brand} — საიუველირო სახლი`;
      if (metaDesc && oldDesc) metaDesc.setAttribute("content", oldDesc);
    };
  }, [lang, siteSettings.brandName]);

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

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const cleaned = priceStr.toString().replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  };

  const categoryCounts = useMemo(() => {
    const counts = { [ALL]: products.length };
    (siteSettings.categories || []).forEach((c) => {
      counts[c] = products.filter((p) => p.category === c).length;
    });
    return counts;
  }, [products, siteSettings.categories]);

  // Only show categories that actually have items (or are currently selected) to avoid 0-count clutter
  const visibleCategories = useMemo(() => {
    const cats = (siteSettings.categories || []).filter(
      (c) => (categoryCounts[c] || 0) > 0 || selectedCategory === c
    );
    return [ALL, ...cats];
  }, [siteSettings.categories, categoryCounts, selectedCategory]);

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

    if (sortBy === "popular") {
      result.sort((a, b) => {
        const viewsA = Number(popularityMap[a.id] ?? popularityMap[a.sku] ?? popularityMap[a.sku?.toLowerCase()] ?? 0);
        const viewsB = Number(popularityMap[b.id] ?? popularityMap[b.sku] ?? popularityMap[b.sku?.toLowerCase()] ?? 0);
        if (viewsB !== viewsA) return viewsB - viewsA;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else {
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return result;
  }, [products, selectedCategory, selectedMetal, onlyExclusive, onlyOnSale, searchQuery, sortBy, popularityMap]);

  const openProduct = (item) => {
    const code = item.sku || item.id;
    const prefix = lang === "en" ? "/en" : "";
    navigateTo(`${prefix}/product/${encodeURIComponent(code)}`);
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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FAF8F4] text-[#1F1C18]">
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

      <main id="main-content" className="pt-[118px] sm:pt-[128px] pb-20">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-[#787168] mb-5">
            <a href={lang === "en" ? "/en" : "/"} className="hover:text-[#1F1C18] transition-colors flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>{lang === "ka" ? "მთავარი" : "Home"}</span>
            </a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1F1C18] font-medium">
              {lang === "ka" ? "კოლექცია" : "Collection"}
            </span>
          </nav>

          {/* Compact Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[#9A7742] block">
                {lang === "ka" ? "საიუველირო კოლექცია" : "Fine Jewelry Collection"}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#1F1C18]">
                {lang === "ka" ? "სრული კატალოგი" : "All Creations"}
              </h1>
              <p className="text-sm text-[#5C564E] max-w-xl">
                {lang === "ka"
                  ? "ხელნაკეთი სამკაულები უმაღლესი სინჯის ოქროთი და სერტიფიცირებული ბრილიანტებით."
                  : "Handcrafted fine jewelry in verified gold purity and certified diamonds."}
              </p>
            </div>
          </div>

          {/* Unified Tactile White Filter & Search Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE4DB] shadow-[0_2px_16px_rgba(31,28,24,0.04)] mb-8 space-y-4">
            {/* Row 1: Category Pills + Search Pill */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
              <div className="flex flex-wrap items-center gap-2">
                {visibleCategories.map((cat) => {
                  const count = categoryCounts[cat] ?? 0;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#1F1C18] text-white shadow-xs"
                          : "bg-[#FAF8F4] text-[#4A453E] border border-[#EAE4DB] hover:border-[#9A7742] hover:text-[#1F1C18]"
                      }`}
                    >
                      <span>{cat === ALL ? (lang === "ka" ? "ყველა" : "All") : cat}</span>
                      <span className={`text-[11px] font-mono ${isSelected ? "text-[#D9C096]" : "text-[#8A8278]"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full lg:w-72 shrink-0">
                <Search className="w-4 h-4 text-[#8A8278] stroke-[1.75] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    updateFilterParam("q", e.target.value);
                  }}
                  placeholder={lang === "ka" ? "ძიება სახელით ან კოდით..." : "Search by name or SKU..."}
                  className="w-full pl-10 pr-9 py-2.5 rounded-full text-xs sm:text-sm bg-[#FAF8F4] border border-[#EAE4DB] focus:bg-white focus:border-[#1F1C18] outline-none text-[#1F1C18] placeholder:text-[#8A8278] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      updateFilterParam("q", "");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787168] hover:text-[#1F1C18] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Metal Pills, Toggles & Sort */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-[#F3EFE8] text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-[#787168] font-medium mr-1">
                  {lang === "ka" ? "მეტალი:" : "Metal:"}
                </span>
                {[ALL, ...(siteSettings.metals || [])].map((metal) => {
                  const isSelected = selectedMetal === metal;
                  return (
                    <button
                      key={metal}
                      type="button"
                      onClick={() => handleMetalChange(metal)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#F5EFE4] text-[#8A6836] font-semibold border border-[#E2D4BC]"
                          : "text-[#5C564E] hover:bg-[#FAF8F4] hover:text-[#1F1C18]"
                      }`}
                    >
                      {metal === ALL ? (lang === "ka" ? "ყველა" : "All") : metal}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#4A453E] hover:text-[#1F1C18]">
                  <input
                    type="checkbox"
                    checked={onlyExclusive}
                    onChange={(e) => {
                      setOnlyExclusive(e.target.checked);
                      updateFilterParam("exclusive", e.target.checked);
                    }}
                    className="accent-[#1F1C18] w-3.5 h-3.5 rounded"
                  />
                  <span>{lang === "ka" ? "ექსკლუზივი" : "Exclusive"}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#9E2A2B]">
                  <input
                    type="checkbox"
                    checked={onlyOnSale}
                    onChange={(e) => {
                      setOnlyOnSale(e.target.checked);
                      updateFilterParam("sale", e.target.checked);
                    }}
                    className="accent-[#9E2A2B] w-3.5 h-3.5 rounded"
                  />
                  <span>{lang === "ka" ? "ფასდაკლება" : "On Sale"}</span>
                </label>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#9A7742]" />
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      updateFilterParam("sort", e.target.value === "newest" ? null : e.target.value);
                    }}
                    className="py-1.5 px-3 rounded-full border border-[#EAE4DB] bg-[#FAF8F4] text-[#1F1C18] outline-none text-xs font-medium cursor-pointer focus:border-[#1F1C18]"
                  >
                    <option value="newest">{lang === "ka" ? "უახლესი პირველად" : "Newest first"}</option>
                    <option value="popular">{lang === "ka" ? "პოპულარობით" : "Most popular"}</option>
                    <option value="price-asc">{lang === "ka" ? "ფასი: ზრდადობით" : "Price: Low to High"}</option>
                    <option value="price-desc">{lang === "ka" ? "ფასი: კლებადობით" : "Price: High to Low"}</option>
                  </select>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-3 border-t border-[#F3EFE8] text-xs">
                <span className="text-[#5C564E] font-medium">
                  {lang === "ka" ? `მოიძებნა ${filteredProducts.length} სამკაული` : `Found ${filteredProducts.length} pieces`}
                </span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[#9E2A2B] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{lang === "ka" ? "ფილტრების გასუფთავება" : "Clear filters"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 space-y-4 bg-white rounded-2xl border border-[#EAE4DB]">
              <Gem className="w-8 h-8 text-[#9A7742] mx-auto stroke-[1.5]" />
              <h3 className="font-serif text-2xl font-medium text-[#1F1C18]">
                {lang === "ka" ? "არჩეული ფილტრით სამკაული ვერ მოიძებნა" : "No jewelry matches your search"}
              </h3>
              <p className="text-sm text-[#5C564E] max-w-md mx-auto">
                {lang === "ka"
                  ? "სცადეთ სხვა კატეგორიის არჩევა ან გაასუფთავეთ ფილტრები."
                  : "Try selecting a different category or clearing active filters."}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-[#1F1C18] text-white text-xs font-medium hover:bg-[#35302A] transition-colors cursor-pointer"
              >
                {lang === "ka" ? "ყველა სამკაულის ნახვა" : "View all pieces"}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4 text-xs text-[#6B645B]">
                <span className="font-medium">
                  {lang === "ka" ? `სულ: ${filteredProducts.length} სამკაული` : `Showing ${filteredProducts.length} pieces`}
                </span>

                <div className="flex sm:hidden items-center gap-1 bg-white rounded-full border border-[#EAE4DB] p-0.5">
                  <button
                    type="button"
                    onClick={() => handleMobileColsChange(2)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mobileCols === 2 ? "bg-[#1F1C18] text-white" : "text-[#787168]"
                    }`}
                  >
                    2
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMobileColsChange(3)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mobileCols === 3 ? "bg-[#1F1C18] text-white" : "text-[#787168]"
                    }`}
                  >
                    3
                  </button>
                </div>
              </div>

              <div className={`grid gap-4 sm:gap-5 ${
                mobileCols === 3
                  ? "grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
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

      <Footer lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={(item) => openProduct(item)}
      />
    </div>
  );
}

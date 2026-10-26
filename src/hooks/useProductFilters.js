import { useState, useMemo } from 'react';

export const ALL = "all";

export const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  const cleaned = priceStr.toString().replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
};

export function useProductFilters(products = [], categories = []) {
  const initialParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

  const [selectedCategory, setSelectedCategory] = useState(initialParams.get("category") || ALL);
  const [selectedMetal, setSelectedMetal] = useState(initialParams.get("metal") || ALL);
  const [onlyExclusive, setOnlyExclusive] = useState(initialParams.get("exclusive") === "true");
  const [onlyOnSale, setOnlyOnSale] = useState(initialParams.get("sale") === "true");
  const [searchQuery, setSearchQuery] = useState(initialParams.get("q") || "");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "price-asc", "price-desc"

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { [ALL]: products.length };
    (categories || []).forEach((c) => {
      counts[c] = products.filter((p) => p.category === c).length;
    });
    return counts;
  }, [products, categories]);

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
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  return {
    selectedCategory, setSelectedCategory,
    selectedMetal, setSelectedMetal,
    onlyExclusive, setOnlyExclusive,
    onlyOnSale, setOnlyOnSale,
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    categoryCounts,
    filteredProducts,
    hasActiveFilters,
    resetFilters
  };
}

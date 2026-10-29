import React, { useState, useMemo } from 'react';
import { X, Trash2, ArrowUpDown, Filter, Sparkles, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/i18n';

export default function FavoritesModal({ isOpen, onClose, onSelectProduct }) {
  const { darkMode, lang, products, favorites, toggleFavorite, compareList, toggleCompare } = useStore();
  const { user } = useAuth();

  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-desc' | 'price-asc' | 'name'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter & sort favorite products
  const favoriteProducts = useMemo(() => {
    let list = (products || []).filter((p) => favorites?.includes(p.id));

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Sorting
    return [...list].sort((a, b) => {
      const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price || '0').replace(/[^0-9.]/g, '')) || 0;
      const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price || '0').replace(/[^0-9.]/g, '')) || 0;

      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      // newest
      return 0;
    });
  }, [products, favorites, sortBy, selectedCategory]);

  const categories = useMemo(() => {
    const allFavs = (products || []).filter((p) => favorites?.includes(p.id));
    const cats = new Set(allFavs.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products, favorites]);

  const totalValue = useMemo(() => {
    return favoriteProducts.reduce((sum, item) => {
      const p = typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0;
      return sum + p;
    }, 0);
  }, [favoriteProducts]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="favorites-modal-title"
    >
      <div className={`w-full max-w-2xl rounded-3xl border p-5 sm:p-6 transition-all ${
        darkMode ? "bg-[#141210] border-stone-800 text-white shadow-2xl shadow-black/80" : "bg-white border-stone-200 text-stone-900 shadow-xl"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-500/20">
          <div className="flex items-center gap-2.5">
            <h3 id="favorites-modal-title" className="font-serif text-xl sm:text-2xl font-medium">
              {lang === "ka" ? "რჩეული სამკაულები" : "Saved Jewelry"}
            </h3>
            {favorites?.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-black">
                {favorites.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === "ka" ? "ფანჯრის დახურვა" : "Close modal"}
            className="p-2 rounded-full hover:bg-stone-500/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: დალაგება & ფილტრაცია (მხოლოდ რეგისტრირებულ მომხმარებელს) */}
        {favorites?.length > 1 && (
          <div className="pt-3 pb-2 flex flex-wrap items-center justify-between gap-2.5 border-b border-stone-500/15">
            {/* დალაგების მენიუ */}
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="opacity-70 font-medium">{lang === 'ka' ? 'დალაგება:' : 'Sort:'}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`py-1 px-2.5 rounded-xl border text-xs outline-none cursor-pointer transition-all ${
                  darkMode ? 'bg-stone-900 border-stone-700 text-stone-200' : 'bg-stone-100 border-stone-300 text-stone-800'
                }`}
              >
                <option value="newest">{lang === 'ka' ? 'უახლესი' : 'Newest'}</option>
                <option value="price-desc">{lang === 'ka' ? 'ფასი: კლებადი ↓' : 'Price: High to Low'}</option>
                <option value="price-asc">{lang === 'ka' ? 'ფასი: ზრდადი ↑' : 'Price: Low to High'}</option>
                <option value="name">{lang === 'ka' ? 'დასახელებით (A-Z)' : 'Name (A-Z)'}</option>
              </select>
            </div>

            {/* კატეგორიების ფილტრი (თუ 1-ზე მეტია) */}
            {categories.length > 2 && (
              <div className="flex items-center gap-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-black font-semibold'
                        : darkMode
                        ? 'bg-stone-900 text-stone-400 hover:text-white'
                        : 'bg-stone-100 text-stone-600 hover:text-black'
                    }`}
                  >
                    {cat === 'all' ? (lang === 'ka' ? 'ყველა' : 'All') : cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites List */}
        <div className="py-4 max-h-96 overflow-y-auto space-y-3">
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="opacity-60 text-sm">
                {lang === "ka" ? "რჩეულების სია ცარიელია." : "No saved items yet."}
              </p>
              <p className="text-xs text-amber-500/80">
                {lang === "ka" ? "დააჭირეთ გულის ხატულას კატალოგში ნივთის დასამატებლად" : "Click the heart icon on any jewelry piece to save it"}
              </p>
            </div>
          ) : (
            favoriteProducts.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                  darkMode ? 'border-stone-800 bg-stone-900/40 hover:border-amber-500/30' : 'border-stone-200 bg-stone-50/60 hover:border-amber-400'
                }`}
              >
                <div
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => {
                    onClose();
                    onSelectProduct(item);
                  }}
                >
                  <img
                    src={item.images?.[0] || item.image || "/brand-logo.jpg"}
                    alt={item.name || "სამკაული"}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-500/20"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-serif font-medium truncate text-sm sm:text-base">{item.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.oldPrice && (
                        <span className="text-xs line-through opacity-50">{formatPrice(item.oldPrice)}</span>
                      )}
                      <span className="text-xs sm:text-sm text-amber-500 font-semibold">{formatPrice(item.price)}</span>
                      {item.category && (
                        <span className="text-[10px] opacity-60 uppercase font-mono px-1.5 py-0.5 rounded bg-stone-500/10">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* შედარებაში დამატება */}
                  <button
                    type="button"
                    onClick={() => toggleCompare(item.id)}
                    title={lang === 'ka' ? 'შედარების სიაში დამატება' : 'Compare'}
                    className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                      compareList?.includes(item.id)
                        ? 'bg-amber-500 text-black border-amber-500'
                        : darkMode
                        ? 'border-stone-700 bg-stone-800 text-stone-300 hover:text-amber-400'
                        : 'border-stone-200 bg-stone-100 text-stone-700 hover:text-amber-600'
                    }`}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectProduct(item);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-semibold hover:brightness-110 transition-all shadow-sm"
                  >
                    {lang === "ka" ? "ნახვა" : "View"}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id)}
                    aria-label={`${lang === "ka" ? "რჩეულებიდან ამოშლა" : "Remove from favorites"}: ${item.name}`}
                    className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {favoriteProducts.length > 0 && (
          <div className="pt-3.5 border-t border-stone-500/20 flex items-center justify-between text-xs">
            <span className="opacity-70">
              {lang === 'ka' ? `ჯამი (${favoriteProducts.length} ნივთი):` : `Total (${favoriteProducts.length} items):`}
            </span>
            <span className="font-mono font-bold text-amber-500 text-sm">
              {formatPrice(totalValue)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

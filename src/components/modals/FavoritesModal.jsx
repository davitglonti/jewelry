import React, { useState, useMemo } from 'react';
import { X, Trash2, ArrowUpDown, ArrowLeftRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../utils/i18n';
import { navigateTo } from '../../utils/navigation';
import QuickBuyModal from './QuickBuyModal';

export default function FavoritesModal({ isOpen, onClose, onSelectProduct }) {
  const { lang, products, favorites, toggleFavorite, compareList, toggleCompare } = useStore();

  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedForBuy] = useState([]);

  const handleBuySingle = (item) => {
    onClose?.();
    const prefix = lang === 'en' ? '/en' : '';
    navigateTo(`${prefix}/checkout?productId=${encodeURIComponent(item.id || item.sku)}`);
  };

  const handleBuyAll = () => {
    if (!favoriteProducts || favoriteProducts.length === 0) return;
    onClose?.();
    const prefix = lang === 'en' ? '/en' : '';
    navigateTo(`${prefix}/checkout?from=favorites`);
  };

  const favoriteProducts = useMemo(() => {
    let list = (products || []).filter((p) => favorites?.includes(p.id));
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    return [...list].sort((a, b) => {
      const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price || '0').replace(/[^0-9.]/g, '')) || 0;
      const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price || '0').replace(/[^0-9.]/g, '')) || 0;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
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
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="favorites-modal-title"
    >
      <div className="w-full max-w-2xl bg-white border border-[#E8E3DB] text-[#141311] p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DB]">
          <div className="flex items-center gap-3">
            <h3 id="favorites-modal-title" className="font-serif text-2xl font-light">
              {lang === "ka" ? "რჩეული სამკაულები" : "Saved Jewelry"}
            </h3>
            {favorites?.length > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-mono bg-[#F8F6F2] border border-[#E8E3DB] text-[#9D7B48]">
                {favorites.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === "ka" ? "ფანჯრის დახურვა" : "Close modal"}
            className="p-2 text-[#847E75] hover:text-[#141311] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {favorites?.length > 1 && (
          <div className="py-3 flex flex-wrap items-center justify-between gap-2.5 border-b border-[#EFECE6]">
            <div className="flex items-center gap-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#9D7B48] stroke-[1.5]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-1.5 px-2.5 border border-[#E8E3DB] bg-white text-xs text-[#141311] outline-none cursor-pointer"
              >
                <option value="newest">{lang === 'ka' ? 'უახლესი' : 'Newest'}</option>
                <option value="price-desc">{lang === 'ka' ? 'ფასი: კლებადი ↓' : 'Price: High to Low'}</option>
                <option value="price-asc">{lang === 'ka' ? 'ფასი: ზრდადი ↑' : 'Price: Low to High'}</option>
                <option value="name">{lang === 'ka' ? 'დასახელებით (A-Z)' : 'Name (A-Z)'}</option>
              </select>
            </div>

            {categories.length > 2 && (
              <div className="flex items-center gap-1.5 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#141311] text-white border-[#141311]'
                        : 'bg-white text-[#4A4640] border-[#E8E3DB] hover:border-[#141311]'
                    }`}
                  >
                    {cat === 'all' ? (lang === 'ka' ? 'ყველა' : 'All') : cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="py-4 max-h-96 overflow-y-auto divide-y divide-[#EFECE6]">
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="font-serif text-lg text-[#4A4640]">
                {lang === "ka" ? "რჩეულების სია ცარიელია." : "No saved items yet."}
              </p>
              <p className="text-xs text-[#847E75]">
                {lang === "ka" ? "დააჭირეთ გულის ხატულას კატალოგში ნივთის დასამატებლად" : "Click the heart icon on any piece to save it"}
              </p>
            </div>
          ) : (
            favoriteProducts.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3.5 first:pt-1">
                <div
                  className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                  onClick={() => {
                    onClose();
                    onSelectProduct(item);
                  }}
                >
                  <img
                    src={item.images?.[0] || item.image || "/brand-logo.jpg"}
                    alt={item.name || "სამკაული"}
                    className="w-14 h-16 object-cover shrink-0 bg-[#F4F1EC] border border-[#E8E3DB]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-serif text-base text-[#141311] truncate">{item.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.oldPrice && (
                        <span className="text-xs line-through text-[#9C958B]">{formatPrice(item.oldPrice)}</span>
                      )}
                      <span className="text-xs sm:text-sm text-[#141311] font-medium">{formatPrice(item.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleCompare(item.id)}
                    title={lang === 'ka' ? 'შედარების სიაში დამატება' : 'Compare'}
                    className={`p-2 border transition-colors cursor-pointer ${
                      compareList?.includes(item.id)
                        ? 'bg-[#9D7B48] text-white border-[#9D7B48]'
                        : 'border-[#E8E3DB] text-[#4A4640] hover:border-[#141311]'
                    }`}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBuySingle(item)}
                    className="px-3.5 py-2 bg-[#141311] hover:bg-[#2C2A26] text-white text-[10px] uppercase tracking-[0.16em] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{lang === "ka" ? "ყიდვა" : "Buy"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id)}
                    aria-label={`${lang === "ka" ? "რჩეულებიდან ამოშლა" : "Remove from favorites"}: ${item.name}`}
                    className="p-2 text-[#847E75] hover:text-[#8E2424] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {favoriteProducts.length > 0 && (
          <div className="pt-4 border-t border-[#E8E3DB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#847E75]">
                {lang === 'ka' ? `ჯამი (${favoriteProducts.length} ნივთი):` : `Total (${favoriteProducts.length} items):`}
              </span>
              <span className="font-mono font-medium text-[#141311] text-base">
                {formatPrice(totalValue)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleBuyAll}
              className="w-full sm:w-auto px-6 py-3 bg-[#141311] hover:bg-[#2C2A26] text-white text-[11px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{lang === 'ka' ? 'შეკვეთის გაფორმება' : 'Checkout Order'}</span>
            </button>
          </div>
        )}
      </div>

      <QuickBuyModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        items={selectedForBuy}
      />
    </div>
  );
}

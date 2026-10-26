import React, { useState } from 'react';
import { Plus, Search, Filter, X, Star, Edit3, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/i18n';
import AdminProductForm from './AdminProductForm';

export default function AdminProductsTab({
  products = [],
  setProducts,
  siteSettings = {},
  darkMode = true,
  syncData,
  homeWarning,
  setHomeWarning,
  triggerHomeWarning,
  parsePriceNumber
}) {
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogSelectedCategory, setCatalogSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);

  const filteredAdminProducts = products.filter((p) => {
    if (catalogSelectedCategory !== 'all' && p.category !== catalogSelectedCategory) {
      return false;
    }
    if (catalogSearchQuery.trim()) {
      const q = catalogSearchQuery.toLowerCase().trim();
      const nameMatch = (p.name || '').toLowerCase().includes(q);
      const nameEnMatch = (p.nameEn || '').toLowerCase().includes(q);
      const skuMatch = (p.sku || '').toLowerCase().includes(q);
      const metalMatch = (p.metal || '').toLowerCase().includes(q);
      const catMatch = (p.category || '').toLowerCase().includes(q);
      if (!nameMatch && !nameEnMatch && !skuMatch && !metalMatch && !catMatch) {
        return false;
      }
    }
    return true;
  });

  const featuredCount = products.filter((p, i) =>
    typeof p.showOnHome === 'boolean' ? p.showOnHome : i < 5
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl">
            სამკაულების სია (
            {filteredAdminProducts.length !== products.length
              ? `${filteredAdminProducts.length} / ${products.length}`
              : products.length}
            )
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs opacity-60">
              მთავარ გვერდზე გამოტანილია:{' '}
              <span
                className={`font-semibold ${
                  featuredCount > 5
                    ? 'text-red-400 font-bold'
                    : featuredCount === 5
                    ? 'text-amber-400'
                    : 'text-amber-500'
                }`}
              >
                {featuredCount} / 5
              </span>{' '}
              სამკაული
            </p>
            {featuredCount > 5 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 font-semibold animate-pulse">
                ⚠️ გადაჭარბებულია ({featuredCount}/5) — მთავარზე გამოჩნდება მხოლოდ 5
              </span>
            )}
            {featuredCount === 5 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                ✓ ვიტრინა სავსეა (5/5)
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setEditingProduct({
              id: 'item-' + Date.now(),
              createdAt: Date.now(),
              sku: 'AUR-' + Math.floor(100 + Math.random() * 900),
              name: '',
              nameEn: '',
              category: siteSettings.categories?.[0] || 'ბეჭდები',
              metal: siteSettings.metals?.[0] || 'ყვითელი ოქრო',
              karat: '750° (18K)',
              weight: '',
              stones: '',
              price: '',
              oldPrice: '',
              exclusive: false,
              showOnHome: featuredCount < 5,
              sizes: ['16.5', '17.0', '17.5'],
              description: '',
              descriptionEn: '',
              images: [],
              video360: '',
              stockStatus: 'in_stock'
            })
          }
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-semibold flex items-center justify-center gap-1.5 hover:brightness-110 transition-all shadow-md shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          ახალი სამკაულის დამატება
        </button>
      </div>

      {editingProduct && (
        <AdminProductForm
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          siteSettings={siteSettings}
          darkMode={darkMode}
          products={products}
          setProducts={setProducts}
          syncData={syncData}
          triggerHomeWarning={triggerHomeWarning}
          setHomeWarning={setHomeWarning}
          parsePriceNumber={parsePriceNumber}
        />
      )}

      {/* Search & Category Filter Toolbar */}
      <div
        className={`p-3 sm:p-4 rounded-2xl border space-y-3 ${
          darkMode ? 'bg-stone-900/60 border-stone-800' : 'bg-stone-100/70 border-stone-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
            <input
              type="text"
              value={catalogSearchQuery}
              onChange={(e) => setCatalogSearchQuery(e.target.value)}
              placeholder="ძებნა დასახელებით, კოდით (SKU), მეტალით..."
              className={`w-full pl-9 pr-9 py-2 rounded-xl text-xs border transition-all ${
                darkMode
                  ? 'bg-stone-800/90 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-amber-500/60'
                  : 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-500'
              }`}
            />
            {catalogSearchQuery && (
              <button
                type="button"
                onClick={() => setCatalogSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity"
                title="გასუფთავება"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear Button if any filter is active */}
          {(catalogSearchQuery || catalogSelectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setCatalogSearchQuery('');
                setCatalogSelectedCategory('all');
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-amber-500 hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>გასუფთავება</span>
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] opacity-50 shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> კატეგორია:
          </span>
          <button
            type="button"
            onClick={() => setCatalogSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              catalogSelectedCategory === 'all'
                ? 'bg-amber-500 text-black font-semibold shadow-xs'
                : darkMode
                ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }`}
          >
            ყველა ({products.length})
          </button>
          {(siteSettings.categories || []).map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            const isSelected = catalogSelectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCatalogSelectedCategory(isSelected ? 'all' : cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-black font-semibold shadow-xs'
                    : darkMode
                    ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-black/20 text-black font-bold' : 'opacity-60 bg-stone-500/15'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid or Empty State */}
      {filteredAdminProducts.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-dashed border-stone-500/25 opacity-70 space-y-2">
          <Search className="w-7 h-7 mx-auto text-amber-500/60 mb-1" />
          <p className="text-sm font-medium">სამკაული ვერ მოიძებნა</p>
          <p className="text-xs opacity-60">
            სცადეთ სხვა საძიებო სიტყვა ან მოხსენით კატეგორიის ფილტრი
          </p>
          <button
            type="button"
            onClick={() => {
              setCatalogSearchQuery('');
              setCatalogSelectedCategory('all');
            }}
            className="mt-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 text-xs font-medium hover:bg-amber-500 hover:text-black transition-all"
          >
            ფილტრების გასუფთავება
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredAdminProducts.map((p, pIdx) => {
            const isFeatured = typeof p.showOnHome === 'boolean' ? p.showOnHome : pIdx < 5;
            return (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl border border-stone-500/20 flex items-center justify-between gap-3 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={p.images?.[0]}
                    alt={p.name}
                    className="w-14 h-14 rounded-xl object-cover bg-stone-800 shrink-0 border border-stone-700/40"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span
                        className="font-serif font-medium text-sm truncate max-w-[140px] sm:max-w-[200px]"
                        title={p.name}
                      >
                        {p.name}
                      </span>
                      {(() => {
                        const st = p.stockStatus || 'in_stock';
                        if (st === 'sold_out') {
                          return (
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-stone-500/20 text-stone-300 border border-stone-500/30 shrink-0 font-medium">
                              ⚪ ამოიწურა
                            </span>
                          );
                        }
                        if (st === 'preorder') {
                          return (
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 font-medium">
                              🟡 შეკვეთით
                            </span>
                          );
                        }
                        return (
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 font-medium">
                            🟢 მარაგშია
                          </span>
                        );
                      })()}
                      {isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 font-medium flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          მთავარზე
                        </span>
                      )}
                    </div>
                    <div className="text-xs opacity-60 truncate">
                      <span className="font-mono text-amber-500/90 font-medium">{p.sku}</span> •{' '}
                      {p.category} • {p.metal}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.oldPrice && (
                        <span className="text-xs line-through opacity-45">
                          {formatPrice(p.oldPrice)}
                        </span>
                      )}
                      <span className="text-xs text-amber-500 font-semibold">
                        {formatPrice(p.price)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const curFeaturedCount = products.filter((item, itemIdx) =>
                        typeof item.showOnHome === 'boolean' ? item.showOnHome : itemIdx < 5
                      ).length;
                      if (!isFeatured && curFeaturedCount >= 5) {
                        triggerHomeWarning(
                          '⚠️ მთავარი გვერდის ვიტრინა სავსეა (მაქსიმუმ 5 სამკაული ერთ ხაზზე). მე-6 ნივთის დასამატებლად ჯერ მოხსენით ვარსკვლავი რომელიმე არსებულ ნივთს!'
                        );
                        return;
                      }
                      setHomeWarning('');
                      const updated = products.map((item, itemIdx) => {
                        const currentStatus =
                          typeof item.showOnHome === 'boolean' ? item.showOnHome : itemIdx < 5;
                        if (item.id === p.id) {
                          return { ...item, showOnHome: !currentStatus };
                        }
                        return typeof item.showOnHome === 'boolean'
                          ? item
                          : { ...item, showOnHome: currentStatus };
                      });
                      setProducts(updated);
                      syncData(siteSettings, updated);
                    }}
                    title={
                      isFeatured
                        ? 'მთავარ გვერდზე გამოტანილია (დააწკაპუნეთ მოსახსნელად)'
                        : 'მთავარ გვერდზე გამოტანა'
                    }
                    className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs ${
                      isFeatured
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-stone-500/10 text-stone-400 hover:text-amber-400 hover:bg-stone-500/20'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${isFeatured ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span className="hidden lg:inline text-[11px] font-medium">
                      {isFeatured ? 'მთავარზეა' : 'მთავარზე'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingProduct(p)}
                    className="p-2 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-black transition-colors"
                    title="რედაქტირება"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = products.filter((item) => item.id !== p.id);
                      setProducts(updated);
                      syncData(siteSettings, updated);
                    }}
                    className="p-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                    title="წაშლა"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

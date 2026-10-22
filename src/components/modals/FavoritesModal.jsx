import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function FavoritesModal({ isOpen, onClose, onSelectProduct }) {
  const { darkMode, lang, products, favorites, toggleFavorite } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-3xl border p-6 ${darkMode ? "bg-[#141210] border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"}`}>
        <div className="flex items-center justify-between pb-4 border-b border-stone-500/20">
          <h3 className="font-serif text-2xl">{lang === "ka" ? "რჩეული სამკაულები" : "Saved Jewelry"}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-500/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="py-4 max-h-96 overflow-y-auto space-y-3">
          {favorites.length === 0 ? (
            <p className="text-center py-8 opacity-60 text-sm">{lang === "ka" ? "რჩეულების სია ცარიელია." : "No saved items yet."}</p>
          ) : (
            products
              .filter((p) => favorites.includes(p.id))
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-stone-500/15">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img src={item.images?.[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-serif font-medium truncate">{item.name}</div>
                      <div className="flex items-center gap-2">
                        {item.oldPrice && (
                          <span className="text-xs line-through opacity-50">{item.oldPrice}</span>
                        )}
                        <span className="text-xs text-amber-500 font-semibold">{item.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProduct(item);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-medium"
                    >
                      {lang === "ka" ? "ნახვა" : "View"}
                    </button>
                    <button onClick={() => toggleFavorite(item.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
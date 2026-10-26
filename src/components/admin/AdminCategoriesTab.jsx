import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AdminCategoriesTab({
  siteSettings = {},
  setSiteSettings,
  products = [],
  syncData,
  darkMode = true
}) {
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newMetalInput, setNewMetalInput] = useState('');

  const handleAddCategory = () => {
    if (!newCategoryInput.trim()) return;
    const updated = {
      ...siteSettings,
      categories: [...(siteSettings.categories || []), newCategoryInput.trim()]
    };
    setSiteSettings(updated);
    syncData(updated, products);
    setNewCategoryInput('');
  };

  const handleDeleteCategory = (cat) => {
    const updated = {
      ...siteSettings,
      categories: (siteSettings.categories || []).filter((c) => c !== cat)
    };
    setSiteSettings(updated);
    syncData(updated, products);
  };

  const handleAddMetal = () => {
    if (!newMetalInput.trim()) return;
    const updated = {
      ...siteSettings,
      metals: [...(siteSettings.metals || []), newMetalInput.trim()]
    };
    setSiteSettings(updated);
    syncData(updated, products);
    setNewMetalInput('');
  };

  const handleDeleteMetal = (metal) => {
    const updated = {
      ...siteSettings,
      metals: (siteSettings.metals || []).filter((m) => m !== metal)
    };
    setSiteSettings(updated);
    syncData(updated, products);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Categories */}
      <div className="p-5 rounded-2xl border border-stone-500/20 space-y-4">
        <h4 className="font-serif text-lg text-amber-500">კატეგორიების მართვა</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryInput}
            onChange={(e) => setNewCategoryInput(e.target.value)}
            placeholder="ახალი კატეგორია (მაგ: გულსაბნევები)"
            className={`flex-1 p-2.5 rounded-xl text-xs border ${
              darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
            }`}
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold hover:brightness-110 transition-all"
          >
            დამატება
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(siteSettings.categories || []).map((cat) => (
            <span
              key={cat}
              className="px-3 py-1.5 rounded-full text-xs bg-stone-500/15 flex items-center gap-2 border border-stone-500/20"
            >
              {cat}
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat)}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="წაშლა"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Metals */}
      <div className="p-5 rounded-2xl border border-stone-500/20 space-y-4">
        <h4 className="font-serif text-lg text-amber-500">მეტალების / მასალების მართვა</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMetalInput}
            onChange={(e) => setNewMetalInput(e.target.value)}
            placeholder="ახალი მეტალი (მაგ: ვერცხლი 925)"
            className={`flex-1 p-2.5 rounded-xl text-xs border ${
              darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
            }`}
          />
          <button
            type="button"
            onClick={handleAddMetal}
            className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold hover:brightness-110 transition-all"
          >
            დამატება
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(siteSettings.metals || []).map((metal) => (
            <span
              key={metal}
              className="px-3 py-1.5 rounded-full text-xs bg-stone-500/15 flex items-center gap-2 border border-stone-500/20"
            >
              {metal}
              <button
                type="button"
                onClick={() => handleDeleteMetal(metal)}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="წაშლა"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

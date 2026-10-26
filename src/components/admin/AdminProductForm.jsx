import React, { useState } from 'react';
import { Upload, Link as LinkIcon, X, RotateCw, Trash2, Sparkles, Star } from 'lucide-react';
import { handleFileUpload } from '../../utils/imageUtils';

export default function AdminProductForm({
  editingProduct,
  setEditingProduct,
  siteSettings = {},
  darkMode = true,
  products = [],
  setProducts,
  syncData,
  triggerHomeWarning,
  setHomeWarning,
  parsePriceNumber
}) {
  const [imageUrlInput, setImageUrlInput] = useState('');

  if (!editingProduct) return null;

  const curPriceNum = parsePriceNumber(editingProduct.price);
  const oldPriceNum = parsePriceNumber(editingProduct.oldPrice);
  const isOldInvalid = oldPriceNum !== null && curPriceNum !== null && curPriceNum >= oldPriceNum;

  const otherFeaturedCount = products.filter(
    (p, i) => (typeof p.showOnHome === 'boolean' ? p.showOnHome : i < 5) && p.id !== editingProduct.id
  ).length;
  const isCurrentlyChecked = Boolean(typeof editingProduct.showOnHome === 'boolean' ? editingProduct.showOnHome : true);
  const isFull = otherFeaturedCount >= 5;

  const handleSave = () => {
    // 1. დასახელების შემოწმება
    if (!editingProduct.name || !editingProduct.name.trim()) {
      triggerHomeWarning('⚠️ გთხოვთ მიუთითოთ სამკაულის დასახელება (სავალდებულოა)!');
      return;
    }

    // 2. ფასის შემოწმება
    if (!editingProduct.price || !editingProduct.price.trim()) {
      triggerHomeWarning('⚠️ გთხოვთ მიუთითოთ სამკაულის ფასი (სავალდებულოა)!');
      return;
    }

    // 3. ფოტოების შემოწმება (მინიმუმ 1 ფოტო)
    if (!editingProduct.images || editingProduct.images.length === 0) {
      triggerHomeWarning('⚠️ გთხოვთ დაამატოთ მინიმუმ 1 ფოტო სამკაულისთვის (სავალდებულოა)!');
      return;
    }

    // 4. ფასდაკლების / ძველი ფასის შემოწმება
    if (oldPriceNum !== null) {
      if (curPriceNum !== null && curPriceNum >= oldPriceNum) {
        triggerHomeWarning(
          '⚠️ ახალი ფასი არ შეიძლება იყოს ძველ ფასზე მეტი ან ტოლი! ფასდაკლებისთვის ძველი ფასი უნდა აღემატებოდეს ახალ ფასს.'
        );
        return;
      }
    }

    // 5. მთავარ გვერდზე 5-იანი ლიმიტის შემოწმება
    if (editingProduct.showOnHome && otherFeaturedCount >= 5) {
      triggerHomeWarning(
        '⚠️ მთავარი გვერდის ვიტრინა სავსეა (მაქსიმუმ 5 სამკაული ერთ ხაზზე). გთხოვთ გათიშოთ მთავარზე ჩვენება ან ჯერ მოხსნათ სხვა სამკაული მთავარიდან!'
      );
      return;
    }

    const exists = products.some((p) => p.id === editingProduct.id);
    const ensureLari = (val) => {
      if (!val) return '';
      const str = val.toString().trim();
      if (!str) return '';
      return str.includes('₾') ? str : str + ' ₾';
    };

    const productToSave = {
      ...editingProduct,
      price: ensureLari(editingProduct.price),
      oldPrice: editingProduct.oldPrice?.trim() ? ensureLari(editingProduct.oldPrice) : ''
    };

    const updated = exists
      ? products.map((p) => (p.id === productToSave.id ? productToSave : p))
      : [productToSave, ...products];

    setProducts(updated);
    syncData(siteSettings, updated);
    setEditingProduct(null);
    setHomeWarning('');
  };

  return (
    <div
      className={`p-5 rounded-2xl border space-y-4 ${
        darkMode ? 'bg-stone-900/90 border-amber-500/40' : 'bg-stone-50 border-amber-500'
      }`}
    >
      <h4 className="font-serif text-lg text-amber-500">სამკაულის რედაქტირება / დამატება</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <input
          type="text"
          placeholder="დასახელება (ქართულად) *"
          value={editingProduct.name}
          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
          className={`p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300'}`}
        />
        <input
          type="text"
          placeholder="Name (English)"
          value={editingProduct.nameEn || ''}
          onChange={(e) => setEditingProduct({ ...editingProduct, nameEn: e.target.value })}
          className={`p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300'}`}
        />
        <input
          type="text"
          placeholder="კოდი (მაგ: AUR-105)"
          value={editingProduct.sku}
          onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
          className={`p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300'}`}
        />
        <select
          value={editingProduct.category}
          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
          className={`p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300'}`}
        >
          {(siteSettings.categories || []).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={editingProduct.metal}
          onChange={(e) => setEditingProduct({ ...editingProduct, metal: e.target.value })}
          className={`p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300'}`}
        >
          {(siteSettings.metals || []).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <div className="flex flex-col">
          <div className="relative">
            <input
              type="text"
              placeholder="ახალი / მიმდინარე ფასი (მაგ: 4,500) *"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
              className={`w-full p-2.5 pr-8 rounded-xl border ${darkMode ? 'bg-stone-800 border-amber-500/50 text-white' : 'bg-white border-amber-500'}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500 pointer-events-none select-none">
              ₾
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="relative">
            <input
              type="text"
              placeholder="ძველი ფასი ფასდაკლებისას (მაგ: 5,200)"
              value={editingProduct.oldPrice || ''}
              onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: e.target.value })}
              className={`w-full p-2.5 pr-8 rounded-xl border transition-all ${
                isOldInvalid
                  ? 'border-red-500 bg-red-500/10 text-red-200 focus:border-red-500'
                  : darkMode
                  ? 'bg-stone-800 border-stone-700 text-white'
                  : 'bg-white border-stone-300'
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500 pointer-events-none select-none">
              ₾
            </span>
          </div>
          {isOldInvalid && (
            <span className="text-[10px] text-red-400 mt-1 font-medium">
              ⚠️ ძველი ფასი ახალ ფასზე მეტი უნდა იყოს!
            </span>
          )}
        </div>

        <input
          type="text"
          placeholder="სინჯი (მაგ: 750° / 18K)"
          value={editingProduct.karat}
          onChange={(e) => setEditingProduct({ ...editingProduct, karat: e.target.value })}
          className={`p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300'}`}
        />
        <input
          type="text"
          placeholder="წონა (მაგ: 4.5 გრ)"
          value={editingProduct.weight}
          onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
          className={`p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300'}`}
        />
        <input
          type="text"
          placeholder="ქვები (მაგ: ბრილიანტი 0.5ct)"
          value={editingProduct.stones}
          onChange={(e) => setEditingProduct({ ...editingProduct, stones: e.target.value })}
          className={`p-2.5 rounded-xl border sm:col-span-3 ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300'}`}
        />
      </div>

      <div className="text-xs">
        <label className="block opacity-70 mb-1">ხელმისაწვდომი ზომები (გამოყავით მძიმით):</label>
        <input
          type="text"
          value={(editingProduct.sizes || []).join(', ')}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
            })
          }
          placeholder="16.0, 16.5, 17.0, 17.5"
          className={`w-full p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300'}`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <textarea
          rows={2}
          placeholder="აღწერა (ქართულად)"
          value={editingProduct.description}
          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
          className={`p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300'}`}
        />
        <textarea
          rows={2}
          placeholder="Description (English)"
          value={editingProduct.descriptionEn || ''}
          onChange={(e) => setEditingProduct({ ...editingProduct, descriptionEn: e.target.value })}
          className={`p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300'}`}
        />
      </div>

      {/* Product Images Upload / URL Section */}
      <div className="space-y-2 text-xs">
        <label className="font-medium text-amber-500 block">
          სამკაულის ფოტოები * (მინიმუმ 1 ფოტო სავალდებულოა):
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 cursor-pointer flex items-center justify-center gap-2 shrink-0">
            <Upload className="w-4 h-4" />
            ფოტოს ატვირთვა მოწყობილობიდან
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleFileUpload(file, (base64) => {
                  setEditingProduct({
                    ...editingProduct,
                    images: [...(editingProduct.images || []), base64]
                  });
                });
              }}
            />
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 w-full">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="ან ჩასვით ფოტოს ლინკი (https://...)"
              className={`w-full sm:flex-1 p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300'}`}
            />
            <button
              type="button"
              onClick={() => {
                if (!imageUrlInput.trim()) return;
                setEditingProduct({
                  ...editingProduct,
                  images: [...(editingProduct.images || []), imageUrlInput.trim()]
                });
                setImageUrlInput('');
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-700 text-white flex items-center justify-center gap-1 shrink-0"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              დამატება
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {(editingProduct.images || []).map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-amber-500/40">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() =>
                  setEditingProduct({
                    ...editingProduct,
                    images: editingProduct.images.filter((_, idx) => idx !== i)
                  })
                }
                className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 360° Video Scrubbing Section */}
      <div className="space-y-2 pt-3 border-t border-stone-700/40">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-wider text-amber-500 font-semibold flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5" />
            360° მბრუნავი ვიდეო (Interactive 360° View)
          </label>
          {editingProduct.video360 && (
            <button
              type="button"
              onClick={() => setEditingProduct({ ...editingProduct, video360: '' })}
              className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors"
            >
              <Trash2 className="w-3 h-3" /> ვიდეოს წაშლა
            </button>
          )}
        </div>
        <p className="text-[11px] text-stone-400">
          სამკაულის 360 გრადუსით დასატრიალებლად მიუთითეთ წრიული ვიდეოს პირდაპირი ბმული (MP4 / WebM). მყიდველი თითის ან მაუსის გადასმით დაატრიალებს ნივთს.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="url"
            placeholder="360° ვიდეოს პირდაპირი ლინკი (მაგ: https://.../video.mp4)"
            value={editingProduct.video360 || ''}
            onChange={(e) => setEditingProduct({ ...editingProduct, video360: e.target.value })}
            className={`w-full p-2.5 rounded-xl border text-xs ${
              darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
            }`}
          />
        </div>
        {editingProduct.video360 && (
          <div className="relative inline-flex flex-col gap-1 mt-2 p-2.5 rounded-xl border border-amber-500/30 bg-black/40">
            <div className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> ვიდეოს წინასწარი გადახედვა:
            </div>
            <video
              src={editingProduct.video360}
              className="w-40 h-28 object-contain rounded-lg bg-black/60"
              muted
              loop
              autoPlay
              playsInline
            />
          </div>
        )}
      </div>

      {/* მარაგის სტატუსი (Stock Availability Status) */}
      <div className="space-y-2 pt-3 border-t border-stone-700/40">
        <label className="text-[11px] uppercase tracking-wider text-amber-500 font-semibold block">
          მარაგის სტატუსი (საიტზე გამოჩენა):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setEditingProduct({ ...editingProduct, stockStatus: 'in_stock' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              (editingProduct.stockStatus || 'in_stock') === 'in_stock'
                ? 'border-emerald-500 bg-emerald-500/15 shadow-sm shadow-emerald-500/10'
                : darkMode
                ? 'border-stone-700 bg-stone-800/40 opacity-70 hover:opacity-100'
                : 'border-stone-200 bg-white opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                {(editingProduct.stockStatus || 'in_stock') === 'in_stock' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-xs text-emerald-400">🟢 მარაგშია</span>
            </div>
            <p className="text-[10px] text-stone-300 mt-1 pl-4 leading-snug">
              ადგილზეა, მიწოდება 24-48 საათში
            </p>
          </button>

          <button
            type="button"
            onClick={() => setEditingProduct({ ...editingProduct, stockStatus: 'preorder' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              editingProduct.stockStatus === 'preorder'
                ? 'border-amber-500 bg-amber-500/15 shadow-sm shadow-amber-500/10'
                : darkMode
                ? 'border-stone-700 bg-stone-800/40 opacity-70 hover:opacity-100'
                : 'border-stone-200 bg-white opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0"></span>
              <span className="font-semibold text-xs text-amber-400">🟡 შეკვეთით</span>
            </div>
            <p className="text-[10px] text-stone-300 mt-1 pl-4 leading-snug">
              3-5 სამუშაო დღე (დამზადება / ჩამოტანა)
            </p>
          </button>

          <button
            type="button"
            onClick={() => setEditingProduct({ ...editingProduct, stockStatus: 'sold_out' })}
            className={`p-3 rounded-2xl border text-left transition-all ${
              editingProduct.stockStatus === 'sold_out'
                ? 'border-stone-400 bg-stone-500/20 shadow-sm'
                : darkMode
                ? 'border-stone-700 bg-stone-800/40 opacity-70 hover:opacity-100'
                : 'border-stone-200 bg-white opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-stone-400 shrink-0"></span>
              <span className="font-semibold text-xs text-stone-300">⚪ გაყიდულია / ამოიწურა</span>
            </div>
            <p className="text-[10px] text-stone-300 mt-1 pl-4 leading-snug">
              რომ კლიენტი ტყუილად არ ელოდოს
            </p>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3">
        <div className="flex flex-wrap items-center gap-5">
          <label
            className={`flex items-center gap-2 text-xs select-none ${
              !isCurrentlyChecked && isFull ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={isCurrentlyChecked}
              onChange={(e) => {
                const willBeChecked = e.target.checked;
                if (willBeChecked && isFull) {
                  triggerHomeWarning(
                    '⚠️ მთავარი გვერდის ვიტრინა სავსეა (მაქსიმუმ 5 სამკაული ერთ ხაზზე). მე-6 ნივთის დასამატებლად ჯერ მოხსენით სხვა ნივთი მთავარი გვერდიდან!'
                  );
                  return;
                }
                setHomeWarning('');
                setEditingProduct({ ...editingProduct, showOnHome: willBeChecked });
              }}
              className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
            />
            <span className="flex items-center gap-1.5 font-medium text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              მთავარ გვერდზე ჩვენება (მაქს. 5)
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={editingProduct.exclusive}
              onChange={(e) => setEditingProduct({ ...editingProduct, exclusive: e.target.checked })}
              className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
            />
            <span>ექსკლუზიური მოდელი</span>
          </label>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setEditingProduct(null)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-stone-600 text-xs text-center"
          >
            გაუქმება
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-amber-500 text-black font-semibold text-xs text-center"
          >
            შენახვა
          </button>
        </div>
      </div>
    </div>
  );
}

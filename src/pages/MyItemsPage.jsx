// src/pages/MyItemsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Edit2, Trash2, ExternalLink, AlertTriangle,
  Check, X, Image as ImageIcon, Sparkles, Eye, Phone, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db } from '../lib/firebase';
import {
  collection, query, where, getDocs, deleteDoc, updateDoc, doc
} from 'firebase/firestore';
import { formatPrice } from '../utils/i18n';
import { handleFileUpload } from '../utils/imageUtils';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function MyItemsPage() {
  const { user } = useAuth();
  const { darkMode, setDarkMode, lang, setLang, siteSettings, favorites, setShowFavoritesModal, products, setProducts } = useStore();

  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOldPrice, setEditOldPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchMyItems = async () => {
    if (!user) return;
    setLoading(true);

    try {
      if (db) {
        const q = query(collection(db, 'products'), where('ownerId', '==', user.uid));
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // თუ Firestore-ში რაიმე მიზეზით არ არის, ასევე გადავამოწმოთ StoreContext-ის ლოკალური პროდუქტები
        const contextItems = (products || []).filter((p) => p.ownerId === user.uid);
        const mergedMap = new Map();
        items.forEach((it) => mergedMap.set(it.id, it));
        contextItems.forEach((it) => {
          if (!mergedMap.has(it.id)) mergedMap.set(it.id, it);
        });

        setMyItems(Array.from(mergedMap.values()));
      } else {
        // ოფლაინ / LocalStorage რეჟიმი
        const local = (products || []).filter((p) => p.ownerId === user.uid);
        setMyItems(local);
      }
    } catch (err) {
      console.warn('ჩემი ნივთების ამოღების შეცდომა:', err);
      // fallback to context
      const local = (products || []).filter((p) => p.ownerId === user.uid);
      setMyItems(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, [user, products]);

  // Start Editing Item
  const handleStartEdit = (item) => {
    setEditingItem(item);
    setEditTitle(item.name || '');
    setEditPrice(item.price || '');
    setEditOldPrice(item.oldPrice || '');
    setEditCategory(item.category || 'ბეჭდები');
    setEditDescription(item.description || '');
    setEditImageUrl(item.image || item.images?.[0] || '');
    setEditPhone(item.sellerPhone || '');
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem || !user) return;

    if (editingItem.ownerId && editingItem.ownerId !== user.uid) {
      showToast('თქვენ არ გაქვთ ამ ნივთის რედაქტირების უფლება');
      return;
    }

    setActionLoading(true);
    try {
      const updatedFields = {
        name: editTitle.trim(),
        nameEn: editTitle.trim(),
        price: parseFloat(editPrice) || editingItem.price,
        oldPrice: editOldPrice ? parseFloat(editOldPrice) : null,
        category: editCategory,
        description: editDescription.trim(),
        descriptionEn: editDescription.trim(),
        image: editImageUrl.trim() || editingItem.image,
        images: editImageUrl.trim() ? [editImageUrl.trim()] : editingItem.images,
        sellerPhone: editPhone.trim(),
        updatedAt: Date.now()
      };

      if (db) {
        const docRef = doc(db, 'products', editingItem.id);
        await updateDoc(docRef, updatedFields);
      }

      // განვაახლოთ ლოკალური state
      setMyItems((prev) =>
        prev.map((it) => (it.id === editingItem.id ? { ...it, ...updatedFields } : it))
      );
      if (setProducts) {
        setProducts((prev) =>
          prev.map((it) => (it.id === editingItem.id ? { ...it, ...updatedFields } : it))
        );
      }

      setEditingItem(null);
      showToast(lang === 'ka' ? 'ცვლილებები წარმატებით შეინახა!' : 'Changes saved successfully!');
    } catch (err) {
      console.error('რედაქტირების შეცდომა:', err);
      showToast(err.message || 'ვერ მოხერხდა შენახვა');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Item
  const handleConfirmDelete = async () => {
    if (!deletingId || !user) return;
    setActionLoading(true);

    try {
      if (db) {
        await deleteDoc(doc(db, 'products', deletingId));
      }

      setMyItems((prev) => prev.filter((it) => it.id !== deletingId));
      if (setProducts) {
        setProducts((prev) => prev.filter((it) => it.id !== deletingId));
      }

      setDeletingId(null);
      showToast(lang === 'ka' ? 'ნივთი წარმატებით წაიშალა' : 'Item successfully removed');
    } catch (err) {
      console.error('წაშლის შეცდომა:', err);
      showToast(err.message || 'ვერ მოხერხდა წაშლა');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
      darkMode ? 'bg-[#0c0b0a] text-[#f5f0e6]' : 'bg-[#faf7f2] text-[#1c1917]'
    }`}>
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

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-28 sm:py-36">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-amber-500 text-black font-semibold text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-500/15 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1.5">
              <Package className="w-4 h-4" />
              <span>{lang === 'ka' ? 'პირადი კაბინეტი' : 'My Collection'}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-normal">
              {lang === 'ka' ? 'ჩემი განთავსებული ნივთები' : 'My Published Pieces'}
            </h1>
            <p className="text-xs sm:text-sm opacity-70 mt-1">
              {user?.displayName ? `${user.displayName} • ` : ''}{user?.email}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={fetchMyItems}
              disabled={loading}
              title="განახლება"
              className="p-2.5 rounded-full border border-stone-700 hover:border-amber-500 text-stone-300 hover:text-amber-500 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <a
              href="/add"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ka' ? 'ნივთის დამატება' : 'Add Piece'}</span>
            </a>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono opacity-60 uppercase tracking-widest">იტვირთება...</span>
          </div>
        ) : myItems.length === 0 ? (
          <div className={`p-12 sm:p-16 rounded-3xl border text-center space-y-5 ${
            darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200'
          }`}>
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-xl sm:text-2xl font-medium">
                {lang === 'ka' ? 'თქვენ ჯერ არ გაქვთ დამატებული ნივთები' : 'You have no listings yet'}
              </h3>
              <p className="text-xs sm:text-sm opacity-65 max-w-md mx-auto">
                {lang === 'ka'
                  ? 'განათავსეთ თქვენი პირველი საიუველირო ნაკეთობა და გახადეთ ის ხელმისაწვდომი მომხმარებლებისთვის.'
                  : 'Publish your first jewelry piece and share it with collectors.'}
              </p>
            </div>
            <a
              href="/add"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ka' ? 'პირველი ნივთის დამატება' : 'Add First Piece'}</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myItems.map((item) => {
              const displayImg = item.images?.[0] || item.image || '/brand-logo.jpg';
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl sm:rounded-3xl border overflow-hidden transition-all flex flex-col justify-between ${
                    darkMode
                      ? 'bg-[#141210] border-stone-800 hover:border-amber-500/40'
                      : 'bg-white border-stone-200 hover:border-amber-500 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative aspect-square overflow-hidden bg-stone-900">
                      <img
                        src={displayImg}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/brand-logo.jpg';
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/80 text-amber-400 backdrop-blur-md border border-amber-500/30">
                          {item.category || 'სამკაული'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/80 text-stone-300 backdrop-blur-md">
                          #{item.sku || item.id.substring(0, 6)}
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500 text-black shadow-md">
                          აქტიური
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-serif text-base font-medium line-clamp-1 hover:text-amber-500 transition-colors">
                        {item.name}
                      </h3>

                      <p className="text-xs opacity-70 line-clamp-2 leading-relaxed">
                        {item.description || 'აღწერა არ არის მითითებული.'}
                      </p>

                      <div className="pt-2 border-t border-stone-500/15 flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-serif text-lg font-bold text-amber-500">
                            {formatPrice(item.price)}
                          </span>
                          {item.oldPrice && (
                            <span className="text-xs line-through opacity-50">
                              {formatPrice(item.oldPrice)}
                            </span>
                          )}
                        </div>

                        {item.metal && (
                          <span className="text-[11px] opacity-60">
                            {item.metal} {item.karat ? `• ${item.karat}` : ''}
                          </span>
                        )}
                      </div>

                      {item.sellerPhone && (
                        <div className="pt-1 flex items-center gap-1 text-[11px] text-stone-400 font-mono">
                          <Phone className="w-3 h-3 text-amber-500" />
                          <span>{item.sellerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 border-t border-stone-500/15 bg-black/20 flex items-center justify-between gap-2">
                    <a
                      href={`/product/${encodeURIComponent(item.sku || item.id)}`}
                      className="px-3 py-1.5 rounded-xl border border-stone-700 hover:border-amber-500 text-[11px] font-medium flex items-center gap-1.5 transition-all text-stone-300 hover:text-amber-400"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{lang === 'ka' ? 'ნახვა' : 'View'}</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="px-3 py-1.5 rounded-xl border border-stone-700 hover:border-amber-500 text-[11px] font-medium flex items-center gap-1.5 transition-all text-amber-400 hover:bg-amber-500/10"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{lang === 'ka' ? 'ჩასწორება' : 'Edit'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingId(item.id)}
                        className="p-1.5 rounded-xl border border-stone-800 hover:border-red-500/40 text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title={lang === 'ka' ? 'წაშლა' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-full max-w-sm p-6 rounded-3xl border space-y-4 shadow-2xl animate-scaleIn ${
              darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-serif text-xl font-medium">
                  {lang === 'ka' ? 'ნამდვილად გსურთ წაშლა?' : 'Confirm deletion'}
                </h3>
                <p className="text-xs opacity-70">
                  {lang === 'ka'
                    ? 'ეს სამკაული სამუდამოდ წაიშლება კატალოგიდან და Firestore ბაზიდან.'
                    : 'This piece will be permanently deleted from the collection.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingId(null)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl border border-stone-700 hover:border-stone-500 text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  {lang === 'ka' ? 'გაუქმება' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'იშლება...' : (lang === 'ka' ? 'დიახ, წაშლა' : 'Delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border space-y-5 shadow-2xl my-8 animate-scaleIn ${
              darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b border-stone-500/15">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-500" />
                  <h3 className="font-serif text-xl font-medium">
                    {lang === 'ka' ? 'სამკაულის რედაქტირება' : 'Edit Jewelry Piece'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1.5 rounded-full opacity-60 hover:opacity-100 hover:bg-stone-500/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block uppercase tracking-wider font-semibold opacity-80 mb-1">
                    {lang === 'ka' ? 'სათაური *' : 'Title *'}
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase tracking-wider font-semibold opacity-80 mb-1">
                      {lang === 'ka' ? 'ფასი (₾) *' : 'Price (₾) *'}
                    </label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      required
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm font-mono ${
                        darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-wider font-semibold opacity-80 mb-1">
                      {lang === 'ka' ? 'ძველი ფასი (₾)' : 'Old Price (₾)'}
                    </label>
                    <input
                      type="number"
                      value={editOldPrice}
                      onChange={(e) => setEditOldPrice(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm font-mono ${
                        darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold opacity-80 mb-1">
                    {lang === 'ka' ? 'სურათის ლინკი' : 'Image URL'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      required
                      className={`flex-1 px-3.5 py-2.5 rounded-xl border outline-none text-sm ${
                        darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300'
                      }`}
                    />
                    <label className="px-3 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 flex items-center justify-center cursor-pointer shrink-0">
                      <ImageIcon className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e.target.files?.[0], (b64) => {
                            if (b64) setEditImageUrl(b64);
                          })
                        }
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold opacity-80 mb-1">
                    {lang === 'ka' ? 'გამყიდველის ტელეფონი' : 'Seller Phone'}
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="555 12 34 56"
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm font-mono ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-semibold opacity-80 mb-1">
                    {lang === 'ka' ? 'აღწერა' : 'Description'}
                  </label>
                  <textarea
                    rows="3"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-sm resize-none ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300'
                    }`}
                  />
                </div>

                <div className="pt-3 border-t border-stone-500/15 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2.5 rounded-xl border border-stone-700 hover:border-stone-500 text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    {lang === 'ka' ? 'გაუქმება' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'ინახება...' : (lang === 'ka' ? 'შენახვა' : 'Save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />
    </div>
  );
}

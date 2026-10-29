// src/pages/AddProductPage.jsx
import React, { useState } from 'react';
import { PlusCircle, Upload, Image as ImageIcon, CheckCircle, ArrowLeft, AlertCircle, Phone, Tag, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFileUpload } from '../utils/imageUtils';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function AddProductPage() {
  const { user } = useAuth();
  const { darkMode, setDarkMode, lang, setLang, siteSettings, favorites, setShowFavoritesModal, setProducts } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [category, setCategory] = useState(siteSettings?.categories?.[0] || 'ბეჭდები');
  const [metal, setMetal] = useState(siteSettings?.metals?.[0] || 'ყვითელი ოქრო');
  const [karat, setKarat] = useState('585° (14K)');
  const [imageUrl, setImageUrl] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [addedProductId, setAddedProductId] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories = siteSettings?.categories?.length > 0
    ? siteSettings.categories
    : ['ბეჭდები', 'ყელსაბამები', 'სამაჯურები', 'საყურეები', 'გულსაკიდები'];

  const metals = siteSettings?.metals?.length > 0
    ? siteSettings.metals
    : ['ყვითელი ოქრო', 'თეთრი ოქრო', 'ვარდისფერი ოქრო', 'პლატინა', 'ვერცხლი'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage(lang === 'ka' ? 'გთხოვთ მიუთითოთ პროდუქტის სათაური' : 'Please provide a product title');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage(lang === 'ka' ? 'გთხოვთ მიუთითოთ სწორი ფასი' : 'Please provide a valid price');
      return;
    }

    if (!imageUrl.trim()) {
      setErrorMessage(lang === 'ka' ? 'გთხოვთ მიუთითოთ სურათის ლინკი ან ატვირთოთ ფოტო' : 'Please provide an image URL or upload a photo');
      return;
    }

    setLoading(true);

    try {
      if (!db || !user) {
        throw new Error('მონაცემთა ბაზა ან ავტორიზაცია მიუწვდომელია');
      }

      // შევქმნათ ახალი დოკუმენტის რეფერენსი Firestore-ში
      const productsCol = collection(db, 'products');
      const newDocRef = doc(productsCol);
      const generatedSku = `AUR-${Math.floor(100 + Math.random() * 900)}`;

      const newProductData = {
        id: newDocRef.id,
        sku: generatedSku,
        name: title.trim(),
        nameEn: title.trim(),
        description: description.trim(),
        descriptionEn: description.trim(),
        price: numPrice,
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        image: imageUrl.trim(),
        images: [imageUrl.trim()],
        category: category || 'ბეჭდები',
        metal: metal || 'ყვითელი ოქრო',
        karat: karat || '585° (14K)',
        sellerPhone: sellerPhone.trim() || '',
        ownerId: user.uid,
        ownerEmail: user.email || '',
        ownerName: user.displayName || user.email || 'ავტორი',
        createdAt: serverTimestamp(),
        stockStatus: 'in_stock',
      };

      await setDoc(newDocRef, newProductData);

      // განვაახლოთ ლოკალური state StoreContext-ში
      const localProduct = {
        ...newProductData,
        createdAt: Date.now()
      };
      if (setProducts) {
        setProducts((prev) => [localProduct, ...prev]);
      }

      setAddedProductId(newDocRef.id);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('პროდუქტის დამატების შეცდომა:', err);
      setErrorMessage(err.message || (lang === 'ka' ? 'ვერ მოხერხდა შენახვა Firestore-ში' : 'Failed to save product'));
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setOldPrice('');
    setImageUrl('');
    setSellerPhone('');
    setSuccess(false);
    setAddedProductId('');
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

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-28 sm:py-36">
        <div className={`p-6 sm:p-10 rounded-3xl border transition-all shadow-2xl ${
          darkMode ? 'bg-[#141210] border-stone-800 shadow-black/80' : 'bg-white border-stone-200 shadow-stone-300/40'
        }`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-500/15 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest mb-1.5">
                <PlusCircle className="w-4 h-4" />
                <span>{lang === 'ka' ? 'ახალი განცხადება' : 'New Listing'}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal">
                {lang === 'ka' ? 'ნივთის დამატება კოლექციაში' : 'Add Jewelry to Collection'}
              </h1>
              <p className="text-xs sm:text-sm opacity-70 mt-1">
                {lang === 'ka'
                  ? 'განათავსეთ თქვენი სამკაული ონლაინ ვიტრინაზე უსაფრთხოდ'
                  : 'Publish your fine piece to the marketplace'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/my-items"
                className="px-4 py-2 rounded-xl border border-stone-700 hover:border-amber-500 text-xs font-medium transition-all"
              >
                {lang === 'ka' ? 'ჩემი ნივთები' : 'My Items'}
              </a>
            </div>
          </div>

          {/* Success Banner */}
          {success ? (
            <div className="p-7 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl text-emerald-400 font-medium">
                {lang === 'ka' ? 'სამკაული წარმატებით დაემატა!' : 'Product Successfully Published!'}
              </h2>
              <p className="text-xs sm:text-sm opacity-80 max-w-md mx-auto">
                {lang === 'ka'
                  ? 'თქვენი ნივთი შენახულია Firestore-ში თქვენი UID-ით და გამოჩნდება საერთო კატალოგში.'
                  : 'Your piece is stored in Firestore under your UID and visible in the public catalog.'}
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <a
                  href="/my-items"
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-md"
                >
                  {lang === 'ka' ? 'ჩემი ნივთების ნახვა' : 'View My Items'}
                </a>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-full border border-stone-600 hover:border-stone-400 text-xs font-semibold tracking-wider uppercase transition-all"
                >
                  {lang === 'ka' ? 'კიდევ ერთის დამატება' : 'Add Another Piece'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider font-semibold opacity-80 mb-1.5">
                    {lang === 'ka' ? 'სამკაულის დასახელება *' : 'Jewelry Title *'}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={lang === 'ka' ? 'მაგ: ბრილიანტის ბეჭედი „მარადიული სიყვარული“' : 'e.g. Diamond Solitaire Ring'}
                    required
                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all ${
                      darkMode
                        ? 'bg-stone-900/90 border-stone-700/80 text-white placeholder-stone-500 focus:border-amber-500'
                        : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold opacity-80 mb-1.5">
                    {lang === 'ka' ? 'კატეგორია' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all ${
                      darkMode
                        ? 'bg-stone-900/90 border-stone-700/80 text-white focus:border-amber-500'
                        : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c} className={darkMode ? 'bg-stone-900 text-white' : 'bg-white text-black'}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold opacity-80 mb-1.5">
                    {lang === 'ka' ? 'მეტალი და სინჯი' : 'Metal & Purity'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={metal}
                      onChange={(e) => setMetal(e.target.value)}
                      className={`w-full px-3 py-3 rounded-xl text-sm border outline-none transition-all ${
                        darkMode
                          ? 'bg-stone-900/90 border-stone-700/80 text-white focus:border-amber-500'
                          : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
                      }`}
                    >
                      {metals.map((m) => (
                        <option key={m} value={m} className={darkMode ? 'bg-stone-900 text-white' : 'bg-white text-black'}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      value={karat}
                      onChange={(e) => setKarat(e.target.value)}
                      className={`w-full px-3 py-3 rounded-xl text-sm border outline-none transition-all ${
                        darkMode
                          ? 'bg-stone-900/90 border-stone-700/80 text-white focus:border-amber-500'
                          : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
                      }`}
                    >
                      <option value="585° (14K)">585° (14K)</option>
                      <option value="750° (18K)">750° (18K)</option>
                      <option value="925° (ვერცხლი)">925° (ვერცხლი)</option>
                      <option value="950° (პლატინა)">950° (პლატინა)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Price & Old Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold opacity-80 mb-1.5">
                    {lang === 'ka' ? 'ფასი (₾) *' : 'Price (₾) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1200"
                    required
                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all font-mono ${
                      darkMode
                        ? 'bg-stone-900/90 border-stone-700/80 text-white placeholder-stone-500 focus:border-amber-500'
                        : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold opacity-80 mb-1.5">
                    {lang === 'ka' ? 'ძველი ფასი (არასავალდებულო, ფასდაკლებისთვის)' : 'Original Price (Optional)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="1500"
                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all font-mono ${
                      darkMode
                        ? 'bg-stone-900/90 border-stone-700/80 text-white placeholder-stone-500 focus:border-amber-500'
                        : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold opacity-80 mb-1.5">
                  {lang === 'ka' ? 'აღწერა და დეტალები' : 'Description & Details'}
                </label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={lang === 'ka' ? 'აღწერეთ ნაკეთობის მდგომარეობა, ზომები, ქვები, სერტიფიკატი...' : 'Describe piece details, condition, stones, certificate...'}
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all resize-y ${
                    darkMode
                      ? 'bg-stone-900/90 border-stone-700/80 text-white placeholder-stone-500 focus:border-amber-500'
                      : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                  }`}
                />
              </div>

              {/* Image Input + Upload */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider font-semibold opacity-80">
                  {lang === 'ka' ? 'სურათის ლინკი ან ფაილის ატვირთვა *' : 'Image URL or Upload File *'}
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... ან ატვირთეთ"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all ${
                        darkMode
                          ? 'bg-stone-900/90 border-stone-700/80 text-white placeholder-stone-500 focus:border-amber-500'
                          : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                      }`}
                    />
                  </div>

                  <label className="px-5 py-3 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>{lang === 'ka' ? 'ფოტოს ატვირთვა' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e.target.files?.[0], (base64) => {
                          if (base64) setImageUrl(base64);
                        })
                      }
                    />
                  </label>
                </div>

                {/* Live Image Preview */}
                {imageUrl && (
                  <div className="mt-3 flex items-center gap-4 p-3 rounded-2xl border border-stone-500/20 bg-black/20">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-stone-700 bg-stone-900 shrink-0">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/brand-logo.jpg';
                        }}
                      />
                    </div>
                    <div className="text-xs space-y-1 min-w-0">
                      <span className="font-semibold text-amber-500 block">სურათის წინასწარი გადახედვა</span>
                      <p className="opacity-70 truncate max-w-md">{imageUrl.substring(0, 60)}...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Seller Contact Phone / WhatsApp */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold opacity-80 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'ka' ? 'გამყიდველის ტელეფონი / WhatsApp ნომერი' : 'Seller Phone / WhatsApp'}</span>
                </label>
                <input
                  type="tel"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="მაგ: 555 12 34 56 ან +995 555 12 34 56"
                  className={`w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all font-mono ${
                    darkMode
                      ? 'bg-stone-900/90 border-stone-700/80 text-white placeholder-stone-500 focus:border-amber-500'
                      : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                  }`}
                />
                <span className="text-[11px] opacity-60 mt-1 block">
                  {lang === 'ka'
                    ? 'ეს ნომერი გამოჩნდება მხოლოდ ავტორიზებული მყიდველებისთვის.'
                    : 'This contact will only be visible to logged-in buyers.'}
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-stone-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <a
                  href="/my-items"
                  className="inline-flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 hover:text-amber-500 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'გაუქმება' : 'Cancel'}</span>
                </a>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === 'ka' ? 'კატალოგში განთავსება' : 'Publish Product'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />
    </div>
  );
}

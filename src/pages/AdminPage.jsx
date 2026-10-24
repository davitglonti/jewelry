import React, { useState, useEffect } from 'react';
import {
  Shield, Sun, Moon, ArrowLeft, Lock, Plus, Upload,
  Link as LinkIcon, X, Edit3, Trash2, BookOpen, ExternalLink, Tag,
  HelpCircle, Truck, ShieldCheck, Sparkles, Star, AlertCircle, RotateCw,
  Search, Filter
} from 'lucide-react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseAuth';
import { useStore } from '../context/StoreContext';
import { handleFileUpload } from '../utils/imageUtils';
import { formatPrice } from '../utils/i18n';
import ValueCardsEditor, { DEFAULT_VALUE_CARDS } from '../components/admin/ValueCardsEditor';
import { DEFAULT_FAQ_ITEMS, DEFAULT_PRODUCT_ASSURANCE } from '../data/defaultSettings';

export default function AdminPage() {
  const {
    darkMode, setDarkMode,
    lang,
    siteSettings, setSiteSettings,
    products, setProducts,
    articles, setArticles, syncArticles,
    inquiries, setInquiries,
    saveMessage, syncData
  } = useStore();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [adminTab, setAdminTab] = useState("catalog");
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [catalogSelectedCategory, setCatalogSelectedCategory] = useState("all");

  // კატალოგის ფილტრაცია ადმინ-პანელში (ძებნა და კატეგორია)
  const filteredAdminProducts = products.filter((p) => {
    if (catalogSelectedCategory !== "all" && p.category !== catalogSelectedCategory) {
      return false;
    }
    if (catalogSearchQuery.trim()) {
      const q = catalogSearchQuery.toLowerCase().trim();
      const nameMatch = (p.name || "").toLowerCase().includes(q);
      const nameEnMatch = (p.nameEn || "").toLowerCase().includes(q);
      const skuMatch = (p.sku || "").toLowerCase().includes(q);
      const metalMatch = (p.metal || "").toLowerCase().includes(q);
      const catMatch = (p.category || "").toLowerCase().includes(q);
      if (!nameMatch && !nameEnMatch && !skuMatch && !metalMatch && !catMatch) {
        return false;
      }
    }
    return true;
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleImageInput, setArticleImageInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newMetalInput, setNewMetalInput] = useState("");
  const [newBlogCategoryInput, setNewBlogCategoryInput] = useState("");
  const [editingFaq, setEditingFaq] = useState(null);
  const [homeWarning, setHomeWarning] = useState("");
  const parsePriceNumber = (val) => {
    if (!val) return null;
    const cleaned = val.toString().replace(/,/g, '').replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const triggerHomeWarning = (msg) => {
    setHomeWarning(msg);
    setTimeout(() => {
      setHomeWarning((prev) => (prev === msg ? "" : prev));
    }, 6000);
  };
  const currentBlogCategories = siteSettings.blogCategories && siteSettings.blogCategories.length > 0
    ? siteSettings.blogCategories
    : ["გიდი", "ოქრო", "ბრილიანტი", "მოვლა", "სტილი"];

  useEffect(() => {
    if (!auth) {
      setAuthChecked(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAdminAuthenticated(!!user);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  return (
    <div
      className={`min-h-screen w-full min-w-0 overflow-x-hidden transition-colors duration-300 ${
        darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#faf7f2] text-[#1c1917]"
      }`}
    >
      {/* Floating Bottom-Right Red Warning Toast */}
      {homeWarning && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100%-3rem)] sm:w-auto p-4 rounded-2xl bg-[#1c0808]/95 border-2 border-red-500 text-white shadow-2xl shadow-black/80 flex items-start gap-3 backdrop-blur-md transition-all animate-bounce-short">
          <div className="p-1.5 rounded-xl bg-red-500/20 text-red-400 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1 pr-1">
            <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-0.5">
              გაფრთხილება
            </div>
            <p className="text-xs sm:text-sm font-medium text-stone-100 leading-snug">
              {homeWarning}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHomeWarning("")}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 shrink-0 transition-colors"
            aria-label="დახურვა"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <header
        className={`sticky top-0 z-40 w-full min-w-0 px-3 sm:px-8 py-3 sm:py-4 border-b backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
          darkMode ? "bg-[#121110]/95 border-stone-800" : "bg-white/95 border-stone-200"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-base sm:text-2xl font-semibold leading-tight break-words">
              {siteSettings.brandName} — {lang === "ka" ? "ადმინ პანელი" : "Admin Panel"}
            </h1>
            <span className="text-xs opacity-60">matare.store/admin</span>
          </div>

          {saveMessage && (
            <span className="hidden sm:inline-block ml-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
              {saveMessage}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto sm:shrink-0">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 shrink-0 rounded-full border transition-all ${
              darkMode ? "border-stone-800 bg-stone-900 text-amber-400" : "border-stone-200 bg-stone-100 text-stone-700"
            }`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <a
            href="/"
            className="flex-1 sm:flex-none min-w-0 px-2.5 sm:px-4 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 text-center transition-all"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>{lang === "ka" ? "საიტზე გადასვლა" : "Back to Store"}</span>
          </a>

          {isAdminAuthenticated && (
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="shrink-0 px-3 sm:px-4 py-2.5 rounded-full border border-stone-600 text-xs font-medium hover:bg-stone-800 hover:text-white transition-all"
            >
              {lang === "ka" ? "გასვლა" : "Logout"}
            </button>
          )}
        </div>
      </header>

      <main className="w-full min-w-0 max-w-6xl mx-auto p-3 sm:p-8">
        {!authChecked ? (
          <div className="text-center py-20 opacity-60 text-sm">იტვირთება...</div>
        ) : !isAdminAuthenticated ? (
          <div className={`p-10 max-w-md mx-auto mt-16 rounded-3xl border text-center space-y-5 ${darkMode ? "bg-[#121110] border-stone-800" : "bg-white border-stone-200 shadow-lg"}`}>
            <div className="w-14 h-14 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl">ადმინისტრატორის ავტორიზაცია</h3>
            <p className="text-xs opacity-65">შეიყვანეთ თქვენი ელ-ფოსტა და პაროლი</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginError("");

                if (!auth) {
                  setLoginError("Firebase Auth არ არის აქტიური!");
                  return;
                }

                try {
                  await signInWithEmailAndPassword(
                    auth,
                    adminEmail.trim(),
                    adminPassword.trim()
                  );
                  setLoginError("");
                } catch (err) {
                  console.error("Firebase Login Error:", err.code, err.message);
                  if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
                    setLoginError("არასწორი ელ-ფოსტა ან პაროლი!");
                  } else if (err.code === "auth/invalid-email") {
                    setLoginError("ელ-ფოსტის ფორმატი არასწორია!");
                  } else {
                    setLoginError(`შეცდომა: ${err.code || err.message}`);
                  }
                }
              }}
              className="space-y-3"
            >
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="ელფოსტა"
                className={`w-full px-4 py-3 rounded-xl text-xs border outline-none ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-100 border-stone-300"}`}
              />
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="პაროლი..."
                className={`w-full px-4 py-3 rounded-xl text-xs border outline-none ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-100 border-stone-300"}`}
              />
              {loginError && <p className="text-xs text-red-400 font-medium">{loginError}</p>}
              <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:brightness-110 transition-all">
                შესვლა
              </button>
            </form>
          </div>
        ) : (
          <div className={`p-6 rounded-3xl border space-y-6 ${darkMode ? "bg-[#121110] border-stone-800" : "bg-white border-stone-200 shadow-sm"}`}>
            <div className="flex flex-wrap gap-2 pb-4 border-b border-stone-500/20">
              {[
                { id: "catalog", label: "1. კატალოგის მართვა" },
                { id: "categories", label: "2. მეტალები & კატეგორიები" },
                { id: "carousel", label: "3. ზედა კარუსელი (Hero)" },
                { id: "brand", label: "4. ლოგო & სათაურები" },
                { id: "craft", label: "5. მთავარი გვერდი (ოსტატობა & ბარათები)" },
                { id: "footer", label: "6. კონტაქტი & ქვედა პანელი" },
                { id: "inquiries", label: `7. შემოსული მოთხოვნები (${inquiries.length})` },
                { id: "about", label: "8. ჩვენს შესახებ გვერდი" },
                { id: "blog", label: `9. ბლოგის მართვა (${(articles || []).length})` },
                { id: "faq", label: "10. FAQ & გარანტიები" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    adminTab === tab.id
                      ? "bg-amber-500 text-black"
                      : darkMode
                      ? "bg-stone-900 text-stone-300 hover:bg-stone-800"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: CATALOG */}
            {adminTab === "catalog" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl">
                      სამკაულების სია ({filteredAdminProducts.length !== products.length ? `${filteredAdminProducts.length} / ${products.length}` : products.length})
                    </h3>
                    {(() => {
                      const featuredCount = products.filter((p, i) => typeof p.showOnHome === "boolean" ? p.showOnHome : i < 5).length;
                      return (
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-xs opacity-60">
                            მთავარ გვერდზე გამოტანილია: <span className={`font-semibold ${featuredCount > 5 ? "text-red-400 font-bold" : featuredCount === 5 ? "text-amber-400" : "text-amber-500"}`}>{featuredCount} / 5</span> სამკაული
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
                      );
                    })()}
                  </div>
                  <button
                    onClick={() =>
                      setEditingProduct({
                        id: "item-" + Date.now(),
                        createdAt: Date.now(),
                        sku: "AUR-" + Math.floor(100 + Math.random() * 900),
                        name: "",
                        nameEn: "",
                        category: siteSettings.categories?.[0] || "ბეჭდები",
                        metal: siteSettings.metals?.[0] || "ყვითელი ოქრო",
                        karat: "750° (18K)",
                        weight: "",
                        stones: "",
                        price: "",
                        oldPrice: "",
                        exclusive: false,
                        showOnHome: products.filter((p, i) => typeof p.showOnHome === "boolean" ? p.showOnHome : i < 5).length < 5,
                        sizes: ["16.5", "17.0", "17.5"],
                        description: "",
                        descriptionEn: "",
                        images: [],
                        video360: "",
                        stockStatus: "in_stock"
                      })
                    }
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    ახალი სამკაულის დამატება
                  </button>
                </div>

                


                {editingProduct && (
                  <div className={`p-5 rounded-2xl border space-y-4 ${darkMode ? "bg-stone-900/90 border-amber-500/40" : "bg-stone-50 border-amber-500"}`}>
                    <h4 className="font-serif text-lg text-amber-500">სამკაულის რედაქტირება / დამატება</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <input
                        type="text"
                        placeholder="დასახელება (ქართულად) *"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                      />
                      <input
                        type="text"
                        placeholder="Name (English)"
                        value={editingProduct.nameEn || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, nameEn: e.target.value })}
                        className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                      />
                      <input
                        type="text"
                        placeholder="კოდი (მაგ: AUR-105)"
                        value={editingProduct.sku}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                      />
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                      >
                        {(siteSettings.categories || []).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <select
                        value={editingProduct.metal}
                        onChange={(e) => setEditingProduct({ ...editingProduct, metal: e.target.value })}
                        className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                      >
                        {(siteSettings.metals || []).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      {(() => {
                        const curPriceNum = parsePriceNumber(editingProduct.price);
                        const oldPriceNum = parsePriceNumber(editingProduct.oldPrice);
                        const isOldInvalid = oldPriceNum !== null && curPriceNum !== null && curPriceNum >= oldPriceNum;

                        return (
                          <>
                            <div className="flex flex-col">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="ახალი / მიმდინარე ფასი (მაგ: 4,500) *"
                                  value={editingProduct.price}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                  className={`w-full p-2.5 pr-8 rounded-xl border ${darkMode ? "bg-stone-800 border-amber-500/50" : "bg-white border-amber-500"}`}
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
                                  value={editingProduct.oldPrice || ""}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: e.target.value })}
                                  className={`w-full p-2.5 pr-8 rounded-xl border transition-all ${
                                    isOldInvalid
                                      ? "border-red-500 bg-red-500/10 text-red-200 focus:border-red-500"
                                      : darkMode
                                        ? "bg-stone-800 border-stone-700"
                                        : "bg-white border-stone-300"
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
                          </>
                        );
                      })()}
                      <input
                        type="text"
                        placeholder="სინჯი (მაგ: 750° / 18K)"
                        value={editingProduct.karat}
                        onChange={(e) => setEditingProduct({ ...editingProduct, karat: e.target.value })}
                        className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                      />
                      <input
                        type="text"
                        placeholder="წონა (მაგ: 4.5 გრ)"
                        value={editingProduct.weight}
                        onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                        className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                      />
                      <input
                        type="text"
                        placeholder="ქვები (მაგ: ბრილიანტი 0.5ct)"
                        value={editingProduct.stones}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stones: e.target.value })}
                        className={`p-2.5 rounded-xl border sm:col-span-3 ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                      />
                    </div>

                    <div className="text-xs">
                      <label className="block opacity-70 mb-1">ხელმისაწვდომი ზომები (გამოყავით მძიმით):</label>
                      <input
                        type="text"
                        value={(editingProduct.sizes || []).join(", ")}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                          })
                        }
                        placeholder="16.0, 16.5, 17.0, 17.5"
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <textarea
                        rows={2}
                        placeholder="აღწერა (ქართულად)"
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                      />
                      <textarea
                        rows={2}
                        placeholder="Description (English)"
                        value={editingProduct.descriptionEn || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, descriptionEn: e.target.value })}
                        className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                      />
                    </div>

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
                            className={`w-full sm:flex-1 p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!imageUrlInput.trim()) return;
                              setEditingProduct({
                                ...editingProduct,
                                images: [...(editingProduct.images || []), imageUrlInput.trim()]
                              });
                              setImageUrlInput("");
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
                            onClick={() => setEditingProduct({ ...editingProduct, video360: "" })}
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
                          value={editingProduct.video360 || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, video360: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border text-xs ${
                            darkMode ? "bg-stone-800 border-stone-700 text-white" : "bg-white border-stone-300 text-stone-900"
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
                        {/* 1. მარაგშია */}
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, stockStatus: "in_stock" })}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            (editingProduct.stockStatus || "in_stock") === "in_stock"
                              ? "border-emerald-500 bg-emerald-500/15 shadow-sm shadow-emerald-500/10"
                              : darkMode ? "border-stone-700 bg-stone-800/40 opacity-70 hover:opacity-100" : "border-stone-200 bg-white opacity-70 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                              {(editingProduct.stockStatus || "in_stock") === "in_stock" && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              )}
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="font-semibold text-xs text-emerald-400">
                              🟢 მარაგშია
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-300 mt-1 pl-4 leading-snug">
                            ადგილზეა, მიწოდება 24-48 საათში
                          </p>
                        </button>

                        {/* 2. შეკვეთით */}
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, stockStatus: "preorder" })}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            editingProduct.stockStatus === "preorder"
                              ? "border-amber-500 bg-amber-500/15 shadow-sm shadow-amber-500/10"
                              : darkMode ? "border-stone-700 bg-stone-800/40 opacity-70 hover:opacity-100" : "border-stone-200 bg-white opacity-70 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0"></span>
                            <span className="font-semibold text-xs text-amber-400">
                              🟡 შეკვეთით
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-300 mt-1 pl-4 leading-snug">
                            3-5 სამუშაო დღე (დამზადება / ჩამოტანა)
                          </p>
                        </button>

                        {/* 3. გაყიდულია / ამოიწურა */}
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, stockStatus: "sold_out" })}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            editingProduct.stockStatus === "sold_out"
                              ? "border-stone-400 bg-stone-500/20 shadow-sm"
                              : darkMode ? "border-stone-700 bg-stone-800/40 opacity-70 hover:opacity-100" : "border-stone-200 bg-white opacity-70 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-stone-400 shrink-0"></span>
                            <span className="font-semibold text-xs text-stone-300">
                              ⚪ გაყიდულია / ამოიწურა
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-300 mt-1 pl-4 leading-snug">
                            რომ კლიენტი ტყუილად არ ელოდოს
                          </p>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3">
                      <div className="flex flex-wrap items-center gap-5">
                        {(() => {
                          const featuredCount = products.filter((p, i) => (typeof p.showOnHome === "boolean" ? p.showOnHome : i < 5) && p.id !== editingProduct.id).length;
                          const isCurrentlyChecked = Boolean(typeof editingProduct.showOnHome === "boolean" ? editingProduct.showOnHome : true);
                          const isFull = featuredCount >= 5;

                          return (
                            <label className={`flex items-center gap-2 text-xs select-none ${!isCurrentlyChecked && isFull ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}>
                              <input
                                type="checkbox"
                                checked={isCurrentlyChecked}
                                onChange={(e) => {
                                  const willBeChecked = e.target.checked;
                                  if (willBeChecked && isFull) {
                                    triggerHomeWarning("⚠️ მთავარი გვერდის ვიტრინა სავსეა (მაქსიმუმ 5 სამკაული ერთ ხაზზე). მე-6 ნივთის დასამატებლად ჯერ მოხსენით სხვა ნივთი მთავარი გვერდიდან!");
                                    return;
                                  }
                                  setHomeWarning("");
                                  setEditingProduct({ ...editingProduct, showOnHome: willBeChecked });
                                }}
                                className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                              />
                              <span className="flex items-center gap-1.5 font-medium text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                მთავარ გვერდზე ჩვენება (მაქს. 5)
                              </span>
                            </label>
                          );
                        })()}

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
                          onClick={() => {
                            // 1. დასახელების შემოწმება
                            if (!editingProduct.name || !editingProduct.name.trim()) {
                              triggerHomeWarning("⚠️ გთხოვთ მიუთითოთ სამკაულის დასახელება (სავალდებულოა)!");
                              return;
                            }

                            // 2. ფასის შემოწმება
                            if (!editingProduct.price || !editingProduct.price.trim()) {
                              triggerHomeWarning("⚠️ გთხოვთ მიუთითოთ სამკაულის ფასი (სავალდებულოა)!");
                              return;
                            }

                            // 3. ფოტოების შემოწმება (მინიმუმ 1 ფოტო)
                            if (!editingProduct.images || editingProduct.images.length === 0) {
                              triggerHomeWarning("⚠️ გთხოვთ დაამატოთ მინიმუმ 1 ფოტო სამკაულისთვის (სავალდებულოა)!");
                              return;
                            }

                            // 4. ფასდაკლების / ძველი ფასის შემოწმება (ახალი ფასი < ძველი ფასი)
                            const curPriceNum = parsePriceNumber(editingProduct.price);
                            const oldPriceNum = parsePriceNumber(editingProduct.oldPrice);
                            if (oldPriceNum !== null) {
                              if (curPriceNum !== null && curPriceNum >= oldPriceNum) {
                                triggerHomeWarning("⚠️ ახალი ფასი არ შეიძლება იყოს ძველ ფასზე მეტი ან ტოლი! ფასდაკლებისთვის ძველი ფასი უნდა აღემატებოდეს ახალ ფასს.");
                                return;
                              }
                            }

                            // 5. მთავარ გვერდზე 5-იანი ლიმიტის შემოწმება
                            const otherFeaturedCount = products.filter((p, i) => (typeof p.showOnHome === "boolean" ? p.showOnHome : i < 5) && p.id !== editingProduct.id).length;
                            if (editingProduct.showOnHome && otherFeaturedCount >= 5) {
                              triggerHomeWarning("⚠️ მთავარი გვერდის ვიტრინა სავსეა (მაქსიმუმ 5 სამკაული ერთ ხაზზე). გთხოვთ გათიშოთ მთავარზე ჩვენება ან ჯერ მოხსნათ სხვა სამკაული მთავარიდან!");
                              return;
                            }

                            const exists = products.some((p) => p.id === editingProduct.id);
                            const ensureLari = (val) => {
                              if (!val) return "";
                              const str = val.toString().trim();
                              if (!str) return "";
                              return str.includes("₾") ? str : (str + " ₾");
                            };

                            const productToSave = {
                              ...editingProduct,
                              price: ensureLari(editingProduct.price),
                              oldPrice: editingProduct.oldPrice?.trim() ? ensureLari(editingProduct.oldPrice) : ""
                            };

                            const updated = exists
                              ? products.map((p) => (p.id === productToSave.id ? productToSave : p))
                              : [productToSave, ...products];
                            setProducts(updated);
                            syncData(siteSettings, updated);
                            setEditingProduct(null);
                            setHomeWarning("");
                          }}
                          className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-amber-500 text-black font-semibold text-xs text-center"
                        >
                          შენახვა
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search & Category Filter Toolbar */}
                <div className={`p-3 sm:p-4 rounded-2xl border space-y-3 ${
                  darkMode ? "bg-stone-900/60 border-stone-800" : "bg-stone-100/70 border-stone-200"
                }`}>
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
                            ? "bg-stone-800/90 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-amber-500/60"
                            : "bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-500"
                        }`}
                      />
                      {catalogSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCatalogSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-50 hover:opacity-100 transition-opacity"
                          title="გასუფთავება"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Quick Clear Button if any filter is active */}
                    {(catalogSearchQuery || catalogSelectedCategory !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setCatalogSearchQuery("");
                          setCatalogSelectedCategory("all");
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
                      onClick={() => setCatalogSelectedCategory("all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                        catalogSelectedCategory === "all"
                          ? "bg-amber-500 text-black font-semibold shadow-xs"
                          : darkMode
                          ? "bg-stone-800 text-stone-300 hover:bg-stone-700"
                          : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-50"
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
                          onClick={() => setCatalogSelectedCategory(isSelected ? "all" : cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-amber-500 text-black font-semibold shadow-xs"
                              : darkMode
                              ? "bg-stone-800 text-stone-300 hover:bg-stone-700"
                              : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-50"
                          }`}
                        >
                          <span>{cat}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected ? "bg-black/20 text-black font-bold" : "opacity-60 bg-stone-500/15"
                          }`}>
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
                        setCatalogSearchQuery("");
                        setCatalogSelectedCategory("all");
                      }}
                      className="mt-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 text-xs font-medium hover:bg-amber-500 hover:text-black transition-all"
                    >
                      ფილტრების გასუფთავება
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredAdminProducts.map((p, pIdx) => {
                      const isFeatured = typeof p.showOnHome === "boolean" ? p.showOnHome : (pIdx < 5);
                      return (
                        <div key={p.id} className="p-3.5 rounded-2xl border border-stone-500/20 flex items-center justify-between gap-3 hover:border-amber-500/30 transition-all">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img src={p.images?.[0]} alt={p.name} className="w-14 h-14 rounded-xl object-cover bg-stone-800 shrink-0 border border-stone-700/40" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                <span className="font-serif font-medium text-sm truncate max-w-[140px] sm:max-w-[200px]" title={p.name}>
                                  {p.name}
                                </span>
                                {(() => {
                                  const st = p.stockStatus || "in_stock";
                                  if (st === "sold_out") {
                                    return (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-stone-500/20 text-stone-300 border border-stone-500/30 shrink-0 font-medium">
                                        ⚪ ამოიწურა
                                      </span>
                                    );
                                  }
                                  if (st === "preorder") {
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
                                <span className="font-mono text-amber-500/90 font-medium">{p.sku}</span> • {p.category} • {p.metal}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {p.oldPrice && <span className="text-xs line-through opacity-45">{formatPrice(p.oldPrice)}</span>}
                                <span className="text-xs text-amber-500 font-semibold">{formatPrice(p.price)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const featuredCount = products.filter((item, itemIdx) => typeof item.showOnHome === "boolean" ? item.showOnHome : (itemIdx < 5)).length;
                                if (!isFeatured && featuredCount >= 5) {
                                  triggerHomeWarning("⚠️ მთავარი გვერდის ვიტრინა სავსეა (მაქსიმუმ 5 სამკაული ერთ ხაზზე). მე-6 ნივთის დასამატებლად ჯერ მოხსენით ვარსკვლავი რომელიმე არსებულ ნივთს!");
                                  return;
                                }
                                setHomeWarning("");
                                const updated = products.map((item, itemIdx) => {
                                  const currentStatus = typeof item.showOnHome === "boolean" ? item.showOnHome : (itemIdx < 5);
                                  if (item.id === p.id) {
                                    return { ...item, showOnHome: !currentStatus };
                                  }
                                  return typeof item.showOnHome === "boolean" ? item : { ...item, showOnHome: currentStatus };
                                });
                                setProducts(updated);
                                syncData(siteSettings, updated);
                              }}
                              title={isFeatured ? "მთავარ გვერდზე გამოტანილია (დააწკაპუნეთ მოსახსნელად)" : "მთავარ გვერდზე გამოტანა"}
                              className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs ${
                                isFeatured
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
                                  : "bg-stone-500/10 text-stone-400 hover:text-amber-400 hover:bg-stone-500/20"
                              }`}
                            >
                              <Star className={`w-4 h-4 ${isFeatured ? "fill-amber-400 text-amber-400" : ""}`} />
                              <span className="hidden lg:inline text-[11px] font-medium">
                                {isFeatured ? "მთავარზეა" : "მთავარზე"}
                              </span>
                            </button>

                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-2 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-black"
                              title="რედაქტირება"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const updated = products.filter((item) => item.id !== p.id);
                                setProducts(updated);
                                syncData(siteSettings, updated);
                              }}
                              className="p-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white"
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
            )}

            {/* TAB 2: CATEGORIES & METALS */}
            {adminTab === "categories" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-stone-500/20 space-y-4">
                  <h4 className="font-serif text-lg text-amber-500">კატეგორიების მართვა</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      placeholder="ახალი კატეგორია (მაგ: გულსაბნევები)"
                      className={`flex-1 p-2.5 rounded-xl text-xs border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                    <button
                      onClick={() => {
                        if (!newCategoryInput.trim()) return;
                        const updated = {
                          ...siteSettings,
                          categories: [...(siteSettings.categories || []), newCategoryInput.trim()]
                        };
                        setSiteSettings(updated);
                        syncData(updated, products);
                        setNewCategoryInput("");
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold"
                    >
                      დამატება
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(siteSettings.categories || []).map((cat) => (
                      <span key={cat} className="px-3 py-1.5 rounded-full text-xs bg-stone-500/15 flex items-center gap-2">
                        {cat}
                        <button
                          onClick={() => {
                            const updated = {
                              ...siteSettings,
                              categories: siteSettings.categories.filter((c) => c !== cat)
                            };
                            setSiteSettings(updated);
                            syncData(updated, products);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-stone-500/20 space-y-4">
                  <h4 className="font-serif text-lg text-amber-500">მეტალების / მასალების მართვა</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMetalInput}
                      onChange={(e) => setNewMetalInput(e.target.value)}
                      placeholder="ახალი მეტალი (მაგ: ვერცხლი 925)"
                      className={`flex-1 p-2.5 rounded-xl text-xs border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                    <button
                      onClick={() => {
                        if (!newMetalInput.trim()) return;
                        const updated = {
                          ...siteSettings,
                          metals: [...(siteSettings.metals || []), newMetalInput.trim()]
                        };
                        setSiteSettings(updated);
                        syncData(updated, products);
                        setNewMetalInput("");
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold"
                    >
                      დამატება
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(siteSettings.metals || []).map((metal) => (
                      <span key={metal} className="px-3 py-1.5 rounded-full text-xs bg-stone-500/15 flex items-center gap-2">
                        {metal}
                        <button
                          onClick={() => {
                            const updated = {
                              ...siteSettings,
                              metals: siteSettings.metals.filter((m) => m !== metal)
                            };
                            setSiteSettings(updated);
                            syncData(updated, products);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CAROUSEL */}
            {adminTab === "carousel" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-lg text-amber-500">ზედა კარუსელის სლაიდები</h4>
                  <button
                    onClick={() => {
                      const newSlide = {
                        id: Date.now(),
                        badge: "ახალი კოლექცია",
                        badgeEn: "New Collection",
                        title: "სათაური ქართულად",
                        titleEn: "Title in English",
                        subtitle: "აღწერა ქართულად...",
                        subtitleEn: "Description in English...",
                        buttonText: "კოლექციის ნახვა",
                        buttonTextEn: "Explore Collection",
                        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80"
                      };
                      const updated = {
                        ...siteSettings,
                        heroSlides: [...(siteSettings.heroSlides || []), newSlide]
                      };
                      setSiteSettings(updated);
                      syncData(updated, products);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    სლაიდის დამატება
                  </button>
                </div>

                {(siteSettings.heroSlides || []).map((slide, idx) => (
                  <div key={slide.id || idx} className="p-4 rounded-2xl border border-stone-500/20 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400">სლაიდი #{idx + 1}</span>
                      {siteSettings.heroSlides.length > 1 && (
                        <button
                          onClick={() => {
                            const updated = {
                              ...siteSettings,
                              heroSlides: siteSettings.heroSlides.filter((_, i) => i !== idx)
                            };
                            setSiteSettings(updated);
                            syncData(updated, products);
                          }}
                          className="text-red-400 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> წაშლა
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="opacity-60 block mb-1">ბეიჯი (GE):</label>
                        <input
                          type="text"
                          value={slide.badge || ""}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], badge: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                      </div>
                      <div>
                        <label className="opacity-60 block mb-1">Badge (EN):</label>
                        <input
                          type="text"
                          value={slide.badgeEn || ""}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], badgeEn: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                      </div>
                      <div>
                        <label className="opacity-60 block mb-1">მთავარი სათაური (GE):</label>
                        <input
                          type="text"
                          value={slide.title || ""}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], title: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                      </div>
                      <div>
                        <label className="opacity-60 block mb-1">Main Title (EN):</label>
                        <input
                          type="text"
                          value={slide.titleEn || ""}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], titleEn: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="opacity-60 block mb-1">აღწერა / ქვესათაური (GE):</label>
                        <textarea
                          rows={2}
                          value={slide.subtitle || ""}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], subtitle: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="opacity-60 block mb-1">Subtitle (EN):</label>
                        <textarea
                          rows={2}
                          value={slide.subtitleEn || ""}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], subtitleEn: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                      </div>
                      <div>
                        <label className="opacity-60 block mb-1">ღილაკის ტექსტი (GE):</label>
                        <input
                          type="text"
                          value={slide.buttonText || ""}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], buttonText: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                      </div>
                      <div>
                        <label className="opacity-60 block mb-1">Button Text (EN):</label>
                        <input
                          type="text"
                          value={slide.buttonTextEn || ""}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], buttonTextEn: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="opacity-60 block mb-1">ფონის ფოტოს ბმული (URL ან ატვირთვა):</label>
                        <input
                          type="text"
                          value={slide.image || ""}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], image: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        ფოტოს ატვირთვა ფაილიდან
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            handleFileUpload(e.target.files?.[0], (base64) => {
                              const copy = [...siteSettings.heroSlides];
                              copy[idx] = { ...copy[idx], image: base64 };
                              setSiteSettings({ ...siteSettings, heroSlides: copy });
                            });
                          }}
                        />
                      </label>
                      <button
                        onClick={() => syncData(siteSettings, products)}
                        className="px-5 py-2 rounded-xl bg-amber-500 text-black font-semibold"
                      >
                        სლაიდის შენახვა
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: BRAND */}
            {adminTab === "brand" && (
              <div className="space-y-4 max-w-xl text-xs">
                <h4 className="font-serif text-lg text-amber-500">ბრენდის სახელი, სათაური და ლოგო</h4>
                <div className="space-y-3">
                  <div>
                    <label className="opacity-70 block mb-1">ბრენდის სახელი (საიტზე შიგნით):</label>
                    <input
                      type="text"
                      value={siteSettings.brandName || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, brandName: e.target.value })}
                      placeholder="მაგ: AURELIA"
                      className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                  </div>

                  <div>
                    <label className="opacity-70 block mb-1">ბრაუზერის სათაური (Tab-ში რაც წერია):</label>
                    <input
                      type="text"
                      value={siteSettings.browserTitle || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, browserTitle: e.target.value })}
                      placeholder="მაგ: AURELIA — საიუველირო სახლი"
                      className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                  </div>

                  <div>
                    <label className="opacity-70 block mb-1">ლოგო (ჩანს საიტზე და ბრაუზერის ტაბში Favicon-ად):</label>
                    <input
                      type="text"
                      value={siteSettings.logoUrl || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, logoUrl: e.target.value })}
                      placeholder="https://... ან ატვირთეთ ქვემოდან"
                      className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    ლოგოს ატვირთვა კომპიუტერიდან
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e.target.files?.[0], (b64) =>
                          setSiteSettings({ ...siteSettings, logoUrl: b64 })
                        )
                      }
                    />
                  </label>
                </div>

                <button
                  onClick={() => syncData(siteSettings, products)}
                  className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold"
                >
                  ცვლილებების შენახვა
                </button>
              </div>
            )}

            {/* TAB 5: CRAFTSMANSHIP */}
            {adminTab === "craft" && (
              <div className="space-y-4 max-w-3xl text-xs">
                <h4 className="font-serif text-lg text-amber-500">„ხელოვნება, რომელიც თაობებს გადაეცემა“ — ტექსტები და ფოტოები</h4>
                <input
                  type="text"
                  value={siteSettings.craftBadge || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, craftBadge: e.target.value })}
                  placeholder="პატარა წარწერა"
                  className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                />
                <input
                  type="text"
                  value={siteSettings.craftTitle || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, craftTitle: e.target.value })}
                  placeholder="მთავარი სათაური"
                  className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                />
                <textarea
                  rows={3}
                  value={siteSettings.craftDesc || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, craftDesc: e.target.value })}
                  placeholder="აღწერის ტექსტი"
                  className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="font-medium block">მარცხენა ფოტო:</label>
                    <input
                      type="text"
                      value={siteSettings.craftImg1 || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, craftImg1: e.target.value })}
                      placeholder="ფოტოს URL"
                      className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> ფაილის ატვირთვა
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e.target.files?.[0], (b64) =>
                            setSiteSettings({ ...siteSettings, craftImg1: b64 })
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium block">მარჯვენა ფოტო:</label>
                    <input
                      type="text"
                      value={siteSettings.craftImg2 || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, craftImg2: e.target.value })}
                      placeholder="ფოტოს URL"
                      className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> ფაილის ატვირთვა
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e.target.files?.[0], (b64) =>
                            setSiteSettings({ ...siteSettings, craftImg2: b64 })
                          )
                        }
                      />
                    </label>
                  </div>
                </div>

                
                <ValueCardsEditor
                  darkMode={darkMode}
                  sectionTitle="მთავარი გვერდის ღირებულებების ბარათები (4 ბარათი)"
                  sectionSubtitle="ეს ბარათები გამოჩნდება მხოლოდ მთავარ გვერდზე. („ჩვენს შესახებ“ გვერდის ბარათები იმართება მე-8 ტაბიდან)."
                  badgeKa={siteSettings.homeValuesBadge || siteSettings.aboutValuesBadge || "რატომ გვირჩევენ ჩვენ"}
                  badgeEn={siteSettings.homeValuesBadgeEn || "Why Choose Us"}
                  onBadgeKaChange={(val) => setSiteSettings({ ...siteSettings, homeValuesBadge: val })}
                  onBadgeEnChange={(val) => setSiteSettings({ ...siteSettings, homeValuesBadgeEn: val })}
                  titleKa={siteSettings.homeValuesTitle || siteSettings.aboutValuesTitle || "ჩვენი სტანდარტი და ღირებულებები"}
                  titleEn={siteSettings.homeValuesTitleEn || "Our Standards & Values"}
                  onTitleKaChange={(val) => setSiteSettings({ ...siteSettings, homeValuesTitle: val })}
                  onTitleEnChange={(val) => setSiteSettings({ ...siteSettings, homeValuesTitleEn: val })}
                  cards={siteSettings.homeValues?.length === 4 ? siteSettings.homeValues : (siteSettings.aboutValues?.length === 4 ? siteSettings.aboutValues : DEFAULT_VALUE_CARDS)}
                  onCardChange={(idx, field, val) => {
                    const base = siteSettings.homeValues?.length === 4
                      ? [...siteSettings.homeValues]
                      : (siteSettings.aboutValues?.length === 4 ? [...siteSettings.aboutValues] : DEFAULT_VALUE_CARDS.map(c => ({ ...c })));
                    base[idx] = { ...base[idx], [field]: val };
                    setSiteSettings({ ...siteSettings, homeValues: base });
                  }}
                />

                <button
                  onClick={() => syncData(siteSettings, products)}
                  className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold"
                >
                  შენახვა
                </button>
              </div>
            )}

            {/* TAB 6: FOOTER & CONTACTS */}
            {adminTab === "footer" && (
              <div className="space-y-4 max-w-2xl text-xs">
                <h4 className="font-serif text-lg text-amber-500">კონტაქტები, WhatsApp/Messenger და ქვედა პანელი</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="opacity-70 block mb-1">ტელეფონი:</label>
                    <input
                      type="text"
                      value={siteSettings.phone || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1">WhatsApp ნომერი (მაგ: 995555000000):</label>
                    <input
                      type="text"
                      value={siteSettings.whatsapp || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1">Messenger ლინკი (მაგ: https://m.me/yourpage):</label>
                    <input
                      type="text"
                      value={siteSettings.messenger || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, messenger: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1">მისამართი:</label>
                    <input
                      type="text"
                      value={siteSettings.address || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1">სამუშაო საათები:</label>
                    <input
                      type="text"
                      value={siteSettings.hours || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hours: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1">საავტორო უფლებების ტექსტი (Footer):</label>
                    <input
                      type="text"
                      value={siteSettings.copyright || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, copyright: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1">Instagram ლინკი:</label>
                    <input
                      type="text"
                      value={siteSettings.instagram || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                  </div>
                  <div>
                    <label className="opacity-70 block mb-1">Facebook ლინკი:</label>
                    <input
                      type="text"
                      value={siteSettings.facebook || ""}
                      onChange={(e) => setSiteSettings({ ...siteSettings, facebook: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                  </div>
                </div>
                <button
                  onClick={() => syncData(siteSettings, products)}
                  className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold"
                >
                  შენახვა
                </button>
              </div>
            )}

            {/* TAB 7: INQUIRIES */}
            {adminTab === "inquiries" && (
              <div className="space-y-3">
                <h4 className="font-serif text-lg text-amber-500">მომხმარებლების მოთხოვნები</h4>
                {inquiries.length === 0 ? (
                  <p className="text-xs opacity-60">ჯერ მოთხოვნები არ შემოსულა.</p>
                ) : (
                  inquiries.map((inq) => (
                    <div key={inq.id} className="p-4 rounded-2xl border border-stone-500/20 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-sm">{inq.clientName} — {inq.clientPhone}</div>
                        <div className="text-amber-500">მოდელი: {inq.productName} ({inq.sku}) {inq.size ? `• ზომა: ${inq.size}` : ""}</div>
                        <div className="opacity-50">{inq.date}</div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = inquiries.filter((i) => i.id !== inq.id);
                          setInquiries(updated);
                          syncData(siteSettings, products, updated);
                        }}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 8: ABOUT PAGE MANAGEMENT */}
            {adminTab === "about" && (
              <div className="space-y-6 max-w-3xl text-xs">
                <h4 className="font-serif text-lg text-amber-500">
                  „ჩვენს შესახებ“ გვერდის მართვა
                </h4>

                {/* Hero სექცია (სათაურები და აღწერები ორივე ენაზე) */}
                <div className="space-y-3">
                  <label className="font-medium block text-amber-400">თავი / სათაური (Hero Section):</label>
                  <input
                    type="text"
                    value={siteSettings.aboutHeroTitle || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutHeroTitle: e.target.value })}
                    placeholder="მთავარი სათაური (ქართულად)"
                    className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                  />
                  <input
                    type="text"
                    value={siteSettings.aboutHeroTitleEn || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutHeroTitleEn: e.target.value })}
                    placeholder="Main Title (English)"
                    className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                  />
                  <textarea
                    rows={2}
                    value={siteSettings.aboutHeroSubtitle || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutHeroSubtitle: e.target.value })}
                    placeholder="ქვესათაური / აღწერა (ქართულად)"
                    className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                  />
                  <textarea
                    rows={2}
                    value={siteSettings.aboutHeroSubtitleEn || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutHeroSubtitleEn: e.target.value })}
                    placeholder="Subtitle (English)"
                    className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                  />
                </div>

                {/* დამატებითი ისტორია */}
                <div className="space-y-3 pt-4 border-t border-stone-500/20">
                  <label className="font-medium block text-amber-400">დამატებითი ისტორია / აბზაცი:</label>
                  <textarea
                    rows={4}
                    value={siteSettings.aboutExtraText || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutExtraText: e.target.value })}
                    placeholder="ტექსტი რომელიც ჩნდება 'ჩვენს შესახებ' გვერდზე..."
                    className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                  />
                </div>

                <ValueCardsEditor
                  darkMode={darkMode}
                  sectionTitle="„ჩვენს შესახებ“ გვერდის ღირებულებების ბარათები (4 ბარათი)"
                  sectionSubtitle="ეს ბარათები გამოჩნდება მხოლოდ „ჩვენს შესახებ“ (/about) გვერდზე. (მთავარი გვერდის ბარათები იმართება მე-5 ტაბიდან)."
                  badgeKa={siteSettings.aboutValuesBadge || "რატომ გვირჩევენ ჩვენ"}
                  badgeEn={siteSettings.aboutValuesBadgeEn || "Why Choose Us"}
                  onBadgeKaChange={(val) => setSiteSettings({ ...siteSettings, aboutValuesBadge: val })}
                  onBadgeEnChange={(val) => setSiteSettings({ ...siteSettings, aboutValuesBadgeEn: val })}
                  titleKa={siteSettings.aboutValuesTitle || "ჩვენი სტანდარტი და ღირებულებები"}
                  titleEn={siteSettings.aboutValuesTitleEn || "Our Standards & Values"}
                  onTitleKaChange={(val) => setSiteSettings({ ...siteSettings, aboutValuesTitle: val })}
                  onTitleEnChange={(val) => setSiteSettings({ ...siteSettings, aboutValuesTitleEn: val })}
                  cards={siteSettings.aboutValues?.length === 4 ? siteSettings.aboutValues : DEFAULT_VALUE_CARDS}
                  onCardChange={(idx, field, val) => {
                    const base = siteSettings.aboutValues?.length === 4
                      ? [...siteSettings.aboutValues]
                      : DEFAULT_VALUE_CARDS.map(c => ({ ...c }));
                    base[idx] = { ...base[idx], [field]: val };
                    setSiteSettings({ ...siteSettings, aboutValues: base });
                  }}
                />

                <button
                  onClick={() => syncData(siteSettings, products)}
                  className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold mt-4"
                >
                  ცვლილებების შენახვა
                </button>
              </div>
            )}
            {/* TAB 9: BLOG MANAGEMENT */}
            {adminTab === "blog" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-500" />
                      სტატიების სია ({(articles || []).length})
                    </h3>
                    <p className="text-xs opacity-70 mt-1">
                      სტატიები განკუთვნილია საიტის SEO ოპტიმიზაციისთვის და მომხმარებლებისთვის რჩევების გასაზიარებლად.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="/blog"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl border border-stone-700 hover:border-amber-500 text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      ბლოგის ნახვა
                    </a>
                    <button
                      onClick={() =>
                        setEditingArticle({
                          id: "art-" + Date.now(),
                          slug: "",
                          titleKa: "",
                          titleEn: "",
                          category: currentBlogCategories[0] || "გიდი",
                          categoryEn: "Guide",
                          readTime: "4 წთ",
                          readTimeEn: "4 min read",
                          date: new Date().toISOString().split("T")[0],
                          image: "",
                          excerptKa: "",
                          excerptEn: "",
                          contentKa: "",
                          contentEn: ""
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold flex items-center gap-1.5 hover:brightness-110 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      ახალი სტატია
                    </button>
                  </div>
                </div>

                {/* BLOG CATEGORIES MANAGEMENT */}
                <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${darkMode ? "bg-stone-900/40 border-stone-800" : "bg-stone-50 border-stone-200"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-serif text-sm font-semibold text-amber-500 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      ბლოგის კატეგორიები ({currentBlogCategories.length})
                    </h4>
                    <span className="text-[11px] opacity-60">
                      ეს კატეგორიები ავტომატურად გამოჩნდება სტატიის დამატებისას და საიტზე ფილტრში
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newBlogCategoryInput}
                      onChange={(e) => setNewBlogCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = newBlogCategoryInput.trim();
                          if (!val) return;
                          if (currentBlogCategories.includes(val)) {
                            alert("ეს კატეგორია უკვე არსებობს!");
                            return;
                          }
                          const updated = {
                            ...siteSettings,
                            blogCategories: [...currentBlogCategories, val]
                          };
                          setSiteSettings(updated);
                          syncData(updated, products);
                          setNewBlogCategoryInput("");
                        }
                      }}
                      placeholder="ახალი კატეგორიის სახელი (მაგ: საჩუქრების იდეები, მოვლა, ისტორია)"
                      className={`flex-1 p-2.5 rounded-xl text-xs border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newBlogCategoryInput.trim();
                        if (!val) return;
                        if (currentBlogCategories.includes(val)) {
                          alert("ეს კატეგორია უკვე არსებობს!");
                          return;
                        }
                        const updated = {
                          ...siteSettings,
                          blogCategories: [...currentBlogCategories, val]
                        };
                        setSiteSettings(updated);
                        syncData(updated, products);
                        setNewBlogCategoryInput("");
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-semibold hover:brightness-110 transition-all shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      კატეგორიის დამატება
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentBlogCategories.map((cat) => (
                      <span
                        key={cat}
                        className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border ${
                          darkMode ? "bg-stone-800/80 border-stone-700 text-stone-200" : "bg-white border-stone-200 text-stone-800 shadow-sm"
                        }`}
                      >
                        <span className="font-medium">{cat}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (currentBlogCategories.length <= 1) {
                              alert("მინიმუმ ერთი კატეგორია უნდა დარჩეს!");
                              return;
                            }
                            const updated = {
                              ...siteSettings,
                              blogCategories: currentBlogCategories.filter((c) => c !== cat)
                            };
                            setSiteSettings(updated);
                            syncData(updated, products);
                          }}
                          className="text-stone-400 hover:text-red-400 transition-colors"
                          title={`წაშლა: ${cat}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* MODAL / EDITOR */}
                {editingArticle && (
                  <div className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${darkMode ? "bg-stone-900/95 border-amber-500/40" : "bg-stone-50 border-amber-500"}`}>
                    <div className="flex items-center justify-between border-b pb-3 border-stone-500/20">
                      <h4 className="font-serif text-lg text-amber-500 flex items-center gap-2">
                        <Edit3 className="w-4 h-4" />
                        {editingArticle.id && (articles || []).some((a) => a.id === editingArticle.id)
                          ? "სტატიის რედაქტირება"
                          : "ახალი სტატიის დამატება"}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingArticle(null)}
                        className="p-1 rounded-lg hover:bg-stone-800 transition-colors"
                      >
                        <X className="w-5 h-5 opacity-70" />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Titles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold block text-amber-500">სათაური (ქართულად) *</label>
                          <input
                            type="text"
                            placeholder="მაგ: როგორ შევარჩიოთ ბეჭდის ზომა სწორად"
                            value={editingArticle.titleKa || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updates = { titleKa: val };
                              if (!editingArticle.slug || editingArticle.slug.trim() === "") {
                                updates.slug = val
                                  .toLowerCase()
                                  .replace(/[^\w\s-]/g, "")
                                  .trim()
                                  .replace(/\s+/g, "-");
                              }
                              setEditingArticle({ ...editingArticle, ...updates });
                            }}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold block text-amber-500">Title (English)</label>
                          <input
                            type="text"
                            placeholder="e.g. How to Choose the Right Ring Size"
                            value={editingArticle.titleEn || ""}
                            onChange={(e) => setEditingArticle({ ...editingArticle, titleEn: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                          />
                        </div>
                      </div>

                      {/* Slug & Category & ReadTime & Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold block">URL სლაგი (slug) *</label>
                          <input
                            type="text"
                            placeholder="how-to-choose-ring-size"
                            value={editingArticle.slug || ""}
                            onChange={(e) =>
                              setEditingArticle({
                                ...editingArticle,
                                slug: e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-_]/g, "-")
                                  .replace(/--+/g, "-")
                              })
                            }
                            className={`w-full p-2.5 rounded-xl border font-mono text-[11px] ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                          />
                          <span className="text-[10px] opacity-60">ლინკი: /blog/{editingArticle.slug || "..."}</span>
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold block text-amber-500">კატეგორია *</label>
                          <select
                            value={editingArticle.category || currentBlogCategories[0] || "გიდი"}
                            onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border cursor-pointer font-medium ${darkMode ? "bg-stone-800 border-stone-700 text-white" : "bg-white border-stone-300 text-stone-900"}`}
                          >
                            {Array.from(new Set([...currentBlogCategories, editingArticle.category].filter(Boolean))).map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold block">კითხვის დრო</label>
                          <input
                            type="text"
                            placeholder="4 წთ / 4 min"
                            value={editingArticle.readTime || ""}
                            onChange={(e) => setEditingArticle({ ...editingArticle, readTime: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold block">გამოქვეყნების თარიღი</label>
                          <input
                            type="date"
                            value={editingArticle.date || ""}
                            onChange={(e) => setEditingArticle({ ...editingArticle, date: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                          />
                        </div>
                      </div>

                      {/* Cover Photo */}
                      <div className="space-y-2 pt-2">
                        <label className="font-semibold block text-amber-500">მთავარი ფოტო (Cover Image)</label>
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-black font-semibold cursor-pointer shrink-0">
                            <Upload className="w-4 h-4" />
                            ფოტოს ატვირთვა
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                handleFileUpload(file, (base64) => {
                                  setEditingArticle((prev) => ({ ...prev, image: base64 }));
                                });

                              }}
                            />
                          </label>

                          <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 w-full">
                            <input
                              type="url"
                              value={articleImageInput}
                              onChange={(e) => setArticleImageInput(e.target.value)}
                              placeholder="ან ჩასვით ფოტოს ლინკი (https://...)"
                              className={`w-full sm:flex-1 p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!articleImageInput.trim()) return;
                                setEditingArticle({ ...editingArticle, image: articleImageInput.trim() });
                                setArticleImageInput("");
                              }}
                              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-700 text-white flex items-center justify-center gap-1 shrink-0"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                              დამატება
                            </button>
                          </div>
                        </div>

                        {editingArticle.image && (
                          <div className="relative w-48 h-28 rounded-xl overflow-hidden border border-amber-500/40 mt-2 group">
                            <img src={editingArticle.image} alt="Cover preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setEditingArticle((prev) => ({ ...prev, image: "" }))}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                              title="ფოტოს წაშლა"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Excerpts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1">
                          <label className="font-semibold block">მოკლე ანონსი / აღწერა (ქართულად) *</label>
                          <textarea
                            rows={3}
                            placeholder="მოკლე შეჯამება, რომელიც გამოჩნდება ბლოგის ბარათზე და Google-ის საძიებო შედეგებში..."
                            value={editingArticle.excerptKa || ""}
                            onChange={(e) => setEditingArticle({ ...editingArticle, excerptKa: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold block">Short Excerpt (English)</label>
                          <textarea
                            rows={3}
                            placeholder="Short excerpt for card and meta description..."
                            value={editingArticle.excerptEn || ""}
                            onChange={(e) => setEditingArticle({ ...editingArticle, excerptEn: e.target.value })}
                            className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                          />
                        </div>
                      </div>

                      {/* Full Markdown Content */}
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="font-semibold block text-amber-500">სტატიის სრული შინაარსი (ქართულად) *</label>
                            <span className="text-[11px] opacity-60">მხარდაჭერილია Markdown (# სათაური, **მუქი**, - სია)</span>
                          </div>
                          <textarea
                            rows={12}
                            placeholder="დაწერეთ სტატიის სრული ტექსტი აქ...&#10;&#10;### ქვესათაური&#10;ტექსტი...&#10;&#10;- პუნქტი 1&#10;- პუნქტი 2"
                            value={editingArticle.contentKa || ""}
                            onChange={(e) => setEditingArticle({ ...editingArticle, contentKa: e.target.value })}
                            className={`w-full p-3 rounded-xl border font-mono text-xs leading-relaxed ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold block text-amber-500">Full Content (English)</label>
                          <textarea
                            rows={8}
                            placeholder="Full article text in English..."
                            value={editingArticle.contentEn || ""}
                            onChange={(e) => setEditingArticle({ ...editingArticle, contentEn: e.target.value })}
                            className={`w-full p-3 rounded-xl border font-mono text-xs leading-relaxed ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-500/20">
                        <button
                          type="button"
                          onClick={() => setEditingArticle(null)}
                          className="px-5 py-2.5 rounded-xl border border-stone-600 hover:bg-stone-800 transition-colors"
                        >
                          გაუქმება
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editingArticle.titleKa?.trim()) {
                              alert("გთხოვთ შეიყვანოთ სტატიის სათაური ქართულად!");
                              return;
                            }
                            const cleanSlug = (editingArticle.slug || editingArticle.id)
                              .toLowerCase()
                              .replace(/[^a-z0-9-_]/g, "-")
                              .replace(/--+/g, "-")
                              .replace(/^-|-$/g, "");

                            if (!cleanSlug) {
                              alert("გთხოვთ შეიყვანოთ სწორი URL სლაგი!");
                              return;
                            }

                            const prepared = {
                              ...editingArticle,
                              slug: cleanSlug,
                              date: editingArticle.date || new Date().toISOString().split("T")[0]
                            };

                            const list = articles || [];
                            const exists = list.some((a) => a.id === prepared.id);
                            const updated = exists
                              ? list.map((a) => (a.id === prepared.id ? prepared : a))
                              : [prepared, ...list];

                            setArticles(updated);
                            syncArticles(updated);
                            setEditingArticle(null);
                          }}
                          className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-semibold hover:brightness-110 transition-all shadow-md"
                        >
                          შენახვა & გამოქვეყნება
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ARTICLES LIST */}
                <div className="space-y-3">
                  {(!articles || articles.length === 0) ? (
                    <div className="text-center py-12 opacity-60 text-xs">
                      სტატიები ჯერ არ არის დამატებული. დააჭირეთ „ახალი სტატია“ ღილაკს.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {articles.map((art) => (
                        <div
                          key={art.id}
                          className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                            darkMode ? "bg-stone-900/60 border-stone-800 hover:border-stone-700" : "bg-white border-stone-200 shadow-sm hover:border-amber-500/40"
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-800 shrink-0">
                              {art.image ? (
                                <img src={art.image} alt={art.titleKa} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-500">
                                  <BookOpen className="w-6 h-6 opacity-40" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-medium">
                                  {art.category || "გიდი"}
                                </span>
                                <span className="text-[10px] opacity-50">{art.date}</span>
                                {art.readTime && <span className="text-[10px] opacity-50">• {art.readTime}</span>}
                              </div>
                              <h4 className="font-serif text-sm font-semibold line-clamp-1">{art.titleKa}</h4>
                              {art.titleEn && <p className="text-[11px] opacity-60 line-clamp-1">{art.titleEn}</p>}
                              <p className="text-[10px] font-mono text-amber-500/80 mt-1 truncate">/blog/{art.slug}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-stone-500/15 text-xs">
                            <a
                              href={`/blog/${art.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-amber-500 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              ნახვა
                            </a>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingArticle({ ...art })}
                                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="w-3 h-3 text-amber-400" />
                                რედაქტირება
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`ნამდვილად გსურთ სტატიის „${art.titleKa}“ წაშლა?`)) {
                                    const updated = articles.filter((a) => a.id !== art.id);
                                    setArticles(updated);
                                    syncArticles(updated);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-colors"
                                title="წაშლა"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* TAB 10: FAQ & PRODUCT ASSURANCE MANAGEMENT */}
            {adminTab === "faq" && (() => {
              const currentFaqList = siteSettings.faqItems && siteSettings.faqItems.length > 0
                ? siteSettings.faqItems
                : DEFAULT_FAQ_ITEMS;

              const currentAssurance = siteSettings.productAssurance && siteSettings.productAssurance.length === 3
                ? siteSettings.productAssurance
                : DEFAULT_PRODUCT_ASSURANCE;

              return (
                <div className="space-y-10">
                  {/* SECTION 1: FAQ MANAGEMENT */}
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-500/20">
                      <div>
                        <h3 className="font-serif text-xl flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-amber-500" />
                          ხშირად დასმული კითხვები (FAQ) ({currentFaqList.length})
                        </h3>
                        <p className="text-xs opacity-70 mt-1">
                          ეს კითხვა-პასუხები გამოდის მთავარი გვერდის ბოლოში და გადაეცემა Google-ს საძიებო შედეგებში Rich Snippets-ისთვის.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingFaq({
                            id: "faq-" + Date.now(),
                            questionKa: "",
                            questionEn: "",
                            answerKa: "",
                            answerEn: ""
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold flex items-center gap-1.5 hover:brightness-110 transition-all shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        ახალი კითხვის დამატება
                      </button>
                    </div>

                    {/* MODAL / FORM FOR FAQ ITEM */}
                    {editingFaq && (
                      <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
                        darkMode ? "bg-stone-900/95 border-amber-500/40" : "bg-stone-50 border-amber-500"
                      }`}>
                        <div className="flex items-center justify-between border-b pb-3 border-stone-500/20">
                          <h4 className="font-serif text-base text-amber-500 flex items-center gap-2">
                            <Edit3 className="w-4 h-4" />
                            {currentFaqList.some((f) => f.id === editingFaq.id)
                              ? "კითხვის რედაქტირება"
                              : "ახალი კითხვის დამატება"}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setEditingFaq(null)}
                            className="p-1 rounded-lg hover:bg-stone-800 transition-colors"
                          >
                            <X className="w-5 h-5 opacity-70" />
                          </button>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-semibold block text-amber-500">კითხვა (ქართულად) *</label>
                              <input
                                type="text"
                                value={editingFaq.questionKa || ""}
                                onChange={(e) => setEditingFaq({ ...editingFaq, questionKa: e.target.value })}
                                placeholder="მაგ: როგორ შევარჩიო ბეჭდის ზომა სწორად?"
                                className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold block text-amber-500">Question (English)</label>
                              <input
                                type="text"
                                value={editingFaq.questionEn || ""}
                                onChange={(e) => setEditingFaq({ ...editingFaq, questionEn: e.target.value })}
                                placeholder="e.g. How do I choose the right ring size?"
                                className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-semibold block">პასუხი (ქართულად) *</label>
                              <textarea
                                rows={4}
                                value={editingFaq.answerKa || ""}
                                onChange={(e) => setEditingFaq({ ...editingFaq, answerKa: e.target.value })}
                                placeholder="დაწერეთ ამომწურავი პასუხი ქართულად..."
                                className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold block">Answer (English)</label>
                              <textarea
                                rows={4}
                                value={editingFaq.answerEn || ""}
                                onChange={(e) => setEditingFaq({ ...editingFaq, answerEn: e.target.value })}
                                placeholder="Write the answer in English..."
                                className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-500/20">
                            <button
                              type="button"
                              onClick={() => setEditingFaq(null)}
                              className="px-4 py-2 rounded-xl border border-stone-600 hover:bg-stone-800 transition-colors"
                            >
                              გაუქმება
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!editingFaq.questionKa?.trim() || !editingFaq.answerKa?.trim()) {
                                  alert("გთხოვთ შეიყვანოთ კითხვა და პასუხი ქართულად!");
                                  return;
                                }
                                const exists = currentFaqList.some((f) => f.id === editingFaq.id);
                                const updated = exists
                                  ? currentFaqList.map((f) => (f.id === editingFaq.id ? editingFaq : f))
                                  : [...currentFaqList, editingFaq];
                                const newSettings = { ...siteSettings, faqItems: updated };
                                setSiteSettings(newSettings);
                                syncData(newSettings, products);
                                setEditingFaq(null);
                              }}
                              className="px-5 py-2 rounded-xl bg-amber-500 text-black font-semibold hover:brightness-110 transition-all"
                            >
                              კითხვის შენახვა
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FAQ ITEMS LIST */}
                    <div className="space-y-3">
                      {currentFaqList.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            darkMode ? "bg-stone-900/60 border-stone-800" : "bg-white border-stone-200 shadow-xs"
                          }`}
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="font-serif text-sm font-semibold flex items-center gap-2">
                              <span className="text-amber-500 font-mono text-xs">#{idx + 1}</span>
                              <span>{item.questionKa}</span>
                            </div>
                            {item.questionEn && (
                              <p className="text-[11px] opacity-60 italic">{item.questionEn}</p>
                            )}
                            <p className="text-xs opacity-75 line-clamp-2 pt-1">{item.answerKa}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => setEditingFaq({ ...item })}
                              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                              რედაქტირება
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (currentFaqList.length <= 1) {
                                  alert("მინიმუმ ერთი კითხვა უნდა დარჩეს!");
                                  return;
                                }
                                if (window.confirm(`ნამდვილად გსურთ კითხვის „${item.questionKa}“ წაშლა?`)) {
                                  const updated = currentFaqList.filter((f) => f.id !== item.id);
                                  const newSettings = { ...siteSettings, faqItems: updated };
                                  setSiteSettings(newSettings);
                                  syncData(newSettings, products);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-colors"
                              title="წაშლა"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 2: PRODUCT ASSURANCE CARDS */}
                  <div className="space-y-6 pt-6 border-t border-stone-500/20">
                    <div>
                      <h3 className="font-serif text-xl flex items-center gap-2">
                        <Truck className="w-5 h-5 text-amber-500" />
                        პროდუქტის გვერდის 3 გარანტიის ბარათი
                      </h3>
                      <p className="text-xs opacity-70 mt-1">
                        ეს 3 ბარათი ჩნდება თითოეული სამკაულის გვერდზე, ფოტოსა და ღილაკების ქვემოთ (მიწოდება, სერტიფიკატი, უვადო მოვლა).
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {currentAssurance.map((card, idx) => {
                        const Icon = idx === 0 ? Truck : idx === 1 ? ShieldCheck : Sparkles;
                        return (
                          <div
                            key={card.id || idx}
                            className={`p-5 rounded-2xl border space-y-4 ${
                              darkMode ? "bg-stone-900/50 border-stone-800" : "bg-white border-stone-200 shadow-xs"
                            }`}
                          >
                            <div className="flex items-center gap-2 text-amber-500 font-serif font-medium pb-2 border-b border-stone-500/15">
                              <Icon className="w-5 h-5 shrink-0" />
                              <span>ბარათი #{idx + 1}</span>
                            </div>

                            <div className="space-y-3 text-xs">
                              <div className="space-y-1">
                                <label className="font-semibold block">სათაური (ქართულად):</label>
                                <input
                                  type="text"
                                  value={card.titleKa || ""}
                                  onChange={(e) => {
                                    const next = [...currentAssurance];
                                    next[idx] = { ...next[idx], titleKa: e.target.value };
                                    setSiteSettings({ ...siteSettings, productAssurance: next });
                                  }}
                                  className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-semibold block">Title (English):</label>
                                <input
                                  type="text"
                                  value={card.titleEn || ""}
                                  onChange={(e) => {
                                    const next = [...currentAssurance];
                                    next[idx] = { ...next[idx], titleEn: e.target.value };
                                    setSiteSettings({ ...siteSettings, productAssurance: next });
                                  }}
                                  className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-semibold block">პუნქტები (ქართულად, თითო ახალ ხაზზე):</label>
                                <textarea
                                  rows={5}
                                  value={card.descKa || ""}
                                  onChange={(e) => {
                                    const next = [...currentAssurance];
                                    next[idx] = { ...next[idx], descKa: e.target.value };
                                    setSiteSettings({ ...siteSettings, productAssurance: next });
                                  }}
                                  className={`w-full p-2.5 rounded-xl border font-mono text-[11px] ${darkMode ? "bg-stone-800 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="font-semibold block">Points (English, one per line):</label>
                                <textarea
                                  rows={5}
                                  value={card.descEn || ""}
                                  onChange={(e) => {
                                    const next = [...currentAssurance];
                                    next[idx] = { ...next[idx], descEn: e.target.value };
                                    setSiteSettings({ ...siteSettings, productAssurance: next });
                                  }}
                                  className={`w-full p-2.5 rounded-xl border font-mono text-[11px] ${darkMode ? "bg-stone-800 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => syncData(siteSettings, products)}
                      className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold text-xs sm:text-sm hover:brightness-110 transition-all shadow-md"
                    >
                      გარანტიების შენახვა
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        )}
      </main>
    </div>
  );
}
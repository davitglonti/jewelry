import React, { useState, useEffect } from 'react';
import {
  Shield, Sun, Moon, ArrowLeft, Lock, Plus, Upload,
  Link as LinkIcon, X, Edit3, Trash2
} from 'lucide-react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useStore } from '../context/StoreContext';
import { handleFileUpload } from '../utils/imageUtils';

export default function AdminPage() {
  const {
    darkMode, setDarkMode,
    lang,
    siteSettings, setSiteSettings,
    products, setProducts,
    inquiries, setInquiries,
    saveMessage, syncData
  } = useStore();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [adminTab, setAdminTab] = useState("catalog");

  const [editingProduct, setEditingProduct] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newMetalInput, setNewMetalInput] = useState("");

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
                if (!auth) {
                  setLoginError("Firebase Auth არ არის აქტიური!");
                  return;
                }
                try {
                  await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
                  setLoginError("");
                } catch (err) {
                  setLoginError("არასწორი ელ-ფოსტა ან პაროლი!");
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
              {loginError && <p className="text-xs text-red-400">{loginError}</p>}
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
                { id: "craft", label: "5. ოსტატობის სექცია" },
                { id: "footer", label: "6. კონტაქტი & ქვედა პანელი" },
                { id: "inquiries", label: `7. შემოსული მოთხოვნები (${inquiries.length})` }
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
                  <h3 className="font-serif text-xl">სამკაულების სია ({products.length})</h3>
                  <button
                    onClick={() =>
                      setEditingProduct({
                        id: "item-" + Date.now(),
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
                        sizes: ["16.5", "17.0", "17.5"],
                        description: "",
                        descriptionEn: "",
                        images: []
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
                        placeholder="დასახელება (ქართულად)"
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
                      <input
                        type="text"
                        placeholder="ახალი / მიმდინარე ფასი (მაგ: 4,500 ₾)"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                        className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-amber-500/50" : "bg-white border-amber-500"}`}
                      />
                      <input
                        type="text"
                        placeholder="ძველი ფასი ფასდაკლებისას (მაგ: 5,200 ₾)"
                        value={editingProduct.oldPrice || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: e.target.value })}
                        className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                      />
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
                        სამკაულის ფოტოები (შეგიძლიათ ატვირთოთ რამდენიმე ფოტო ან ჩასვათ ლინკი):
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

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProduct.exclusive}
                          onChange={(e) => setEditingProduct({ ...editingProduct, exclusive: e.target.checked })}
                          className="accent-amber-500 w-4 h-4"
                        />
                        <span>ექსკლუზიური მოდელი</span>
                      </label>

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
                            const exists = products.some((p) => p.id === editingProduct.id);
                            const updated = exists
                              ? products.map((p) => (p.id === editingProduct.id ? editingProduct : p))
                              : [editingProduct, ...products];
                            setProducts(updated);
                            syncData(siteSettings, updated);
                            setEditingProduct(null);
                          }}
                          className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-amber-500 text-black font-semibold text-xs text-center"
                        >
                          შენახვა
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {products.map((p) => (
                    <div key={p.id} className="p-3.5 rounded-2xl border border-stone-500/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]} alt="" className="w-14 h-14 rounded-xl object-cover bg-stone-800" />
                        <div>
                          <div className="font-serif font-medium">{p.name}</div>
                          <div className="text-xs opacity-60">{p.sku} • {p.category} • {p.metal}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {p.oldPrice && <span className="text-xs line-through opacity-45">{p.oldPrice}</span>}
                            <span className="text-xs text-amber-500 font-semibold">{p.price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="p-2 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-black"
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
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                <h4 className="font-serif text-lg text-amber-500">ბრენდის სახელი და ლოგო</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={siteSettings.brandName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, brandName: e.target.value })}
                    placeholder="ბრენდის სახელი (მაგ: AURELIA)"
                    className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                  />
                  <input
                    type="text"
                    value={siteSettings.brandSubtitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, brandSubtitle: e.target.value })}
                    placeholder="სლოგანი (მაგ: საიუველირო სახლი • 1998)"
                    className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                  />
                  <input
                    type="text"
                    value={siteSettings.logoUrl}
                    onChange={(e) => setSiteSettings({ ...siteSettings, logoUrl: e.target.value })}
                    placeholder="ლოგოს ბმული (ან ატვირთეთ ქვემოდან)"
                    className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                  />
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
              <div className="space-y-4 max-w-2xl text-xs">
                <h4 className="font-serif text-lg text-amber-500">„ხელოვნება, რომელიც თაობებს გადაეცემა“ — ტექსტები და ფოტოები</h4>
                <input
                  type="text"
                  value={siteSettings.craftBadge}
                  onChange={(e) => setSiteSettings({ ...siteSettings, craftBadge: e.target.value })}
                  placeholder="პატარა წარწერა (ქართული საიუველირო მემკვიდრეობა)"
                  className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                />
                <input
                  type="text"
                  value={siteSettings.craftTitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, craftTitle: e.target.value })}
                  placeholder="მთავარი სათაური"
                  className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                />
                <textarea
                  rows={3}
                  value={siteSettings.craftDesc}
                  onChange={(e) => setSiteSettings({ ...siteSettings, craftDesc: e.target.value })}
                  placeholder="აღწერის ტექსტი"
                  className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="font-medium block">მარცხენა ფოტო:</label>
                    <input
                      type="text"
                      value={siteSettings.craftImg1}
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
                      value={siteSettings.craftImg2}
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
          </div>
        )}
      </main>
    </div>
  );
}
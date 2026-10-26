import React, { useState, useEffect } from 'react';
import {
  Sun, Moon, ExternalLink, LogOut, CheckCircle2,
  AlertCircle, X, Cloud, Database
} from 'lucide-react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseAuth';
import { useStore } from '../context/StoreContext';

import AdminLoginView from '../components/admin/AdminLoginView';
import AdminProductsTab from '../components/admin/AdminProductsTab';
import AdminCategoriesTab from '../components/admin/AdminCategoriesTab';
import AdminHomeTab from '../components/admin/AdminHomeTab';
import AdminBlogTab from '../components/admin/AdminBlogTab';
import AdminInquiriesTab from '../components/admin/AdminInquiriesTab';
import AdminSettingsTab from '../components/admin/AdminSettingsTab';

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
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [adminTab, setAdminTab] = useState('catalog');
  const [homeSubTab, setHomeSubTab] = useState('carousel');
  const [siteSubTab, setSiteSubTab] = useState('contacts');
  const [homeWarning, setHomeWarning] = useState('');

  const parsePriceNumber = (val) => {
    if (!val) return null;
    const cleaned = val.toString().replace(/,/g, '').replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const triggerHomeWarning = (msg) => {
    setHomeWarning(msg);
    setTimeout(() => {
      setHomeWarning((prev) => (prev === msg ? '' : prev));
    }, 6000);
  };

  useEffect(() => {
    if (!auth) {
      setAuthChecked(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAdminAuthenticated(!!user);
      if (user && user.email) {
        setCurrentUserEmail(user.email);
      }
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  return (
    <div
      className={`min-h-screen w-full min-w-0 overflow-x-hidden transition-colors duration-300 ${
        darkMode ? 'bg-[#0c0b0a] text-[#f5f0e6]' : 'bg-[#faf7f2] text-[#1c1917]'
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
            onClick={() => setHomeWarning('')}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 shrink-0 transition-colors"
            aria-label="დახურვა"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <header
        className={`sticky top-0 z-40 w-full min-w-0 px-4 sm:px-8 py-3.5 border-b backdrop-blur-md flex items-center justify-between gap-3 ${
          darkMode ? 'bg-[#0c0b0a]/95 border-stone-800/80' : 'bg-white/95 border-stone-200'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold font-serif text-sm">
            M
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`font-serif tracking-widest text-base sm:text-lg font-bold uppercase ${darkMode ? 'text-white' : 'text-stone-900'}`}>
              {siteSettings.brandName || 'MATARE'}
            </span>
            <span className="text-xs font-mono text-stone-500">/admin</span>
          </div>

          {saveMessage && (
            <span className="hidden md:inline-flex items-center gap-1.5 ml-3 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {saveMessage}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border transition-all ${
              darkMode ? 'border-stone-800 bg-[#141210] text-amber-400 hover:bg-stone-800' : 'border-stone-200 bg-stone-100 text-stone-800 hover:bg-stone-200'
            }`}
            title="თემის შეცვლა"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* View Website */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3 sm:px-4 py-2 rounded-xl border border-stone-800 bg-[#141210] hover:bg-stone-800 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <span>{lang === 'ka' ? 'საიტზე გადასვლა' : 'View Store'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </a>

          {/* Logout */}
          {isAdminAuthenticated && (
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="px-3 sm:px-4 py-2 rounded-xl border border-stone-800 bg-[#141210] hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 text-stone-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ka' ? 'გასვლა' : 'Logout'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full min-w-0 max-w-[1720px] mx-auto p-3 sm:p-6 lg:p-8 space-y-5">
        {!authChecked ? (
          <div className="text-center py-20 opacity-60 text-sm">იტვირთება...</div>
        ) : !isAdminAuthenticated ? (
          <AdminLoginView
            darkMode={darkMode}
            auth={auth}
            signInWithEmailAndPassword={signInWithEmailAndPassword}
          />
        ) : (
          <div className="space-y-5">
            {/* Google Cloud Firestore Status Banner */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                darkMode ? 'border-stone-800 bg-[#121110]' : 'border-stone-200 bg-white shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Google Cloud Firestore:</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      აქტიურია (ცოცხალი სინქრონიზაცია)
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    პროდუქცია, კატალოგი და მოთხოვნები რეალურ დროში ინახება თქვენს Firebase Cloud ბაზაში.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => syncData(siteSettings, products, inquiries)}
                className="px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
              >
                <Database className="w-4 h-4" />
                <span>კატალოგის Firebase-ში ატვირთვა</span>
              </button>
            </div>

            {/* Master Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'catalog', label: `პროდუქცია (${products.length})` },
                { id: 'categories', label: `კატეგორიები & მეტალები (${(siteSettings.categories || []).length})` },
                { id: 'home', label: 'მთავარი გვერდი 🌟' },
                { id: 'blog', label: `ბლოგი & სიახლეები (${(articles || []).length})` },
                { id: 'inquiries', label: `შემოსული მოთხოვნები (${inquiries.length})` },
                { id: 'site', label: 'საიტის პარამეტრები' }
              ].map((tab) => {
                const isSelected =
                  adminTab === tab.id ||
                  (tab.id === 'home' && ['carousel', 'craft'].includes(adminTab)) ||
                  (tab.id === 'site' &&
                    ['site', 'branding', 'contacts', 'about', 'faq', 'footer', 'brand'].includes(adminTab));
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAdminTab(tab.id)}
                    className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/10'
                        : darkMode
                        ? 'bg-[#141210] hover:bg-[#1c1a17] text-stone-300 border border-stone-800'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-xs'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT */}
            {adminTab === 'catalog' && (
              <AdminProductsTab
                products={products}
                setProducts={setProducts}
                siteSettings={siteSettings}
                darkMode={darkMode}
                syncData={syncData}
                homeWarning={homeWarning}
                setHomeWarning={setHomeWarning}
                triggerHomeWarning={triggerHomeWarning}
                parsePriceNumber={parsePriceNumber}
              />
            )}

            {adminTab === 'categories' && (
              <AdminCategoriesTab
                siteSettings={siteSettings}
                setSiteSettings={setSiteSettings}
                products={products}
                syncData={syncData}
                darkMode={darkMode}
              />
            )}

            {(adminTab === 'home' || ['carousel', 'craft'].includes(adminTab)) && (
              <AdminHomeTab
                homeSubTab={['carousel', 'craft'].includes(adminTab) ? adminTab : homeSubTab}
                setHomeSubTab={setHomeSubTab}
                siteSettings={siteSettings}
                setSiteSettings={setSiteSettings}
                products={products}
                syncData={syncData}
                darkMode={darkMode}
              />
            )}

            {adminTab === 'blog' && (
              <AdminBlogTab
                articles={articles}
                setArticles={setArticles}
                syncArticles={syncArticles}
                siteSettings={siteSettings}
                setSiteSettings={setSiteSettings}
                products={products}
                syncData={syncData}
                darkMode={darkMode}
              />
            )}

            {adminTab === 'inquiries' && (
              <AdminInquiriesTab
                inquiries={inquiries}
                setInquiries={setInquiries}
                siteSettings={siteSettings}
                products={products}
                syncData={syncData}
              />
            )}

            {(adminTab === 'site' ||
              ['branding', 'contacts', 'about', 'faq', 'footer', 'brand'].includes(adminTab)) && (
              <AdminSettingsTab
                siteSubTab={
                  adminTab === 'footer'
                    ? 'contacts'
                    : adminTab === 'brand'
                    ? 'branding'
                    : ['branding', 'contacts', 'about', 'faq'].includes(adminTab)
                    ? adminTab
                    : siteSubTab
                }
                setSiteSubTab={setSiteSubTab}
                siteSettings={siteSettings}
                setSiteSettings={setSiteSettings}
                products={products}
                inquiries={inquiries}
                syncData={syncData}
                darkMode={darkMode}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

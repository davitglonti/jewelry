// src/pages/OrderTrackingPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import OrderTrackingTimeline from '../components/order/OrderTrackingTimeline';
import { useStore } from '../context/StoreContext';
import { Search, Package, ArrowLeft, Truck, HelpCircle, PhoneCall } from 'lucide-react';

export default function OrderTrackingPage() {
  const {
    lang,
    setLang,
    darkMode,
    setDarkMode,
    favorites,
    setShowFavoritesModal,
    inquiries = [],
    siteSettings = {}
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Read local stored orders for quick suggestion
  const localOrders = useMemo(() => {
    try {
      if (typeof window === 'undefined') return [];
      return JSON.parse(localStorage.getItem('matare_orders') || '[]');
    } catch {
      return [];
    }
  }, []);

  // Check URL query param e.g. /track?id=MTR-123456
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id') || params.get('order') || params.get('code');
    if (idParam) {
      setSearchQuery(idParam);
      handleFindOrder(idParam);
    } else if (localOrders.length > 0) {
      // Pre-select most recent local order if available
      const first = localOrders[0];
      // Check if there is an updated version in inquiries
      const live = (inquiries || []).find((inq) => inq.id === first.id);
      setSelectedOrder(live || first);
    }
  }, [inquiries, localOrders]);

  const handleFindOrder = (queryToSearch) => {
    const q = String(queryToSearch || searchQuery).trim().toLowerCase().replace('#', '');
    if (!q) return;

    setHasSearched(true);

    // Clean phone lookup
    const cleanedDigits = q.replace(/[^0-9]/g, '');

    // Search live inquiries first
    let match = (inquiries || []).find((inq) => {
      if (inq.id && inq.id.toLowerCase().replace('#', '') === q) return true;
      if (cleanedDigits && cleanedDigits.length >= 8 && inq.clientPhone) {
        const inqPhone = inq.clientPhone.replace(/[^0-9]/g, '');
        if (inqPhone.includes(cleanedDigits)) return true;
      }
      return false;
    });

    // Fallback to local storage orders
    if (!match && localOrders.length > 0) {
      match = localOrders.find((ord) => {
        if (ord.id && ord.id.toLowerCase().replace('#', '') === q) return true;
        if (cleanedDigits && cleanedDigits.length >= 8 && ord.clientPhone) {
          const ordPhone = ord.clientPhone.replace(/[^0-9]/g, '');
          if (ordPhone.includes(cleanedDigits)) return true;
        }
        return false;
      });
    }

    setSelectedOrder(match || null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleFindOrder(searchQuery);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
        darkMode ? 'bg-[#0c0b0a] text-[#f5f0e6]' : 'bg-[#faf7f2] text-[#1c1917]'
      }`}
    >
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

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs opacity-60">
          <a href={lang === 'en' ? '/en' : '/'} className="hover:text-amber-500 transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'ka' ? 'მთავარი' : 'Home'}</span>
          </a>
          <span>/</span>
          <span className="font-semibold text-amber-500">
            {lang === 'ka' ? 'შეკვეთის თრექინგი' : 'Order Tracking'}
          </span>
        </div>

        {/* Hero Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" />
            <span>{lang === 'ka' ? 'სად არის ჩემი ნივთი?' : 'Where is my jewelry?'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-wide">
            {lang === 'ka' ? 'შეკვეთის სტატუსის შემოწმება' : 'Track Your Order Live'}
          </h1>

          <p className="text-xs sm:text-sm opacity-70 leading-relaxed">
            {lang === 'ka'
              ? 'შეიყვანეთ თქვენი შეკვეთის უნიკალური ნომერი (მაგ: MTR-982341) ან ტელეფონის ნომერი, რომ გაიგოთ ნივთის ზუსტი სტატუსი, კონდიცია და სავარაუდო მიტანის დრო.'
              : 'Enter your Order Code (e.g. MTR-982341) or phone number to see real-time atelier crafting status, delivery progress and ETA.'}
          </p>
        </div>

        {/* Search Bar Card */}
        <form
          onSubmit={handleFormSubmit}
          className={`p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border flex flex-col sm:flex-row items-center gap-2 shadow-xl ${
            darkMode ? 'bg-[#151413] border-stone-800' : 'bg-white border-stone-300'
          }`}
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ka' ? 'ჩაწერეთ შეკვეთის კოდი (MTR-XXXXXX) ან ტელეფონი...' : 'Enter Order Code (MTR-XXXXXX) or phone...'}
              className={`w-full pl-11 pr-4 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm outline-none transition-colors ${
                darkMode ? 'bg-stone-900/60 text-white placeholder-stone-500' : 'bg-stone-100 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-amber-500/20 shrink-0"
          >
            {lang === 'ka' ? 'შემოწმება' : 'Track Order'}
          </button>
        </form>

        {/* Quick Recent Orders Chips (if user has any saved locally) */}
        {localOrders.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs pb-1">
            <span className="opacity-60 shrink-0">{lang === 'ka' ? 'თქვენი ბოლო შეკვეთები:' : 'Recent orders:'}</span>
            {localOrders.slice(0, 3).map((ord) => (
              <button
                key={ord.id}
                type="button"
                onClick={() => {
                  setSearchQuery(ord.id);
                  handleFindOrder(ord.id);
                }}
                className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold border transition-all shrink-0 ${
                  selectedOrder?.id === ord.id
                    ? 'bg-amber-500 text-black border-amber-500'
                    : darkMode
                    ? 'border-stone-800 bg-stone-900 text-stone-300 hover:border-amber-500/40'
                    : 'border-stone-300 bg-stone-100 text-stone-800 hover:border-amber-500'
                }`}
              >
                #{ord.id}
              </button>
            ))}
          </div>
        )}

        {/* Order Result View */}
        {selectedOrder ? (
          <div className="animate-fadeIn">
            <OrderTrackingTimeline
              order={selectedOrder}
              darkMode={darkMode}
              lang={lang}
              siteSettings={siteSettings}
            />
          </div>
        ) : hasSearched ? (
          <div
            className={`p-10 rounded-3xl border text-center space-y-4 ${
              darkMode ? 'bg-[#151413] border-stone-800' : 'bg-white border-stone-200 shadow-md'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
              <Package className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-medium">
                {lang === 'ka' ? 'შეკვეთა ვერ მოიძებნა' : 'Order Not Found'}
              </h3>
              <p className="text-xs opacity-65 max-w-md mx-auto">
                {lang === 'ka'
                  ? `შეკვეთის კოდით „${searchQuery}“ მონაცემები ვერ მოიძებნა. გთხოვთ გადაამოწმოთ ნომერი ან დაუკავშირდეთ ჩვენს კონსიერჟს.`
                  : `No order found matching "${searchQuery}". Please verify the code or contact our concierge.`}
              </p>
            </div>
            <a
              href={`https://wa.me/${(siteSettings?.whatsapp || '+995599000000').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{lang === 'ka' ? 'კონსიერჟთან დაკავშირება' : 'Contact Concierge'}</span>
            </a>
          </div>
        ) : null}
      </main>

      <Footer
        siteSettings={siteSettings}
        darkMode={darkMode}
        lang={lang}
      />
    </div>
  );
}

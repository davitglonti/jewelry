// src/pages/OrderTrackingPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import OrderTrackingTimeline from '../components/order/OrderTrackingTimeline';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Search, Package, ArrowLeft, PhoneCall } from 'lucide-react';

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
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchingRemote, setSearchingRemote] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const localOrders = useMemo(() => {
    try {
      if (typeof window === 'undefined') return [];
      return JSON.parse(localStorage.getItem('matare_orders') || '[]');
    } catch {
      return [];
    }
  }, []);

  const handleFindOrder = async (queryToSearch) => {
    const rawQ = String(queryToSearch || searchQuery).trim();
    const q = rawQ.toLowerCase().replace('#', '');
    if (!q) return;

    setHasSearched(true);
    const cleanedDigits = q.replace(/[^0-9]/g, '');

    let match = (inquiries || []).find((inq) => {
      if (inq.id && inq.id.toLowerCase().replace('#', '') === q) return true;
      if (cleanedDigits && cleanedDigits.length >= 8 && inq.clientPhone) {
        const inqPhone = inq.clientPhone.replace(/[^0-9]/g, '');
        if (inqPhone.includes(cleanedDigits)) return true;
      }
      return false;
    });

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

    if (match) {
      setSelectedOrder(match);
      return;
    }

    // Remote server lookup via /api/track-order when not found in local history
    setSearchingRemote(true);
    try {
      if (typeof window !== 'undefined' && typeof fetch === 'function' && window.location?.origin) {
        const headers = { 'Content-Type': 'application/json' };
        if (user && typeof user.getIdToken === 'function') {
          try {
            const token = await user.getIdToken();
            if (token) headers.Authorization = `Bearer ${token}`;
          } catch {}
        }

        const res = await fetch(`${window.location.origin}/api/track-order`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ query: rawQ }),
        });
        if (res && res.ok && typeof res.json === 'function') {
          const data = await res.json().catch(() => null);
          if (data?.found && data.order) {
            setSelectedOrder(data.order);
            return;
          }
        }
      }
    } catch {
      // Fallback safely to not found
    } finally {
      setSearchingRemote(false);
    }

    setSelectedOrder(null);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id') || params.get('order') || params.get('code');
    if (idParam) {
      setSearchQuery(idParam);
      handleFindOrder(idParam);
    } else if (localOrders.length > 0) {
      const first = localOrders[0];
      const live = (inquiries || []).find((inq) => inq.id === first.id);
      setSelectedOrder(live || first);
    }
  }, [inquiries, localOrders]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleFindOrder(searchQuery);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-[#141311]">
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

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-[108px] sm:pt-[124px] pb-24 space-y-10">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#847E75]">
          <a href={lang === 'en' ? '/en' : '/'} className="hover:text-[#141311] transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{lang === 'ka' ? 'მთავარი' : 'Home'}</span>
          </a>
          <span>/</span>
          <span className="text-[#141311]">
            {lang === 'ka' ? 'შეკვეთის თრექინგი' : 'Order Tracking'}
          </span>
        </div>

        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[#9D7B48] font-medium block">
            {lang === 'ka' ? 'სად არის ჩემი ნივთი?' : 'Where is my jewelry?'}
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#141311]">
            {lang === 'ka' ? 'შეკვეთის სტატუსის შემოწმება' : 'Track Your Order Live'}
          </h1>

          <p className="text-xs sm:text-sm text-[#5C574F] leading-relaxed font-light">
            {lang === 'ka'
              ? 'შეიყვანეთ თქვენი შეკვეთის უნიკალური ნომერი (მაგ: MTR-982341) ან ტელეფონის ნომერი, რომ გაიგოთ ნივთის ზუსტი სტატუსი და სავარაუდო მიტანის დრო.'
              : 'Enter your Order Code (e.g. MTR-982341) or phone number to see real-time atelier crafting status and delivery progress.'}
          </p>
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="p-2 bg-[#FAF9F6] border border-[#E8E3DB] flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#9D7B48] stroke-[1.5] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ka' ? 'ჩაწერეთ შეკვეთის კოდი (MTR-XXXXXX) ან ტელეფონი...' : 'Enter Order Code (MTR-XXXXXX) or phone...'}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E8E3DB] focus:border-[#141311] text-xs sm:text-sm text-[#141311] placeholder-[#9C958B] outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#141311] hover:bg-[#2C2A26] text-white text-[11px] uppercase tracking-[0.2em] font-medium transition-colors shrink-0 cursor-pointer"
          >
            {lang === 'ka' ? 'შემოწმება' : 'Track Order'}
          </button>
        </form>

        {localOrders.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs pb-1">
            <span className="text-[#847E75] shrink-0">{lang === 'ka' ? 'თქვენი ბოლო შეკვეთები:' : 'Recent orders:'}</span>
            {localOrders.slice(0, 3).map((ord) => (
              <button
                key={ord.id}
                type="button"
                onClick={() => {
                  setSearchQuery(ord.id);
                  handleFindOrder(ord.id);
                }}
                className={`px-3 py-1 font-mono text-[11px] border transition-colors shrink-0 cursor-pointer ${
                  selectedOrder?.id === ord.id
                    ? 'bg-[#141311] text-white border-[#141311]'
                    : 'border-[#E8E3DB] bg-white text-[#4A4640] hover:border-[#141311]'
                }`}
              >
                #{ord.id}
              </button>
            ))}
          </div>
        )}

        {selectedOrder ? (
          <div className="animate-fadeIn">
            <OrderTrackingTimeline
              order={selectedOrder}
              darkMode={false}
              lang={lang}
              siteSettings={siteSettings}
            />
          </div>
        ) : hasSearched ? (
          <div className="p-12 bg-[#FAF9F6] border border-[#E8E3DB] text-center space-y-4">
            <Package className="w-8 h-8 text-[#9D7B48] mx-auto stroke-[1.25]" />
            <div className="space-y-1.5">
              <h3 className="font-serif text-2xl font-light text-[#141311]">
                {lang === 'ka' ? 'შეკვეთა ვერ მოიძებნა' : 'Order Not Found'}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C574F] max-w-md mx-auto font-light">
                {lang === 'ka'
                  ? `შეკვეთის კოდით „${searchQuery}“ მონაცემები ვერ მოიძებნა. გთხოვთ გადაამოწმოთ ნომერი ან დაუკავშირდეთ ჩვენს კონსიერჟს.`
                  : `No order found matching "${searchQuery}". Please verify the code or contact our concierge.`}
              </p>
            </div>
            <a
              href={`https://wa.me/${(siteSettings?.whatsapp || '+995599000000').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#141311] hover:bg-[#2C2A26] text-white text-[11px] uppercase tracking-[0.18em] transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{lang === 'ka' ? 'კონსიერჟთან დაკავშირება' : 'Contact Concierge'}</span>
            </a>
          </div>
        ) : null}
      </main>

      <Footer siteSettings={siteSettings} lang={lang} />
    </div>
  );
}

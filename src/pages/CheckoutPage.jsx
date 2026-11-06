// src/pages/CheckoutPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag, Check, ArrowLeft, Truck, Store, CreditCard,
  Banknote, Phone, User, Mail, MapPin, Gift, MessageSquare,
  ShieldCheck, Sparkles, AlertCircle, ArrowRight, Trash2, Tag, ChevronDown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, pick } from '../utils/i18n';
import { navigateTo } from '../utils/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function CheckoutPage() {
  const {
    darkMode, setDarkMode,
    lang, setLang,
    siteSettings,
    products,
    favorites,
    inquiries, setInquiries,
    syncData,
    setShowFavoritesModal
  } = useStore();
  const { user } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Parse URL query parameters
  const searchParams = useMemo(() => {
    return new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  }, []);

  const productIdParam = searchParams.get('productId') || searchParams.get('id') || searchParams.get('sku') || '';
  const initialSizeParam = searchParams.get('size') || '';
  const fromParam = searchParams.get('from') || '';

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('courier'); // 'courier' | 'pickup'
  const [city, setCity] = useState('თბილისი');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'cod' | 'boutique'
  const [isGift, setIsGift] = useState(false);
  const [notes, setNotes] = useState('');

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Selected Items State
  const [orderItems, setOrderItems] = useState([]);
  const [itemSizes, setItemSizes] = useState({}); // { [productId]: size }

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Autofill user details
  useEffect(() => {
    if (user) {
      if (user.displayName && !clientName) setClientName(user.displayName);
      if (user.email && !clientEmail) setClientEmail(user.email);
    }
  }, [user]);

  // Load items from query params or favorites
  useEffect(() => {
    if (!products || products.length === 0) return;

    if (productIdParam) {
      const target = decodeURIComponent(productIdParam).trim().toLowerCase();
      const found = products.find(
        (p) =>
          p.id?.toString().toLowerCase() === target ||
          p.sku?.toString().toLowerCase() === target
      );
      if (found) {
        setOrderItems([found]);
        const chosenSize =
          initialSizeParam || (found.sizes && found.sizes.length > 0 ? found.sizes[0] : '');
        setItemSizes({ [found.id]: chosenSize });
        return;
      }
    }

    if (fromParam === 'favorites' || (!productIdParam && favorites?.length > 0)) {
      const favList = products.filter((p) => favorites?.includes(p.id));
      if (favList.length > 0) {
        setOrderItems(favList);
        const sizesMap = {};
        favList.forEach((p) => {
          sizesMap[p.id] = p.sizes && p.sizes.length > 0 ? p.sizes[0] : '';
        });
        setItemSizes(sizesMap);
        return;
      }
    }

    // Fallback: first available product if none specified
    if (products.length > 0) {
      const sample = products[0];
      setOrderItems([sample]);
      setItemSizes({ [sample.id]: sample.sizes?.[0] || '' });
    }
  }, [products, productIdParam, initialSizeParam, fromParam, favorites]);

  // Handle Size Change for an Item
  const handleSizeChange = (itemId, newSize) => {
    setItemSizes((prev) => ({
      ...prev,
      [itemId]: newSize
    }));
  };

  // Handle Item Removal from Order
  const handleRemoveItem = (itemId) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Price Calculations
  const rawSubtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      const p = typeof item.price === 'number'
        ? item.price
        : parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0;
      return sum + p;
    }, 0);
  }, [orderItems]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    return Math.round(rawSubtotal * appliedPromo.percent);
  }, [rawSubtotal, appliedPromo]);

  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  // Apply Promo Code
  const handleApplyPromo = (e) => {
    e?.preventDefault();
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();

    if (!code) {
      setPromoError(lang === 'ka' ? 'შეიყვანეთ პრომო კოდი' : 'Enter promo code');
      return;
    }

    if (code === 'VIP-AURELIA10' || code === 'MATARE10') {
      setAppliedPromo({ code, percent: 0.1, label: '-10% VIP ფასდაკლება' });
      setPromoCodeInput('');
    } else {
      setPromoError(lang === 'ka' ? 'არასწორი პრომო კოდი' : 'Invalid promo code');
    }
  };

  // Submit Order
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (orderItems.length === 0) {
      setFormError(lang === 'ka' ? 'შეკვეთის სია ცარიელია' : 'Your order is empty');
      return;
    }

    if (!clientName.trim()) {
      setFormError(lang === 'ka' ? 'გთხოვთ შეიყვანოთ თქვენი სახელი და გვარი' : 'Please enter full name');
      return;
    }

    const cleanedPhone = clientPhone.replace(/[\s\-()]/g, '');
    const georgianPhoneRegex = /^(\+?995)?5\d{8}$/;

    if (!cleanedPhone || !georgianPhoneRegex.test(cleanedPhone)) {
      setFormError(
        lang === 'ka'
          ? 'შეიყვანეთ სწორი ქართული ნომერი (მაგ: 555 12 34 56)'
          : 'Please enter a valid Georgian phone number (e.g. 555 12 34 56)'
      );
      return;
    }

    if (deliveryMethod === 'courier' && !address.trim()) {
      setFormError(lang === 'ka' ? 'გთხოვთ მიუთითოთ მიწოდების მისამართი' : 'Please enter delivery address');
      return;
    }

    setSubmitting(true);

    const orderId = `MTR-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleString('ka-GE'),
      clientName: clientName.trim(),
      clientPhone: cleanedPhone,
      clientEmail: clientEmail.trim(),
      deliveryMethod: deliveryMethod === 'courier' ? `კურიერით (${city})` : 'შოურუმში გატანა',
      address: deliveryMethod === 'courier' ? `${city}, ${address.trim()}` : 'შოურუმი (მ. კოსტავას 75, თბილისი)',
      paymentMethod:
        paymentMethod === 'card'
          ? 'ონლაინ ბარათით'
          : paymentMethod === 'cod'
          ? 'კურიერთან გადახდა'
          : 'შოურუმში გადახდა',
      isGift,
      notes: notes.trim(),
      items: orderItems.map((p) => {
        const itemSize = itemSizes[p.id] || (p.sizes && p.sizes.length > 0 ? p.sizes[0] : '') || 'სტანდარტული';
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          sku: p.sku || p.id,
          size: itemSize
        };
      }),
      productName: orderItems
        .map((p) => {
          const itemSize = itemSizes[p.id] || (p.sizes && p.sizes.length > 0 ? p.sizes[0] : '');
          return `${p.name}${itemSize ? ` (ზომა: ${itemSize})` : ''}`;
        })
        .join(', '),
      totalPrice: finalTotal,
      rawSubtotal,
      discountAmount,
      promoApplied: appliedPromo?.code || null,
      status: 'ახალი შეკვეთა'
    };

    try {
      // 1. Sync to store inquiries (so admin sees it immediately)
      const updated = [newOrder, ...(inquiries || [])];
      if (setInquiries) setInquiries(updated);
      if (syncData) syncData(siteSettings, products, updated);

      // 2. Persist to customer's order history
      try {
        const prevHistory = JSON.parse(localStorage.getItem('matare_orders') || '[]');
        localStorage.setItem('matare_orders', JSON.stringify([newOrder, ...prevHistory]));
      } catch (err) {
        console.warn('Local storage error:', err);
      }

      setCompletedOrder(newOrder);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Order placement error:', err);
      setFormError(lang === 'ka' ? 'შეკვეთის გაფორმება ვერ მოხერხდა' : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMessage = completedOrder
    ? encodeURIComponent(
        `✨ მოგესალმებით! გავაფორმე შეკვეთა #${completedOrder.id} matare.store-ზე.\n` +
        `ნივთები: ${completedOrder.productName}\n` +
        `ჯამური თანხა: ${formatPrice(completedOrder.totalPrice)}\n` +
        `მიწოდება: ${completedOrder.deliveryMethod}\n` +
        `მყიდველი: ${completedOrder.clientName} (${completedOrder.clientPhone})`
      )
    : '';

  const whatsappUrl = `https://wa.me/${(siteSettings?.whatsapp || '+995599000000').replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

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

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'ka' ? 'უკან დაბრუნება' : 'Back'}</span>
          </button>

          <span className="text-[11px] font-mono opacity-50 uppercase tracking-widest">
            {lang === 'ka' ? 'უსაფრთხო შეკვეთა • SSL 256-BIT' : 'Secure Checkout • 256-Bit SSL'}
          </span>
        </div>

        {/* COMPLETED ORDER VIEW */}
        {completedOrder ? (
          <div className="max-w-2xl mx-auto py-8 sm:py-12 animate-fadeIn text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10">
              <Check className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-amber-500">
                {lang === 'ka' ? 'შეკვეთა მიღებულია!' : 'Order Placed!'}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal">
                {lang === 'ka' ? 'მადლობას გიხდით არჩევანისთვის' : 'Thank you for your order'}
              </h1>
              <p className="text-xs sm:text-sm opacity-70 max-w-md mx-auto leading-relaxed">
                {lang === 'ka'
                  ? 'თქვენი შეკვეთა წარმატებით დარეგისტრირდა. ჩვენი კონსულტანტი უმოკლეს დროში დაგიკავშირდებათ მითითებულ ნომერზე.'
                  : 'Your order has been registered. Our salon concierge will contact you shortly to confirm the delivery.'}
              </p>
            </div>

            <div
              className={`p-6 rounded-3xl border text-left space-y-3.5 ${
                darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-md'
              }`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-stone-500/15">
                <span className="text-xs opacity-60">{lang === 'ka' ? 'შეკვეთის ნომერი:' : 'Order Code:'}</span>
                <span className="font-mono font-bold text-amber-500 text-sm">#{completedOrder.id}</span>
              </div>

              <div className="space-y-2 text-xs">
                {completedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="font-medium">
                      {it.name} {it.size ? `(${lang === 'ka' ? 'ზომა' : 'Size'}: ${it.size})` : ''}
                    </span>
                    <span className="font-mono font-semibold text-amber-500/90">{formatPrice(it.price)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-500/15 flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-70">
                  {lang === 'ka' ? 'საბოლოო თანხა:' : 'Total Amount:'}
                </span>
                <span className="font-mono text-lg font-bold text-amber-500">
                  {formatPrice(completedOrder.totalPrice)}
                </span>
              </div>

              <div className="pt-2 text-[11px] opacity-65 space-y-1">
                <div>
                  <strong>{lang === 'ka' ? 'მიწოდება:' : 'Delivery:'}</strong> {completedOrder.deliveryMethod} — {completedOrder.address}
                </div>
                <div>
                  <strong>{lang === 'ka' ? 'გადახდა:' : 'Payment:'}</strong> {completedOrder.paymentMethod}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{lang === 'ka' ? 'WhatsApp-ით დაკავშირება' : 'Chat on WhatsApp'}</span>
              </a>

              <button
                type="button"
                onClick={() => navigateTo('/catalog')}
                className={`py-3.5 px-6 rounded-2xl border text-xs font-semibold tracking-wider uppercase transition-all ${
                  darkMode
                    ? 'border-stone-800 bg-stone-900 text-stone-200 hover:bg-stone-800'
                    : 'border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-200'
                }`}
              >
                {lang === 'ka' ? 'კოლექციის დათვალიერება' : 'Continue Shopping'}
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM VIEW */
          <div className="space-y-8">
            <div>
              <h1 className="font-serif text-2xl sm:text-4xl font-normal tracking-wide">
                {lang === 'ka' ? 'შეკვეთის გაფორმება' : 'Checkout & Purchase'}
              </h1>
              <p className="text-xs sm:text-sm opacity-60 mt-1.5">
                {lang === 'ka'
                  ? 'შეავსეთ მონაცემები სამკაულის უსაფრთხო მიწოდებისა და შეკვეთის დასადასტურებლად.'
                  : 'Enter delivery details to finalize your fine jewelry purchase.'}
              </p>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Customer & Delivery Details */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Contact Info Card */}
                <div
                  className={`p-6 sm:p-7 rounded-3xl border space-y-4 ${
                    darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2.5 pb-2 border-b border-stone-500/15">
                    <User className="w-4 h-4 text-amber-500" />
                    <h2 className="font-serif text-base sm:text-lg font-medium">
                      {lang === 'ka' ? '1. საკონტაქტო მონაცემები' : '1. Contact Details'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-semibold opacity-75 block mb-1.5">
                        {lang === 'ka' ? 'სახელი და გვარი *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder={lang === 'ka' ? 'მაგ: ნინო ბერიძე' : 'Your name'}
                        required
                        className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                          darkMode
                            ? 'bg-stone-900/90 border-stone-700 text-white placeholder-stone-500 focus:border-amber-500'
                            : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-semibold opacity-75 block mb-1.5">
                        {lang === 'ka' ? 'მობილურის ნომერი *' : 'Phone Number *'}
                      </label>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="5XX XX XX XX"
                        required
                        className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                          darkMode
                            ? 'bg-stone-900/90 border-stone-700 text-white placeholder-stone-500 focus:border-amber-500'
                            : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold opacity-75 block mb-1.5">
                      {lang === 'ka' ? 'ელ-ფოსტა (სურვილისამებრ ინვოისისთვის)' : 'Email (Optional for Invoice)'}
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                        darkMode
                          ? 'bg-stone-900/90 border-stone-700 text-white placeholder-stone-500 focus:border-amber-500'
                          : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                      }`}
                    />
                  </div>
                </div>

                {/* 2. Delivery Method Card */}
                <div
                  className={`p-6 sm:p-7 rounded-3xl border space-y-4 ${
                    darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2.5 pb-2 border-b border-stone-500/15">
                    <Truck className="w-4 h-4 text-amber-500" />
                    <h2 className="font-serif text-base sm:text-lg font-medium">
                      {lang === 'ka' ? '2. მიღების მეთოდი' : '2. Delivery Method'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('courier')}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        deliveryMethod === 'courier'
                          ? darkMode
                            ? 'border-amber-500 bg-amber-500/15 text-stone-100 ring-2 ring-amber-400/30'
                            : 'border-amber-500 bg-amber-50 text-stone-900 ring-2 ring-amber-400/40'
                          : darkMode
                          ? 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700'
                          : 'border-stone-300 bg-stone-50 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${deliveryMethod === 'courier' ? 'bg-amber-500 text-black font-bold' : 'bg-stone-800 text-stone-400'}`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm">
                          {lang === 'ka' ? 'საკურიერო მიწოდება' : 'Courier Delivery'}
                        </div>
                        <p className="text-[11px] opacity-70 mt-0.5">
                          {lang === 'ka' ? 'სრულიად უფასო მთელ საქართველოში' : 'Free delivery across Georgia'}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        deliveryMethod === 'pickup'
                          ? darkMode
                            ? 'border-amber-500 bg-amber-500/15 text-stone-100 ring-2 ring-amber-400/30'
                            : 'border-amber-500 bg-amber-50 text-stone-900 ring-2 ring-amber-400/40'
                          : darkMode
                          ? 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700'
                          : 'border-stone-300 bg-stone-50 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${deliveryMethod === 'pickup' ? 'bg-amber-500 text-black font-bold' : 'bg-stone-800 text-stone-400'}`}>
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm">
                          {lang === 'ka' ? 'შოურუმში გატანა' : 'Boutique Pickup'}
                        </div>
                        <p className="text-[11px] opacity-70 mt-0.5">
                          {lang === 'ka' ? 'მ. კოსტავას 75, თბილისი' : 'Kostava St. 75, Tbilisi'}
                        </p>
                      </div>
                    </button>
                  </div>

                  {deliveryMethod === 'courier' && (
                    <div className="space-y-3 pt-2 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] uppercase tracking-wider font-semibold opacity-75 block mb-1.5">
                            {lang === 'ka' ? 'ქალაქი' : 'City'}
                          </label>
                          <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={`w-full px-3.5 py-3 rounded-xl text-xs sm:text-sm border outline-none cursor-pointer transition-all ${
                              darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                            }`}
                          >
                            <option value="თბილისი">თბილისი (Tbilisi)</option>
                            <option value="ბათუმი">ბათუმი (Batumi)</option>
                            <option value="ქუთაისი">ქუთაისი (Kutaisi)</option>
                            <option value="რუსთავი">რუსთავი (Rustavi)</option>
                            <option value="სხვა რეგიონი">სხვა რეგიონი (Other Region)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[11px] uppercase tracking-wider font-semibold opacity-75 block mb-1.5">
                            {lang === 'ka' ? 'ზუსტი მისამართი (ქუჩა, კორპუსი, ბინა) *' : 'Delivery Address *'}
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder={lang === 'ka' ? 'მაგ: ჭავჭავაძის გამზ. 24, ბინა 15' : 'Street address'}
                              required={deliveryMethod === 'courier'}
                              className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                                darkMode
                                  ? 'bg-stone-900/90 border-stone-700 text-white placeholder-stone-500 focus:border-amber-500'
                                  : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Payment Method Card */}
                <div
                  className={`p-6 sm:p-7 rounded-3xl border space-y-4 ${
                    darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2.5 pb-2 border-b border-stone-500/15">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <h2 className="font-serif text-base sm:text-lg font-medium">
                      {lang === 'ka' ? '3. გადახდის მეთოდი' : '3. Payment Method'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all ${
                        paymentMethod === 'card'
                          ? darkMode
                            ? 'border-amber-500 bg-amber-500/15 text-stone-100 ring-2 ring-amber-400/30'
                            : 'border-amber-500 bg-amber-50 text-stone-900 ring-2 ring-amber-400/40'
                          : darkMode
                          ? 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700'
                          : 'border-stone-300 bg-stone-50 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="font-semibold text-xs sm:text-sm">
                          {lang === 'ka' ? 'ონლაინ ბარათით' : 'Online Card'}
                        </div>
                        <span className="text-[10px] opacity-65">Visa / Mastercard</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all ${
                        paymentMethod === 'cod'
                          ? darkMode
                            ? 'border-amber-500 bg-amber-500/15 text-stone-100 ring-2 ring-amber-400/30'
                            : 'border-amber-500 bg-amber-50 text-stone-900 ring-2 ring-amber-400/40'
                          : darkMode
                          ? 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700'
                          : 'border-stone-300 bg-stone-50 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="font-semibold text-xs sm:text-sm">
                          {lang === 'ka' ? 'კურიერთან გადახდა' : 'Cash / Courier'}
                        </div>
                        <span className="text-[10px] opacity-65">
                          {lang === 'ka' ? 'მიღებისას (ნაღდი/ტერმინალი)' : 'Upon delivery'}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('boutique')}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all ${
                        paymentMethod === 'boutique'
                          ? darkMode
                            ? 'border-amber-500 bg-amber-500/15 text-stone-100 ring-2 ring-amber-400/30'
                            : 'border-amber-500 bg-amber-50 text-stone-900 ring-2 ring-amber-400/40'
                          : darkMode
                          ? 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700'
                          : 'border-stone-300 bg-stone-50 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <Store className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="font-semibold text-xs sm:text-sm">
                          {lang === 'ka' ? 'შოურუმში გადახდა' : 'In Boutique'}
                        </div>
                        <span className="text-[10px] opacity-65">
                          {lang === 'ka' ? 'ადგილზე შემოწმებით' : 'Pay at salon'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 4. Notes & Gift Packaging */}
                <div
                  className={`p-6 sm:p-7 rounded-3xl border space-y-4 ${
                    darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
                  }`}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Gift className="w-4 h-4 text-amber-500" />
                      <span className="font-medium">
                        {lang === 'ka'
                          ? 'სასაჩუქრე ექსკლუზიური შეფუთვა ბრენდირებული ყუთით (უფასო)'
                          : 'Exclusive gift packaging with signature boutique box (Free)'}
                      </span>
                    </div>
                  </label>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold opacity-75 block mb-1.5">
                      {lang === 'ka' ? 'კომენტარი ან დამატებითი სურვილი (სურვილისამებრ):' : 'Additional Notes (Optional):'}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={lang === 'ka' ? 'მაგ: გთხოვთ მიტანამდე 30 წუთით ადრე დარეკოთ' : 'Notes for delivery courier'}
                      rows={2}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition-all resize-none ${
                        darkMode
                          ? 'bg-stone-900/90 border-stone-700 text-white placeholder-stone-500 focus:border-amber-500'
                          : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Order Summary Card (Sticky) */}
              <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
                <div
                  className={`p-6 sm:p-7 rounded-3xl border space-y-5 shadow-xl ${
                    darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-500/15">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-500" />
                      <h2 className="font-serif text-lg font-medium">
                        {lang === 'ka' ? 'შეკვეთის დეტალები' : 'Order Summary'}
                      </h2>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-black">
                      {orderItems.length}
                    </span>
                  </div>

                  {/* Selected Products List */}
                  <div className="divide-y divide-stone-500/10 max-h-80 overflow-y-auto space-y-3 pr-1">
                    {orderItems.map((item) => {
                      const currentItemSize = itemSizes[item.id] || '';
                      return (
                        <div key={item.id} className="pt-3 first:pt-0 flex items-start gap-3">
                          <img
                            src={item.images?.[0] || item.image || '/brand-logo.jpg'}
                            alt={item.name}
                            className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-stone-500/20"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-serif text-sm font-medium truncate">{item.name}</h3>
                              {orderItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-stone-400 hover:text-red-400 p-0.5 transition-colors"
                                  title="ამოშლა"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="font-mono text-xs text-amber-500 font-bold mt-0.5">
                              {formatPrice(item.price)}
                            </div>

                            {/* SIZE SELECTOR FOR ITEM */}
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-wider opacity-60 font-medium">
                                {lang === 'ka' ? 'ზომა:' : 'Size:'}
                              </span>

                              {item.sizes && item.sizes.length > 0 ? (
                                <div className="relative inline-block">
                                  <select
                                    aria-label={lang === 'ka' ? `ზომის არჩევა - ${item.name}` : `Select size - ${item.name}`}
                                    data-testid="item-size-select"
                                    value={currentItemSize || item.sizes[0] || ''}
                                    onChange={(e) => handleSizeChange(item.id, e.target.value)}
                                    className={`py-1 pl-2 pr-6 rounded-lg text-xs font-semibold border outline-none cursor-pointer appearance-none transition-all ${
                                      darkMode
                                        ? 'bg-stone-900 border-stone-700 text-amber-400 hover:border-amber-500'
                                        : 'bg-stone-100 border-stone-300 text-stone-900 hover:border-amber-600'
                                    }`}
                                  >
                                    {item.sizes.map((sz) => (
                                      <option key={sz} value={sz}>
                                        {sz}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3 h-3 text-stone-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              ) : (
                                <span className="text-[11px] opacity-75 font-mono">
                                  {lang === 'ka' ? 'უნივერსალური' : 'One Size'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Promo Code Input */}
                  <div className="pt-2">
                    {appliedPromo ? (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5" />
                          <span className="font-bold">{appliedPromo.code}</span>
                          <span>({appliedPromo.label})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAppliedPromo(null)}
                          className="text-[10px] uppercase font-bold text-stone-400 hover:text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value)}
                            placeholder="VIP პრომო კოდი"
                            className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-none uppercase font-mono ${
                              darkMode
                                ? 'bg-stone-900 border-stone-700 text-white placeholder-stone-500'
                                : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all"
                          >
                            {lang === 'ka' ? 'გააქტიურება' : 'Apply'}
                          </button>
                        </div>
                        {promoError && (
                          <span className="text-[11px] text-red-400 block">{promoError}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price Calculations */}
                  <div className="pt-3 border-t border-stone-500/15 space-y-2 text-xs">
                    <div className="flex justify-between items-center opacity-70">
                      <span>{lang === 'ka' ? 'ნივთების ჯამი:' : 'Subtotal:'}</span>
                      <span className="font-mono">{formatPrice(rawSubtotal)}</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between items-center text-emerald-400 font-medium">
                        <span>{lang === 'ka' ? 'ფასდაკლება (-10%):' : 'Discount:'}</span>
                        <span className="font-mono">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center opacity-70">
                      <span>{lang === 'ka' ? 'მიწოდება:' : 'Delivery:'}</span>
                      <span className="text-emerald-400 font-semibold">{lang === 'ka' ? 'უფასო' : 'Free'}</span>
                    </div>

                    <div className="pt-2 border-t border-stone-500/15 flex justify-between items-baseline">
                      <span className="font-serif text-sm sm:text-base font-semibold">
                        {lang === 'ka' ? 'საბოლოო თანხა:' : 'Total to Pay:'}
                      </span>
                      <span className="font-mono font-bold text-amber-500 text-xl sm:text-2xl">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || orderItems.length === 0}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{lang === 'ka' ? 'შეკვეთის დადასტურება' : 'Confirm Order'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 flex items-center justify-center gap-2 text-[10px] opacity-60 text-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>
                      {lang === 'ka'
                        ? 'უსაფრთხო მიწოდება და ოფიციალური საგარანტიო სერტიფიკატი'
                        : 'Secure insured delivery & authenticity certificate included'}
                    </span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer
        lang={lang}
        darkMode={darkMode}
        siteSettings={siteSettings}
      />
    </div>
  );
}

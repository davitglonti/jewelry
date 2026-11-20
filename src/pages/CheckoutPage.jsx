// src/pages/CheckoutPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag, Check, ArrowLeft, Truck, CreditCard,
  Banknote, User, Mail, MapPin, Gift, MessageSquare,
  ShieldCheck, AlertCircle, ArrowRight, Trash2, Tag, ChevronDown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/i18n';
import { navigateTo } from '../utils/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import OrderTrackingTimeline from '../components/order/OrderTrackingTimeline';

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

  const searchParams = useMemo(() => {
    return new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  }, []);

  const productIdParam = searchParams.get('productId') || searchParams.get('id') || searchParams.get('sku') || '';
  const initialSizeParam = searchParams.get('size') || '';
  const fromParam = searchParams.get('from') || '';

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [city, setCity] = useState('თბილისი');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isGift, setIsGift] = useState(false);
  const [notes, setNotes] = useState('');

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const [orderItems, setOrderItems] = useState([]);
  const [itemSizes, setItemSizes] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      if (user.displayName && !clientName) setClientName(user.displayName);
      if (user.email && !clientEmail) setClientEmail(user.email);
    }
  }, [user]);

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

    if (products.length > 0) {
      const sample = products[0];
      setOrderItems([sample]);
      setItemSizes({ [sample.id]: sample.sizes?.[0] || '' });
    }
  }, [products, productIdParam, initialSizeParam, fromParam, favorites]);

  const handleSizeChange = (itemId, newSize) => {
    setItemSizes((prev) => ({
      ...prev,
      [itemId]: newSize
    }));
  };

  const handleRemoveItem = (itemId) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const parseRate = (val, fallback) => {
    if (val === null || val === undefined || val === '') return fallback;
    const num = Number(val);
    return Number.isFinite(num) ? num : fallback;
  };

  const deliveryPriceTbilisi = parseRate(siteSettings?.deliveryPriceTbilisi, 6);
  const deliveryPriceRegional = parseRate(siteSettings?.deliveryPriceRegional, 10);
  const giftPackagingPrice = parseRate(siteSettings?.giftPackagingPrice, 5);

  const isTbilisi = city === 'თბილისი';
  const baseShippingFee = isTbilisi ? deliveryPriceTbilisi : deliveryPriceRegional;
  const isFreeShippingPromo = appliedPromo?.type === 'free_shipping';
  const shippingFee = isFreeShippingPromo ? 0 : baseShippingFee;
  const giftFee = isGift ? giftPackagingPrice : 0;

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
    if (appliedPromo.type === 'free_shipping') return 0;
    if (appliedPromo.type === 'fixed') {
      return Math.min(rawSubtotal, Number(appliedPromo.value) || 0);
    }
    const pct = appliedPromo.percent ?? ((Number(appliedPromo.value) || 0) / 100);
    return Math.round(rawSubtotal * pct);
  }, [rawSubtotal, appliedPromo]);

  const finalTotal = Math.max(0, rawSubtotal - discountAmount) + shippingFee + giftFee;

  const handleApplyPromo = (e) => {
    e?.preventDefault();
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();

    if (!code) {
      setPromoError(lang === 'ka' ? 'შეიყვანეთ პრომო კოდი' : 'Enter promo code');
      return;
    }

    const availableCodes = siteSettings?.promoCodes && Array.isArray(siteSettings.promoCodes)
      ? siteSettings.promoCodes
      : [
          { code: 'VIP-AURELIA10', type: 'percentage', value: 10, percent: 0.1, label: '-10% VIP ფასდაკლება', isActive: true },
          { code: 'MATARE10', type: 'percentage', value: 10, percent: 0.1, label: '-10% VIP ფასდაკლება', isActive: true }
        ];

    const match = availableCodes.find((c) => c.code?.toUpperCase() === code);

    if (!match && (code === 'VIP-AURELIA10' || code === 'MATARE10')) {
      setAppliedPromo({ code, type: 'percentage', percent: 0.1, value: 10, label: '-10% VIP ფასდაკლება' });
      setPromoCodeInput('');
      return;
    }

    if (!match || match.isActive === false) {
      setPromoError(lang === 'ka' ? 'არასწორი პრომო კოდი' : 'Invalid promo code');
      return;
    }

    if (match.expiresAt) {
      const exp = new Date(match.expiresAt);
      if (!isNaN(exp.getTime()) && exp < new Date()) {
        setPromoError(lang === 'ka' ? 'პრომო კოდს ვადა გაუვიდა' : 'Promo code has expired');
        return;
      }
    }

    if (match.maxUses && (match.usedCount || 0) >= match.maxUses) {
      setPromoError(lang === 'ka' ? 'პრომო კოდის გამოყენების ლიმიტი ამოწურულია' : 'Promo code usage limit reached');
      return;
    }

    if (match.minOrderAmount && rawSubtotal < match.minOrderAmount) {
      setPromoError(
        lang === 'ka'
          ? `პრომო კოდი მოითხოვს მინიმუმ ${match.minOrderAmount} ₾ შეკვეთას`
          : `Promo code requires minimum order of ${match.minOrderAmount} GEL`
      );
      return;
    }

    const label =
      match.description ||
      (match.type === 'percentage'
        ? `-${match.value}% ${match.code === 'VIP-AURELIA10' ? 'VIP ფასდაკლება' : 'ფასდაკლება'}`
        : match.type === 'free_shipping'
        ? (lang === 'ka' ? 'უფასო მიწოდება' : 'Free Shipping')
        : `-${match.value} ₾ ფასდაკლება`);

    const percent = match.type === 'percentage' ? (match.value / 100) : 0;

    setAppliedPromo({
      id: match.id,
      code: match.code,
      type: match.type || 'percentage',
      value: match.value,
      percent,
      label
    });
    setPromoCodeInput('');
  };

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

    if (!address.trim()) {
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
      deliveryMethod: `კურიერით (${city})`,
      city,
      address: `${city}, ${address.trim()}`,
      paymentMethod: paymentMethod === 'card' ? 'ონლაინ ბარათით' : 'კურიერთან გადახდა',
      paymentStatus: paymentMethod === 'card' ? 'გადახდილია' : 'გადასახდელია',
      isGift,
      giftFee,
      shippingFee,
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
      let nextSettings = siteSettings;
      if (appliedPromo?.id && siteSettings?.promoCodes) {
        const updatedCodes = siteSettings.promoCodes.map((c) => {
          if (c.id === appliedPromo.id) {
            return { ...c, usedCount: (c.usedCount || 0) + 1 };
          }
          return c;
        });
        nextSettings = { ...siteSettings, promoCodes: updatedCodes };
      }

      const updated = [newOrder, ...(inquiries || [])];
      if (setInquiries) setInquiries(updated);
      if (syncData) syncData(nextSettings, products, updated);

      try {
        const prevHistory = JSON.parse(localStorage.getItem('matare_orders') || '[]');
        localStorage.setItem('matare_orders', JSON.stringify([newOrder, ...prevHistory]));
      } catch (err) {
        console.warn('Local storage error:', err);
      }

      if (typeof window !== 'undefined' && window.location?.origin) {
        try {
          fetch(`${window.location.origin}/api/send-order-notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order: newOrder,
              origin: window.location.origin,
              adminEmail: nextSettings?.email || nextSettings?.contactEmail
            })
          }).catch(() => {});
        } catch {}
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

  const inputClass =
    'w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#DCD6CC] focus:border-[#141311] text-[#141311] placeholder-[#9C958B] outline-none transition-colors';

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

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-[104px] sm:pt-[120px] pb-24">
        <div className="mb-8 flex items-center justify-between pb-4 border-b border-[#E8E3DB]">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#5C574F] hover:text-[#141311] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{lang === 'ka' ? 'უკან დაბრუნება' : 'Back'}</span>
          </button>

          <span className="text-[10px] font-mono text-[#847E75] uppercase tracking-[0.18em]">
            {lang === 'ka' ? 'უსაფრთხო შეკვეთა • SSL 256-BIT' : 'Secure Checkout • 256-Bit SSL'}
          </span>
        </div>

        {completedOrder ? (
          <div className="max-w-2xl mx-auto py-8 animate-fadeIn text-center space-y-7">
            <div className="w-16 h-16 rounded-full bg-[#F4F8F5] border border-[#2E7D52] text-[#2E7D52] flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.26em] font-medium text-[#9D7B48]">
                {lang === 'ka' ? 'შეკვეთა მიღებულია!' : 'Order Placed!'}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#141311]">
                {lang === 'ka' ? 'მადლობას გიხდით არჩევანისთვის' : 'Thank you for your order'}
              </h1>
              <p className="text-xs sm:text-sm text-[#5C574F] max-w-md mx-auto leading-relaxed font-light">
                {lang === 'ka'
                  ? 'თქვენი შეკვეთა წარმატებით დარეგისტრირდა. ჩვენი კონსულტანტი უმოკლეს დროში დაგიკავშირდებათ მითითებულ ნომერზე.'
                  : 'Your order has been registered. Our salon concierge will contact you shortly to confirm delivery.'}
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-[#FAF9F6] border border-[#E8E3DB] text-left space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#E8E3DB]">
                <span className="text-xs text-[#847E75]">{lang === 'ka' ? 'შეკვეთის ნომერი:' : 'Order Code:'}</span>
                <span className="font-mono font-medium text-[#141311] text-sm">#{completedOrder.id}</span>
              </div>

              <div className="space-y-2 text-xs">
                {completedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="font-medium text-[#141311]">
                      {it.name} {it.size ? `(${lang === 'ka' ? 'ზომა' : 'Size'}: ${it.size})` : ''}
                    </span>
                    <span className="font-mono text-[#141311]">{formatPrice(it.price)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#E8E3DB] flex justify-between items-center">
                <span className="text-xs uppercase tracking-[0.16em] text-[#5C574F]">
                  {lang === 'ka' ? 'საბოლოო თანხა:' : 'Total Amount:'}
                </span>
                <span className="font-mono text-lg font-medium text-[#141311]">
                  {formatPrice(completedOrder.totalPrice)}
                </span>
              </div>

              <div className="pt-2 text-[11px] text-[#5C574F] space-y-1 font-light">
                <div>
                  <strong className="text-[#141311] font-medium">{lang === 'ka' ? 'მიწოდება:' : 'Delivery:'}</strong> {completedOrder.deliveryMethod} — {completedOrder.address}
                </div>
                <div>
                  <strong className="text-[#141311] font-medium">{lang === 'ka' ? 'გადახდა:' : 'Payment:'}</strong> {completedOrder.paymentMethod}
                </div>
              </div>
            </div>

            {completedOrder.clientEmail && (
              <div className="p-4 bg-[#F8F6F2] border border-[#E8E3DB] flex items-center gap-3 text-xs text-[#4A4640]">
                <Mail className="w-4 h-4 text-[#9D7B48] shrink-0 stroke-[1.5]" />
                <span>
                  {lang === 'ka'
                    ? `შეკვეთის დეტალები & თრექინგის ბმული გაიგზავნა თქვენს ელფოსტაზე: ${completedOrder.clientEmail}`
                    : `Live order tracking link has been sent to your email: ${completedOrder.clientEmail}`}
                </span>
              </div>
            )}

            <OrderTrackingTimeline
              order={completedOrder}
              lang={lang}
              siteSettings={siteSettings}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3.5 px-6 bg-[#141311] hover:bg-[#2C2A26] text-white text-[11px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 stroke-[1.5]" />
                <span>{lang === 'ka' ? 'WhatsApp-ით დაკავშირება' : 'Chat on WhatsApp'}</span>
              </a>

              <a
                href={`/track?id=${completedOrder.id}`}
                className="py-3.5 px-6 border border-[#141311] text-[#141311] hover:bg-[#F8F6F2] text-[11px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <Truck className="w-4 h-4 stroke-[1.5]" />
                <span>{lang === 'ka' ? 'თრექინგის გვერდი' : 'Track Order Page'}</span>
              </a>

              <button
                type="button"
                onClick={() => navigateTo('/catalog')}
                className="py-3.5 px-6 border border-[#E8E3DB] text-[#4A4640] hover:border-[#141311] hover:text-[#141311] text-[11px] tracking-[0.18em] uppercase transition-colors cursor-pointer"
              >
                {lang === 'ka' ? 'კოლექცია' : 'Collection'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.26em] text-[#9D7B48] font-medium block">
                {lang === 'ka' ? 'პერსონალური შეკვეთა' : 'Private Boutique Checkout'}
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#141311]">
                {lang === 'ka' ? 'შეკვეთის გაფორმება' : 'Checkout & Purchase'}
              </h1>
              <p className="text-xs sm:text-sm text-[#5C574F] font-light">
                {lang === 'ka'
                  ? 'შეავსეთ მონაცემები სამკაულის უსაფრთხო მიწოდებისა და შეკვეთის დასადასტურებლად.'
                  : 'Enter delivery details to finalize your fine jewelry purchase.'}
              </p>
            </div>

            {formError && (
              <div className="p-4 bg-[#FDF6F6] border border-[#E8C8C8] text-[#8E2424] text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Contact Info */}
                <div className="p-6 sm:p-8 bg-white border border-[#E8E3DB] space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#EFECE6]">
                    <User className="w-4 h-4 text-[#9D7B48] stroke-[1.5]" />
                    <h2 className="font-serif text-lg sm:text-xl font-light">
                      {lang === 'ka' ? '1. საკონტაქტო მონაცემები' : '1. Contact Details'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.16em] text-[#5C574F] block mb-1.5 font-medium">
                        {lang === 'ka' ? 'სახელი და გვარი *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder={lang === 'ka' ? 'მაგ: ნინო ბერიძე' : 'Your name'}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-[0.16em] text-[#5C574F] block mb-1.5 font-medium">
                        {lang === 'ka' ? 'მობილურის ნომერი *' : 'Phone Number *'}
                      </label>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="5XX XX XX XX"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] uppercase tracking-[0.16em] text-[#5C574F] font-medium">
                        {lang === 'ka' ? 'ელ-ფოსტა (თრექინგის ბმულის მისაღებად):' : 'Email (to receive tracking link):'}
                      </label>
                      <span className="text-[10px] text-[#9D7B48]">
                        {lang === 'ka' ? 'ბმული გამოიგზავნება მეილზე' : 'Tracking link sent here'}
                      </span>
                    </div>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* 2. Delivery Method */}
                <div className="p-6 sm:p-8 bg-white border border-[#E8E3DB] space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#EFECE6]">
                    <Truck className="w-4 h-4 text-[#9D7B48] stroke-[1.5]" />
                    <h2 className="font-serif text-lg sm:text-xl font-light">
                      {lang === 'ka' ? '2. მიღების მეთოდი' : '2. Delivery Method'}
                    </h2>
                  </div>

                  <div className="p-4 sm:p-5 bg-[#F8F6F2] border border-[#E8E3DB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-[#141311] text-white flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4 stroke-[1.5]" />
                      </div>
                      <div>
                        <div className="font-medium text-xs sm:text-sm text-[#141311]">
                          {lang === 'ka' ? 'საკურიერო მიწოდება' : 'Express Courier Delivery'}
                        </div>
                        <p className="text-[11px] text-[#5C574F] mt-0.5 font-light">
                          {isTbilisi
                            ? (lang === 'ka'
                                ? `თბილისის მასშტაბით: ${formatPrice(deliveryPriceTbilisi)} (1-2 სამუშაო დღე)`
                                : `Tbilisi area: ${formatPrice(deliveryPriceTbilisi)} (1-2 business days)`)
                            : (lang === 'ka'
                                ? `ქალაქგარეთ / რეგიონებში: ${formatPrice(deliveryPriceRegional)} (2-3 სამუშაო დღე)`
                                : `Regions across Georgia: ${formatPrice(deliveryPriceRegional)} (2-3 business days)`)}
                        </p>
                      </div>
                    </div>

                    <div className="font-mono font-medium text-sm sm:text-base text-[#141311] self-end sm:self-center shrink-0">
                      {formatPrice(shippingFee)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.16em] text-[#5C574F] block mb-1.5 font-medium">
                        {lang === 'ka' ? 'ქალაქი / რეგიონი' : 'City / Region'}
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="თბილისი">თბილისი (Tbilisi) — {formatPrice(deliveryPriceTbilisi)}</option>
                        <option value="ბათუმი">ბათუმი (Batumi) — {formatPrice(deliveryPriceRegional)}</option>
                        <option value="ქუთაისი">ქუთაისი (Kutaisi) — {formatPrice(deliveryPriceRegional)}</option>
                        <option value="რუსთავი">რუსთავი (Rustavi) — {formatPrice(deliveryPriceRegional)}</option>
                        <option value="სხვა რეგიონი">სხვა რეგიონი (Other Region) — {formatPrice(deliveryPriceRegional)}</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase tracking-[0.16em] text-[#5C574F] block mb-1.5 font-medium">
                        {lang === 'ka' ? 'ზუსტი მისამართი (ქუჩა, კორპუსი, ბინა) *' : 'Delivery Address *'}
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-[#847E75] stroke-[1.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder={lang === 'ka' ? 'მაგ: ჭავჭავაძის გამზ. 24, ბინა 15' : 'Street address'}
                          required
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method */}
                <div className="p-6 sm:p-8 bg-white border border-[#E8E3DB] space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#EFECE6]">
                    <CreditCard className="w-4 h-4 text-[#9D7B48] stroke-[1.5]" />
                    <h2 className="font-serif text-lg sm:text-xl font-light">
                      {lang === 'ka' ? '3. გადახდის მეთოდი' : '3. Payment Method'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-[#141311] bg-[#F8F6F2] text-[#141311]'
                          : 'border-[#E8E3DB] bg-white text-[#5C574F] hover:border-[#9D7B48]'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-[#9D7B48] shrink-0 mt-0.5 stroke-[1.5]" />
                      <div>
                        <div className="font-medium text-xs sm:text-sm text-[#141311]">
                          {lang === 'ka' ? 'ონლაინ ბარათით' : 'Online Card'}
                        </div>
                        <span className="text-[11px] text-[#847E75]">Visa / Mastercard</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-[#141311] bg-[#F8F6F2] text-[#141311]'
                          : 'border-[#E8E3DB] bg-white text-[#5C574F] hover:border-[#9D7B48]'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-[#9D7B48] shrink-0 mt-0.5 stroke-[1.5]" />
                      <div>
                        <div className="font-medium text-xs sm:text-sm text-[#141311]">
                          {lang === 'ka' ? 'კურიერთან გადახდა' : 'Cash / Courier'}
                        </div>
                        <span className="text-[11px] text-[#847E75]">
                          {lang === 'ka' ? 'მიღებისას (ნაღდი ან ტერმინალი)' : 'Upon delivery'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 4. Notes & Gift Packaging */}
                <div className="p-6 sm:p-8 bg-white border border-[#E8E3DB] space-y-5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                      className="w-4 h-4 accent-[#141311] cursor-pointer"
                    />
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[#141311]">
                      <Gift className="w-4 h-4 text-[#9D7B48] shrink-0 stroke-[1.5]" />
                      <span className="font-medium">
                        {lang === 'ka'
                          ? `სასაჩუქრე ექსკლუზიური შეფუთვა ბრენდირებული ყუთით (+${giftPackagingPrice} ₾)`
                          : `Exclusive signature gift packaging with boutique box (+${formatPrice(giftPackagingPrice)})`}
                      </span>
                    </div>
                  </label>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.16em] text-[#5C574F] block mb-1.5 font-medium">
                      {lang === 'ka' ? 'კომენტარი ან დამატებითი სურვილი (სურვილისამებრ):' : 'Additional Notes (Optional):'}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={lang === 'ka' ? 'მაგ: გთხოვთ მიტანამდე 30 წუთით ადრე დარეკოთ' : 'Notes for delivery courier'}
                      rows={2}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-5 lg:sticky lg:top-[132px]">
                <div className="p-6 sm:p-8 bg-[#FAF9F6] border border-[#E8E3DB] space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DB]">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#9D7B48] stroke-[1.5]" />
                      <h2 className="font-serif text-xl font-light">
                        {lang === 'ka' ? 'შეკვეთის დეტალები' : 'Order Summary'}
                      </h2>
                    </div>
                    <span className="px-2.5 py-0.5 text-xs font-mono bg-[#141311] text-white">
                      {orderItems.length}
                    </span>
                  </div>

                  <div className="divide-y divide-[#E8E3DB] max-h-80 overflow-y-auto pr-1">
                    {orderItems.map((item) => {
                      const currentItemSize = itemSizes[item.id] || '';
                      return (
                        <div key={item.id} className="py-3.5 first:pt-0 flex items-start gap-3.5">
                          <img
                            src={item.images?.[0] || item.image || '/brand-logo.jpg'}
                            alt={item.name}
                            className="w-16 h-20 object-cover shrink-0 bg-[#F4F1EC] border border-[#E8E3DB]"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-serif text-base font-normal text-[#141311] truncate">{item.name}</h3>
                              {orderItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-[#847E75] hover:text-[#8E2424] p-0.5 transition-colors cursor-pointer"
                                  title="ამოშლა"
                                >
                                  <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                                </button>
                              )}
                            </div>

                            <div className="font-mono text-xs text-[#141311] font-medium mt-0.5">
                              {formatPrice(item.price)}
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-[0.14em] text-[#847E75]">
                                {lang === 'ka' ? 'ზომა:' : 'Size:'}
                              </span>

                              {item.sizes && item.sizes.length > 0 ? (
                                <div className="relative inline-block">
                                  <select
                                    aria-label={lang === 'ka' ? `ზომის არჩევა - ${item.name}` : `Select size - ${item.name}`}
                                    data-testid="item-size-select"
                                    value={currentItemSize || item.sizes[0] || ''}
                                    onChange={(e) => handleSizeChange(item.id, e.target.value)}
                                    className="py-1 pl-2.5 pr-6 text-xs font-medium bg-white border border-[#DCD6CC] text-[#141311] outline-none cursor-pointer appearance-none focus:border-[#141311]"
                                  >
                                    {item.sizes.map((sz) => (
                                      <option key={sz} value={sz}>{sz}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3 h-3 text-[#847E75] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              ) : (
                                <span className="text-[11px] text-[#5C574F] font-mono">
                                  {lang === 'ka' ? 'უნივერსალური' : 'One Size'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Promo Code */}
                  <div className="pt-1">
                    {appliedPromo ? (
                      <div className="p-3 bg-[#F4F8F5] border border-[#D4E2D9] text-[#2B5C40] text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 stroke-[1.5]" />
                          <span className="font-medium">{appliedPromo.code}</span>
                          <span>({appliedPromo.label})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAppliedPromo(null)}
                          className="text-xs text-[#847E75] hover:text-[#8E2424] cursor-pointer"
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
                            className="flex-1 px-3 py-2.5 text-xs bg-white border border-[#DCD6CC] focus:border-[#141311] text-[#141311] placeholder-[#9C958B] outline-none uppercase font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            className="px-4 py-2.5 border border-[#141311] text-[#141311] hover:bg-[#141311] hover:text-white text-[10px] uppercase tracking-[0.16em] font-medium transition-colors cursor-pointer"
                          >
                            {lang === 'ka' ? 'გააქტიურება' : 'Apply'}
                          </button>
                        </div>
                        {promoError && (
                          <span className="text-[11px] text-[#8E2424] block">{promoError}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="pt-4 border-t border-[#E8E3DB] space-y-2.5 text-xs text-[#4A4640]">
                    <div className="flex justify-between items-center">
                      <span>{lang === 'ka' ? 'ნივთების ჯამი:' : 'Subtotal:'}</span>
                      <span className="font-mono text-[#141311]">{formatPrice(rawSubtotal)}</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between items-center text-[#2B5C40] font-medium">
                        <span>
                          {lang === 'ka'
                            ? `ფასდაკლება${appliedPromo.type === 'percentage' ? ` (-${appliedPromo.value || 10}%):` : ':'}`
                            : `Discount${appliedPromo.type === 'percentage' ? ` (-${appliedPromo.value || 10}%):` : ':'}`}
                        </span>
                        <span className="font-mono">
                          {appliedPromo.type === 'free_shipping'
                            ? (lang === 'ka' ? 'უფასო მიწოდება' : 'Free Shipping')
                            : `-${formatPrice(discountAmount)}`}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span>
                        {lang === 'ka'
                          ? `მიწოდება (${isTbilisi ? 'თბილისი' : 'რეგიონი'}):`
                          : `Delivery (${isTbilisi ? 'Tbilisi' : 'Regions'}):`}
                      </span>
                      <span className="font-mono text-[#141311]">
                        {formatPrice(shippingFee)}
                      </span>
                    </div>

                    {isGift && (
                      <div className="flex justify-between items-center text-[#9D7B48] font-medium">
                        <span>{lang === 'ka' ? 'სასაჩუქრე შეფუთვა:' : 'Gift Box:'}</span>
                        <span className="font-mono">+{formatPrice(giftFee)}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-[#E8E3DB] flex justify-between items-baseline">
                      <span className="font-serif text-base text-[#141311]">
                        {lang === 'ka' ? 'საბოლოო თანხა:' : 'Total to Pay:'}
                      </span>
                      <span className="font-mono font-medium text-[#141311] text-xl sm:text-2xl">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || orderItems.length === 0}
                    className="w-full py-4 px-6 bg-[#141311] hover:bg-[#2C2A26] text-white font-medium text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-[1.5px] border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                        <span>{lang === 'ka' ? 'შეკვეთის დადასტურება' : 'Confirm Order'}</span>
                        <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                      </>
                    )}
                  </button>

                  <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-[#847E75] text-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9D7B48] shrink-0 stroke-[1.5]" />
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

      <Footer lang={lang} siteSettings={siteSettings} />
    </div>
  );
}

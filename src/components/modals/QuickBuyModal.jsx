// src/components/modals/QuickBuyModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Check, ShoppingBag, Truck, Store, CreditCard,
  Banknote, Phone, User, MapPin, MessageSquare, Sparkles, AlertCircle, ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/i18n';
import { getWhatsAppLink } from '../../utils/shareUtils';

export default function QuickBuyModal({
  isOpen,
  onClose,
  items = [], // Array of products to purchase
  onSuccess
}) {
  const store = useStore() || {};
  const {
    darkMode = true,
    lang = 'ka',
    siteSettings = {},
    inquiries = [],
    setInquiries,
    syncData,
    products = []
  } = store;

  const auth = useAuth() || {};
  const { user = null } = auth;

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('courier'); // 'courier' | 'pickup'
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'cod' | 'boutique'
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Autofill user details if available
  useEffect(() => {
    if (user) {
      if (user.displayName && !clientName) {
        setClientName(user.displayName);
      }
    }
  }, [user]);

  // Reset states when opened with new items
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setCompletedOrder(null);
    }
  }, [isOpen]);

  const rawProducts = useMemo(() => {
    if (!items || items.length === 0) return [];
    return Array.isArray(items) ? items : [items];
  }, [items]);

  const totalPrice = useMemo(() => {
    return rawProducts.reduce((sum, item) => {
      const p = typeof item.price === 'number'
        ? item.price
        : parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) || 0;
      return sum + p;
    }, 0);
  }, [rawProducts]);

  if (!isOpen) return null;

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clientName.trim()) {
      setErrorMsg(lang === 'ka' ? 'გთხოვთ შეიყვანოთ თქვენი სახელი და გვარი' : 'Please enter your full name');
      return;
    }

    const cleanedPhone = clientPhone.replace(/[\s\-()]/g, '');
    const georgianPhoneRegex = /^(\+?995)?5\d{8}$/;

    if (!cleanedPhone || !georgianPhoneRegex.test(cleanedPhone)) {
      setErrorMsg(
        lang === 'ka'
          ? 'შეიყვანეთ სწორი ქართული მობილურის ნომერი (მაგ: 555 12 34 56)'
          : 'Please enter a valid Georgian phone number (e.g. 555 12 34 56)'
      );
      return;
    }

    if (deliveryMethod === 'courier' && !address.trim()) {
      setErrorMsg(
        lang === 'ka'
          ? 'გთხოვთ მიუთითოთ მიტანის მისამართი'
          : 'Please enter delivery address'
      );
      return;
    }

    setSubmitting(true);

    const orderId = `MTR-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleString('ka-GE'),
      clientName: clientName.trim(),
      clientPhone: cleanedPhone,
      deliveryMethod: deliveryMethod === 'courier' ? 'საკურიერო მიწოდება' : 'შოურუმში გატანა',
      address: deliveryMethod === 'courier' ? address.trim() : 'შოურუმი (მ. კოსტავას 75, თბილისი)',
      paymentMethod:
        paymentMethod === 'card'
          ? 'ონლაინ ბარათით'
          : paymentMethod === 'cod'
          ? 'კურიერთან ნაღდი/ტერმინალი'
          : 'შოურუმში გადახდა',
      notes: notes.trim(),
      productName: rawProducts.map((p) => p.name).join(', '),
      sku: rawProducts.map((p) => p.sku || p.id).join(', '),
      totalPrice,
      itemsCount: rawProducts.length,
      status: 'ახალი შეკვეთა'
    };

    try {
      // 1. Sync to store inquiries
      const updatedInquiries = [newOrder, ...(inquiries || [])];
      if (setInquiries) setInquiries(updatedInquiries);
      if (syncData) syncData(siteSettings, products, updatedInquiries);

      // 2. Persist locally to customer history
      try {
        const prevHistory = JSON.parse(localStorage.getItem('matare_orders') || '[]');
        localStorage.setItem('matare_orders', JSON.stringify([newOrder, ...prevHistory]));
      } catch (err) {
        console.warn('Local storage order history error:', err);
      }

      setCompletedOrder(newOrder);
      if (onSuccess) onSuccess(newOrder);
    } catch (err) {
      console.error('Order placement error:', err);
      setErrorMsg(lang === 'ka' ? 'შეკვეთის გაფორმებისას დაფიქსირდა შეცდომა' : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMessage = completedOrder
    ? encodeURIComponent(
        `გამარჯობა! გავაფორმე შეკვეთა #${completedOrder.id} matare.store-ზე.\n` +
        `ნივთი: ${completedOrder.productName}\n` +
        `თანხა: ${formatPrice(completedOrder.totalPrice)}\n` +
        `სახელი: ${completedOrder.clientName}\n` +
        `ტელეფონი: ${completedOrder.clientPhone}`
      )
    : '';

  const whatsappUrl = `https://wa.me/${(siteSettings?.whatsapp || '+995599000000').replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-lg rounded-3xl border p-5 sm:p-7 my-auto transition-all ${
          darkMode
            ? 'bg-[#141210] border-stone-800 text-stone-100 shadow-2xl shadow-black/90'
            : 'bg-white border-stone-200 text-stone-900 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-500/15">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-medium tracking-wide">
                {lang === 'ka' ? 'შეკვეთის გაფორმება' : 'Complete Order'}
              </h3>
              <span className="text-[11px] opacity-60">
                {lang === 'ka' ? 'საიუველირო სახლი «მატარე»' : 'Fine Jewelry House Matare'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-500/10 text-stone-400 hover:text-white transition-colors"
            aria-label="დახურვა"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* COMPLETED ORDER VIEW */}
        {completedOrder ? (
          <div className="py-6 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-500">
                {lang === 'ka' ? 'შეკვეთა მიღებულია!' : 'Order Placed Successfully!'}
              </span>
              <h4 className="font-serif text-2xl font-medium">
                {lang === 'ka' ? 'მადლობას გიხდით არჩევანისთვის' : 'Thank you for your order'}
              </h4>
              <p className="text-xs opacity-70 max-w-sm mx-auto leading-relaxed">
                {lang === 'ka'
                  ? 'ჩვენი კონსულტანტი უმოკლეს დროში დაგიკავშირდებათ მითითებულ ნომერზე დეტალების დასადასტურებლად.'
                  : 'Our boutique concierge will contact you shortly to confirm order details.'}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border text-xs text-left space-y-2 ${
              darkMode ? 'bg-stone-900/60 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className="opacity-60">{lang === 'ka' ? 'შეკვეთის კოდი:' : 'Order Code:'}</span>
                <span className="font-mono font-bold text-amber-500">#{completedOrder.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-60">{lang === 'ka' ? 'სამკაული:' : 'Jewelry:'}</span>
                <span className="font-medium truncate max-w-[200px]">{completedOrder.productName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-60">{lang === 'ka' ? 'ჯამური თანხა:' : 'Total Amount:'}</span>
                <span className="font-mono font-bold text-amber-500">{formatPrice(completedOrder.totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-60">{lang === 'ka' ? 'მიწოდება:' : 'Delivery:'}</span>
                <span className="font-medium">{completedOrder.deliveryMethod}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{lang === 'ka' ? 'WhatsApp-ით დაკავშირება' : 'Chat on WhatsApp'}</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold tracking-wider uppercase transition-all ${
                  darkMode
                    ? 'border-stone-800 bg-stone-900 text-stone-300 hover:bg-stone-800'
                    : 'border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-200'
                }`}
              >
                {lang === 'ka' ? 'ფანჯრის დახურვა' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          /* ORDER FORM */
          <form onSubmit={handleSubmitOrder} className="py-4 space-y-4">
            {/* Products Summary Strip */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
              darkMode ? 'bg-stone-900/40 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                {rawProducts[0] && (
                  <img
                    src={rawProducts[0].images?.[0] || rawProducts[0].image || '/brand-logo.jpg'}
                    alt={rawProducts[0].name || 'სამკაული'}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-500/20"
                  />
                )}
                <div className="min-w-0">
                  <div className="font-serif text-sm font-medium truncate">
                    {rawProducts.length === 1
                      ? rawProducts[0]?.name
                      : lang === 'ka'
                      ? `${rawProducts[0]?.name} და კიდევ ${rawProducts.length - 1} ნივთი`
                      : `${rawProducts[0]?.name} and ${rawProducts.length - 1} more`}
                  </div>
                  <span className="text-[11px] opacity-60">
                    {lang === 'ka' ? `სულ: ${rawProducts.length} სამკაული` : `${rawProducts.length} item(s)`}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-amber-500 text-sm sm:text-base">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Client Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold opacity-70 block mb-1">
                  {lang === 'ka' ? 'თქვენი სახელი და გვარი:' : 'Full Name:'}
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={lang === 'ka' ? 'მაგ: ნინო ბერიძე' : 'e.g. John Doe'}
                    required
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                      darkMode
                        ? 'bg-stone-900/90 border-stone-700 text-white placeholder-stone-500 focus:border-amber-500'
                        : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold opacity-70 block mb-1">
                  {lang === 'ka' ? 'ტელეფონის ნომერი:' : 'Phone Number:'}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="555 12 34 56"
                    required
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                      darkMode
                        ? 'bg-stone-900/90 border-stone-700 text-white placeholder-stone-500 focus:border-amber-500'
                        : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Method Selection */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold opacity-70 block mb-1.5">
                {lang === 'ka' ? 'მიღების მეთოდი:' : 'Delivery Method:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('courier')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    deliveryMethod === 'courier'
                      ? 'bg-amber-500 text-black border-amber-500 font-semibold shadow-xs'
                      : darkMode
                      ? 'border-stone-800 bg-stone-900/50 text-stone-300 hover:border-stone-700'
                      : 'border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'კურიერით მიწოდება (უფასო)' : 'Courier Delivery'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                    deliveryMethod === 'pickup'
                      ? 'bg-amber-500 text-black border-amber-500 font-semibold shadow-xs'
                      : darkMode
                      ? 'border-stone-800 bg-stone-900/50 text-stone-300 hover:border-stone-700'
                      : 'border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'შოურუმში გატანა' : 'Pick up at boutique'}</span>
                </button>
              </div>
            </div>

            {/* Address Field if courier */}
            {deliveryMethod === 'courier' && (
              <div className="animate-fadeIn">
                <label className="text-[11px] uppercase tracking-wider font-semibold opacity-70 block mb-1">
                  {lang === 'ka' ? 'მიტანის მისამართი (ქალაქი, ქუჩა, ბინა):' : 'Delivery Address:'}
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={lang === 'ka' ? 'მაგ: თბილისი, ჭავჭავაძის გამზ. 24, ბინა 12' : 'City, Street, Apartment'}
                    required={deliveryMethod === 'courier'}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                      darkMode
                        ? 'bg-stone-900/90 border-stone-700 text-white placeholder-stone-500 focus:border-amber-500'
                        : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold opacity-70 block mb-1.5">
                {lang === 'ka' ? 'გადახდის მეთოდი:' : 'Payment Method:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 rounded-xl border text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-400 font-semibold shadow-xs'
                      : darkMode
                      ? 'border-stone-800 bg-stone-900/50 text-stone-400'
                      : 'border-stone-300 bg-stone-100 text-stone-700'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'ონლაინ ბარათით' : 'Online Card'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-2 rounded-xl border text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-400 font-semibold shadow-xs'
                      : darkMode
                      ? 'border-stone-800 bg-stone-900/50 text-stone-400'
                      : 'border-stone-300 bg-stone-100 text-stone-700'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'კურიერთან' : 'Cash / Courier'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('boutique')}
                  className={`p-2 rounded-xl border text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'boutique'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-400 font-semibold shadow-xs'
                      : darkMode
                      ? 'border-stone-800 bg-stone-900/50 text-stone-400'
                      : 'border-stone-300 bg-stone-100 text-stone-700'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{lang === 'ka' ? 'შოურუმში' : 'In Boutique'}</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold opacity-70 block mb-1">
                {lang === 'ka' ? 'კომენტარი ან სასურველი ზომა (სურვილისამებრ):' : 'Notes / Ring size (Optional):'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={lang === 'ka' ? 'მაგ: სასურველი ზომა 17.5, საჩუქრად შეფუთვით' : 'Notes for boutique concierge'}
                rows={2}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-all resize-none ${
                  darkMode
                    ? 'bg-stone-900/90 border-stone-700 text-white placeholder-stone-500 focus:border-amber-500'
                    : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                }`}
              />
            </div>

            {/* Submit Order Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span>{lang === 'ka' ? 'მუშავდება...' : 'Processing...'}</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {lang === 'ka'
                        ? `შეკვეთის გაფორმება • ${formatPrice(totalPrice)}`
                        : `Place Order • ${formatPrice(totalPrice)}`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

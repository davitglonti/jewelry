// src/components/modals/QuickBuyModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Check, ShoppingBag, Truck, Store, CreditCard,
  Banknote, Phone, User, MapPin, MessageSquare, AlertCircle, ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/i18n';

export default function QuickBuyModal({
  isOpen,
  onClose,
  items = [],
  onSuccess
}) {
  const store = useStore() || {};
  const {
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
  const [deliveryMethod, setDeliveryMethod] = useState('courier');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (user?.displayName && !clientName) {
      setClientName(user.displayName);
    }
  }, [user]);

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
      setErrorMsg(lang === 'ka' ? 'გთხოვთ მიუთითოთ მიტანის მისამართი' : 'Please enter delivery address');
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
      const updatedInquiries = [newOrder, ...(inquiries || [])];
      if (setInquiries) setInquiries(updatedInquiries);
      if (syncData) syncData(siteSettings, products, updatedInquiries);

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
  const inputClass =
    'w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#DCD6CC] focus:border-[#141311] text-[#141311] placeholder-[#9C958B] outline-none transition-colors';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-white border border-[#E8E3DB] text-[#141311] p-6 sm:p-8 my-auto shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E3DB]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-[#9D7B48] stroke-[1.5]" />
            <div>
              <h3 className="font-serif text-xl font-light">
                {lang === 'ka' ? 'შეკვეთის გაფორმება' : 'Complete Order'}
              </h3>
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#847E75]">
                {lang === 'ka' ? 'საიუველირო სახლი «მატარე»' : 'Fine Jewelry House Matare'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#847E75] hover:text-[#141311] transition-colors cursor-pointer"
            aria-label="დახურვა"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {completedOrder ? (
          <div className="py-6 text-center space-y-5 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-[#F4F8F5] border border-[#2E7D52] text-[#2E7D52] flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 stroke-[1.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.22em] font-medium text-[#9D7B48]">
                {lang === 'ka' ? 'შეკვეთა მიღებულია!' : 'Order Placed Successfully!'}
              </span>
              <h4 className="font-serif text-2xl font-light">
                {lang === 'ka' ? 'მადლობას გიხდით არჩევანისთვის' : 'Thank you for your order'}
              </h4>
            </div>

            <div className="p-4 bg-[#FAF9F6] border border-[#E8E3DB] text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#847E75]">{lang === 'ka' ? 'შეკვეთის კოდი:' : 'Order Code:'}</span>
                <span className="font-mono font-medium">#{completedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#847E75]">{lang === 'ka' ? 'სამკაული:' : 'Jewelry:'}</span>
                <span className="font-medium truncate max-w-[200px]">{completedOrder.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#847E75]">{lang === 'ka' ? 'ჯამური თანხა:' : 'Total Amount:'}</span>
                <span className="font-mono font-medium">{formatPrice(completedOrder.totalPrice)}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-[#141311] hover:bg-[#2C2A26] text-white text-[11px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 stroke-[1.5]" />
                <span>{lang === 'ka' ? 'WhatsApp-ით დაკავშირება' : 'Chat on WhatsApp'}</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 border border-[#E8E3DB] text-[#4A4640] hover:border-[#141311] text-[11px] tracking-[0.18em] uppercase cursor-pointer"
              >
                {lang === 'ka' ? 'ფანჯრის დახურვა' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="py-5 space-y-4">
            <div className="p-3.5 bg-[#FAF9F6] border border-[#E8E3DB] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {rawProducts[0] && (
                  <img
                    src={rawProducts[0].images?.[0] || rawProducts[0].image || '/brand-logo.jpg'}
                    alt={rawProducts[0].name || 'სამკაული'}
                    className="w-12 h-14 object-cover shrink-0 bg-[#F2EFE9] border border-[#E8E3DB]"
                  />
                )}
                <div className="min-w-0">
                  <div className="font-serif text-sm text-[#141311] truncate">
                    {rawProducts.length === 1
                      ? rawProducts[0]?.name
                      : lang === 'ka'
                      ? `${rawProducts[0]?.name} და კიდევ ${rawProducts.length - 1} ნივთი`
                      : `${rawProducts[0]?.name} and ${rawProducts.length - 1} more`}
                  </div>
                  <span className="text-[11px] text-[#847E75]">
                    {lang === 'ka' ? `სულ: ${rawProducts.length} სამკაული` : `${rawProducts.length} item(s)`}
                  </span>
                </div>
              </div>
              <span className="font-mono font-medium text-[#141311] text-sm shrink-0">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#FDF6F6] border border-[#E8C8C8] text-[#8E2424] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.14em] text-[#5C574F] block mb-1">
                  {lang === 'ka' ? 'თქვენი სახელი და გვარი:' : 'Full Name:'}
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#847E75] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={lang === 'ka' ? 'მაგ: ნინო ბერიძე' : 'e.g. John Doe'}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.14em] text-[#5C574F] block mb-1">
                  {lang === 'ka' ? 'ტელეფონის ნომერი:' : 'Phone Number:'}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#847E75] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="555 12 34 56"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.14em] text-[#5C574F] block mb-1.5">
                {lang === 'ka' ? 'მიღების მეთოდი:' : 'Delivery Method:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('courier')}
                  className={`p-2.5 border text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    deliveryMethod === 'courier'
                      ? 'bg-[#141311] text-white border-[#141311]'
                      : 'border-[#E8E3DB] bg-white text-[#4A4640] hover:border-[#141311]'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{lang === 'ka' ? 'კურიერით მიწოდება (უფასო)' : 'Courier Delivery'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-2.5 border text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    deliveryMethod === 'pickup'
                      ? 'bg-[#141311] text-white border-[#141311]'
                      : 'border-[#E8E3DB] bg-white text-[#4A4640] hover:border-[#141311]'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{lang === 'ka' ? 'შოურუმში გატანა' : 'Pick up at boutique'}</span>
                </button>
              </div>
            </div>

            {deliveryMethod === 'courier' && (
              <div className="animate-fadeIn">
                <label className="text-[10px] uppercase tracking-[0.14em] text-[#5C574F] block mb-1">
                  {lang === 'ka' ? 'მიტანის მისამართი (ქალაქი, ქუჩა, ბინა):' : 'Delivery Address:'}
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#847E75] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={lang === 'ka' ? 'მაგ: თბილისი, ჭავჭავაძის გამზ. 24, ბინა 12' : 'City, Street, Apartment'}
                    required={deliveryMethod === 'courier'}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase tracking-[0.14em] text-[#5C574F] block mb-1.5">
                {lang === 'ka' ? 'გადახდის მეთოდი:' : 'Payment Method:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['card', CreditCard, lang === 'ka' ? 'ონლაინ ბარათით' : 'Online Card'],
                  ['cod', Banknote, lang === 'ka' ? 'კურიერთან' : 'Cash / Courier'],
                  ['boutique', Store, lang === 'ka' ? 'შოურუმში' : 'In Boutique']
                ].map(([val, Icon, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPaymentMethod(val)}
                    className={`p-2 border text-[11px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                      paymentMethod === val
                        ? 'border-[#141311] bg-[#F8F6F2] text-[#141311] font-medium'
                        : 'border-[#E8E3DB] bg-white text-[#847E75] hover:border-[#9D7B48]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.14em] text-[#5C574F] block mb-1">
                {lang === 'ka' ? 'კომენტარი ან სასურველი ზომა (სურვილისამებრ):' : 'Notes / Ring size (Optional):'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={lang === 'ka' ? 'მაგ: სასურველი ზომა 17.5, საჩუქრად შეფუთვით' : 'Notes for boutique concierge'}
                rows={2}
                className="w-full px-3 py-2 text-xs bg-white border border-[#DCD6CC] focus:border-[#141311] text-[#141311] placeholder-[#9C958B] outline-none resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 bg-[#141311] hover:bg-[#2C2A26] text-white text-xs tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span>{lang === 'ka' ? 'მუშავდება...' : 'Processing...'}</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                    <span>
                      {lang === 'ka'
                        ? `შეკვეთის გაფორმება • ${formatPrice(totalPrice)}`
                        : `Place Order • ${formatPrice(totalPrice)}`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
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

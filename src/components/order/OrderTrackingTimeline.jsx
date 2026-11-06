// src/components/order/OrderTrackingTimeline.jsx
import React, { useState } from 'react';
import {
  CheckCircle2, Clock, Truck, Package, Sparkles, MapPin,
  Calendar, AlertCircle, Copy, Check, MessageCircle, Gift
} from 'lucide-react';
import { formatPrice } from '../../utils/i18n';

export const TRACKING_STEPS = [
  {
    key: 'order_placed',
    titleKa: 'შეკვეთა მიღებულია',
    titleEn: 'Order Placed',
    descKa: 'თქვენი შეკვეთა წარმატებით დარეგისტრირდა სისტემაში. ველოდებით დამუშავებას.',
    descEn: 'Your order has been registered in our system and is pending processing.',
    icon: Clock
  },
  {
    key: 'processing',
    titleKa: 'მზადდება & მოწმდება',
    titleEn: 'Crafting & Inspection',
    descKa: 'საიუველირო ოსტატი ამოწმებს ნაკეთობის ხარისხს, ბრილიანტების ჩასმას და ასუფთავებს ნაკეთობას.',
    descEn: 'Jewelry craftsman is inspecting gem setting, polishing and certifying perfection.',
    icon: Sparkles
  },
  {
    key: 'packed',
    titleKa: 'შეფუთულია ბრენდირებულ ყუთში',
    titleEn: 'Packed & Ready',
    descKa: 'სამკაული მოთავსებულია ბრენდირებულ ხავერდის ყუთში და გადაცემულია საკურიერო განყოფილებაში.',
    descEn: 'Placed in velvet signature boutique packaging and prepared for dispatch.',
    icon: Package
  },
  {
    key: 'in_transit',
    titleKa: 'გზაშია კურიერთან',
    titleEn: 'Out for Delivery',
    descKa: 'კურიერი მიემართება თქვენს მისამართზე. მიტანამდე დაგიკავშირდებათ მითითებულ ნომერზე.',
    descEn: 'Courier is en route to your address. They will call shortly before arrival.',
    icon: Truck
  },
  {
    key: 'delivered',
    titleKa: 'ჩაბარებულია',
    titleEn: 'Delivered',
    descKa: 'შეკვეთა წარმატებით ჩაგბარდათ. მადლობას გიხდით Matare-ს არჩევისთვის!',
    descEn: 'Order successfully delivered. Thank you for choosing Matare!',
    icon: CheckCircle2
  }
];

export function getOrderStepIndex(status) {
  const norm = String(status || '').trim().toLowerCase();
  if (norm.includes('გაუქმებ') || norm.includes('cancel')) return -1;
  if (norm.includes('ჩაბარებ') || norm.includes('დასრულებ') || norm.includes('deliver')) return 4;
  if (norm.includes('გზაში') || norm.includes('კურიერ') || norm.includes('transit')) return 3;
  if (norm.includes('შეფუთ') || norm.includes('მზადაა') || norm.includes('pack')) return 2;
  if (norm.includes('მუშავ') || norm.includes('შეთანხმებ') || norm.includes('process')) return 1;
  return 0; // Default: ახალი შეკვეთა
}

export function getDefaultEstimatedDelivery(order, lang = 'ka') {
  if (order?.estimatedDelivery) return order.estimatedDelivery;
  const isTbilisi = (order?.city || '').toLowerCase().includes('თბილ') || (order?.city || '').toLowerCase().includes('tbilisi');
  if (isTbilisi) {
    return lang === 'ka'
      ? 'დღესვე 19:00-მდე (ან მაქსიმუმ 24 საათში)'
      : 'Today by 19:00 (within 24 hours)';
  }
  return lang === 'ka'
    ? '1-3 სამუშაო დღეში'
    : 'Within 1-3 business days';
}

export default function OrderTrackingTimeline({
  order,
  darkMode = true,
  lang = 'ka',
  siteSettings = {}
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!order) return null;

  const currentStepIdx = getOrderStepIndex(order.status);
  const isCancelled = currentStepIdx === -1;
  const estimatedArrival = getDefaultEstimatedDelivery(order, lang);

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track?id=${order.id}`
    : `https://matare.store/track?id=${order.id}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const whatsappInquiryMsg = encodeURIComponent(
    `მოგესალმებით! მაინტერესებს ჩემი შეკვეთის (#${order.id}) მიწოდების დეტალები.\n` +
    `მიმღები: ${order.clientName || 'მყიდველი'}\n` +
    `მისამართი: ${order.address || order.city || 'თბილისი'}`
  );
  const whatsappUrl = `https://wa.me/${(siteSettings?.whatsapp || '+995599000000').replace(/[^0-9]/g, '')}?text=${whatsappInquiryMsg}`;

  return (
    <div
      className={`rounded-3xl border p-5 sm:p-7 space-y-6 transition-all ${
        darkMode
          ? 'bg-[#141210] border-amber-500/20 text-[#f5f0e6] shadow-2xl'
          : 'bg-white border-stone-200 text-[#1c1917] shadow-xl'
      }`}
    >
      {/* Header: Order ID & Live Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-500/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] uppercase tracking-widest font-bold text-amber-500">
              {lang === 'ka' ? 'შეკვეთის ლაივ-თრექინგი' : 'Live Order Tracker'}
            </span>
          </div>
          <h3 className="font-mono text-xl sm:text-2xl font-bold mt-1">
            #{order.id}
          </h3>
          <p className="text-xs opacity-60 mt-0.5">
            {lang === 'ka' ? 'გაფორმების თარიღი:' : 'Placed on:'} {order.date || 'ახლახან'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              darkMode
                ? 'border-stone-800 bg-stone-900/80 hover:border-amber-500/50 text-stone-300'
                : 'border-stone-200 bg-stone-100 hover:border-amber-500 text-stone-700'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? (lang === 'ka' ? 'დაკოპირდა!' : 'Copied!') : (lang === 'ka' ? 'თრექინგის ბმული' : 'Copy Link')}</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* ETA & Condition Highlight Card */}
      {!isCancelled ? (
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            darkMode
              ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30'
              : 'bg-gradient-to-r from-amber-50 via-amber-50/50 to-white border-amber-300'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">
                  {lang === 'ka' ? 'როდის მოვა? (სავარაუდო მიწოდება)' : 'Estimated Delivery'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {order.deliveryMethod || 'საკურიერო მიწოდება'}
                </span>
              </div>
              <div className="font-serif text-base sm:text-lg font-bold text-stone-100 dark:text-stone-100 mt-0.5">
                {estimatedArrival}
              </div>
              {order.courierNote && (
                <div className="text-xs text-amber-400/90 font-medium mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{order.courierNote}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-xs space-y-1 md:text-right border-t md:border-t-0 md:border-l border-stone-500/20 pt-3 md:pt-0 md:pl-4">
            <div className="flex items-center md:justify-end gap-1.5 text-stone-300 opacity-80">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate max-w-xs">{order.address || order.city || 'მისამართი'}</span>
            </div>
            <div className="text-[11px] opacity-60">
              {order.clientPhone} • {order.clientName}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">{lang === 'ka' ? 'შეკვეთა გაუქმებულია' : 'Order Cancelled'}</span>
            <span>{lang === 'ka' ? 'დეტალების დასაზუსტებლად გთხოვთ დაუკავშირდეთ ჩვენს კონსიერჟს.' : 'Please contact our concierge for further details.'}</span>
          </div>
        </div>
      )}

      {/* Stepper Timeline */}
      {!isCancelled && (
        <div className="py-2">
          {/* Desktop Horizontal Stepper */}
          <div className="hidden lg:grid grid-cols-5 gap-2 relative">
            {TRACKING_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="flex flex-col items-center text-center relative group">
                  {/* Connecting Line */}
                  {idx < TRACKING_STEPS.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-1 z-0 transition-colors ${
                        idx < currentStepIdx
                          ? 'bg-amber-500'
                          : darkMode ? 'bg-stone-800' : 'bg-stone-200'
                      }`}
                    />
                  )}

                  {/* Step Icon */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isPast
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                        : isCurrent
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black ring-4 ring-amber-500/30 shadow-lg shadow-amber-500/40 animate-pulse'
                        : darkMode
                        ? 'bg-stone-900 border border-stone-800 text-stone-500'
                        : 'bg-stone-100 border border-stone-300 text-stone-400'
                    }`}
                  >
                    {isPast ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3 space-y-1 px-1">
                    <span
                      className={`block font-serif text-xs font-semibold leading-tight ${
                        isCurrent
                          ? 'text-amber-500'
                          : isPast
                          ? 'text-stone-200 dark:text-stone-200 font-medium'
                          : 'opacity-40'
                      }`}
                    >
                      {lang === 'ka' ? step.titleKa : step.titleEn}
                    </span>
                    <p className={`text-[10px] leading-relaxed line-clamp-3 ${
                      isCurrent ? 'opacity-85' : 'opacity-45'
                    }`}>
                      {lang === 'ka' ? step.descKa : step.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical Stepper */}
          <div className="lg:hidden space-y-4 relative pl-2">
            {TRACKING_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="flex items-start gap-3.5 relative">
                  {/* Vertical line between items */}
                  {idx < TRACKING_STEPS.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-[1px] ${
                        idx < currentStepIdx ? 'bg-amber-500' : darkMode ? 'bg-stone-800' : 'bg-stone-200'
                      }`}
                    />
                  )}

                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : isCurrent
                        ? 'bg-amber-500 text-black ring-4 ring-amber-500/25 shadow-lg shadow-amber-500/30 animate-pulse'
                        : darkMode
                        ? 'bg-stone-900 border border-stone-800 text-stone-500'
                        : 'bg-stone-100 border border-stone-300 text-stone-400'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isCurrent
                            ? 'text-amber-500'
                            : isPast
                            ? 'text-stone-200 dark:text-stone-200'
                            : 'opacity-40'
                        }`}
                      >
                        {lang === 'ka' ? step.titleKa : step.titleEn}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-black">
                          {lang === 'ka' ? 'მიმდინარე' : 'Active'}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-relaxed mt-0.5 ${
                      isCurrent ? 'opacity-80' : 'opacity-45'
                    }`}>
                      {lang === 'ka' ? step.descKa : step.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items Summary in this Order */}
      {order.items && order.items.length > 0 && (
        <div className={`p-4 rounded-2xl border space-y-3 ${
          darkMode ? 'bg-stone-900/30 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold opacity-75">
            <span>{lang === 'ka' ? 'შეკვეთილი ნაკეთობები' : 'Ordered Items'} ({order.items.length})</span>
            <span className="font-mono text-amber-500 font-bold">{formatPrice(order.totalPrice)}</span>
          </div>

          <div className="divide-y divide-stone-500/10 space-y-2">
            {order.items.map((it, i) => (
              <div key={i} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-[10px] font-bold text-amber-400">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium truncate block">{it.name}</span>
                    {it.size && (
                      <span className="text-[10px] opacity-65">
                        {lang === 'ka' ? 'ზომა' : 'Size'}: {it.size}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-mono font-semibold shrink-0">{formatPrice(it.price)}</span>
              </div>
            ))}
          </div>

          {order.isGift && (
            <div className="pt-2 border-t border-stone-500/10 flex items-center gap-2 text-xs text-purple-400 font-medium">
              <Gift className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'ka' ? 'ექსკლუზიური სასაჩუქრე შეფუთვა ბრენდირებული ყუთით' : 'Exclusive boutique gift packaging'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// src/components/order/OrderTrackingTimeline.jsx
import React, { useState } from 'react';
import {
  CheckCircle2, Clock, Truck, Package, Sparkles, MapPin,
  AlertCircle, Copy, Check, MessageCircle, Gift
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
  return 0;
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
    <div className="bg-white border border-[#E8E3DB] p-6 sm:p-8 space-y-7 text-[#141311]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8E3DB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D52]" />
            <span className="text-[10px] uppercase tracking-[0.22em] font-medium text-[#9D7B48]">
              {lang === 'ka' ? 'შეკვეთის ლაივ-თრექინგი' : 'Live Order Tracker'}
            </span>
          </div>
          <h3 className="font-mono text-xl sm:text-2xl font-medium mt-1 text-[#141311]">
            #{order.id}
          </h3>
          <p className="text-xs text-[#847E75] mt-0.5">
            {lang === 'ka' ? 'გაფორმების თარიღი:' : 'Placed on:'} {order.date || 'ახლახან'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 border border-[#E8E3DB] bg-white hover:border-[#141311] text-[#141311] text-[11px] uppercase tracking-[0.14em] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#2E7D52]" /> : <Copy className="w-3.5 h-3.5 stroke-[1.5]" />}
            <span>{copiedLink ? (lang === 'ka' ? 'დაკოპირდა!' : 'Copied!') : (lang === 'ka' ? 'თრექინგის ბმული' : 'Copy Link')}</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-[#141311] hover:bg-[#2C2A26] text-white text-[11px] uppercase tracking-[0.14em] flex items-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* ETA Highlight */}
      {!isCancelled ? (
        <div className="p-5 bg-[#F8F6F2] border border-[#E8E3DB] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#141311] text-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#9D7B48] font-medium">
                  {lang === 'ka' ? 'როდის მოვა? (სავარაუდო მიწოდება)' : 'Estimated Delivery'}
                </span>
                <span className="px-2 py-0.5 text-[10px] bg-white border border-[#E8E3DB] text-[#4A4640]">
                  {order.deliveryMethod || 'საკურიერო მიწოდება'}
                </span>
              </div>
              <div className="font-serif text-lg sm:text-xl font-normal text-[#141311] mt-0.5">
                {estimatedArrival}
              </div>
              {order.courierNote && (
                <div className="text-xs text-[#7E6136] mt-1">{order.courierNote}</div>
              )}
            </div>
          </div>

          <div className="text-xs space-y-1 md:text-right border-t md:border-t-0 md:border-l border-[#E5DFD6] pt-3 md:pt-0 md:pl-5 text-[#5C574F]">
            <div className="flex items-center md:justify-end gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#9D7B48] shrink-0 stroke-[1.5]" />
              <span className="truncate max-w-xs">{order.address || order.city || 'მისამართი'}</span>
            </div>
            <div className="text-[11px] text-[#847E75]">
              {order.clientPhone} • {order.clientName}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#FDF6F6] border border-[#E8C8C8] text-[#8E2424] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 stroke-[1.5]" />
          <div className="text-xs">
            <span className="font-medium block">{lang === 'ka' ? 'შეკვეთა გაუქმებულია' : 'Order Cancelled'}</span>
            <span className="opacity-80">{lang === 'ka' ? 'დეტალების დასაზუსტებლად გთხოვთ დაუკავშირდეთ ჩვენს კონსიერჟს.' : 'Please contact our concierge for further details.'}</span>
          </div>
        </div>
      )}

      {/* Stepper Timeline */}
      {!isCancelled && (
        <div className="py-2">
          <div className="hidden lg:grid grid-cols-5 gap-3 relative">
            {TRACKING_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="flex flex-col items-center text-center relative">
                  {idx < TRACKING_STEPS.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-[1.5px] z-0 ${
                        idx < currentStepIdx ? 'bg-[#141311]' : 'bg-[#E8E3DB]'
                      }`}
                    />
                  )}

                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isPast
                        ? 'bg-[#141311] text-white'
                        : isCurrent
                        ? 'bg-[#9D7B48] text-white ring-4 ring-[#9D7B48]/20'
                        : 'bg-[#FAF9F6] border border-[#E8E3DB] text-[#9C958B]'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[2]" /> : <Icon className="w-4 h-4 stroke-[1.5]" />}
                  </div>

                  <div className="mt-3 space-y-1 px-1">
                    <span
                      className={`block font-serif text-sm leading-tight ${
                        isCurrent
                          ? 'text-[#9D7B48] font-medium'
                          : isPast
                          ? 'text-[#141311]'
                          : 'text-[#9C958B]'
                      }`}
                    >
                      {lang === 'ka' ? step.titleKa : step.titleEn}
                    </span>
                    <p className={`text-[11px] leading-relaxed font-light ${isCurrent ? 'text-[#4A4640]' : 'text-[#847E75]'}`}>
                      {lang === 'ka' ? step.descKa : step.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:hidden space-y-4 relative pl-2">
            {TRACKING_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="flex items-start gap-3.5 relative">
                  {idx < TRACKING_STEPS.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 bottom-0 w-[1px] ${
                        idx < currentStepIdx ? 'bg-[#141311]' : 'bg-[#E8E3DB]'
                      }`}
                    />
                  )}

                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isPast
                        ? 'bg-[#141311] text-white'
                        : isCurrent
                        ? 'bg-[#9D7B48] text-white ring-4 ring-[#9D7B48]/20'
                        : 'bg-[#FAF9F6] border border-[#E8E3DB] text-[#9C958B]'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5 stroke-[1.5]" />}
                  </div>

                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${isCurrent ? 'text-[#9D7B48]' : isPast ? 'text-[#141311]' : 'text-[#9C958B]'}`}>
                        {lang === 'ka' ? step.titleKa : step.titleEn}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] bg-[#141311] text-white">
                          {lang === 'ka' ? 'მიმდინარე' : 'Active'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#5C574F] leading-relaxed mt-0.5 font-light">
                      {lang === 'ka' ? step.descKa : step.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items Summary */}
      {order.items && order.items.length > 0 && (
        <div className="p-5 bg-[#FAF9F6] border border-[#E8E3DB] space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-[#4A4640]">
            <span className="uppercase tracking-[0.14em] text-[11px]">{lang === 'ka' ? 'შეკვეთილი ნაკეთობები' : 'Ordered Items'} ({order.items.length})</span>
            <span className="font-mono text-[#141311] font-semibold">{formatPrice(order.totalPrice)}</span>
          </div>

          <div className="divide-y divide-[#E8E3DB]">
            {order.items.map((it, i) => (
              <div key={i} className="py-2.5 first:pt-1 last:pb-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 bg-white border border-[#E8E3DB] flex items-center justify-center shrink-0 text-[10px] font-mono text-[#9D7B48]">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-[#141311] truncate block">{it.name}</span>
                    {it.size && (
                      <span className="text-[10px] text-[#847E75]">
                        {lang === 'ka' ? 'ზომა' : 'Size'}: {it.size}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-mono text-[#141311] shrink-0">{formatPrice(it.price)}</span>
              </div>
            ))}
          </div>

          {order.isGift && (
            <div className="pt-2.5 border-t border-[#E8E3DB] flex items-center gap-2 text-xs text-[#9D7B48]">
              <Gift className="w-3.5 h-3.5 shrink-0 stroke-[1.5]" />
              <span>{lang === 'ka' ? 'ექსკლუზიური სასაჩუქრე შეფუთვა ბრენდირებული ყუთით' : 'Exclusive boutique gift packaging'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

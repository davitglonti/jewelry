import React from 'react';
import { Trash2 } from 'lucide-react';

export default function AdminInquiriesTab({
  inquiries = [],
  setInquiries,
  siteSettings = {},
  products = [],
  syncData
}) {
  const handleDeleteInquiry = (id) => {
    const updated = inquiries.filter((i) => i.id !== id);
    setInquiries(updated);
    syncData(siteSettings, products, updated);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-serif text-lg text-amber-500">მომხმარებლების მოთხოვნები ({inquiries.length})</h4>
      {inquiries.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-stone-500/25 opacity-60 text-xs">
          ჯერ მოთხოვნები არ შემოსულა.
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="p-4 rounded-2xl border border-stone-500/20 flex items-center justify-between text-xs hover:border-amber-500/30 transition-all"
            >
              <div className="space-y-1">
                <div className="font-semibold text-sm">
                  {inq.clientName} — <span className="font-mono text-amber-400">{inq.clientPhone}</span>
                </div>
                <div className="text-amber-500">
                  მოდელი: {inq.productName} ({inq.sku}) {inq.size ? `• ზომა: ${inq.size}` : ''}
                </div>
                <div className="opacity-50 text-[11px]">{inq.date}</div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteInquiry(inq.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                title="წაშლა"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

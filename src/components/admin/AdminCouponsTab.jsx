import React, { useState } from 'react';
import {
  Tag, Plus, Edit3, Trash2, Check, Copy, Percent, Truck,
  DollarSign, Calendar, AlertCircle, ToggleLeft, ToggleRight,
  Clock, Hash, Sparkles, X, ShieldCheck
} from 'lucide-react';
import { DEFAULT_PROMO_CODES } from '../../data/defaultSettings';

export default function AdminCouponsTab({
  siteSettings = {},
  setSiteSettings,
  products = [],
  inquiries = [],
  syncData,
  darkMode = true
}) {
  const promoCodes = siteSettings.promoCodes && Array.isArray(siteSettings.promoCodes)
    ? siteSettings.promoCodes
    : DEFAULT_PROMO_CODES;

  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  const activeCount = promoCodes.filter((c) => c.isActive !== false).length;
  const totalUses = promoCodes.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleToggleActive = (couponId) => {
    const updated = promoCodes.map((c) => {
      if (c.id === couponId) {
        return { ...c, isActive: c.isActive === false ? true : false };
      }
      return c;
    });
    const newSettings = { ...siteSettings, promoCodes: updated };
    setSiteSettings(newSettings);
    syncData(newSettings, products, inquiries);
  };

  const handleDelete = (coupon) => {
    if (window.confirm(`ნამდვილად გსურთ პრომო კოდის „${coupon.code}“ წაშლა?`)) {
      const updated = promoCodes.filter((c) => c.id !== coupon.id);
      const newSettings = { ...siteSettings, promoCodes: updated };
      setSiteSettings(newSettings);
      syncData(newSettings, products, inquiries);
    }
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!editingCoupon) return;

    const trimmedCode = (editingCoupon.code || '').trim().toUpperCase();
    if (!trimmedCode) {
      alert('გთხოვთ შეიყვანოთ პრომო კოდის სახელი (მაგ: MATARE10)');
      return;
    }

    // Check duplicate code if new coupon
    const duplicate = promoCodes.find(
      (c) => c.id !== editingCoupon.id && c.code.toUpperCase() === trimmedCode
    );
    if (duplicate) {
      alert(`კოდი „${trimmedCode}“ უკვე არსებობს! გთხოვთ აირჩიოთ სხვა სახელი.`);
      return;
    }

    const cleanedCoupon = {
      ...editingCoupon,
      code: trimmedCode,
      value: editingCoupon.type === 'free_shipping' ? 0 : Number(editingCoupon.value) || 0,
      minOrderAmount: Number(editingCoupon.minOrderAmount) || 0,
      maxUses: editingCoupon.maxUses ? Number(editingCoupon.maxUses) : null,
      usedCount: editingCoupon.usedCount || 0,
      isActive: editingCoupon.isActive !== false
    };

    const exists = promoCodes.some((c) => c.id === cleanedCoupon.id);
    const updated = exists
      ? promoCodes.map((c) => (c.id === cleanedCoupon.id ? cleanedCoupon : c))
      : [cleanedCoupon, ...promoCodes];

    const newSettings = { ...siteSettings, promoCodes: updated };
    setSiteSettings(newSettings);
    syncData(newSettings, products, inquiries);
    setEditingCoupon(null);
  };

  const filteredCodes = promoCodes.filter((c) => {
    if (filter === 'active') return c.isActive !== false;
    if (filter === 'inactive') return c.isActive === false;
    return true;
  });

  const isExpired = (coupon) => {
    if (!coupon.expiresAt) return false;
    const exp = new Date(coupon.expiresAt);
    return !isNaN(exp.getTime()) && exp < new Date();
  };

  const isExhausted = (coupon) => {
    if (!coupon.maxUses) return false;
    return (coupon.usedCount || 0) >= coupon.maxUses;
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-800">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl text-amber-500 font-bold flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            <span>პრომო კოდები & ფასდაკლების კუპონები</span>
          </h3>
          <p className="text-xs opacity-70 mt-1 max-w-2xl">
            მართეთ ონლაინ ფასდაკლებები (% ფასდაკლება, ფიქსირებული თანხა, უფასო მიწოდება). კლიენტები კოდს გამოიყენებენ ჩექაუთის (Checkout) გვერდზე.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setEditingCoupon({
              id: 'promo-' + Date.now(),
              code: '',
              type: 'percentage',
              value: 10,
              minOrderAmount: 0,
              maxUses: null,
              usedCount: 0,
              isActive: true,
              expiresAt: '',
              description: ''
            })
          }
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ახალი პრომო კოდის შექმნა</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div
          className={`p-4 rounded-2xl border ${
            darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-xs'
          }`}
        >
          <span className="text-[11px] font-medium opacity-60 block">სულ პრომო კოდი</span>
          <div className="font-serif text-2xl font-bold text-amber-500 mt-1">
            {promoCodes.length}
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-xs'
          }`}
        >
          <span className="text-[11px] font-medium opacity-60 block">აქტიური კოდი</span>
          <div className="font-serif text-2xl font-bold text-emerald-500 mt-1">
            {activeCount}
          </div>
        </div>

        <div
          className={`col-span-2 sm:col-span-1 p-4 rounded-2xl border ${
            darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-xs'
          }`}
        >
          <span className="text-[11px] font-medium opacity-60 block">სულ გამოყენებული (Redemptions)</span>
          <div className="font-serif text-2xl font-bold text-blue-400 mt-1">
            {totalUses} <span className="text-xs font-normal opacity-70">ჯერ</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: `ყველა (${promoCodes.length})` },
          { id: 'active', label: `აქტიური (${activeCount})` },
          { id: 'inactive', label: `შეჩერებული (${promoCodes.length - activeCount})` }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === t.id
                ? 'bg-amber-500 text-black font-semibold'
                : darkMode
                ? 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* EDIT / CREATE MODAL */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-5 animate-fadeIn shadow-2xl ${
              darkMode ? 'bg-[#141210] border-amber-500/40 text-stone-100' : 'bg-white border-stone-300 text-stone-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h4 className="font-serif text-lg text-amber-500 font-bold flex items-center gap-2">
                <Tag className="w-5 h-5" />
                <span>
                  {promoCodes.some((c) => c.id === editingCoupon.id)
                    ? 'პრომო კოდის რედაქტირება'
                    : 'ახალი პრომო კოდის შექმნა'}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              {/* Promo Code Input */}
              <div>
                <label className="block mb-1.5 font-semibold text-amber-500">
                  პრომო კოდის სახელი *
                </label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code || ''}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      code: e.target.value.toUpperCase().replace(/\s+/g, '')
                    })
                  }
                  placeholder="მაგ: SPRING20, MATARE10, FREESHIP"
                  className={`w-full px-4 py-2.5 rounded-xl border font-mono font-bold text-sm tracking-wider outline-none uppercase ${
                    darkMode
                      ? 'bg-stone-900 border-stone-700 text-amber-400 focus:border-amber-500'
                      : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500'
                  }`}
                />
                <span className="text-[10px] opacity-60 mt-1 block">
                  კოდი ავტომატურად გადადის დიდ ასოებში (Uppercase).
                </span>
              </div>

              {/* Discount Type */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCoupon({ ...editingCoupon, type: 'percentage' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    editingCoupon.type === 'percentage'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-500 font-bold'
                      : darkMode
                      ? 'border-stone-800 bg-stone-900/60 opacity-60 hover:opacity-100'
                      : 'border-stone-200 bg-stone-50 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  <span className="text-[11px]">% ფასდაკლება</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingCoupon({ ...editingCoupon, type: 'fixed' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    editingCoupon.type === 'fixed'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-500 font-bold'
                      : darkMode
                      ? 'border-stone-800 bg-stone-900/60 opacity-60 hover:opacity-100'
                      : 'border-stone-200 bg-stone-50 opacity-60 hover:opacity-100'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="text-[11px]">ფიქსირებული ₾</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingCoupon({ ...editingCoupon, type: 'free_shipping', value: 0 })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    editingCoupon.type === 'free_shipping'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-500 font-bold'
                      : darkMode
                      ? 'border-stone-800 bg-stone-900/60 opacity-60 hover:opacity-100'
                      : 'border-stone-200 bg-stone-50 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span className="text-[11px]">უფასო მიწოდება</span>
                </button>
              </div>

              {/* Discount Value */}
              {editingCoupon.type !== 'free_shipping' && (
                <div>
                  <label className="block mb-1.5 font-semibold">
                    {editingCoupon.type === 'percentage' ? 'ფასდაკლების პროცენტი (%)' : 'ფასდაკლების თანხა (₾)'} *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min="1"
                      max={editingCoupon.type === 'percentage' ? 100 : 10000}
                      step={editingCoupon.type === 'percentage' ? '1' : '0.5'}
                      value={editingCoupon.value || ''}
                      onChange={(e) =>
                        setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) || 0 })
                      }
                      className={`w-36 px-4 py-2.5 rounded-xl border font-mono font-bold text-sm outline-none ${
                        darkMode
                          ? 'bg-stone-900 border-stone-700 text-amber-400 focus:border-amber-500'
                          : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500'
                      }`}
                    />
                    <span className="font-bold text-sm">
                      {editingCoupon.type === 'percentage' ? '%' : '₾ (ლარი)'}
                    </span>
                  </div>
                </div>
              )}

              {/* Min Order & Max Uses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 font-medium opacity-80">
                    მინიმალური შეკვეთა (₾):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={editingCoupon.minOrderAmount || 0}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        minOrderAmount: parseFloat(e.target.value) || 0
                      })
                    }
                    placeholder="0 = შეზღუდვის გარეშე"
                    className={`w-full px-3.5 py-2 rounded-xl border font-mono outline-none ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                  <span className="text-[10px] opacity-60 block mt-1">0 ნიშნავს ნებისმიერ თანხაზე მოქმედს</span>
                </div>

                <div>
                  <label className="block mb-1.5 font-medium opacity-80">
                    გამოყენების ლიმიტი (მაქს.):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingCoupon.maxUses || ''}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        maxUses: e.target.value ? parseInt(e.target.value, 10) : null
                      })
                    }
                    placeholder="ულიმიტო"
                    className={`w-full px-3.5 py-2 rounded-xl border font-mono outline-none ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                  <span className="text-[10px] opacity-60 block mt-1">ცარიელი = ულიმიტო</span>
                </div>
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block mb-1.5 font-medium opacity-80">
                  მოქმედების ვადა (Expiration Date):
                </label>
                <input
                  type="date"
                  value={editingCoupon.expiresAt ? editingCoupon.expiresAt.split('T')[0] : ''}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      expiresAt: e.target.value ? e.target.value : null
                    })
                  }
                  className={`w-full px-3.5 py-2 rounded-xl border font-mono outline-none ${
                    darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
                <span className="text-[10px] opacity-60 block mt-1">დატოვეთ ცარიელი, თუ კოდს ვადა არ გასდის</span>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1.5 font-medium opacity-80">
                  შიდა აღწერა / შეტყობინება კლიენტისთვის:
                </label>
                <input
                  type="text"
                  value={editingCoupon.description || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                  placeholder="მაგ: -10% VIP ფასდაკლება"
                  className={`w-full px-3.5 py-2 rounded-xl border outline-none ${
                    darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-xs">სტატუსი:</span>
                <button
                  type="button"
                  onClick={() =>
                    setEditingCoupon({ ...editingCoupon, isActive: editingCoupon.isActive === false })
                  }
                  className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold transition-all ${
                    editingCoupon.isActive !== false
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      editingCoupon.isActive !== false ? 'bg-emerald-400' : 'bg-stone-400'
                    }`}
                  />
                  <span>{editingCoupon.isActive !== false ? 'აქტიურია' : 'შეჩერებულია'}</span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-600 hover:bg-stone-800 transition-colors"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-md transition-all active:scale-95"
                >
                  შენახვა
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIST OF COUPONS */}
      <div className="space-y-3">
        {filteredCodes.length === 0 ? (
          <div className="text-center py-16 opacity-60 text-xs">
            პრომო კოდები ვერ მოიძებნა.
          </div>
        ) : (
          filteredCodes.map((coupon) => {
            const expired = isExpired(coupon);
            const exhausted = isExhausted(coupon);
            const active = coupon.isActive !== false && !expired && !exhausted;

            return (
              <div
                key={coupon.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-xs'
                }`}
              >
                {/* Left: Code info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                      coupon.type === 'percentage'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                        : coupon.type === 'free_shipping'
                        ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {coupon.type === 'percentage' ? (
                      <Percent className="w-5 h-5" />
                    ) : coupon.type === 'free_shipping' ? (
                      <Truck className="w-5 h-5" />
                    ) : (
                      <DollarSign className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-base sm:text-lg font-bold tracking-wider text-amber-400 uppercase">
                        {coupon.code}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopy(coupon.code)}
                        className="p-1 rounded-md hover:bg-stone-700/50 text-stone-400 hover:text-white transition-colors"
                        title="კოდის კოპირება"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Status Badges */}
                      {active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          აქტიურია
                        </span>
                      ) : coupon.isActive === false ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-500/20 text-stone-400 border border-stone-500/30">
                          შეჩერებულია
                        </span>
                      ) : expired ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                          ვადაგასულია
                        </span>
                      ) : exhausted ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          ამოწურულია
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-stone-300 font-medium">
                      {coupon.type === 'percentage'
                        ? `${coupon.value}% ფასდაკლება`
                        : coupon.type === 'free_shipping'
                        ? 'უფასო საკურიერო მიწოდება'
                        : `${coupon.value} ₾ ფასდაკლება`}
                      {coupon.description ? ` • ${coupon.description}` : ''}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] opacity-60 flex-wrap pt-0.5">
                      {coupon.minOrderAmount > 0 && (
                        <span>მინ. შეკვეთა: {coupon.minOrderAmount} ₾</span>
                      )}
                      <span>
                        გამოყენებულია: <strong className="font-mono">{coupon.usedCount || 0}</strong>
                        {coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                      </span>
                      {coupon.expiresAt && (
                        <span>ვადა: {coupon.expiresAt.split('T')[0]}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(coupon.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      coupon.isActive !== false
                        ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        : 'border-stone-700 text-stone-400 hover:bg-stone-800'
                    }`}
                    title={coupon.isActive !== false ? 'კოდის შეჩერება' : 'კოდის გააქტიურება'}
                  >
                    {coupon.isActive !== false ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-400" />
                        <span>აქტიური</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-stone-500" />
                        <span>შეჩერებული</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingCoupon({ ...coupon })}
                    className="p-2 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                    title="რედაქტირება"
                  >
                    <Edit3 className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(coupon)}
                    className="p-2 rounded-xl border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    title="წაშლა"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

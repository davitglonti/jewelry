// src/components/admin/AdminInquiriesTab.jsx
import React, { useState, useMemo } from 'react';
import {
  ShoppingBag, Phone, Mail, MapPin, Gift, Truck, Store,
  CreditCard, Banknote, Clock, CheckCircle2, AlertCircle, X,
  Search, Trash2, Printer, MessageCircle, Plus, Copy, Check,
  Download, ExternalLink, Tag, RefreshCw, FileText, ChevronDown
} from 'lucide-react';
import { formatPrice } from '../../utils/i18n';

const ORDER_STATUSES = [
  { id: 'ახალი შეკვეთა', label: 'ახალი შეკვეთა', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  { id: 'მუშავდება', label: 'მუშავდება / შეთანხმებული', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  { id: 'შეფუთულია', label: 'შეფუთულია / მზადაა', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  { id: 'გზაშია', label: 'გზაშია კურიერთან', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  { id: 'ჩაბარებულია', label: 'ჩაბარებულია / დასრულებული', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  { id: 'გაუქმებულია', label: 'გაუქმებულია', color: 'bg-red-500/20 text-red-400 border-red-500/40' }
];

export default function AdminInquiriesTab({
  inquiries = [],
  setInquiries,
  siteSettings = {},
  products = [],
  syncData,
  darkMode = true,
  lang = 'ka'
}) {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'orders' | 'callbacks'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'price-desc'

  // Modals state
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [printOrder, setPrintOrder] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // New Order Form state
  const [newOrderForm, setNewOrderForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    productId: products[0]?.id || '',
    size: products[0]?.sizes?.[0] || '16.5',
    deliveryMethod: 'courier',
    city: 'თბილისი',
    address: '',
    paymentMethod: 'card',
    isGift: false,
    notes: '',
    status: 'ახალი შეკვეთა'
  });

  // KPI Calculations
  const stats = useMemo(() => {
    let totalRev = 0;
    let newCount = 0;
    let inTransitCount = 0;
    let deliveredCount = 0;
    let onlineOrdersCount = 0;

    inquiries.forEach((item) => {
      const priceVal = item.totalPrice || (typeof item.price === 'number' ? item.price : parseFloat(String(item.price || '0').replace(/[^0-9.]/g, ''))) || 0;
      totalRev += priceVal;

      const st = item.status || 'ახალი შეკვეთა';
      if (st === 'ახალი შეკვეთა') newCount++;
      else if (st === 'გზაშია' || st === 'მუშავდება' || st === 'შეფუთულია') inTransitCount++;
      else if (st === 'ჩაბარებულია') deliveredCount++;

      if (item.items || item.deliveryMethod || item.paymentMethod) {
        onlineOrdersCount++;
      }
    });

    return {
      total: inquiries.length,
      revenue: totalRev,
      newOrders: newCount,
      inTransit: inTransitCount,
      delivered: deliveredCount,
      onlineOrders: onlineOrdersCount
    };
  }, [inquiries]);

  // Filtered & Sorted Inquiries
  const filteredInquiries = useMemo(() => {
    let list = [...inquiries];

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter((item) => (item.status || 'ახალი შეკვეთა') === statusFilter);
    }

    // Type filter
    if (typeFilter === 'orders') {
      list = list.filter((item) => item.items || item.deliveryMethod);
    } else if (typeFilter === 'callbacks') {
      list = list.filter((item) => !item.items && !item.deliveryMethod);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const idMatch = (item.id || '').toLowerCase().includes(q);
        const nameMatch = (item.clientName || '').toLowerCase().includes(q);
        const phoneMatch = (item.clientPhone || '').includes(q);
        const emailMatch = (item.clientEmail || '').toLowerCase().includes(q);
        const prodMatch = (item.productName || '').toLowerCase().includes(q);
        const skuMatch = (item.sku || '').toLowerCase().includes(q);
        const addrMatch = (item.address || '').toLowerCase().includes(q);
        return idMatch || nameMatch || phoneMatch || emailMatch || prodMatch || skuMatch || addrMatch;
      });
    }

    // Sort
    return list.sort((a, b) => {
      if (sortBy === 'price-desc') {
        const pA = a.totalPrice || parseFloat(String(a.price || 0).replace(/[^0-9.]/g, '')) || 0;
        const pB = b.totalPrice || parseFloat(String(b.price || 0).replace(/[^0-9.]/g, '')) || 0;
        return pB - pA;
      }
      if (sortBy === 'oldest') {
        return (new Date(a.date || 0)) - (new Date(b.date || 0));
      }
      // default: newest
      return (new Date(b.date || 0)) - (new Date(a.date || 0));
    });
  }, [inquiries, statusFilter, typeFilter, searchQuery, sortBy]);

  // Update an order field & sync
  const handleUpdateOrder = (id, updates) => {
    const updated = inquiries.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    setInquiries(updated);
    if (syncData) syncData(siteSettings, products, updated);
  };

  // Delete an order
  const handleDeleteOrder = (id) => {
    const updated = inquiries.filter((item) => item.id !== id);
    setInquiries(updated);
    if (syncData) syncData(siteSettings, products, updated);
    setDeleteConfirmId(null);
  };

  // Copy order ID
  const handleCopyId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send WhatsApp message to customer
  const handleWhatsAppCustomer = (item) => {
    const cleanPhone = (item.clientPhone || '').replace(/[\s\-()]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone.startsWith('995') ? cleanPhone : `995${cleanPhone}`;
    const orderTitle = item.id?.startsWith('MTR-') ? `#${item.id}` : `#MTR-${item.id}`;
    const statusLabel = item.status || 'ახალი შეკვეთა';

    const msg = encodeURIComponent(
      `✨ მოგესალმებით, ${item.clientName || 'ძვირფასო მომხმარებელო'}!\n` +
      `საიუველირო სახლი «${siteSettings.brandName || 'MATARE'}» გიკავშირდებათ თქვენს შეკვეთაზე ${orderTitle}.\n\n` +
      `📍 სტატუსი: ${statusLabel}\n` +
      `💎 ნივთები: ${item.productName || 'სამკაული'}\n` +
      (item.totalPrice ? `💰 ჯამური თანხა: ${formatPrice(item.totalPrice)}\n` : '') +
      `🚚 მიწოდება: ${item.deliveryMethod || 'საკურიერო მიწოდება'}\n\n` +
      `გმადლობთ, რომ ირჩევთ ჩვენს საიუველირო სახლს. შეკითხვების შემთხვევაში სიამოვნებით დაგეხმარებით!`
    );

    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    if (inquiries.length === 0) return;

    const headers = [
      'შეკვეთის ID',
      'თარიღი',
      'მომხმარებელი',
      'ტელეფონი',
      'ელფოსტა',
      'პროდუქცია და ზომა',
      'ჯამური თანხა',
      'მიწოდება',
      'მისამართი',
      'გადახდა',
      'სტატუსი',
      'შენიშვნები'
    ];

    const rows = inquiries.map((item) => [
      `"${item.id || ''}"`,
      `"${item.date || ''}"`,
      `"${(item.clientName || '').replace(/"/g, '""')}"`,
      `"${item.clientPhone || ''}"`,
      `"${item.clientEmail || ''}"`,
      `"${(item.productName || '').replace(/"/g, '""')}"`,
      `"${item.totalPrice || item.price || 0}"`,
      `"${item.deliveryMethod || 'საკურიერო'}"`,
      `"${(item.address || '').replace(/"/g, '""')}"`,
      `"${item.paymentMethod || 'ბარათით'}"`,
      `"${item.status || 'ახალი შეკვეთა'}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `matare_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Manual Order
  const handleCreateManualOrder = (e) => {
    e.preventDefault();
    if (!newOrderForm.clientName.trim() || !newOrderForm.clientPhone.trim()) {
      alert('გთხოვთ მიუთითოთ კლიენტის სახელი და ტელეფონის ნომერი');
      return;
    }

    const selProd = products.find((p) => p.id === newOrderForm.productId) || products[0];
    const orderId = `MTR-${Math.floor(100000 + Math.random() * 900000)}`;

    const pPrice = typeof selProd?.price === 'number'
      ? selProd.price
      : parseFloat(String(selProd?.price || '0').replace(/[^0-9.]/g, '')) || 0;

    const parseRate = (val, fallback) => {
      if (val === null || val === undefined || val === '') return fallback;
      const num = Number(val);
      return Number.isFinite(num) ? num : fallback;
    };

    const deliveryPriceTbilisi = parseRate(siteSettings?.deliveryPriceTbilisi, 6);
    const deliveryPriceRegional = parseRate(siteSettings?.deliveryPriceRegional, 10);
    const giftPackagingPrice = parseRate(siteSettings?.giftPackagingPrice, 5);

    const shippingFee = newOrderForm.city === 'თბილისი' ? deliveryPriceTbilisi : deliveryPriceRegional;
    const giftFee = newOrderForm.isGift ? giftPackagingPrice : 0;
    const finalAmount = pPrice + shippingFee + giftFee;

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleString('ka-GE'),
      clientName: newOrderForm.clientName.trim(),
      clientPhone: newOrderForm.clientPhone.trim(),
      clientEmail: newOrderForm.clientEmail.trim(),
      deliveryMethod: `კურიერით (${newOrderForm.city})`,
      city: newOrderForm.city,
      address: `${newOrderForm.city}, ${newOrderForm.address.trim()}`,
      shippingFee,
      giftFee,
      paymentMethod: newOrderForm.paymentMethod === 'card' ? 'ონლაინ ბარათით' : 'კურიერთან გადახდა',
      paymentStatus: newOrderForm.paymentMethod === 'card' ? 'გადახდილია' : 'გადასახდელია',
      isGift: newOrderForm.isGift,
      notes: newOrderForm.notes.trim(),
      status: newOrderForm.status || 'ახალი შეკვეთა',
      items: [
        {
          id: selProd?.id,
          name: selProd?.name,
          sku: selProd?.sku,
          price: pPrice,
          size: newOrderForm.size || 'სტანდარტული',
          image: selProd?.images?.[0] || selProd?.image
        }
      ],
      productName: `${selProd?.name || 'სამკაული'} (ზომა: ${newOrderForm.size || 'სტანდარტული'})`,
      totalPrice: finalAmount,
      rawSubtotal: pPrice,
      discountAmount: 0
    };

    const updated = [newOrder, ...inquiries];
    setInquiries(updated);
    if (syncData) syncData(siteSettings, products, updated);

    setShowNewOrderModal(false);
    setNewOrderForm({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      productId: products[0]?.id || '',
      size: products[0]?.sizes?.[0] || '16.5',
      deliveryMethod: 'courier',
      city: 'თბილისი',
      address: '',
      paymentMethod: 'card',
      isGift: false,
      notes: '',
      status: 'ახალი შეკვეთა'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-500 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-amber-500" />
              <span>შეკვეთებისა და გაყიდვების ცენტრი</span>
            </h3>
            {stats.newOrders > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-black animate-pulse">
                {stats.newOrders} ახალი
              </span>
            )}
          </div>
          <p className="text-xs opacity-70 mt-1">
            ყველა ონლაინ შეკვეთა, სატელეფონო მოთხოვნა, ზომები და მიწოდების დეტალები ერთ სივრცეში.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
              darkMode
                ? 'border-stone-800 bg-[#141210] hover:bg-stone-800 text-stone-200'
                : 'border-stone-300 bg-white hover:bg-stone-50 text-stone-800 shadow-xs'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>CSV ექსპორტი</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewOrderModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ ახალი შეკვეთა</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: საათივით აწყობილი სტატისტიკური ბარათები */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs opacity-70">
            <span>სულ შეკვეთები</span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-amber-500 mt-2">
            {stats.total}
          </div>
          <span className="text-[11px] opacity-60">აქედან {stats.onlineOrders} ონლაინ გაფორმებული</span>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs opacity-70">
            <span>ჯამური გაყიდვები</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 mt-2 truncate">
            {formatPrice(stats.revenue)}
          </div>
          <span className="text-[11px] opacity-60">დაფიქსირებული შემოსავალი</span>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-[#141210] border-amber-500/20' : 'bg-amber-50/50 border-amber-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs opacity-70">
            <span>ახალი (მოლოდინში)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-amber-400 mt-2">
            {stats.newOrders}
          </div>
          <span className="text-[11px] text-amber-500/80 font-medium">საჭიროებს დაკავშირებას</span>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs opacity-70">
            <span>გზაშია / ჩაბარებული</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-stone-200 mt-2">
            {stats.inTransit} / {stats.delivered}
          </div>
          <span className="text-[11px] opacity-60">მიწოდების ეტაპზე / ჩაბარებული</span>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className={`p-4 rounded-2xl border space-y-3 ${
        darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="მოძებნეთ შეკვეთის კოდით (#MTR-...), კლიენტის სახელით, ნომრით ან მოდელით..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                darkMode
                  ? 'bg-stone-900 border-stone-700 text-white placeholder-stone-500 focus:border-amber-500'
                  : 'bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Filter & Sorter */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-3 py-2.5 rounded-xl text-xs border outline-none cursor-pointer ${
                darkMode ? 'bg-stone-900 border-stone-700 text-stone-200' : 'bg-stone-50 border-stone-300 text-stone-800'
              }`}
            >
              <option value="all">ყველა ტიპი</option>
              <option value="orders">🛍️ ონლაინ შეკვეთები</option>
              <option value="callbacks">📞 სატელეფონო მოთხოვნები</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2.5 rounded-xl text-xs border outline-none cursor-pointer ${
                darkMode ? 'bg-stone-900 border-stone-700 text-stone-200' : 'bg-stone-50 border-stone-300 text-stone-800'
              }`}
            >
              <option value="newest">უახლესი პირველი</option>
              <option value="oldest">უძველესი პირველი</option>
              <option value="price-desc">თანხით (კლებადი)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-black font-bold shadow-xs'
                : darkMode
                ? 'bg-stone-900 text-stone-400 hover:text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            ყველა ({inquiries.length})
          </button>

          {ORDER_STATUSES.map((st) => {
            const count = inquiries.filter((it) => (it.status || 'ახალი შეკვეთა') === st.id).length;
            const isSelected = statusFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? darkMode
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                      : 'border-amber-600 bg-amber-100 text-amber-950 font-bold'
                    : darkMode
                    ? 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>{st.label.split(' / ')[0]}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {filteredInquiries.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-3xl border border-dashed border-stone-500/25 space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
            <ShoppingBag className="w-6 h-6 opacity-75" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-medium">შეკვეთები არ მოიძებნა</h4>
            <p className="text-xs opacity-60 max-w-sm mx-auto">
              მითითებული ფილტრებით ჩანაწერი არ არსებობს. შეცვალეთ ძიების პარამეტრები ან დაამატეთ ახალი შეკვეთა.
            </p>
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="text-xs text-amber-500 font-semibold underline underline-offset-4"
            >
              ფილტრების გასუფთავება
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((order) => {
            const currentStatus = order.status || 'ახალი შეკვეთა';
            const statusConfig = ORDER_STATUSES.find((s) => s.id === currentStatus) || ORDER_STATUSES[0];
            const orderCode = order.id?.startsWith('MTR-') ? order.id : `MTR-${order.id}`;

            // Resolve ordered items
            let itemsList = [];
            if (Array.isArray(order.items) && order.items.length > 0) {
              itemsList = order.items;
            } else {
              itemsList = [
                {
                  name: order.productName || 'სამკაული',
                  sku: order.sku || 'AURELIA',
                  size: order.size || 'სტანდარტული',
                  price: order.price || order.totalPrice || 0
                }
              ];
            }

            const totalAmount = order.totalPrice || order.price || itemsList.reduce((acc, it) => acc + (parseFloat(it.price) || 0), 0);

            return (
              <div
                key={order.id}
                className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-5 shadow-sm ${
                  darkMode
                    ? 'bg-[#141210] border-stone-800 hover:border-amber-500/30'
                    : 'bg-white border-stone-200/90 hover:border-amber-500/50'
                }`}
              >
                {/* 1. Header Row: Order Code, Timestamp, Interactive Status Dropdown & Delete */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-500/15">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCopyId(orderCode)}
                      title="კოდის კოპირება"
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 font-mono font-bold text-amber-400 text-xs flex items-center gap-1.5 hover:bg-amber-500/25 transition-all"
                    >
                      <span>#{orderCode}</span>
                      {copiedId === orderCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                    </button>

                    <div className="flex items-center gap-1.5 text-xs opacity-60 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{order.date || 'ახლახანს'}</span>
                    </div>

                    {order.isGift && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        <span>სასაჩუქრე ყუთი</span>
                      </span>
                    )}

                    {order.promoApplied && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>VIP: {order.promoApplied}</span>
                      </span>
                    )}
                  </div>

                  {/* Status Dropdown & Print/Delete actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="relative">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleUpdateOrder(order.id, { status: e.target.value })}
                        className={`py-1.5 pl-3 pr-7 rounded-xl text-xs font-bold border outline-none cursor-pointer appearance-none transition-all ${statusConfig.color}`}
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st.id} value={st.id} className="bg-stone-900 text-white font-medium">
                            {st.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Print Invoice Button */}
                    <button
                      type="button"
                      onClick={() => setPrintOrder(order)}
                      title="ინვოისის ბეჭდვა"
                      className={`p-2 rounded-xl border text-stone-400 hover:text-amber-400 transition-colors ${
                        darkMode ? 'border-stone-800 bg-stone-900 hover:bg-stone-800' : 'border-stone-300 bg-stone-100 hover:bg-stone-200'
                      }`}
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    {deleteConfirmId === order.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-bold"
                        >
                          დიახ, წაშლა
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1 text-xs opacity-70"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(order.id)}
                        className="p-2 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        title="შეკვეთის წაშლა"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Customer, Delivery & Payment Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Customer Information */}
                  <div className={`p-4 rounded-2xl border space-y-2 ${
                    darkMode ? 'bg-stone-900/40 border-stone-800/80' : 'bg-stone-50/80 border-stone-200/80'
                  }`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">
                      მყიდველი
                    </span>
                    <div className="font-semibold text-sm text-stone-100 dark:text-stone-100">
                      {order.clientName || 'სახელი მითითებული არაა'}
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={`tel:${order.clientPhone}`}
                          className="font-mono text-amber-500 hover:underline flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.clientPhone || '—'}</span>
                        </a>

                        {order.clientPhone && (
                          <button
                            type="button"
                            onClick={() => handleWhatsAppCustomer(order)}
                            className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-all text-[11px] font-semibold flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>
                        )}
                      </div>

                      {order.clientEmail && (
                        <a
                          href={`mailto:${order.clientEmail}`}
                          className="text-stone-400 hover:underline flex items-center gap-1.5 truncate text-[11px]"
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{order.clientEmail}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className={`p-4 rounded-2xl border space-y-2.5 ${
                    darkMode ? 'bg-stone-900/40 border-stone-800/80' : 'bg-stone-50/80 border-stone-200/80'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">
                        მიწოდების მეთოდი & მისამართი
                      </span>
                      <a
                        href={`/track?id=${order.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-semibold text-amber-500 hover:underline flex items-center gap-1"
                        title="კლიენტის თრექინგის ეკრანის ნახვა"
                      >
                        <span>თრექინგი 🚚</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm">
                      {order.deliveryMethod?.includes('შოურუმ') ? (
                        <>
                          <Store className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>შოურუმიდან გატანა</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{order.deliveryMethod || 'საკურიერო მიწოდება'}</span>
                        </>
                      )}
                    </div>

                    <div className="text-stone-300 opacity-80 pt-1 leading-snug">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span>{order.address || (order.city ? `${order.city}, მისამართი დასაზუსტებელია` : 'მისამართი დასაზუსტებელია')}</span>
                      </div>

                      {order.address && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-amber-500 hover:underline mt-1 font-medium"
                        >
                          <span>📍 რუკაზე ნახვა</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>

                    {order.notes && (
                      <div className="pt-1.5 border-t border-stone-500/10 text-[11px] text-stone-400 italic">
                        💬 „{order.notes}“
                      </div>
                    )}

                    {/* Delivery ETA & Courier Controls for Customer Tracking */}
                    <div className="pt-2 border-t border-stone-500/10 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>მიწოდების დრო (ETA):</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateOrder(order.id, { estimatedDelivery: 'დღეს 18:00-მდე' })}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-black transition-all"
                          >
                            დღესვე
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateOrder(order.id, { estimatedDelivery: 'ხვალ 14:00 - 18:00' })}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-black transition-all"
                          >
                            ხვალ
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        defaultValue={order.estimatedDelivery || ''}
                        onBlur={(e) => handleUpdateOrder(order.id, { estimatedDelivery: e.target.value.trim() })}
                        placeholder="მაგ: დღეს 18:00-მდე ან ხვალ..."
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none transition-colors ${
                          darkMode ? 'bg-stone-900 border-stone-700 text-stone-200 focus:border-amber-500' : 'bg-white border-stone-300'
                        }`}
                      />

                      <div className="pt-1">
                        <span className="font-semibold text-stone-400 block mb-0.5">კურიერის ინფო კლიენტისთვის:</span>
                        <input
                          type="text"
                          defaultValue={order.courierNote || ''}
                          onBlur={(e) => handleUpdateOrder(order.id, { courierNote: e.target.value.trim() })}
                          placeholder="მაგ: კურიერი: გიორგი, 599 12 34 56"
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none transition-colors ${
                            darkMode ? 'bg-stone-900 border-stone-700 text-stone-200 focus:border-amber-500' : 'bg-white border-stone-300'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment & Grand Total */}
                  <div className={`p-4 rounded-2xl border space-y-2 flex flex-col justify-between ${
                    darkMode ? 'bg-stone-900/40 border-stone-800/80' : 'bg-stone-50/80 border-stone-200/80'
                  }`}>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">
                        გადახდა & ჯამი
                      </span>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="flex items-center gap-1.5 font-medium text-xs">
                          {order.paymentMethod?.includes('ბარათ') ? (
                            <CreditCard className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Banknote className="w-4 h-4 text-amber-500" />
                          )}
                          <span>{order.paymentMethod || 'ონლაინ ბარათით'}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newPayStatus = (order.paymentStatus || 'გადასახდელია') === 'გადახდილია' ? 'გადასახდელია' : 'გადახდილია';
                            handleUpdateOrder(order.id, { paymentStatus: newPayStatus });
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                            (order.paymentStatus || 'გადასახდელია') === 'გადახდილია'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {(order.paymentStatus || 'გადასახდელია') === 'გადახდილია' ? 'გადახდილია ✓' : 'გადასახდელია ⏳'}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-500/15 flex items-baseline justify-between">
                      <span className="text-xs opacity-75 font-medium">სრული თანხა:</span>
                      <span className="font-mono font-bold text-lg sm:text-xl text-amber-400">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Ordered Jewelry Items Breakdown (ზომების მკაფიო გამოკვეთით!) */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  darkMode ? 'bg-stone-900/20 border-stone-800/60' : 'bg-stone-50/50 border-stone-200/60'
                }`}>
                  <span className="text-[11px] uppercase tracking-wider font-bold opacity-75 flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                    <span>შეკვეთის შემადგენლობა ({itemsList.length} ნივთი):</span>
                  </span>

                  <div className="divide-y divide-stone-500/10 space-y-2">
                    {itemsList.map((item, idx) => {
                      const matchedProd = products.find((p) => p.id === item.id || p.sku === item.sku);
                      const itemImg = item.image || matchedProd?.images?.[0] || matchedProd?.image || '/brand-logo.jpg';
                      const itemSize = item.size || order.size || 'სტანდარტული';

                      return (
                        <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={itemImg}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-500/20 bg-stone-900"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-xs sm:text-sm truncate">
                                {item.name}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] opacity-75 mt-0.5">
                                <span className="font-mono text-amber-400">#{item.sku || 'SKU'}</span>
                                {matchedProd?.category && (
                                  <>
                                    <span>•</span>
                                    <span>{matchedProd.category}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 ml-auto">
                            {/* SIZE BADGE: ზომის გამოკვეთილი მაჩვენებელი */}
                            <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
                              <span className="text-[10px] uppercase opacity-75 font-sans">ზომა:</span>
                              <span className="text-sm">{itemSize}</span>
                            </div>

                            <div className="font-mono font-bold text-xs sm:text-sm text-stone-200 dark:text-stone-200 min-w-[70px] text-right">
                              {formatPrice(item.price)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Internal Admin Notes */}
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="text-[10px] uppercase font-bold opacity-50 shrink-0">
                    შიდა ჩანაწერი:
                  </span>
                  <input
                    type="text"
                    defaultValue={order.adminNote || ''}
                    onBlur={(e) => {
                      if (e.target.value !== (order.adminNote || '')) {
                        handleUpdateOrder(order.id, { adminNote: e.target.value.trim() });
                      }
                    }}
                    placeholder="ჩაწერეთ შიდა კომენტარი კურიერისთვის ან თანამშრომლისთვის..."
                    className={`flex-1 px-3 py-1.5 rounded-lg border text-xs outline-none transition-all ${
                      darkMode
                        ? 'bg-stone-900/60 border-stone-800 text-stone-300 focus:border-amber-500/50'
                        : 'bg-white border-stone-300 text-stone-800 focus:border-amber-600'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: NEW MANUAL ORDER CREATION */}
      {showNewOrderModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className={`w-full max-w-xl rounded-3xl border p-6 space-y-5 my-8 ${
            darkMode ? 'bg-[#141210] border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900 shadow-2xl'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-stone-500/15">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif text-lg sm:text-xl font-bold">
                  ახალი შეკვეთის რეგისტრაცია
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs sm:text-sm">
              {/* Product & Size Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] uppercase font-semibold opacity-75 block">
                    სამკაულის შერჩევა *
                  </label>
                  <select
                    value={newOrderForm.productId}
                    onChange={(e) => {
                      const prod = products.find((p) => p.id === e.target.value);
                      setNewOrderForm((prev) => ({
                        ...prev,
                        productId: e.target.value,
                        size: prod?.sizes?.[0] || '16.5'
                      }));
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (#{p.sku}) — {formatPrice(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-semibold opacity-75 block">
                    ზომა (Size) *
                  </label>
                  {(() => {
                    const selProd = products.find((p) => p.id === newOrderForm.productId) || products[0];
                    const availSizes = selProd?.sizes && selProd.sizes.length > 0
                      ? selProd.sizes
                      : ['16.0', '16.5', '17.0', '17.5', '18.0', 'უნივერსალური'];

                    return (
                      <select
                        value={newOrderForm.size}
                        onChange={(e) => setNewOrderForm((prev) => ({ ...prev, size: e.target.value }))}
                        className={`w-full px-3 py-2.5 rounded-xl border outline-none font-bold text-amber-500 ${
                          darkMode ? 'bg-stone-900 border-stone-700' : 'bg-stone-50 border-stone-300'
                        }`}
                      >
                        {availSizes.map((sz) => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>

              {/* Client Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-semibold opacity-75 block">
                    კლიენტის სახელი & გვარი *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.clientName}
                    onChange={(e) => setNewOrderForm((prev) => ({ ...prev, clientName: e.target.value }))}
                    placeholder="მაგ: დავით გლონტი"
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-semibold opacity-75 block">
                    ტელეფონის ნომერი *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newOrderForm.clientPhone}
                    onChange={(e) => setNewOrderForm((prev) => ({ ...prev, clientPhone: e.target.value }))}
                    placeholder="5XX XX XX XX"
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              {/* Delivery City & Address */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] uppercase font-semibold opacity-75 block">
                  საკურიერო მიწოდება & მისამართი *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={newOrderForm.city}
                    onChange={(e) => setNewOrderForm((prev) => ({ ...prev, city: e.target.value }))}
                    className={`px-3 py-2.5 rounded-xl border outline-none ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300'
                    }`}
                  >
                    <option value="თბილისი">თბილისი ({formatPrice(siteSettings.deliveryPriceTbilisi ?? 6)})</option>
                    <option value="ბათუმი">ბათუმი ({formatPrice(siteSettings.deliveryPriceRegional ?? 10)})</option>
                    <option value="ქუთაისი">ქუთაისი ({formatPrice(siteSettings.deliveryPriceRegional ?? 10)})</option>
                    <option value="რუსთავი">რუსთავი ({formatPrice(siteSettings.deliveryPriceRegional ?? 10)})</option>
                    <option value="სხვა">სხვა რეგიონი ({formatPrice(siteSettings.deliveryPriceRegional ?? 10)})</option>
                  </select>

                  <input
                    type="text"
                    required
                    value={newOrderForm.address}
                    onChange={(e) => setNewOrderForm((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="ქუჩა, კორპუსი, ბინა"
                    className={`sm:col-span-2 px-3.5 py-2.5 rounded-xl border outline-none ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300'
                    }`}
                  />
                </div>
              </div>

              {/* Payment Method & Gift Packaging */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-semibold opacity-75 block">
                    გადახდის მეთოდი
                  </label>
                  <select
                    value={newOrderForm.paymentMethod}
                    onChange={(e) => setNewOrderForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300'
                    }`}
                  >
                    <option value="card">ონლაინ ბარათით</option>
                    <option value="cod">კურიერთან გადახდა (ნაღდი/ტერმინალი)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={newOrderForm.isGift}
                      onChange={(e) => setNewOrderForm((prev) => ({ ...prev, isGift: e.target.checked }))}
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span>სასაჩუქრე ექსკლუზიური შეფუთვა (+{formatPrice(siteSettings.giftPackagingPrice ?? 5)})</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase font-semibold opacity-75 block">
                  დამატებითი შენიშვნა
                </label>
                <textarea
                  value={newOrderForm.notes}
                  onChange={(e) => setNewOrderForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="მაგ: კლიენტს სურს მიწოდება ხვალ 16:00-მდე"
                  rows={2}
                  className={`w-full px-3 py-2 rounded-xl border outline-none resize-none ${
                    darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300'
                  }`}
                />
              </div>

              <div className="pt-3 border-t border-stone-500/15 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold opacity-70 hover:opacity-100"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-md active:scale-95"
                >
                  შეკვეთის შენახვა
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE INVOICE / PACKING SLIP */}
      {printOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white text-stone-900 rounded-3xl p-6 sm:p-8 space-y-6 my-8 shadow-2xl print:m-0 print:p-0 print:shadow-none print:w-full">
            {/* Action Bar (hidden when printing) */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <span className="font-serif font-bold text-base">ოფიციალური ინვოისი / შეკვეთის ბარათი</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-amber-400"
                >
                  <Printer className="w-4 h-4" />
                  <span>ბეჭდვა (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintOrder(null)}
                  className="p-1.5 text-stone-500 hover:text-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="space-y-6 text-xs sm:text-sm">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b-2 border-stone-900">
                <div>
                  <h1 className="font-serif text-2xl font-bold tracking-widest uppercase">
                    {siteSettings.brandName || 'MATARE'}
                  </h1>
                  <span className="text-[10px] tracking-widest uppercase block text-stone-500">
                    JEWELRY ATELIER • TBILISI
                  </span>
                  <p className="text-xs text-stone-600 mt-1">
                    {siteSettings.showroomAddress || 'მ. კოსტავას 75, თბილისი, საქართველო'}<br />
                    ტელ: {siteSettings.phone || '+995 32 200 00 00'} • www.matare.store
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono text-amber-700">
                    #{printOrder.id?.startsWith('MTR-') ? printOrder.id : `MTR-${printOrder.id}`}
                  </div>
                  <div className="text-xs text-stone-500 font-mono mt-0.5">
                    {printOrder.date || new Date().toLocaleDateString('ka-GE')}
                  </div>
                  <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 border border-stone-300">
                    {printOrder.status || 'ახალი შეკვეთა'}
                  </div>
                </div>
              </div>

              {/* Customer & Delivery */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    შემკვეთი / მიმღები:
                  </span>
                  <div className="font-bold text-stone-900 text-sm">
                    {printOrder.clientName}
                  </div>
                  <div className="text-xs text-stone-700 font-mono mt-0.5">
                    📞 {printOrder.clientPhone}
                  </div>
                  {printOrder.clientEmail && (
                    <div className="text-xs text-stone-600">
                      ✉️ {printOrder.clientEmail}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    მიწოდების დეტალები:
                  </span>
                  <div className="font-semibold text-stone-900">
                    {printOrder.deliveryMethod || 'საკურიერო მიწოდება'}
                  </div>
                  <div className="text-xs text-stone-700 mt-0.5">
                    📍 {printOrder.address || 'შოურუმი'}
                  </div>
                  <div className="text-xs text-stone-600 mt-0.5">
                    💳 გადახდა: {printOrder.paymentMethod || 'ბარათით'} ({printOrder.paymentStatus || 'გადასახდელია'})
                  </div>
                </div>
              </div>

              {/* Items Table with Size Column */}
              <div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-300 text-[11px] uppercase tracking-wider text-stone-500">
                      <th className="py-2">სამკაული</th>
                      <th className="py-2">კოდი (SKU)</th>
                      <th className="py-2 text-center">ზომა (Size)</th>
                      <th className="py-2 text-right">ფასი</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-xs">
                    {(printOrder.items && printOrder.items.length > 0 ? printOrder.items : [
                      {
                        name: printOrder.productName || 'სამკაული',
                        sku: printOrder.sku || 'AURELIA',
                        size: printOrder.size || 'სტანდარტული',
                        price: printOrder.totalPrice || printOrder.price || 0
                      }
                    ]).map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-medium">{it.name}</td>
                        <td className="py-2.5 font-mono text-stone-600">#{it.sku || 'SKU'}</td>
                        <td className="py-2.5 text-center font-mono font-bold text-amber-700 bg-amber-50/50 rounded">
                          {it.size || printOrder.size || 'სტანდარტული'}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold">{formatPrice(it.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="pt-3 border-t-2 border-stone-900 space-y-1.5 text-right">
                {printOrder.promoApplied && (
                  <div className="text-xs text-emerald-700">
                    VIP ფასდაკლება ({printOrder.promoApplied}): -10%
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs uppercase font-bold text-stone-600">სულ გადასახდელი:</span>
                  <span className="font-mono text-2xl font-bold text-amber-700">
                    {formatPrice(printOrder.totalPrice || printOrder.price)}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-stone-300 grid grid-cols-2 gap-8 text-[11px] text-stone-600">
                <div>
                  <span className="block mb-6">გამგზავნი / საიუველირო სახლი:</span>
                  <div className="border-b border-stone-400 w-3/4"></div>
                  <span className="text-[10px] opacity-75">ხელმოწერა / ბეჭედი</span>
                </div>
                <div>
                  <span className="block mb-6">ჩამბარებელი / კლიენტი:</span>
                  <div className="border-b border-stone-400 w-3/4"></div>
                  <span className="text-[10px] opacity-75">ხელმოწერა (მიღებულია უდეფექტოდ)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

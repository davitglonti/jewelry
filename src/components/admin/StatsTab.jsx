// src/components/admin/StatsTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Eye, Users, Trophy, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown,
  Search, ExternalLink, Clock, Trash2, CheckCircle2, AlertCircle,
  Package, Sparkles, Filter
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

export default function StatsTab({ products = [], darkMode = true, lang = 'ka' }) {
  const [statsMap, setStatsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('views'); // 'views' | 'uniqueViews' | 'lastViewedAt' | 'name'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'viewed' | 'zero'
  const [actionMessage, setActionMessage] = useState('');
  const [resettingId, setResettingId] = useState(null);

  // ტექსტების ლოკალიზაცია (KA / EN)
  const t = {
    title: lang === 'ka' ? 'პროდუქციის ნახვების სტატისტიკა' : 'Product Views Statistics',
    subtitle: lang === 'ka'
      ? 'მონაცემები აღირიცხება რეალურ დროში და ინახება დაცულ productStats კოლექციაში'
      : 'Real-time analytics stored securely in productStats collection',
    refresh: lang === 'ka' ? 'განახლება' : 'Refresh',
    lastRefreshedText: lang === 'ka' ? 'ბოლო განახლება' : 'Last refreshed',
    totalViews: lang === 'ka' ? 'სულ ნახვები' : 'Total Views',
    totalUnique: lang === 'ka' ? 'უნიკალური ვიზიტორი' : 'Unique Visitors',
    top3Title: lang === 'ka' ? 'ტოპ 3 ყველაზე მოთხოვნადი' : 'Top 3 Most Viewed',
    searchPlaceholder: lang === 'ka' ? 'ძიება ნივთის სახელით ან SKU-ით...' : 'Search by item name or SKU...',
    filterAll: lang === 'ka' ? 'ყველა ნივთი' : 'All Items',
    filterViewed: lang === 'ka' ? 'მხოლოდ ნანახი' : 'Viewed Only',
    filterZero: lang === 'ka' ? 'ნულოვანი ნახვა' : 'Zero Views',
    colItem: lang === 'ka' ? 'ნივთი' : 'Item',
    colViews: lang === 'ka' ? 'სულ ნახვები' : 'Total Views',
    colUnique: lang === 'ka' ? 'უნიკალური' : 'Unique',
    colLastViewed: lang === 'ka' ? 'ბოლო ნახვა' : 'Last Viewed',
    colActions: lang === 'ka' ? 'მოქმედება' : 'Action',
    neverViewed: lang === 'ka' ? 'არ უნახავთ' : 'Never',
    deletedItem: lang === 'ka' ? 'წაშლილი ნივთი' : 'Deleted Item',
    openStore: lang === 'ka' ? 'საიტზე ნახვა' : 'View on Store',
    resetStats: lang === 'ka' ? 'სტატისტიკის განულება' : 'Reset Stat',
    confirmReset: lang === 'ka' ? 'ნამდვილად გსურთ ამ ნივთის სტატისტიკის განულება?' : 'Are you sure you want to reset stats for this item?',
    resetSuccess: lang === 'ka' ? 'სტატისტიკა წარმატებით განულდა' : 'Stats reset successfully',
    noData: lang === 'ka' ? 'მონაცემები ვერ მოიძებნა' : 'No data found',
    noItemsWithViews: lang === 'ka' ? 'ჯერჯერობით ნახვები არ დაფიქსირებულა' : 'No views recorded yet',
  };

  // 1. სტატისტიკის ერთჯერადი წაკითხვა (არა realtime listener, რათა დაზოგოს Firestore reads)
  const fetchStats = async () => {
    setLoading(true);
    setActionMessage('');
    try {
      if (!db) {
        setLoading(false);
        return;
      }
      const colRef = collection(db, 'productStats');
      const snapshot = await getDocs(colRef);
      const newMap = {};
      snapshot.forEach((docSnap) => {
        newMap[docSnap.id] = docSnap.data();
      });
      setStatsMap(newMap);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch product stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 2. სტატისტიკის განულება (Reset) მხოლოდ ადმინს შეუძლია
  const handleResetStat = async (docId) => {
    if (!window.confirm(t.confirmReset)) return;
    setResettingId(docId);
    try {
      if (!db) return;
      await deleteDoc(doc(db, 'productStats', docId));
      setStatsMap((prev) => {
        const copy = { ...prev };
        delete copy[docId];
        return copy;
      });
      setActionMessage(t.resetSuccess);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      console.error('Failed to reset stat:', err);
      alert(err.message || 'Error resetting stat');
    } finally {
      setResettingId(null);
    }
  };

  // 3. ნივთებისა და სტატისტიკის გაერთიანება (Merging)
  const mergedList = useMemo(() => {
    const list = [];
    const matchedDocIds = new Set();

    // ა) არსებული პროდუქტები
    (products || []).forEach((p) => {
      const pid = String(p.id || '').trim();
      const psku = String(p.sku || '').trim();

      // ვამოწმებთ ჯერ ID-ით, მერე SKU-ით
      let stat = statsMap[pid];
      if (stat) {
        matchedDocIds.add(pid);
      } else if (psku && statsMap[psku]) {
        stat = statsMap[psku];
        matchedDocIds.add(psku);
      }

      const views = typeof stat?.views === 'number' ? stat.views : 0;
      const uniqueViews = typeof stat?.uniqueViews === 'number' ? stat.uniqueViews : 0;
      const lastViewedAt = stat?.lastViewedAt || null;

      list.push({
        id: pid || psku,
        sku: psku,
        name: p.name || (lang === 'ka' ? 'უსახელო ნივთი' : 'Unnamed Item'),
        image: (p.images && p.images[0]) || p.imageUrl || '',
        price: p.price || '',
        category: p.category || '',
        views,
        uniqueViews,
        lastViewedAt,
        isDeleted: false,
        rawProduct: p,
      });
    });

    // ბ) წაშლილი ნივთები (თუ სტატისტიკა დარჩა ბაზაში, მაგრამ ნივთი წაშლილია)
    Object.keys(statsMap).forEach((docId) => {
      if (!matchedDocIds.has(docId)) {
        const stat = statsMap[docId];
        list.push({
          id: docId,
          sku: docId,
          name: `${t.deletedItem} (${docId})`,
          image: '',
          price: '-',
          category: '-',
          views: stat?.views || 0,
          uniqueViews: stat?.uniqueViews || 0,
          lastViewedAt: stat?.lastViewedAt || null,
          isDeleted: true,
          rawProduct: null,
        });
      }
    });

    return list;
  }, [products, statsMap, lang]);

  // 4. ზედა ბარათების მონაცემები (სულ ნახვები, უნიკალურები, ტოპ 3)
  const summary = useMemo(() => {
    let totalViews = 0;
    let totalUnique = 0;
    let itemsWithViews = 0;

    mergedList.forEach((item) => {
      totalViews += item.views;
      totalUnique += item.uniqueViews;
      if (item.views > 0) itemsWithViews += 1;
    });

    const sortedByViews = [...mergedList]
      .filter((item) => item.views > 0)
      .sort((a, b) => b.views - a.views);

    const top3 = sortedByViews.slice(0, 3);

    return {
      totalViews,
      totalUnique,
      itemsWithViews,
      totalItems: mergedList.length,
      top3,
    };
  }, [mergedList]);

  // 5. გაფილტვრა და დალაგება
  const filteredAndSortedList = useMemo(() => {
    let result = mergedList.filter((item) => {
      if (filterMode === 'viewed' && item.views === 0) return false;
      if (filterMode === 'zero' && item.views > 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (item.name || '').toLowerCase().includes(q);
        const matchesSku = (item.sku || '').toLowerCase().includes(q);
        const matchesCategory = (item.category || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesCategory) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'lastViewedAt') {
        const timeA = valA?.toDate ? valA.toDate().getTime() : (valA?.seconds ? valA.seconds * 1000 : (valA ? new Date(valA).getTime() : 0));
        const timeB = valB?.toDate ? valB.toDate().getTime() : (valB?.seconds ? valB.seconds * 1000 : (valB ? new Date(valB).getTime() : 0));
        return sortDir === 'asc' ? timeA - timeB : timeB - timeA;
      }

      if (typeof valA === 'string') {
        return sortDir === 'asc'
          ? (valA || '').localeCompare(valB || '')
          : (valB || '').localeCompare(valA || '');
      }

      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [mergedList, searchQuery, filterMode, sortField, sortDir]);

  // სვეტით დალაგების გადართვა
  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'name' ? 'asc' : 'desc');
    }
  };

  // დროის ფორმატირება
  const formatTime = (ts) => {
    if (!ts) return t.neverViewed;
    try {
      const date = ts.toDate ? ts.toDate() : (ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
      if (isNaN(date.getTime())) return t.neverViewed;
      return date.toLocaleString(lang === 'ka' ? 'ka-GE' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return t.neverViewed;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* შეტყობინების ბანერი */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif text-xl sm:text-2xl font-medium tracking-wide">
              {t.title}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
              productStats
            </span>
          </div>
          <p className="text-xs sm:text-sm opacity-60 mt-1">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {lastRefreshed && (
            <div className="text-xs opacity-50 flex items-center gap-1.5 hidden md:flex">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {t.lastRefreshedText}: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t.refresh}</span>
          </button>
        </div>
      </div>

      {/* Top Cards: Summary & Top 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Views */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {t.totalViews}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif tracking-tight text-amber-500">
            {summary.totalViews.toLocaleString()}
          </div>
          <div className="text-xs opacity-60 mt-2 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            <span>
              {lang === 'ka'
                ? `ნანახია ${summary.itemsWithViews} / ${summary.totalItems} ნივთი`
                : `${summary.itemsWithViews} of ${summary.totalItems} items viewed`}
            </span>
          </div>
        </div>

        {/* Card 2: Unique Visitors */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {t.totalUnique}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif tracking-tight text-emerald-400">
            {summary.totalUnique.toLocaleString()}
          </div>
          <div className="text-xs opacity-60 mt-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {summary.totalUnique > 0
                ? (lang === 'ka'
                    ? `საშუალოდ ${(summary.totalViews / summary.totalUnique).toFixed(1)} ნახვა ვიზიტორზე`
                    : `Avg ${(summary.totalViews / summary.totalUnique).toFixed(1)} views / visitor`)
                : (lang === 'ka' ? 'ვიზიტორები არ ფიქსირდება' : 'No visitors yet')}
            </span>
          </div>
        </div>

        {/* Card 3: Top 3 Popular Items */}
        <div
          className={`p-5 rounded-2xl border transition-all sm:col-span-2 lg:col-span-1 ${
            darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {t.top3Title}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          {summary.top3.length === 0 ? (
            <div className="text-xs opacity-50 py-3 text-center">
              {t.noItemsWithViews}
            </div>
          ) : (
            <div className="space-y-2.5">
              {summary.top3.map((item, idx) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={item.id} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">{medals[idx]}</span>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-7 h-7 rounded-lg object-cover shrink-0 border border-stone-700/50"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5 opacity-40" />
                        </div>
                      )}
                      <span className="truncate font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-amber-500 shrink-0">
                      {item.views} {lang === 'ka' ? 'ნახვა' : 'views'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
              darkMode
                ? 'bg-[#141210] border-stone-800 text-white placeholder-stone-500 focus:border-amber-500'
                : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-stone-800 bg-[#141210] self-start sm:self-auto">
          {[
            { id: 'all', label: `${t.filterAll} (${mergedList.length})` },
            { id: 'viewed', label: `${t.filterViewed} (${summary.itemsWithViews})` },
            { id: 'zero', label: `${t.filterZero} (${mergedList.length - summary.itemsWithViews})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterMode(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterMode === f.id
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Table */}
      <div
        className={`rounded-2xl border overflow-hidden transition-all ${
          darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr
                className={`border-b text-[11px] uppercase tracking-wider font-semibold opacity-70 ${
                  darkMode ? 'bg-stone-900/60 border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                {/* Column: Item */}
                <th
                  onClick={() => handleSortToggle('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-amber-500 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t.colItem}</span>
                    {sortField === 'name' ? (
                      sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>

                {/* Column: Total Views */}
                <th
                  onClick={() => handleSortToggle('views')}
                  className="py-3.5 px-4 cursor-pointer hover:text-amber-500 select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{t.colViews}</span>
                    {sortField === 'views' ? (
                      sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>

                {/* Column: Unique Views */}
                <th
                  onClick={() => handleSortToggle('uniqueViews')}
                  className="py-3.5 px-4 cursor-pointer hover:text-amber-500 select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{t.colUnique}</span>
                    {sortField === 'uniqueViews' ? (
                      sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>

                {/* Column: Last Viewed */}
                <th
                  onClick={() => handleSortToggle('lastViewedAt')}
                  className="py-3.5 px-4 cursor-pointer hover:text-amber-500 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t.colLastViewed}</span>
                    {sortField === 'lastViewedAt' ? (
                      sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>

                {/* Column: Actions */}
                <th className="py-3.5 px-4 text-right">
                  <span>{t.colActions}</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-800/40">
              {filteredAndSortedList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center opacity-50 text-xs">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filteredAndSortedList.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-stone-50'
                    } ${item.isDeleted ? 'opacity-60 bg-red-500/[0.03]' : ''}`}
                  >
                    {/* Item Cell */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 opacity-40" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium truncate flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.isDeleted && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                                {t.deletedItem}
                              </span>
                            )}
                          </div>
                          <div className="text-xs opacity-50 font-mono mt-0.5 flex items-center gap-2">
                            {item.sku && <span>SKU: {item.sku}</span>}
                            {item.price && item.price !== '-' && <span>• {item.price}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Views Cell */}
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      <span className={item.views > 0 ? 'text-amber-500 font-bold' : 'opacity-40'}>
                        {item.views.toLocaleString()}
                      </span>
                    </td>

                    {/* Unique Views Cell */}
                    <td className="py-3 px-4 text-right font-mono">
                      <span className={item.uniqueViews > 0 ? 'text-emerald-400 font-medium' : 'opacity-40'}>
                        {item.uniqueViews.toLocaleString()}
                      </span>
                    </td>

                    {/* Last Viewed Cell */}
                    <td className="py-3 px-4 text-xs opacity-75">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 opacity-40" />
                        <span>{formatTime(item.lastViewedAt)}</span>
                      </div>
                    </td>

                    {/* Action Cell */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {!item.isDeleted && (
                          <a
                            href={`/product/${encodeURIComponent(item.sku || item.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={t.openStore}
                            className="p-2 rounded-lg text-stone-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {item.views > 0 && (
                          <button
                            type="button"
                            onClick={() => handleResetStat(item.id)}
                            disabled={resettingId === item.id}
                            title={t.resetStats}
                            className="p-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// src/components/admin/StatsTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Eye, Users, Trophy, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown,
  Search, ExternalLink, Clock, Trash2, CheckCircle2, AlertCircle,
  Package, Sparkles, Filter, Heart, ArrowLeftRight, ShoppingBag,
  TrendingUp, Calendar, Download, Mail, UserCheck, ShieldCheck,
  ChevronRight, BarChart3, Layers, Check, Copy
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

export default function StatsTab({ products = [], inquiries = [], darkMode = true, lang = 'ka' }) {
  // Data state
  const [statsMap, setStatsMap] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Sub-tabs & Views
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'users' | 'wishlist' | 'products'
  const [timeRange, setTimeRange] = useState('7days'); // 'today' | '7days' | '30days' | 'thisMonth' | 'all'

  // Products Table Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('views'); // 'views' | 'uniqueViews' | 'favorites' | 'orders' | 'lastViewedAt' | 'name' | 'price'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'viewed' | 'zero' | 'favorited'

  // Users Controls
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userProviderFilter, setUserProviderFilter] = useState('all'); // 'all' | 'google' | 'password' | 'ordered'
  const [copiedEmail, setCopiedEmail] = useState(null);

  // Actions state
  const [actionMessage, setActionMessage] = useState('');
  const [resettingId, setResettingId] = useState(null);
  const [syncingUsers, setSyncingUsers] = useState(false);

  // Localization strings
  const t = {
    title: lang === 'ka' ? 'ანალიტიკა და სტატისტიკის ცენტრი' : 'Analytics & Statistics Center',
    subtitle: lang === 'ka'
      ? 'მომხმარებელთა აქტივობა, რეგისტრაციები, ნახვები და გაყიდვების დინამიკა რეალურ დროში'
      : 'Real-time user engagement, registrations, views, wishlist and sales analytics',
    refresh: lang === 'ka' ? 'განახლება' : 'Refresh',
    lastRefreshedText: lang === 'ka' ? 'განახლდა' : 'Updated',
    exportCsv: lang === 'ka' ? 'CSV ექსპორტი' : 'Export CSV',

    // Sub-tabs
    tabOverview: lang === 'ka' ? 'მიმოხილვა და ტრენდები' : 'Overview & Trends',
    tabUsers: lang === 'ka' ? 'რეგისტრირებული მომხმარებლები' : 'Registered Users',
    tabWishlist: lang === 'ka' ? 'რჩეულები & მოთხოვნა' : 'Wishlist & Demand',
    tabProducts: lang === 'ka' ? 'პროდუქციის კატალოგი' : 'Products Analytics',

    // Time Ranges
    timeToday: lang === 'ka' ? 'დღეს' : 'Today',
    time7Days: lang === 'ka' ? 'ბოლო 7 დღე' : 'Last 7 Days',
    time30Days: lang === 'ka' ? 'ბოლო 30 დღე' : 'Last 30 Days',
    timeThisMonth: lang === 'ka' ? 'მიმდინარე თვე' : 'This Month',
    timeAll: lang === 'ka' ? 'სრული პერიოდი' : 'All Time',

    // KPI Cards
    totalViews: lang === 'ka' ? 'სულ ნახვები' : 'Total Views',
    totalUnique: lang === 'ka' ? 'უნიკალური ვიზიტორი' : 'Unique Visitors',
    totalOrders: lang === 'ka' ? 'სულ შეკვეთები' : 'Total Inquiries',
    totalRevenue: lang === 'ka' ? 'შეკვეთების თანხა' : 'Inquiries Volume',
    totalUsers: lang === 'ka' ? 'რეგისტრირებული მომხმარებელი' : 'Registered Users',
    newUsersWeek: lang === 'ka' ? 'ახალი ამ კვირაში' : 'New This Week',
    totalWishlists: lang === 'ka' ? 'სულ რჩეულებში' : 'Total Wishlists',
    conversionRate: lang === 'ka' ? 'ვიტრინის კონვერსია' : 'Showcase Conversion',

    // Chart
    trendChartTitle: lang === 'ka' ? 'დღიური აქტივობის დინამიკა' : 'Daily Activity Trends',
    trendChartSubtitle: lang === 'ka' ? 'ნახვებისა და შეკვეთების თანაფარდობა დღეების მიხედვით' : 'Views vs orders comparison by day',
    peakDay: lang === 'ka' ? 'პიკური აქტივობა' : 'Peak Activity',

    // Wishlist Leaderboard
    wishlistTopTitle: lang === 'ka' ? 'ტოპ სასურველი სამკაულები (Wishlist)' : 'Top Wishlisted Pieces',
    wishlistTopSub: lang === 'ka' ? 'მოდელები, რომლებიც ყველაზე ხშირად ინახება რჩეულებში' : 'Most frequently favorited jewelry items',
    wishlistEmpty: lang === 'ka' ? 'რჩეულებში დამატებული ნივთები ჯერ არ არის' : 'No items added to favorites yet',

    // Table
    searchPlaceholder: lang === 'ka' ? 'ძიება ნივთის სახელით ან SKU-ით...' : 'Search item or SKU...',
    userSearchPlaceholder: lang === 'ka' ? 'ძიება მომხმარებლის სახელით ან ელ.ფოსტით...' : 'Search user by name or email...',
    filterAll: lang === 'ka' ? 'ყველა' : 'All',
    filterViewed: lang === 'ka' ? 'მხოლოდ ნანახი' : 'Viewed Only',
    filterZero: lang === 'ka' ? 'ნულოვანი ნახვა' : 'Zero Views',
    filterFavorited: lang === 'ka' ? 'რჩეულებში მყოფი' : 'In Wishlist',

    colItem: lang === 'ka' ? 'ნივთი' : 'Item',
    colPrice: lang === 'ka' ? 'ფასი' : 'Price',
    colViews: lang === 'ka' ? 'ნახვა' : 'Views',
    colUnique: lang === 'ka' ? 'უნიკალური' : 'Unique',
    colWishlist: lang === 'ka' ? 'რჩეული' : 'Wishlist',
    colCompares: lang === 'ka' ? 'შედარება' : 'Compare',
    colOrders: lang === 'ka' ? 'შეკვეთა' : 'Orders',
    colLastViewed: lang === 'ka' ? 'ბოლო ნახვა' : 'Last Viewed',
    colActions: lang === 'ka' ? 'მოქმედება' : 'Action',
    neverViewed: lang === 'ka' ? 'არ უნახავთ' : 'Never',
    deletedItem: lang === 'ka' ? 'წაშლილი ნივთი' : 'Deleted Item',
    openStore: lang === 'ka' ? 'საიტზე ნახვა' : 'View on Store',
    resetStats: lang === 'ka' ? 'სტატისტიკის განულება' : 'Reset Stat',
    confirmReset: lang === 'ka' ? 'ნამდვილად გსურთ ამ ნივთის სტატისტიკის განულება?' : 'Are you sure you want to reset stats for this item?',
    resetSuccess: lang === 'ka' ? 'სტატისტიკა წარმატებით განულდა' : 'Stats reset successfully',
    noData: lang === 'ka' ? 'მონაცემები ვერ მოიძებნა' : 'No data found',
  };

  // 1. მონაცემების ერთჯერადი წაკითხვა Firestore-დან (productStats და users)
  const fetchAllData = async () => {
    setLoading(true);
    setActionMessage('');
    try {
      if (!db) {
        setLoading(false);
        return;
      }

      // ა) productStats კოლექცია
      try {
        const statsCol = collection(db, 'productStats');
        const statsSnap = await getDocs(statsCol);
        const newStatsMap = {};
        statsSnap.forEach((docSnap) => {
          newStatsMap[docSnap.id] = docSnap.data();
        });
        setStatsMap(newStatsMap);
      } catch (e) {
        console.warn('Direct productStats read error:', e?.message);
      }

      // ბ) users კოლექცია (რეგისტრირებული მომხმარებლები)
      let loadedUsers = [];
      try {
        const usersCol = collection(db, 'users');
        const usersSnap = await getDocs(usersCol);
        usersSnap.forEach((docSnap) => {
          loadedUsers.push({ id: docSnap.id, ...docSnap.data() });
        });
      } catch (e) {
        console.warn('Direct Firestore users read error:', e?.message);
      }

      // თუ Firestore წესების გამო ცარიელია, ვიძახებთ /api/sync-all-users-ს (Admin SDK):
      if (loadedUsers.length === 0) {
        try {
          const { auth } = await import('../../lib/firebase');
          const token = await auth?.currentUser?.getIdToken();
          if (token) {
            const apiRes = await fetch('/api/sync-all-users', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              if (apiData?.users?.length) {
                loadedUsers = apiData.users;
              }
            }
          }
        } catch (apiErr) {
          console.debug('API user fetch fallback notice:', apiErr?.message);
        }
      }

      setUsersList(loadedUsers);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 2. სტატისტიკის განულება კონკრეტულ ნივთზე
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

  // 2.1 Firebase Auth-ის მომხმარებელთა სრული იმპორტი / სინქრონიზაცია
  const handleSyncAllAuthUsers = async () => {
    setSyncingUsers(true);
    try {
      const { auth } = await import('../../lib/firebase');
      const token = await auth?.currentUser?.getIdToken();
      if (!token) {
        alert(lang === 'ka' ? 'ავტორიზაცია არ მოიძებნა' : 'Not authenticated');
        setSyncingUsers(false);
        return;
      }
      const res = await fetch('/api/sync-all-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      if (data?.users?.length) {
        setUsersList(data.users);
      }
      setActionMessage(data.message || (lang === 'ka' ? 'მომხმარებლები წარმატებით დასინქრონირდა' : 'Users synced successfully'));
      setTimeout(() => setActionMessage(''), 5000);
    } catch (err) {
      console.warn('Sync users notice:', err.message);
      await fetchAllData();
    } finally {
      setSyncingUsers(false);
    }
  };

  // 3. შეკვეთების თარიღის პარსინგი დროითი ფილტრისთვის
  const parseDate = (val) => {
    if (!val) return null;
    if (val.toDate) return val.toDate();
    if (val.seconds) return new Date(val.seconds * 1000);
    if (typeof val === 'number') return new Date(val);
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
    return null;
  };

  // 4. დროითი დიაპაზონის საზღვარი
  const timeThreshold = useMemo(() => {
    const now = new Date();
    if (timeRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime();
    }
    if (timeRange === '7days') {
      return now.getTime() - 7 * 24 * 60 * 60 * 1000;
    }
    if (timeRange === '30days') {
      return now.getTime() - 30 * 24 * 60 * 60 * 1000;
    }
    if (timeRange === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return startOfMonth.getTime();
    }
    return 0; // all time
  }, [timeRange]);

  // 5. ნივთებისა და სტატისტიკის გაერთიანება (Product Analytics Merging)
  const mergedList = useMemo(() => {
    const list = [];
    const matchedDocIds = new Set();

    // შეკვეთების განაწილება ნივთების მიხედვით
    const ordersByProduct = {};
    (inquiries || []).forEach((inq) => {
      const inqTime = parseDate(inq.createdAt || inq.timestamp || inq.date)?.getTime() || 0;
      if (timeThreshold > 0 && inqTime < timeThreshold) return;

      if (inq.items && Array.isArray(inq.items)) {
        inq.items.forEach((it) => {
          const key = it.sku || it.id;
          if (key) ordersByProduct[key] = (ordersByProduct[key] || 0) + 1;
        });
      } else if (inq.sku) {
        ordersByProduct[inq.sku] = (ordersByProduct[inq.sku] || 0) + 1;
      }
    });

    (products || []).forEach((p) => {
      const pid = String(p.id || '').trim();
      const psku = String(p.sku || '').trim();

      let stat = statsMap[pid];
      if (stat) {
        matchedDocIds.add(pid);
      } else if (psku && statsMap[psku]) {
        stat = statsMap[psku];
        matchedDocIds.add(psku);
      }

      const views = typeof stat?.views === 'number' ? stat.views : 0;
      const uniqueViews = typeof stat?.uniqueViews === 'number' ? stat.uniqueViews : 0;
      const favoritesCount = typeof stat?.favoritesCount === 'number' ? Math.max(0, stat.favoritesCount) : 0;
      const comparesCount = typeof stat?.comparesCount === 'number' ? stat.comparesCount : 0;
      const lastViewedAt = stat?.lastViewedAt || null;
      const dailyViews = stat?.dailyViews || {};

      const cleanPrice = parseFloat(String(p.price || '0').replace(/[^0-9.]/g, '')) || 0;
      const orderCount = ordersByProduct[psku] || ordersByProduct[pid] || 0;

      list.push({
        id: pid || psku,
        sku: psku,
        name: p.name || (lang === 'ka' ? 'უსახელო ნივთი' : 'Unnamed Item'),
        image: (p.images && p.images[0]) || p.imageUrl || '',
        price: p.price || '',
        priceNumeric: cleanPrice,
        category: p.category || '',
        views,
        uniqueViews,
        favoritesCount,
        comparesCount,
        ordersCount: orderCount,
        lastViewedAt,
        dailyViews,
        isDeleted: false,
        rawProduct: p,
      });
    });

    // წაშლილი ნივთები, რომელთა სტატისტიკაც დარჩა ბაზაში
    Object.keys(statsMap).forEach((docId) => {
      if (!matchedDocIds.has(docId)) {
        const stat = statsMap[docId];
        list.push({
          id: docId,
          sku: docId,
          name: `${t.deletedItem} (${docId})`,
          image: '',
          price: '-',
          priceNumeric: 0,
          category: '-',
          views: stat?.views || 0,
          uniqueViews: stat?.uniqueViews || 0,
          favoritesCount: stat?.favoritesCount || 0,
          comparesCount: stat?.comparesCount || 0,
          ordersCount: 0,
          lastViewedAt: stat?.lastViewedAt || null,
          dailyViews: stat?.dailyViews || {},
          isDeleted: true,
          rawProduct: null,
        });
      }
    });

    return list;
  }, [products, statsMap, inquiries, timeThreshold, lang]);

  // 6. მომხმარებელთა გამდიდრებული სია (User Enrichment with Inquiries)
  const enrichedUsers = useMemo(() => {
    const ordersByUserEmail = {};
    const revenueByUserEmail = {};

    (inquiries || []).forEach((inq) => {
      const email = (inq.clientEmail || '').toLowerCase().trim();
      if (!email) return;

      const priceVal = inq.totalPrice || (typeof inq.price === 'number' ? inq.price : parseFloat(String(inq.price || '0').replace(/[^0-9.]/g, ''))) || 0;
      ordersByUserEmail[email] = (ordersByUserEmail[email] || 0) + 1;
      revenueByUserEmail[email] = (revenueByUserEmail[email] || 0) + priceVal;
    });

    return (usersList || []).map((u) => {
      const email = (u.email || '').toLowerCase().trim();
      const count = ordersByUserEmail[email] || u.ordersCount || 0;
      const spent = revenueByUserEmail[email] || 0;
      const createdAtDate = parseDate(u.createdAt);
      const lastLoginDate = parseDate(u.lastLoginAt);

      return {
        ...u,
        email,
        displayName: u.displayName || (email ? email.split('@')[0] : (lang === 'ka' ? 'მომხმარებელი' : 'Customer')),
        ordersCount: count,
        totalSpent: spent,
        createdAtDate,
        lastLoginDate,
      };
    });
  }, [usersList, inquiries, lang]);

  // 7. გაფილტრული მომხმარებლები
  const filteredUsers = useMemo(() => {
    return enrichedUsers.filter((u) => {
      if (userProviderFilter === 'google' && u.provider !== 'google') return false;
      if (userProviderFilter === 'password' && u.provider === 'google') return false;
      if (userProviderFilter === 'ordered' && u.ordersCount === 0) return false;

      if (userSearchQuery.trim()) {
        const q = userSearchQuery.toLowerCase();
        const matchName = (u.displayName || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      return true;
    }).sort((a, b) => {
      const timeA = a.createdAtDate ? a.createdAtDate.getTime() : 0;
      const timeB = b.createdAtDate ? b.createdAtDate.getTime() : 0;
      return timeB - timeA;
    });
  }, [enrichedUsers, userSearchQuery, userProviderFilter]);

  // 8. შემაჯამებელი ციფრები (KPI Calculations)
  const summary = useMemo(() => {
    let totalViews = 0;
    let totalUnique = 0;
    let totalWishlists = 0;
    let itemsWithViews = 0;

    mergedList.forEach((item) => {
      totalViews += item.views;
      totalUnique += item.uniqueViews;
      totalWishlists += item.favoritesCount;
      if (item.views > 0) itemsWithViews += 1;
    });

    // Inquiries in current timeRange
    const filteredInquiries = (inquiries || []).filter((inq) => {
      const inqTime = parseDate(inq.createdAt || inq.timestamp || inq.date)?.getTime() || 0;
      if (timeThreshold > 0 && inqTime < timeThreshold) return false;
      return true;
    });

    let totalOrdersRev = 0;
    filteredInquiries.forEach((inq) => {
      const p = inq.totalPrice || (typeof inq.price === 'number' ? inq.price : parseFloat(String(inq.price || '0').replace(/[^0-9.]/g, ''))) || 0;
      totalOrdersRev += p;
    });

    // Conversion rate: (Orders / Unique Views) * 100
    const convRate = totalUnique > 0 ? ((filteredInquiries.length / totalUnique) * 100).toFixed(1) : '0.0';

    // Users stats:
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newUsersThisWeek = enrichedUsers.filter((u) => u.createdAtDate && u.createdAtDate.getTime() >= oneWeekAgo).length;

    // Top Wishlisted Products
    const topWishlisted = [...mergedList]
      .filter((item) => item.favoritesCount > 0)
      .sort((a, b) => b.favoritesCount - a.favoritesCount)
      .slice(0, 5);

    // Top 3 Most Viewed
    const top3Viewed = [...mergedList]
      .filter((item) => item.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, 3);

    return {
      totalViews,
      totalUnique,
      totalWishlists,
      itemsWithViews,
      totalItems: mergedList.length,
      ordersCount: filteredInquiries.length,
      ordersRevenue: totalOrdersRev,
      convRate,
      totalUsers: enrichedUsers.length,
      newUsersThisWeek,
      topWishlisted,
      top3Viewed,
    };
  }, [mergedList, inquiries, enrichedUsers, timeThreshold]);

  // 9. დღიური აქტივობის გრაფიკის მონაცემები (Trend Chart Buckets)
  const trendBuckets = useMemo(() => {
    const daysCount = timeRange === 'today' ? 1 : (timeRange === '7days' ? 7 : (timeRange === '30days' ? 30 : 14));
    const buckets = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const dayLabel = d.toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });

      // Daily views from all merged products
      let dayViews = 0;
      mergedList.forEach((prod) => {
        if (prod.dailyViews && typeof prod.dailyViews[dayKey] === 'number') {
          dayViews += prod.dailyViews[dayKey];
        }
      });

      // Daily orders from inquiries
      let dayOrders = 0;
      let dayRevenue = 0;
      (inquiries || []).forEach((inq) => {
        const inqDate = parseDate(inq.createdAt || inq.timestamp || inq.date);
        if (inqDate && inqDate.toISOString().slice(0, 10) === dayKey) {
          dayOrders += 1;
          const p = inq.totalPrice || (typeof inq.price === 'number' ? inq.price : parseFloat(String(inq.price || '0').replace(/[^0-9.]/g, ''))) || 0;
          dayRevenue += p;
        }
      });

      buckets.push({
        date: dayKey,
        label: dayLabel,
        views: dayViews,
        orders: dayOrders,
        revenue: dayRevenue,
      });
    }

    // Find peak activity day
    let peakBucket = buckets[0] || null;
    let maxMetric = -1;
    buckets.forEach((b) => {
      const metric = b.views + b.orders * 15;
      if (metric > maxMetric) {
        maxMetric = metric;
        peakBucket = b;
      }
    });

    const maxViews = Math.max(1, ...buckets.map((b) => b.views));
    const maxOrders = Math.max(1, ...buckets.map((b) => b.orders));

    return { buckets, peakBucket, maxViews, maxOrders };
  }, [mergedList, inquiries, timeRange, lang]);

  // 10. პროდუქციის გაფილტვრა და დალაგება
  const filteredAndSortedList = useMemo(() => {
    let result = mergedList.filter((item) => {
      if (filterMode === 'viewed' && item.views === 0) return false;
      if (filterMode === 'zero' && item.views > 0) return false;
      if (filterMode === 'favorited' && item.favoritesCount === 0) return false;

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
        const timeA = parseDate(valA)?.getTime() || 0;
        const timeB = parseDate(valB)?.getTime() || 0;
        return sortDir === 'asc' ? timeA - timeB : timeB - timeA;
      }

      if (sortField === 'price') {
        valA = a.priceNumeric || 0;
        valB = b.priceNumeric || 0;
        return sortDir === 'asc' ? valA - valB : valB - valA;
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

  // ცხრილის სორტირების გადართვა
  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'name' ? 'asc' : 'desc');
    }
  };

  // CSV ექსპორტის ფუნქცია
  const handleExportCsv = () => {
    const headers = ['SKU', 'დასახელება', 'კატეგორია', 'ფასი', 'სულ ნახვები', 'უნიკალური', 'რჩეულები', 'შედარებები', 'შეკვეთები'];
    const rows = mergedList.map((item) => [
      `"${item.sku || ''}"`,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${item.category || ''}"`,
      `"${item.price || ''}"`,
      item.views,
      item.uniqueViews,
      item.favoritesCount,
      item.comparesCount,
      item.ordersCount,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `matare_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // დროის ფორმატირება
  const formatTime = (ts) => {
    if (!ts) return t.neverViewed;
    const date = parseDate(ts);
    if (!date) return t.neverViewed;
    return date.toLocaleString(lang === 'ka' ? 'ka-GE' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* შეტყობინების ბანერი */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header, Refresh & CSV Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-serif text-xl sm:text-2xl font-medium tracking-wide">
              {t.title}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30">
              Live Analytics
            </span>
          </div>
          <p className="text-xs sm:text-sm opacity-60 mt-1">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {lastRefreshed && (
            <div className="text-xs opacity-50 flex items-center gap-1.5 hidden md:flex">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {t.lastRefreshedText}: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl border border-stone-700/60 hover:border-amber-500/60 text-stone-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.exportCsv}</span>
          </button>

          <button
            type="button"
            onClick={fetchAllData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t.refresh}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-stone-800 bg-[#121110] overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: t.tabOverview, icon: TrendingUp },
          { id: 'users', label: `${t.tabUsers} (${enrichedUsers.length})`, icon: Users },
          { id: 'wishlist', label: `${t.tabWishlist} (${summary.totalWishlists})`, icon: Heart },
          { id: 'products', label: `${t.tabProducts} (${mergedList.length})`, icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 shrink-0 transition-all ${
                isActive
                  ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Time Range Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-stone-800/60 bg-[#141210]/60">
        <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>{lang === 'ka' ? 'დროითი დიაპაზონი:' : 'Time Period:'}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'today', label: t.timeToday },
            { id: '7days', label: t.time7Days },
            { id: '30days', label: t.time30Days },
            { id: 'thisMonth', label: t.timeThisMonth },
            { id: 'all', label: t.timeAll },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setTimeRange(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === r.id
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 border border-transparent'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Primary Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Users className="w-3.5 h-3.5" />
            <span>
              {summary.totalUnique.toLocaleString()} {t.totalUnique}
            </span>
          </div>
        </div>

        {/* Card 2: Registered Users */}
        <div
          onClick={() => setActiveSubTab('users')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-amber-500/40 ${
            darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {t.totalUsers}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif tracking-tight text-blue-400">
            {summary.totalUsers}
          </div>
          <div className="text-xs opacity-60 mt-2 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>+{summary.newUsersThisWeek} {t.newUsersWeek}</span>
          </div>
        </div>

        {/* Card 3: Wishlists & Compares */}
        <div
          onClick={() => setActiveSubTab('wishlist')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-red-500/40 ${
            darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {t.totalWishlists}
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif tracking-tight text-red-400">
            {summary.totalWishlists.toLocaleString()}
          </div>
          <div className="text-xs opacity-60 mt-2 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-red-400" />
            <span>
              {summary.topWishlisted[0]?.name || (lang === 'ka' ? 'რჩეული მოდელები' : 'Favorited pieces')}
            </span>
          </div>
        </div>

        {/* Card 4: Orders & Inquiries Volume */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {t.totalOrders}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif tracking-tight text-emerald-400">
            {summary.ordersCount}
          </div>
          <div className="text-xs opacity-60 mt-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {summary.ordersRevenue > 0 ? `${summary.ordersRevenue.toLocaleString()} ₾` : '0 ₾'} • {summary.convRate}% კონვერსია
            </span>
          </div>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW & TRENDS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Trend Chart (Daily Activity) */}
          <div
            className={`p-5 sm:p-6 rounded-3xl border transition-all ${
              darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-800/60">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif text-lg font-medium tracking-wide">
                    {t.trendChartTitle}
                  </h3>
                </div>
                <p className="text-xs opacity-60 mt-0.5">
                  {t.trendChartSubtitle}
                </p>
              </div>

              {trendBuckets.peakBucket && (
                <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {t.peakDay}: {trendBuckets.peakBucket.label} ({trendBuckets.peakBucket.views} {lang === 'ka' ? 'ნახვა' : 'views'}, {trendBuckets.peakBucket.orders} {lang === 'ka' ? 'შეკვეთა' : 'orders'})
                  </span>
                </div>
              )}
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-3">
              <div className="h-52 flex items-end gap-2 sm:gap-4 pt-6 pb-2 overflow-x-auto scrollbar-none">
                {trendBuckets.buckets.map((b) => {
                  const viewHeight = Math.max(8, Math.round((b.views / trendBuckets.maxViews) * 160));
                  const orderHeight = Math.max(6, Math.round((b.orders / trendBuckets.maxOrders) * 140));

                  return (
                    <div key={b.date} className="flex-1 min-w-[36px] sm:min-w-[48px] flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-xl bg-black/95 text-white text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 border border-stone-700 shadow-xl">
                        <div className="font-semibold text-amber-400">{b.label}</div>
                        <div>👁️ {b.views} • 🛍️ {b.orders} ({b.revenue > 0 ? `${b.revenue}₾` : '0₾'})</div>
                      </div>

                      {/* Bars pair */}
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                        {/* Views Bar */}
                        <div
                          style={{ height: `${viewHeight}px` }}
                          className="w-2.5 sm:w-3.5 rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 group-hover:brightness-125 transition-all shadow-sm"
                          title={`${b.label}: ${b.views} views`}
                        />
                        {/* Orders Bar */}
                        <div
                          style={{ height: `${b.orders > 0 ? orderHeight : 4}px` }}
                          className={`w-2.5 sm:w-3.5 rounded-t-lg transition-all shadow-sm ${
                            b.orders > 0
                              ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:brightness-125'
                              : 'bg-stone-800'
                          }`}
                          title={`${b.label}: ${b.orders} orders`}
                        />
                      </div>

                      {/* Label below bar */}
                      <span className="text-[10px] opacity-60 mt-2 truncate max-w-full font-mono">
                        {b.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-3 text-xs opacity-75 border-t border-stone-800/40">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>{lang === 'ka' ? 'პროდუქციის ნახვები' : 'Product Views'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span>{lang === 'ka' ? 'შესრულებული შეკვეთები' : 'Orders & Inquiries'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Dual Cards: Top 3 Viewed & Top 3 Wishlisted */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Viewed */}
            <div
              className={`p-5 rounded-2xl border ${
                darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h4 className="font-serif text-base font-medium">{t.top3Title}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('products')}
                  className="text-xs text-amber-500 hover:underline flex items-center gap-1"
                >
                  <span>{lang === 'ka' ? 'ყველას ნახვა' : 'View all'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {summary.top3Viewed.map((item, idx) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-stone-900/40 border border-stone-800/50 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm shrink-0">{medals[idx]}</span>
                        {item.image ? (
                          <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-stone-800" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 opacity-40" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-[11px] opacity-50 font-mono">{item.price}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-amber-500 shrink-0">
                        {item.views} {lang === 'ka' ? 'ნახვა' : 'views'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Wishlisted */}
            <div
              className={`p-5 rounded-2xl border ${
                darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <h4 className="font-serif text-base font-medium">{t.wishlistTopTitle}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('wishlist')}
                  className="text-xs text-red-400 hover:underline flex items-center gap-1"
                >
                  <span>{lang === 'ka' ? 'სრული რეიტინგი' : 'Full list'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {summary.topWishlisted.length === 0 ? (
                  <p className="text-xs opacity-50 py-6 text-center">{t.wishlistEmpty}</p>
                ) : (
                  summary.topWishlisted.slice(0, 3).map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-stone-900/40 border border-stone-800/50 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono font-bold text-amber-500 text-xs w-4">#{idx + 1}</span>
                        {item.image ? (
                          <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-stone-800" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 opacity-40" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-[11px] opacity-50 font-mono">{item.price}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-red-400 shrink-0 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-red-400" />
                        <span>{item.favoritesCount}</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: REGISTERED USERS */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* User Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder={t.userSearchPlaceholder}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                  darkMode
                    ? 'bg-[#141210] border-stone-800 text-white placeholder-stone-500 focus:border-amber-500'
                    : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 p-1 rounded-xl border border-stone-800 bg-[#141210] self-start sm:self-auto">
                {[
                  { id: 'all', label: `${lang === 'ka' ? 'ყველა' : 'All'} (${enrichedUsers.length})` },
                  { id: 'google', label: 'Google' },
                  { id: 'password', label: lang === 'ka' ? 'ელ.ფოსტა' : 'Email' },
                  { id: 'ordered', label: `${lang === 'ka' ? 'შემკვეთები' : 'Buyers'}` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setUserProviderFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      userProviderFilter === f.id
                        ? 'bg-blue-500 text-white font-semibold shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSyncAllAuthUsers}
                disabled={syncingUsers}
                className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                title={lang === 'ka' ? 'Firebase Auth-ის მომხმარებელთა სრული სინქრონიზაცია' : 'Full sync from Firebase Auth'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingUsers ? 'animate-spin' : ''}`} />
                <span>{lang === 'ka' ? 'სრული იმპორტი' : 'Sync All'}</span>
              </button>
            </div>
          </div>

          {/* Registered Users Table */}
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
                    <th className="py-3.5 px-4">{lang === 'ka' ? 'მომხმარებელი' : 'User'}</th>
                    <th className="py-3.5 px-4">{lang === 'ka' ? 'ელ.ფოსტა' : 'Email'}</th>
                    <th className="py-3.5 px-4">{lang === 'ka' ? 'მეთოდი' : 'Auth'}</th>
                    <th className="py-3.5 px-4">{lang === 'ka' ? 'რეგისტრაციის თარიღი' : 'Joined'}</th>
                    <th className="py-3.5 px-4">{lang === 'ka' ? 'ბოლო ვიზიტი' : 'Last Active'}</th>
                    <th className="py-3.5 px-4 text-right">{lang === 'ka' ? 'შეკვეთები' : 'Orders'}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-800/40">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center opacity-50 text-xs">
                        {lang === 'ka'
                          ? 'რეგისტრირებული მომხმარებლები ჯერ არ არის ან ძიების შედეგი ცარიელია'
                          : 'No registered users found'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isGoogle = u.provider === 'google';
                      return (
                        <tr
                          key={u.id}
                          className={`transition-colors ${
                            darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-stone-50'
                          }`}
                        >
                          {/* User Avatar & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {u.photoURL ? (
                                <img
                                  src={u.photoURL}
                                  alt=""
                                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-stone-700/60"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                                  {(u.displayName || u.email || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium truncate">{u.displayName}</p>
                                <p className="text-[11px] opacity-50 font-mono truncate">{u.uid}</p>
                              </div>
                            </div>
                          </td>

                          {/* Email & Copy */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              <span className="truncate">{u.email}</span>
                              {u.email && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(u.email);
                                    setCopiedEmail(u.id);
                                    setTimeout(() => setCopiedEmail(null), 2000);
                                  }}
                                  title={lang === 'ka' ? 'დაკოპირება' : 'Copy email'}
                                  className="text-stone-400 hover:text-amber-400"
                                >
                                  {copiedEmail === u.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Auth Method */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                                isGoogle
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                  : 'bg-stone-800 text-stone-300 border-stone-700'
                              }`}
                            >
                              <span>{isGoogle ? '🌐 Google' : '🔑 Email'}</span>
                            </span>
                          </td>

                          {/* Registration Date */}
                          <td className="py-3 px-4 text-xs opacity-75">
                            {formatTime(u.createdAtDate)}
                          </td>

                          {/* Last Active Date */}
                          <td className="py-3 px-4 text-xs opacity-75">
                            {formatTime(u.lastLoginDate)}
                          </td>

                          {/* Orders & Total Spent */}
                          <td className="py-3 px-4 text-right">
                            <div className="font-mono">
                              <span className={`font-bold ${u.ordersCount > 0 ? 'text-emerald-400' : 'opacity-40'}`}>
                                {u.ordersCount} {lang === 'ka' ? 'შეკვეთა' : 'orders'}
                              </span>
                              {u.totalSpent > 0 && (
                                <div className="text-[11px] text-amber-500 font-semibold">
                                  {u.totalSpent.toLocaleString()} ₾
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: WISHLIST & DEMAND */}
      {activeSubTab === 'wishlist' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-red-400 shrink-0 fill-red-400/30" />
              <span>
                {lang === 'ka'
                  ? `მომხმარებლების მიერ რჩეულებში შენახულია ჯამში ${summary.totalWishlists} სამკაული`
                  : `Total ${summary.totalWishlists} items currently saved in customer wishlists`}
              </span>
            </div>
          </div>

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
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">{t.colItem}</th>
                    <th className="py-3.5 px-4">{t.colPrice}</th>
                    <th className="py-3.5 px-4 text-center">❤️ {t.colWishlist}</th>
                    <th className="py-3.5 px-4 text-center">🔄 {t.colCompares}</th>
                    <th className="py-3.5 px-4 text-center">👁️ {t.colViews}</th>
                    <th className="py-3.5 px-4 text-right">{t.colActions}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-800/40">
                  {summary.topWishlisted.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center opacity-50 text-xs">
                        {t.wishlistEmpty}
                      </td>
                    </tr>
                  ) : (
                    summary.topWishlisted.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-stone-50'
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-mono font-bold text-amber-500">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-800" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 opacity-40" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-xs opacity-50 font-mono">SKU: {item.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-serif text-amber-500 font-semibold">
                          {item.price}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-red-400 text-sm">
                          {item.favoritesCount}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-stone-300">
                          {item.comparesCount}
                        </td>
                        <td className="py-3 px-4 text-center font-mono opacity-80">
                          {item.views}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`/product/${encodeURIComponent(item.sku || item.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-stone-400 hover:text-amber-500 transition-colors inline-block"
                            title={t.openStore}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: PRODUCTS FULL ANALYTICS TABLE */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

            <div className="flex items-center gap-1.5 p-1 rounded-xl border border-stone-800 bg-[#141210] self-start sm:self-auto">
              {[
                { id: 'all', label: `${t.filterAll} (${mergedList.length})` },
                { id: 'viewed', label: `${t.filterViewed} (${summary.itemsWithViews})` },
                { id: 'favorited', label: `${t.filterFavorited} (${summary.topWishlisted.length})` },
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
                    <th onClick={() => handleSortToggle('name')} className="py-3.5 px-4 cursor-pointer hover:text-amber-500 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>{t.colItem}</span>
                        {sortField === 'name' ? (
                          sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th onClick={() => handleSortToggle('price')} className="py-3.5 px-4 cursor-pointer hover:text-amber-500 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>{t.colPrice}</span>
                        {sortField === 'price' ? (
                          sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th onClick={() => handleSortToggle('views')} className="py-3.5 px-4 cursor-pointer hover:text-amber-500 select-none text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{t.colViews}</span>
                        {sortField === 'views' ? (
                          sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th onClick={() => handleSortToggle('uniqueViews')} className="py-3.5 px-4 cursor-pointer hover:text-amber-500 select-none text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{t.colUnique}</span>
                        {sortField === 'uniqueViews' ? (
                          sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th onClick={() => handleSortToggle('favoritesCount')} className="py-3.5 px-4 cursor-pointer hover:text-amber-500 select-none text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>❤️ {t.colWishlist}</span>
                        {sortField === 'favoritesCount' ? (
                          sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th onClick={() => handleSortToggle('ordersCount')} className="py-3.5 px-4 cursor-pointer hover:text-amber-500 select-none text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span>🛍️ {t.colOrders}</span>
                        {sortField === 'ordersCount' ? (
                          sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th onClick={() => handleSortToggle('lastViewedAt')} className="py-3.5 px-4 cursor-pointer hover:text-amber-500 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>{t.colLastViewed}</span>
                        {sortField === 'lastViewedAt' ? (
                          sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th className="py-3.5 px-4 text-right">
                      <span>{t.colActions}</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-800/40">
                  {filteredAndSortedList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center opacity-50 text-xs">
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
                                {item.category && item.category !== '-' && <span>• {item.category}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price Cell */}
                        <td className="py-3 px-4 font-serif text-amber-500 font-semibold whitespace-nowrap">
                          {item.price}
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

                        {/* Wishlist Cell */}
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={item.favoritesCount > 0 ? 'text-red-400 font-bold' : 'opacity-30'}>
                            {item.favoritesCount}
                          </span>
                        </td>

                        {/* Orders Cell */}
                        <td className="py-3 px-4 text-center font-mono">
                          <span className={item.ordersCount > 0 ? 'text-emerald-400 font-bold' : 'opacity-30'}>
                            {item.ordersCount}
                          </span>
                        </td>

                        {/* Last Viewed Cell */}
                        <td className="py-3 px-4 text-xs opacity-75 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 opacity-40" />
                            <span>{formatTime(item.lastViewedAt)}</span>
                          </div>
                        </td>

                        {/* Action Cell */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
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
      )}
    </div>
  );
}

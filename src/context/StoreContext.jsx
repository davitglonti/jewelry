import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts';
import { DEFAULT_ARTICLES } from '../data/defaultArticles';

export const StoreContext = createContext();

const KEYS = {
  settings: "aurelia_settings_v2",
  products: "aurelia_products_v2",
  favs: "aurelia_favs_v2",
  inquiries: "aurelia_inquiries_v2",
  articles: "aurelia_articles_v1",
  compare: "aurelia_compare_v1",
};

const FIRESTORE_PROJECT_ID = "jewelry-4fdb3";
const REST_BASE = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents`;

// Firestore REST API ობიექტების მსუბუქი პარსერი (არ მოითხოვს მძიმე Firebase SDK-ს ჩატვირთვას)
export function parseFirestoreFields(fields) {
  if (!fields) return {};
  const res = {};
  for (const key of Object.keys(fields)) {
    const val = fields[key];
    if ('stringValue' in val) res[key] = val.stringValue;
    else if ('integerValue' in val) res[key] = parseInt(val.integerValue, 10);
    else if ('doubleValue' in val) res[key] = parseFloat(val.doubleValue);
    else if ('booleanValue' in val) res[key] = val.booleanValue;
    else if ('nullValue' in val) res[key] = null;
    else if ('arrayValue' in val) {
      res[key] = (val.arrayValue.values || []).map(v => {
        if ('stringValue' in v) return v.stringValue;
        if ('mapValue' in v) return parseFirestoreFields(v.mapValue.fields);
        return v;
      });
    }
    else if ('mapValue' in val) res[key] = parseFirestoreFields(val.mapValue.fields);
  }
  return res;
}

export const sortNewestFirst = (list) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const getTimestamp = (item) => {
      if (item.createdAt && typeof item.createdAt === 'number') return item.createdAt;
      if (typeof item.id === 'string' && item.id.startsWith('item-')) {
        const num = parseInt(item.id.replace('item-', ''), 10);
        if (!isNaN(num) && num > 1000000) return num;
      }
      if (typeof item.id === 'string' && item.id.startsWith('art-')) {
        const num = parseInt(item.id.replace('art-', ''), 10);
        if (!isNaN(num) && num > 1000000) return num;
      }
      return 0;
    };
    const tA = getTimestamp(a);
    const tB = getTimestamp(b);
    if (tA !== tB) return tB - tA; // უახლესი პირველ ადგილზე
    return 0;
  });
};

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export function StoreProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState("ka");

  const [siteSettings, setSiteSettings] = useState(() => {
    const cached = readCache(KEYS.settings);
    return cached ? { ...DEFAULT_SETTINGS, ...cached } : DEFAULT_SETTINGS;
  });
  const [products, setProducts] = useState(() => sortNewestFirst(readCache(KEYS.products) || DEFAULT_PRODUCTS));
  const [articles, setArticles] = useState(() => readCache(KEYS.articles) || DEFAULT_ARTICLES);
  const [favorites, setFavorites] = useState(() => readCache(KEYS.favs) || []);
  const [compareList, setCompareList] = useState(() => readCache(KEYS.compare) || []);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [inquiries, setInquiries] = useState(() => readCache(KEYS.inquiries) || []);
  const [saveMessage, setSaveMessage] = useState("");

  const [settingsLoaded, setSettingsLoaded] = useState(true);

  // თემის დამახსოვრება
  useEffect(() => {
    const savedTheme = localStorage.getItem("aurelia_theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("aurelia_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // ენის დამახსოვრება
  useEffect(() => {
    const savedLang = localStorage.getItem("aurelia_lang");
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("aurelia_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  // 🌟 საიტის ლოგოდან / ფავიკონიდან Favicon-ის დინამიური სინქრონიზაცია
  useEffect(() => {
    const icon = (siteSettings?.faviconUrl || siteSettings?.logoUrl || '').trim();
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }

    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleIcon);
    }

    if (icon) {
      favicon.setAttribute('href', icon);
      appleIcon.setAttribute('href', icon);
    } else {
      favicon.setAttribute('href', '/logo.svg');
      appleIcon.setAttribute('href', '/logo.svg');
    }
  }, [siteSettings?.faviconUrl, siteSettings?.logoUrl]);

  // 🚀 Firebase მონაცემების ჩატვირთვა
  useEffect(() => {
    const isAdmin = window.location.pathname.startsWith("/admin");

    // 1. თუ მომხმარებელი არის ადმინ პანელში, ჩავტვირთოთ რეალურ დროში (onSnapshot)
    if (isAdmin) {
      let unsubSettings = () => {};
      let unsubProducts = () => {};
      let unsubArticles = () => {};

      import('../lib/firebase').then(async ({ db }) => {
        if (!db) return;
        const { doc, onSnapshot, collection } = await import('firebase/firestore');

        // პარამეტრების რეალურ დროში მოსმენა
        unsubSettings = onSnapshot(
          doc(db, "aurelia", "storeData"),
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.settings) {
                setSiteSettings({ ...DEFAULT_SETTINGS, ...data.settings });
                writeCache(KEYS.settings, data.settings);
              }
              if (data.inquiries) setInquiries(data.inquiries);
            }
          },
          (error) => console.error("Firebase storeData შეცდომა:", error)
        );

        // პროდუქტების რეალურ დროში მოსმენა
        unsubProducts = onSnapshot(
          collection(db, "products"),
          (colSnap) => {
            if (!colSnap.empty) {
              const list = colSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
              const sorted = sortNewestFirst(list);
              setProducts(sorted);
              writeCache(KEYS.products, sorted);
            }
          },
          (error) => console.error("Firebase products შეცდომა:", error)
        );

        // სტატიების რეალურ დროში მოსმენა
        unsubArticles = onSnapshot(
          collection(db, "articles"),
          (colSnap) => {
            if (!colSnap.empty) {
              const list = colSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
              setArticles(list);
              writeCache(KEYS.articles, list);
            }
          },
          (error) => console.error("Firebase articles შეცდომა:", error)
        );
      });

      return () => {
        unsubSettings();
        unsubProducts();
        unsubArticles();
      };
    }

    // 2. ჩვეულებრივი მომხმარებლისთვის ვიყენებთ მსუბუქ ასინქრონულ REST ფეჩს
    // არ ვტვირთავთ მძიმე Firebase SDK-ს (476 KB) და არ ვხსნით Listen/channel (2.9 MB) სტრიმინგს მთავარ გვერდზე!
    let isMounted = true;
    let cancelTimer = null;

    const runPublicSync = async () => {
      if (!isMounted) return;
      try {
        const [storeRes, prodRes, artRes] = await Promise.all([
          fetch(`${REST_BASE}/aurelia/storeData`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${REST_BASE}/products`).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${REST_BASE}/articles`).then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        if (!isMounted) return;

        if (storeRes && storeRes.fields) {
          const data = parseFirestoreFields(storeRes.fields);
          if (data.settings) {
            setSiteSettings({ ...DEFAULT_SETTINGS, ...data.settings });
            writeCache(KEYS.settings, data.settings);
          }
          if (data.inquiries) setInquiries(data.inquiries);
        }

        if (prodRes && prodRes.documents && prodRes.documents.length > 0) {
          const list = prodRes.documents.map((d) => ({
            id: d.name.split('/').pop(),
            ...parseFirestoreFields(d.fields)
          }));
          const sorted = sortNewestFirst(list);
          setProducts(sorted);
          writeCache(KEYS.products, sorted);
        }

        if (artRes && artRes.documents && artRes.documents.length > 0) {
          const artList = artRes.documents.map((d) => ({
            id: d.name.split('/').pop(),
            ...parseFirestoreFields(d.fields)
          }));
          setArticles(artList);
          writeCache(KEYS.articles, artList);
        }
      } catch (err) {
        console.warn("Public background sync skipped:", err);
      }
    };

    // 🚀 სინქრონიზაცია ეშვება მხოლოდ მას შემდეგ, რაც გვერდი სრულად ჩაიტვირთება და ბრაუზერი თავისუფალია (Idle)
    // ეს უზრუნველყოფს, რომ LCP და FCP-ს დროს ქსელი არ დაიტვირთოს და მობილურზე მაქსიმალური სისწრაფე (95+) შენარჩუნდეს.
    const scheduleSync = () => {
      if ('requestIdleCallback' in window) {
        cancelTimer = window.requestIdleCallback(() => runPublicSync(), { timeout: 5000 });
      } else {
        cancelTimer = setTimeout(runPublicSync, 4000);
      }
    };

    if (document.readyState === 'complete') {
      scheduleSync();
    } else {
      window.addEventListener('load', scheduleSync, { once: true });
    }

    return () => {
      isMounted = false;
      if (cancelTimer) {
        if ('cancelIdleCallback' in window && typeof cancelTimer === 'number') {
          window.cancelIdleCallback(cancelTimer);
        } else {
          clearTimeout(cancelTimer);
        }
      }
    };
  }, []);

  // მონაცემების შენახვა (Firebase + LocalStorage)
  const syncData = async (newSettings, newProducts, newInquiries = inquiries) => {
    const sortedProducts = sortNewestFirst(newProducts);
    setProducts(sortedProducts);
    writeCache(KEYS.settings, newSettings);
    writeCache(KEYS.products, sortedProducts);
    writeCache(KEYS.inquiries, newInquiries);

    try {
      const [{ db }, { doc, setDoc, deleteDoc, getDocs, collection }] = await Promise.all([
        import('../lib/firebase'),
        import('firebase/firestore')
      ]);

      if (db) {
        // 1. პარამეტრების და მოთხოვნების შენახვა
        await setDoc(doc(db, "aurelia", "storeData"), {
          settings: newSettings,
          inquiries: newInquiries,
          updatedAt: new Date().toISOString(),
        });

        // 2. თითოეული პროდუქტის შენახვა ცალკე დოკუმენტად products კოლექციაში
        const savePromises = sortedProducts.map((p) => {
          const cleanProduct = {
            ...p,
            createdAt: p.createdAt || (typeof p.id === 'string' && p.id.startsWith('item-') ? parseInt(p.id.replace('item-', ''), 10) || Date.now() : Date.now())
          };
          return setDoc(doc(db, "products", p.id), cleanProduct);
        });
        await Promise.all(savePromises);

        // 3. თუ რომელიმე პროდუქტი წაიშალა სიიდან, წავშალოთ Firestore-იდანაც
        try {
          const existingDocs = await getDocs(collection(db, "products"));
          const currentIds = new Set(sortedProducts.map((p) => p.id));
          const deletePromises = [];
          existingDocs.forEach((d) => {
            if (!currentIds.has(d.id)) {
              deletePromises.push(deleteDoc(doc(db, "products", d.id)));
            }
          });
          if (deletePromises.length > 0) {
            await Promise.all(deletePromises);
          }
        } catch (delErr) {
          console.warn("წაშლილი პროდუქტების გასუფთავების შეცდომა:", delErr);
        }

        setSaveMessage("ყველა ცვლილება წარმატებით შეინახა!");
      } else {
        setSaveMessage("შენახულია ლოკალურად (ოფლაინ)");
      }
    } catch (err) {
      console.error("Firebase შენახვის შეცდომა:", err);
      setSaveMessage("შეცდომა: " + (err.message || "ვერ შეინახა ბაზაში"));
    }

    setTimeout(() => setSaveMessage(""), 3000);
  };

  // სტატიების შენახვა
  const syncArticles = async (newArticles) => {
    setArticles(newArticles);
    writeCache(KEYS.articles, newArticles);

    try {
      const [{ db }, { doc, setDoc, deleteDoc, getDocs, collection }] = await Promise.all([
        import('../lib/firebase'),
        import('firebase/firestore')
      ]);

      if (db) {
        const savePromises = newArticles.map((art) => {
          return setDoc(doc(db, "articles", art.id || ("art-" + Date.now())), art);
        });
        await Promise.all(savePromises);

        try {
          const existingDocs = await getDocs(collection(db, "articles"));
          const currentIds = new Set(newArticles.map((a) => a.id));
          const deletePromises = [];
          existingDocs.forEach((d) => {
            if (!currentIds.has(d.id)) {
              deletePromises.push(deleteDoc(doc(db, "articles", d.id)));
            }
          });
          if (deletePromises.length > 0) {
            await Promise.all(deletePromises);
          }
        } catch (delErr) {
          console.warn("სტატიების გასუფთავების შეცდომა:", delErr);
        }

        setSaveMessage("სტატიები წარმატებით შეინახა!");
      } else {
        setSaveMessage("შენახულია ლოკალურად (ოფლაინ)");
      }
    } catch (err) {
      console.error("სტატიების შენახვის შეცდომა:", err);
      setSaveMessage("შეცდომა: " + (err.message || "ვერ შეინახა სტატიები"));
    }

    setTimeout(() => setSaveMessage(""), 3000);
  };

  // ფავორიტებში დამატება/წაშლა
  const toggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(updated);
    writeCache(KEYS.favs, updated);
  };

  // სამკაულების შედარებაში დამატება/წაშლა (მაქს. 4 ნივთი)
  const toggleCompare = (id) => {
    setCompareList((prev) => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) {
          updated = [...prev.slice(1), id];
        } else {
          updated = [...prev, id];
        }
      }
      writeCache(KEYS.compare, updated);
      return updated;
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    writeCache(KEYS.compare, []);
  };

  return (
    <StoreContext.Provider
      value={{
        darkMode, setDarkMode,
        lang, setLang,
        siteSettings, setSiteSettings,
        settingsLoaded,
        products, setProducts,
        articles, setArticles, syncArticles,
        favorites, toggleFavorite,
        compareList, toggleCompare, clearCompare,
        showCompareModal, setShowCompareModal,
        inquiries, setInquiries,
        saveMessage,
        syncData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);

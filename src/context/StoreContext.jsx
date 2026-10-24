import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts';

const StoreContext = createContext();

const KEYS = {
  settings: "aurelia_settings_v2",
  products: "aurelia_products_v2",
  favs: "aurelia_favs_v2",
  inquiries: "aurelia_inquiries_v2",
};

export const sortNewestFirst = (list) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const getTimestamp = (item) => {
      if (item.createdAt && typeof item.createdAt === 'number') return item.createdAt;
      if (typeof item.id === 'string' && item.id.startsWith('item-')) {
        const num = parseInt(item.id.replace('item-', ''), 10);
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
  const [favorites, setFavorites] = useState(() => readCache(KEYS.favs) || []);
  const [inquiries, setInquiries] = useState(() => readCache(KEYS.inquiries) || []);
  const [saveMessage, setSaveMessage] = useState("");

  const [settingsLoaded, setSettingsLoaded] = useState(true);

  // Favicon: იგივე logoUrl, რაც საიტზე ლოგოდ ჩანს
  useEffect(() => {
    const iconUrl = siteSettings.logoUrl;
    if (!iconUrl) return;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    const match = iconUrl.match(/^data:(image\/[a-zA-Z+.-]+);/);
    if (match) link.type = match[1];
    else link.removeAttribute("type");

    link.href = iconUrl;
  }, [siteSettings.logoUrl]);

  // გვერდის სათაური მისამართის მიხედვით (/product/:sku მხარდაჭერით)
  useEffect(() => {
    const updateTitle = () => {
      const brand = siteSettings.brandName || "მატარე";
      const en = lang === "en";
      const path = window.location.pathname;

      if (path.startsWith("/admin")) {
        document.title = `${en ? "Admin Panel" : "ადმინ პანელი"} — ${brand}`;
      } else if (path.startsWith("/about")) {
        document.title = `${en ? "About Us" : "ჩვენს შესახებ"} — ${brand}`;
      } else if (path.startsWith("/product/")) {
        const rawCode = path.replace("/product/", "").replace(/\/+$/, "");
        const code = decodeURIComponent(rawCode);
        const product = code
          ? products.find((p) =>
              [p.sku, p.id].some(
                (v) => v?.toString().toLowerCase() === code.toLowerCase()
              )
            )
          : null;

        if (product) {
          const name = en && product.nameEn ? product.nameEn : product.name;
          document.title = `${name} — ${brand}`;
        } else {
          document.title = siteSettings.browserTitle || `${brand} — საიუველირო სახლი`;
        }
      } else {
        document.title = siteSettings.browserTitle || `${brand} — საიუველირო სახლი`;
      }
    };

    updateTitle();
    window.addEventListener("urlchange", updateTitle);
    window.addEventListener("popstate", updateTitle);
    return () => {
      window.removeEventListener("urlchange", updateTitle);
      window.removeEventListener("popstate", updateTitle);
    };
  }, [siteSettings, products, lang]);

  // Firebase-იდან ჩატვირთვა
  useEffect(() => {
    // 1. ადმინ პანელში ვიყენებთ real-time onSnapshot-ს (პარამეტრებზეც და პროდუქტების კოლექციაზეც)
    if (window.location.pathname.startsWith("/admin")) {
      let unsubSettings = () => {};
      let unsubProducts = () => {};
      Promise.all([
        import('../lib/firebase'),
        import('firebase/firestore')
      ]).then(([{ db }, { onSnapshot, doc, collection }]) => {
        if (!db) return;
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
      });

      return () => {
        unsubSettings();
        unsubProducts();
      };
    }

    // 2. ჩვეულებრივი მომხმარებლისთვის ვიყენებთ ასინქრონულ ჩატვირთვას (რათა გვერდის გახსნა არ დააყოვნოს)
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const [{ db }, { getDoc, getDocs, doc, collection }] = await Promise.all([
          import('../lib/firebase'),
          import('firebase/firestore')
        ]);
        if (!db || !isMounted) return;

        const [docSnap, colSnap] = await Promise.all([
          getDoc(doc(db, "aurelia", "storeData")),
          getDocs(collection(db, "products"))
        ]);
        if (!isMounted) return;

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.settings) {
            setSiteSettings({ ...DEFAULT_SETTINGS, ...data.settings });
            writeCache(KEYS.settings, data.settings);
          }
          if (data.inquiries) setInquiries(data.inquiries);
        }

        if (!colSnap.empty) {
          const list = colSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          const sorted = sortNewestFirst(list);
          setProducts(sorted);
          writeCache(KEYS.products, sorted);
        } else if (docSnap.exists() && docSnap.data()?.products?.length > 0) {
          const sorted = sortNewestFirst(docSnap.data().products);
          setProducts(sorted);
          writeCache(KEYS.products, sorted);
        }
      } catch (err) {
        console.error("Firebase ჩატვირთვის შეცდომა:", err);
      }
    }, 1200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
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
          console.warn("წაშლილი დოკუმენტების გასუფთავების შეცდომა:", delErr);
        }
      }

      setSaveMessage(lang === "ka" ? "ცვლილებები შენახულია!" : "Changes saved!");
    } catch (e) {
      console.error("Firebase შენახვის შეცდომა:", e);
      setSaveMessage(lang === "ka" ? "შეცდომა შენახვისას! სცადეთ ხელახლა." : "Save error! Please try again.");
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

  return (
    <StoreContext.Provider
      value={{
        darkMode, setDarkMode,
        lang, setLang,
        siteSettings, setSiteSettings,
        settingsLoaded,
        products, setProducts,
        favorites, toggleFavorite,
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

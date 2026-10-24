import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts';

const StoreContext = createContext();

const KEYS = {
  settings: "aurelia_settings_v2",
  products: "aurelia_products_v2",
  favs: "aurelia_favs_v2",
  inquiries: "aurelia_inquiries_v2",
};

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const writeCache = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
};

export function StoreProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState("ka");

  const [siteSettings, setSiteSettings] = useState(() => {
    const cached = readCache(KEYS.settings);
    return cached ? { ...DEFAULT_SETTINGS, ...cached } : DEFAULT_SETTINGS;
  });
  const [products, setProducts] = useState(() => readCache(KEYS.products) || DEFAULT_PRODUCTS);
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
    if (!db) return;

    // ადმინ პანელში ვიყენებთ real-time onSnapshot-ს
    if (window.location.pathname.startsWith("/admin")) {
      let unsub = () => {};
      import('firebase/firestore').then(({ onSnapshot, doc }) => {
        unsub = onSnapshot(
          doc(db, "aurelia", "storeData"),
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.settings) {
                setSiteSettings({ ...DEFAULT_SETTINGS, ...data.settings });
                writeCache(KEYS.settings, data.settings);
              }
              if (data.products) {
                setProducts(data.products);
                writeCache(KEYS.products, data.products);
              }
              if (data.inquiries) setInquiries(data.inquiries);
            }
          },
          (error) => {
            console.error("Firebase ჩატვირთვის შეცდომა:", error);
          }
        );
      });
      return () => unsub();
    }

    // ჩვეულებრივი მომხმარებლისთვის ვიყენებთ ერთჯერად getDoc-ს, რათა არ დაკიდოს კავშირი
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const docSnap = await getDoc(doc(db, "aurelia", "storeData"));
        if (!isMounted) return;
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.settings) {
            setSiteSettings({ ...DEFAULT_SETTINGS, ...data.settings });
            writeCache(KEYS.settings, data.settings);
          }
          if (data.products) {
            setProducts(data.products);
            writeCache(KEYS.products, data.products);
          }
          if (data.inquiries) setInquiries(data.inquiries);
        }
      } catch (err) {
        console.error("Firebase ჩატვირთვის შეცდომა:", err);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // მონაცემების შენახვა (Firebase + LocalStorage)
  const syncData = async (newSettings, newProducts, newInquiries = inquiries) => {
    writeCache(KEYS.settings, newSettings);
    writeCache(KEYS.products, newProducts);
    writeCache(KEYS.inquiries, newInquiries);

    if (db) {
      try {
        await setDoc(doc(db, "aurelia", "storeData"), {
          settings: newSettings,
          products: newProducts,
          inquiries: newInquiries,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error("Firebase შენახვის შეცდომა:", e);
      }
    }
    setSaveMessage(lang === "ka" ? "ცვლილებები შენახულია!" : "Changes saved!");
    setTimeout(() => setSaveMessage(""), 2500);
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

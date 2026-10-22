import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
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

  // true: ქეში არსებობს, ან Firebase საერთოდ არ არის -> loader არ გვჭირდება
  const [settingsLoaded, setSettingsLoaded] = useState(
    () => !!readCache(KEYS.settings) || !db
  );

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

    // base64-ის შემთხვევაში ტიპს თვითონ სურათიდან ვიღებთ
    const match = iconUrl.match(/^data:(image\/[a-zA-Z+.-]+);/);
    if (match) link.type = match[1];
    else link.removeAttribute("type");

    link.href = iconUrl;
  }, [siteSettings.logoUrl]);

  // გვერდის სათაური მისამართის მიხედვით, ერთ ადგილას
  useEffect(() => {
    const updateTitle = () => {
      const brand = siteSettings.brandName || "AURELIA";
      const en = lang === "en";
      const path = window.location.pathname;

      if (path.startsWith("/admin")) {
        document.title = `${en ? "Admin Panel" : "ადმინ პანელი"} — ${brand}`;
      } else if (path.startsWith("/about")) {
        document.title = `${en ? "About Us" : "ჩვენს შესახებ"} — ${brand}`;
      } else {
        const code = new URLSearchParams(window.location.search).get("item");
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

    // თუ Firebase 6 წამში არ პასუხობს, მაინც გამოვაჩინოთ საიტი
    const fallbackTimer = setTimeout(() => setSettingsLoaded(true), 6000);

    const unsub = onSnapshot(
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
        setSettingsLoaded(true);
      },
      (error) => {
        console.error("Firebase ჩატვირთვის შეცდომა:", error);
        setSettingsLoaded(true);
      }
    );

    return () => {
      clearTimeout(fallbackTimer);
      unsub();
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
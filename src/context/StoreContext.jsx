import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState("ka");
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [favorites, setFavorites] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");

  // LocalStorage + Firebase ჩატვირთვა
  useEffect(() => {
    const savedSettings = localStorage.getItem("aurelia_settings_v2");
    const savedProducts = localStorage.getItem("aurelia_products_v2");
    const savedFavs = localStorage.getItem("aurelia_favs_v2");
    const savedInquiries = localStorage.getItem("aurelia_inquiries_v2");

    if (savedSettings) {
      try { setSiteSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) }); } catch (e) {}
    }
    if (savedProducts) {
      try { setProducts(JSON.parse(savedProducts)); } catch (e) {}
    }
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }
    if (savedInquiries) {
      try { setInquiries(JSON.parse(savedInquiries)); } catch (e) {}
    }

    if (db) {
      const unsub = onSnapshot(doc(db, "aurelia", "storeData"), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.settings) setSiteSettings({ ...DEFAULT_SETTINGS, ...data.settings });
          if (data.products) setProducts(data.products);
          if (data.inquiries) setInquiries(data.inquiries);
        }
      });
      return () => unsub();
    }
  }, []);

  // მონაცემების შენახვა (Firebase + LocalStorage)
  const syncData = async (newSettings, newProducts, newInquiries = inquiries) => {
    localStorage.setItem("aurelia_settings_v2", JSON.stringify(newSettings));
    localStorage.setItem("aurelia_products_v2", JSON.stringify(newProducts));
    localStorage.setItem("aurelia_inquiries_v2", JSON.stringify(newInquiries));

    if (db) {
      try {
        await setDoc(doc(db, "aurelia", "storeData"), {
          settings: newSettings,
          products: newProducts,
          inquiries: newInquiries,
          updatedAt: new Date().toISOString()
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
    localStorage.setItem("aurelia_favs_v2", JSON.stringify(updated));
  };

  return (
    <StoreContext.Provider
      value={{
        darkMode, setDarkMode,
        lang, setLang,
        siteSettings, setSiteSettings,
        products, setProducts,
        favorites, toggleFavorite,
        inquiries, setInquiries,
        saveMessage,
        syncData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
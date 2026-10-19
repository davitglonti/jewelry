import React, { useState, useEffect } from 'react';
import {
  Sparkles, Shield, Moon, Sun, Heart, Search, Plus, Trash2, Edit3,
  ChevronLeft, ChevronRight, ZoomIn, X, Phone, MapPin, Clock,
  Instagram, Facebook, MessageCircle, Send, Check, Upload, Link as LinkIcon,
  Globe, Lock, Eye, SlidersHorizontal, Award, Gem, Share2, Menu, ArrowLeft
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ==========================================
// 1. FIREBASE კონფიგურაცია
// ==========================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let db = null;
try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (err) {
  console.warn("Firebase არ არის კონფიგურირებული, მუშაობს LocalStorage რეჟიმში.");
}

// ==========================================
// 2. საწყისი მონაცემები (DEFAULT DATA)
// ==========================================
const DEFAULT_SETTINGS = {
  brandName: "AURELIA",
  brandSubtitle: "საიუველირო სახლი • 1998",
  brandSubtitleEn: "Jewelry House • 1998",
  logoUrl: "",
  heroSlides: [
    {
      id: 1,
      badge: "ახალი კოლექცია 2026",
      badgeEn: "New Collection 2026",
      title: "მარადიული ელეგანტურობის ხელოვნება",
      titleEn: "The Art of Eternal Elegance",
      subtitle: "უნიკალური ხელნაკეთი სამკაულები უმაღლესი სინჯის ოქროსა და სერტიფიცირებული ბრილიანტებისგან.",
      subtitleEn: "Unique handcrafted jewelry made from the finest gold and certified diamonds.",
      buttonText: "კოლექციის ნახვა",
      buttonTextEn: "Explore Collection",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=85"
    },
    {
      id: 2,
      badge: "ექსკლუზიური ხაზი",
      badgeEn: "Exclusive Line",
      title: "ბრწყინვალება ყველა დეტალში",
      titleEn: "Brilliance in Every Detail",
      subtitle: "აღმოაჩინეთ საიუველირო შედევრები, რომლებიც თაობებს გადაეცემა.",
      subtitleEn: "Discover jewelry masterpieces passed down through generations.",
      buttonText: "კატალოგი",
      buttonTextEn: "View Catalog",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=85"
    }
  ],
  craftBadge: "ქართული საიუველირო მემკვიდრეობა",
  craftBadgeEn: "Georgian Jewelry Heritage",
  craftTitle: "ხელოვნება, რომელიც თაობებს გადაეცემა",
  craftTitleEn: "Art Passed Down Through Generations",
  craftDesc: "საიუველირო სახლი „AURELIA“ აერთიანებს მრავალსაუკუნოვან ქართულ ტრადიციებსა და თანამედროვე ევროპულ სტანდარტებს. თითოეული ნაკეთობა იქმნება ინდივიდუალურად, უმაღლესი სიზუსტით.",
  craftDescEn: "AURELIA Jewelry House combines centuries-old Georgian traditions with modern European standards. Each piece is individually crafted with ultimate precision.",
  craftImg1: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80",
  craftImg2: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=80",
  categories: ["ბეჭდები", "ყელსაბამები", "საყურეები", "სამაჯურები"],
  metals: ["ყვითელი ოქრო", "თეთრი ოქრო", "ვარდისფერი ოქრო", "პლატინა"],
  phone: "+995 555 00 00 00",
  whatsapp: "995555000000",
  messenger: "https://m.me/aureliajewelry",
  address: "თბილისი, რუსთაველის გამზ. #24",
  addressEn: "24 Rustaveli Ave, Tbilisi, Georgia",
  hours: "ყოველდღე: 11:00 - 20:00",
  hoursEn: "Daily: 11:00 AM - 08:00 PM",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  footerDesc: "უმაღლესი ხარისხის სერტიფიცირებული სამკაულების შოურუმი თბილისში.",
  footerDescEn: "Showroom of certified fine jewelry in Tbilisi.",
  copyright: "© 2026 AUREL Jewelry House. ყველა უფლება დაცულია."
};

const DEFAULT_PRODUCTS = [
  {
    id: "item-1",
    sku: "AUR-101",
    name: "ბეჭედი Celeste Diamond",
    nameEn: "Celeste Diamond Ring",
    category: "ბეჭდები",
    metal: "თეთრი ოქრო",
    karat: "750° (18K)",
    weight: "4.2 გრ",
    stones: "ბრილიანტი 0.65 ct (VS1/F)",
    price: "4,800 ₾",
    oldPrice: "5,400 ₾",
    exclusive: true,
    sizes: ["16.0", "16.5", "17.0", "17.5", "18.0"],
    description: "დახვეწილი სოლიტერის ტიპის ბეჭედი ბუნებრივი სერტიფიცირებული ბრილიანტით და 18-კარატიანი თეთრი ოქროს რგოლით.",
    descriptionEn: "Exquisite solitaire ring featuring a natural certified diamond set in 18K white gold.",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=85"
    ]
  },
  {
    id: "item-2",
    sku: "AUR-102",
    name: "ყელსაბამი Royal Emerald",
    nameEn: "Royal Emerald Necklace",
    category: "ყელსაბამები",
    metal: "ყვითელი ოქრო",
    karat: "750° (18K)",
    weight: "6.8 გრ",
    stones: "ზურმუხტი 1.2 ct & ბრილიანტები",
    price: "6,200 ₾",
    oldPrice: "",
    exclusive: true,
    sizes: ["40 სმ", "45 სმ", "50 სმ"],
    description: "კოლუმბიური ზურმუხტის გულსაკიდი 18K ყვითელ ოქროში, გარშემორტყმული წვრილი ბრილიანტების შარავანდედით.",
    descriptionEn: "Colombian emerald pendant in 18K yellow gold surrounded by a halo of fine diamonds.",
    images: [
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=85"
    ]
  },
  {
    id: "item-3",
    sku: "AUR-103",
    name: "საყურეები Lumina Drop",
    nameEn: "Lumina Drop Earrings",
    category: "საყურეები",
    metal: "ვარდისფერი ოქრო",
    karat: "585° (14K)",
    weight: "5.1 გრ",
    stones: "ბრილიანტი 0.45 ct",
    price: "3,400 ₾",
    oldPrice: "3,900 ₾",
    exclusive: false,
    sizes: ["სტანდარტული"],
    description: "ნაზი და ელეგანტური ჩამოსაკიდი საყურეები ვარდისფერი ოქროსა და ბრილიანტების კომბინაციით.",
    descriptionEn: "Delicate and elegant drop earrings crafted from rose gold and diamonds.",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85"
    ]
  },
  {
    id: "item-4",
    sku: "AUR-104",
    name: "სამაჯური Infinity Tennis",
    nameEn: "Infinity Tennis Bracelet",
    category: "სამაჯურები",
    metal: "თეთრი ოქრო",
    karat: "750° (18K)",
    weight: "11.4 გრ",
    stones: "ბრილიანტი 3.20 ct",
    price: "11,500 ₾",
    oldPrice: "",
    exclusive: true,
    sizes: ["16 სმ", "17 სმ", "18 სმ", "19 სმ"],
    description: "კლასიკური ჩოგბურთის სტილის სამაჯური უწყვეტი ბრილიანტების ხაზით.",
    descriptionEn: "Classic tennis bracelet featuring a continuous line of brilliant-cut diamonds.",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1000&q=85"
    ]
  }
];

export default function App() {
  // ამოწმებს, იმყოფება თუ არა მომხმარებელი /admin გვერდზე
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    const path = window.location.pathname.replace(/\/+$/, "");
    return path === "/admin";
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/\/+$/, "");
      setIsAdminRoute(path === "/admin");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ძირითადი State-ები
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState("ka");
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [favorites, setFavorites] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  // Mobile Header
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // კარუსელის State
  const [currentSlide, setCurrentSlide] = useState(0);

  // ფილტრაცია
  const [selectedCategory, setSelectedCategory] = useState("ყველა");
  const [selectedMetal, setSelectedMetal] = useState("ყველა");
  const [onlyExclusive, setOnlyExclusive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  // დეტალური მოდალი, გალერეა და ზუმი
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // საკონსულტაციო მოთხოვნის ფორმა
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientNote, setClientNote] = useState("");
  const [inquirySent, setInquirySent] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // ადმინ პანელის State-ები
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState("2026");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [adminTab, setAdminTab] = useState("catalog");

  // სამკაულის დამატება/რედაქტირება ადმინში
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newMetalInput, setNewMetalInput] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // კლავიატურის ისრებით ფოტოების გადართვა ლაითბოქსში
  useEffect(() => {
    if (!lightboxImage || !selectedProduct?.images) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length);
      } else if (e.key === "Escape") {
        setLightboxImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, selectedProduct]);



  // 3. მონაცემების ჩატვირთვა და სინქრონიზაცია
  // ==========================================
  useEffect(() => {
    const savedSettings = localStorage.getItem("aurelia_settings_v2");
    const savedProducts = localStorage.getItem("aurelia_products_v2");
    const savedFavs = localStorage.getItem("aurelia_favs_v2");
    const savedInquiries = localStorage.getItem("aurelia_inquiries_v2");
    const savedPin = localStorage.getItem("aurelia_pin_v2");

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
    if (savedPin) setAdminPin(savedPin);

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

  // მონაცემების შენახვის ფუნქცია (Local + Firebase)
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

  // ინახავს URL-ის პარამეტრს თავიდანვე, რომ არ დაიკარგოს (მხოლოდ მთავარ გვერდზე)
  useEffect(() => {
    if (isAdminRoute) return;
    const params = new URLSearchParams(window.location.search);
    const itemCode = params.get("item");
    if (itemCode) {
      window.savedItemCode = itemCode;
    }
  }, [isAdminRoute]);

  // როგორც კი პროდუქტები ჩამოიტვირთება, ამოწმებს შენახულ კოდს
  useEffect(() => {
    if (isAdminRoute) return;
    const itemCode = window.savedItemCode || new URLSearchParams(window.location.search).get("item");

    if (!products || products.length === 0 || !itemCode) return;

    const target = decodeURIComponent(itemCode).toString().trim().toLowerCase();

    const found = products.find((p) => {
      const pSku = p.sku?.toString().trim().toLowerCase();
      const pId = p.id?.toString().trim().toLowerCase();
      return (pSku && pSku === target) || (pId && pId === target);
    });

    if (found) {
      setSelectedProduct(found);
      setActiveImageIndex(0);
      setSelectedSize(found.sizes && found.sizes.length > 0 ? found.sizes[0] : "");
      window.savedItemCode = null;
    }
  }, [products, isAdminRoute]);

  // ნივთის გახსნისას ბრაუზერის ლინკში დაემატოს კოდი, დახურვისას — გასუფთავდეს
  useEffect(() => {
    if (isAdminRoute) return;
    if (selectedProduct) {
      const code = selectedProduct.sku || selectedProduct.id;
      window.history.replaceState(null, "", `?item=${encodeURIComponent(code)}`);
    } else {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [selectedProduct, isAdminRoute]);

  // ფოტოს კომპრესია და Base64-ში გადაყვანა ატვირთვისას
  const handleFileUpload = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.82);
        callback(compressed);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ფავორიტებში დამატება/წაშლა
  const toggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("aurelia_favs_v2", JSON.stringify(updated));
  };

  // პროდუქტის დეტალური ფანჯრის გახსნა
  const openProductModal = (product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : "");
    setInquirySent(false);
    setPhoneError("")
  };

  // მაუსით მიახლოების (Zoom) გამოთვლა
  const handleMouseMoveZoom = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  // ნივთის ბმულის გაზიარება / კოპირება
  const handleShareProduct = async (product) => {
    const code = product.sku || product.id;
    const shareUrl = `${window.location.origin}/?item=${encodeURIComponent(code)}`;
    const title = lang === "ka" ? product.name : (product.nameEn || product.name);

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} (${product.sku}) - ${product.price}`,
          url: shareUrl
        });
        return;
      } catch (err) {}
    }

    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // სწრაფი WhatsApp ბმულის გენერაცია
  const getWhatsAppLink = (product) => {
    const cleanPhone = (siteSettings.whatsapp || "995555000000").replace(/[^0-9]/g, "");
    const itemUrl = `${window.location.origin}/?item=${encodeURIComponent(product.sku || product.id)}`;
    const priceText = product.oldPrice ? `${product.price} (ძველი ფასი: ${product.oldPrice})` : product.price;
    const priceTextEn = product.oldPrice ? `${product.price} (Was: ${product.oldPrice})` : product.price;

    const message = lang === "ka"
      ? `გამარჯობა! მაინტერესებს სამკაული: ${product.name} (კოდი: ${product.sku})${selectedSize ? `, ზომა: ${selectedSize}` : ""}, ფასი: ${priceText}\nბმული: ${itemUrl}`
      : `Hello! I am interested in: ${product.nameEn || product.name} (SKU: ${product.sku})${selectedSize ? `, Size: ${selectedSize}` : ""}, Price: ${priceTextEn}\nLink: ${itemUrl}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // კონსულტაციის მოთხოვნის გაგზავნა
  const handleSendInquiry = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // 1. სახელის შემოწმება
    if (!clientName.trim()) {
      setPhoneError(
        lang === "ka" ? "გთხოვთ შეიყვანოთ თქვენი სახელი" : "Please enter your name"
      );
      return;
    }

    // 2. ნომრის გასუფთავება და შემოწმება (თუ ცარიელია ან ასოები წერია)
    const cleanedPhone = clientPhone.replace(/[\s\-()]/g, "");
    const georgianPhoneRegex = /^(\+?995)?5\d{8}$/;

    if (!cleanedPhone || !georgianPhoneRegex.test(cleanedPhone)) {
      setPhoneError(
        lang === "ka"
          ? "შეიყვანეთ სწორი ქართული ნომერი (მაგ: 555 12 34 56)"
          : "Please enter a valid Georgian number (e.g. 555 12 34 56)"
      );
      return;
    }

    setPhoneError("");

    const newInq = {
      id: Date.now().toString(),
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      size: selectedSize,
      clientName,
      clientPhone: cleanedPhone,
      clientNote,
      date: new Date().toLocaleString("ka-GE")
    };
    const updatedInquiries = [newInq, ...inquiries];
    setInquiries(updatedInquiries);
    syncData(siteSettings, products, updatedInquiries);
    setClientName("");
    setClientPhone("");
    setClientNote("");
    setInquirySent(true);
  };

  // გაფილტრული პროდუქცია
  const filteredProducts = products.filter((item) => {
    const matchesCat = selectedCategory === "ყველა" || item.category === selectedCategory;
    const matchesMetal = selectedMetal === "ყველა" || item.metal === selectedMetal;
    const matchesExcl = !onlyExclusive || item.exclusive;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.nameEn?.toLowerCase().includes(q) ||
      item.sku?.toLowerCase().includes(q) ||
      item.stones?.toLowerCase().includes(q);
    return matchesCat && matchesMetal && matchesExcl && matchesSearch;
  });

  const slides = siteSettings.heroSlides?.length > 0 ? siteSettings.heroSlides : DEFAULT_SETTINGS.heroSlides;
  const activeSlide = slides[currentSlide % slides.length] || slides[0];
 
  // ავტომატური სლაიდერი (6 წამიანი ტაიმერით)
  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); 

    return () => clearInterval(timer);
  }, [slides.length]);

  // ==========================================
  // 4. თუ მომხმარებელი არის /admin გვერდზე
  // ==========================================
  if (isAdminRoute) {
    return (
      <div className={`min-h-screen w-full transition-colors duration-300 ${darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#faf7f2] text-[#1c1917]"}`}>
        {/* ადმინის ზედა ზოლი */}
        <header className={`sticky top-0 z-40 px-4 sm:px-8 py-4 border-b backdrop-blur-md flex items-center justify-between ${darkMode ? "bg-[#121110]/95 border-stone-800" : "bg-white/95 border-stone-200"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg sm:text-2xl font-semibold">
                {siteSettings.brandName} — {lang === "ka" ? "ადმინ პანელი" : "Admin Panel"}
              </h1>
              <span className="text-xs opacity-60">matare.store/admin</span>
            </div>
            {saveMessage && (
              <span className="ml-3 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                {saveMessage}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-full border transition-all ${
                darkMode ? "border-stone-800 bg-stone-900 text-amber-400" : "border-stone-200 bg-stone-100 text-stone-700"
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a
              href="/"
              className="px-4 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === "ka" ? "საიტზე გადასვლა" : "Back to Store"}</span>
            </a>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-4 sm:p-8">
          {/* თუ არ არის ავტორიზებული -> პაროლის ფანჯარა */}
          {!isAdminAuthenticated ? (
            <div className={`p-10 max-w-md mx-auto mt-16 rounded-3xl border text-center space-y-5 ${darkMode ? "bg-[#121110] border-stone-800" : "bg-white border-stone-200 shadow-lg"}`}>
              <div className="w-14 h-14 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl">შეიყვანეთ ადმინისტრატორის PIN</h3>
              <p className="text-xs opacity-65">წვდომა მხოლოდ ავტორიზებული პირებისთვის</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (passwordInput === adminPin) {
                    setIsAdminAuthenticated(true);
                    setLoginError("");
                  } else {
                    setLoginError("არასწორი კოდი!");
                  }
                }}
                className="space-y-3"
              >
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="PIN კოდი..."
                  className={`w-full px-4 py-3 rounded-xl text-center text-lg tracking-widest border outline-none ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-100 border-stone-300"}`}
                />
                {loginError && <p className="text-xs text-red-400">{loginError}</p>}
                <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:brightness-110 transition-all">
                  შესვლა
                </button>
              </form>
            </div>
          ) : (
            <div className={`p-6 rounded-3xl border space-y-6 ${darkMode ? "bg-[#121110] border-stone-800" : "bg-white border-stone-200 shadow-sm"}`}>
              {/* ადმინის ჩანართები (Tabs) */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-stone-500/20">
                {[
                  { id: "catalog", label: "1. კატალოგის მართვა" },
                  { id: "categories", label: "2. მეტალები & კატეგორიები" },
                  { id: "carousel", label: "3. ზედა კარუსელი (Hero)" },
                  { id: "brand", label: "4. ლოგო & სათაურები" },
                  { id: "craft", label: "5. ოსტატობის სექცია" },
                  { id: "footer", label: "6. კონტაქტი & ქვედა პანელი" },
                  { id: "inquiries", label: `7. შემოსული მოთხოვნები (${inquiries.length})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                      adminTab === tab.id
                        ? "bg-amber-500 text-black"
                        : darkMode
                        ? "bg-stone-900 text-stone-300 hover:bg-stone-800"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ჩანართი 1: კატალოგის მართვა */}
              {adminTab === "catalog" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl">სამკაულების სია ({products.length})</h3>
                    <button
                      onClick={() =>
                        setEditingProduct({
                          id: "item-" + Date.now(),
                          sku: "AUR-" + Math.floor(100 + Math.random() * 900),
                          name: "",
                          nameEn: "",
                          category: siteSettings.categories?.[0] || "ბეჭდები",
                          metal: siteSettings.metals?.[0] || "ყვითელი ოქრო",
                          karat: "750° (18K)",
                          weight: "",
                          stones: "",
                          price: "",
                          oldPrice: "",
                          exclusive: false,
                          sizes: ["16.5", "17.0", "17.5"],
                          description: "",
                          descriptionEn: "",
                          images: []
                        })
                      }
                      className="px-4 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      ახალი სამკაულის დამატება
                    </button>
                  </div>

                  {/* სამკაულის რედაქტირების/დამატების ფორმა */}
                  {editingProduct && (
                    <div className={`p-5 rounded-2xl border space-y-4 ${darkMode ? "bg-stone-900/90 border-amber-500/40" : "bg-stone-50 border-amber-500"}`}>
                      <h4 className="font-serif text-lg text-amber-500">სამკაულის რედაქტირება / დამატება</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <input
                          type="text"
                          placeholder="დასახელება (ქართულად)"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                        />
                        <input
                          type="text"
                          placeholder="Name (English)"
                          value={editingProduct.nameEn || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, nameEn: e.target.value })}
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                        />
                        <input
                          type="text"
                          placeholder="კოდი (მაგ: AUR-105)"
                          value={editingProduct.sku}
                          onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                        />
                        <select
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                        >
                          {(siteSettings.categories || []).map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <select
                          value={editingProduct.metal}
                          onChange={(e) => setEditingProduct({ ...editingProduct, metal: e.target.value })}
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                        >
                          {(siteSettings.metals || []).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="ახალი / მიმდინარე ფასი (მაგ: 4,500 ₾)"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-amber-500/50" : "bg-white border-amber-500"}`}
                        />
                        <input
                          type="text"
                          placeholder="ძველი ფასი ფასდაკლებისას (მაგ: 5,200 ₾)"
                          value={editingProduct.oldPrice || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: e.target.value })}
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                        />
                        <input
                          type="text"
                          placeholder="სინჯი (მაგ: 750° / 18K)"
                          value={editingProduct.karat}
                          onChange={(e) => setEditingProduct({ ...editingProduct, karat: e.target.value })}
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                        />
                        <input
                          type="text"
                          placeholder="წონა (მაგ: 4.5 გრ)"
                          value={editingProduct.weight}
                          onChange={(e) => setEditingProduct({ ...editingProduct, weight: e.target.value })}
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                        />
                        <input
                          type="text"
                          placeholder="ქვები (მაგ: ბრილიანტი 0.5ct)"
                          value={editingProduct.stones}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stones: e.target.value })}
                          className={`p-2.5 rounded-xl border sm:col-span-3 ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                        />
                      </div>

                      {/* ზომები */}
                      <div className="text-xs">
                        <label className="block opacity-70 mb-1">ხელმისაწვდომი ზომები (გამოყავით მძიმით):</label>
                        <input
                          type="text"
                          value={(editingProduct.sizes || []).join(", ")}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            })
                          }
                          placeholder="16.0, 16.5, 17.0, 17.5"
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                        />
                      </div>

                      {/* აღწერა */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <textarea
                          rows={2}
                          placeholder="აღწერა (ქართულად)"
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                        />
                        <textarea
                          rows={2}
                          placeholder="Description (English)"
                          value={editingProduct.descriptionEn || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, descriptionEn: e.target.value })}
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                        />
                      </div>

                      {/* ფოტოების დამატება */}
                      <div className="space-y-2 text-xs">
                        <label className="font-medium text-amber-500 block">
                          სამკაულის ფოტოები (შეგიძლიათ ატვირთოთ რამდენიმე ფოტო ან ჩასვათ ლინკი):
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 cursor-pointer flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            ფოტოს ატვირთვა მოწყობილობიდან
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleFileUpload(file, (base64) => {
                                  setEditingProduct({
                                    ...editingProduct,
                                    images: [...(editingProduct.images || []), base64]
                                  });
                                });
                              }}
                            />
                          </label>

                          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                            <input
                              type="url"
                              value={imageUrlInput}
                              onChange={(e) => setImageUrlInput(e.target.value)}
                              placeholder="ან ჩასვით ფოტოს ლინკი (https://...)"
                              className={`flex-1 p-2.5 rounded-xl border ${darkMode ? "bg-stone-800 border-stone-700" : "bg-white border-stone-300"}`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!imageUrlInput.trim()) return;
                                setEditingProduct({
                                  ...editingProduct,
                                  images: [...(editingProduct.images || []), imageUrlInput.trim()]
                                });
                                setImageUrlInput("");
                              }}
                              className="px-4 py-2.5 rounded-xl bg-stone-700 text-white flex items-center gap-1"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                              დამატება
                            </button>
                          </div>
                        </div>

                        {/* ატვირთული ფოტოების სია */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          {(editingProduct.images || []).map((img, i) => (
                            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-amber-500/40">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingProduct({
                                    ...editingProduct,
                                    images: editingProduct.images.filter((_, idx) => idx !== i)
                                  })
                                }
                                className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingProduct.exclusive}
                            onChange={(e) => setEditingProduct({ ...editingProduct, exclusive: e.target.checked })}
                            className="accent-amber-500 w-4 h-4"
                          />
                          <span>ექსკლუზიური მოდელი</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="px-4 py-2 rounded-xl border border-stone-600 text-xs"
                          >
                            გაუქმება
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const exists = products.some((p) => p.id === editingProduct.id);
                              const updated = exists
                                ? products.map((p) => (p.id === editingProduct.id ? editingProduct : p))
                                : [editingProduct, ...products];
                              setProducts(updated);
                              syncData(siteSettings, updated);
                              setEditingProduct(null);
                            }}
                            className="px-5 py-2 rounded-xl bg-amber-500 text-black font-semibold text-xs"
                          >
                            შენახვა
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* არსებული პროდუქტების ცხრილი */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {products.map((p) => (
                      <div key={p.id} className="p-3.5 rounded-2xl border border-stone-500/20 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0]} alt="" className="w-14 h-14 rounded-xl object-cover bg-stone-800" />
                          <div>
                            <div className="font-serif font-medium">{p.name}</div>
                            <div className="text-xs opacity-60">{p.sku} • {p.category} • {p.metal}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {p.oldPrice && (
                                <span className="text-xs line-through opacity-45">{p.oldPrice}</span>
                              )}
                              <span className="text-xs text-amber-500 font-semibold">{p.price}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-2 rounded-xl bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-black"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const updated = products.filter((item) => item.id !== p.id);
                              setProducts(updated);
                              syncData(siteSettings, updated);
                            }}
                            className="p-2 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ჩანართი 2: მეტალები & კატეგორიები */}
              {adminTab === "categories" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* კატეგორიები */}
                  <div className="p-5 rounded-2xl border border-stone-500/20 space-y-4">
                    <h4 className="font-serif text-lg text-amber-500">კატეგორიების მართვა</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        placeholder="ახალი კატეგორია (მაგ: გულსაბნევები)"
                        className={`flex-1 p-2.5 rounded-xl text-xs border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                      />
                      <button
                        onClick={() => {
                          if (!newCategoryInput.trim()) return;
                          const updated = {
                            ...siteSettings,
                            categories: [...(siteSettings.categories || []), newCategoryInput.trim()]
                          };
                          setSiteSettings(updated);
                          syncData(updated, products);
                          setNewCategoryInput("");
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold"
                      >
                        დამატება
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(siteSettings.categories || []).map((cat) => (
                        <span key={cat} className="px-3 py-1.5 rounded-full text-xs bg-stone-500/15 flex items-center gap-2">
                          {cat}
                          <button
                            onClick={() => {
                              const updated = {
                                ...siteSettings,
                                categories: siteSettings.categories.filter((c) => c !== cat)
                              };
                              setSiteSettings(updated);
                              syncData(updated, products);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* მეტალები */}
                  <div className="p-5 rounded-2xl border border-stone-500/20 space-y-4">
                    <h4 className="font-serif text-lg text-amber-500">მეტალების / მასალების მართვა</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMetalInput}
                        onChange={(e) => setNewMetalInput(e.target.value)}
                        placeholder="ახალი მეტალი (მაგ: ვერცხლი 925)"
                        className={`flex-1 p-2.5 rounded-xl text-xs border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                      />
                      <button
                        onClick={() => {
                          if (!newMetalInput.trim()) return;
                          const updated = {
                            ...siteSettings,
                            metals: [...(siteSettings.metals || []), newMetalInput.trim()]
                          };
                          setSiteSettings(updated);
                          syncData(updated, products);
                          setNewMetalInput("");
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold"
                      >
                        დამატება
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(siteSettings.metals || []).map((metal) => (
                        <span key={metal} className="px-3 py-1.5 rounded-full text-xs bg-stone-500/15 flex items-center gap-2">
                          {metal}
                          <button
                            onClick={() => {
                              const updated = {
                                ...siteSettings,
                                metals: siteSettings.metals.filter((m) => m !== metal)
                              };
                              setSiteSettings(updated);
                              syncData(updated, products);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ჩანართი 3: ზედა კარუსელი (Hero Slider) */}
              {adminTab === "carousel" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-lg text-amber-500">ზედა კარუსელის სლაიდები</h4>
                    <button
                      onClick={() => {
                        const newSlide = {
                          id: Date.now(),
                          badge: "ახალი სლაიდი",
                          title: "სათაური",
                          subtitle: "აღწერა",
                          buttonText: "კოლექციის ნახვა",
                          image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80"
                        };
                        const updated = {
                          ...siteSettings,
                          heroSlides: [...(siteSettings.heroSlides || []), newSlide]
                        };
                        setSiteSettings(updated);
                        syncData(updated, products);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      სლაიდის დამატება
                    </button>
                  </div>

                  {(siteSettings.heroSlides || []).map((slide, idx) => (
                    <div key={slide.id || idx} className="p-4 rounded-2xl border border-stone-500/20 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400">სლაიდი #{idx + 1}</span>
                        {siteSettings.heroSlides.length > 1 && (
                          <button
                            onClick={() => {
                              const updated = {
                                ...siteSettings,
                                heroSlides: siteSettings.heroSlides.filter((_, i) => i !== idx)
                              };
                              setSiteSettings(updated);
                              syncData(updated, products);
                            }}
                            className="text-red-400 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> წაშლა
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={slide.badge}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], badge: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          placeholder="ბეიჯი (მაგ: ახალი კოლექცია)"
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], title: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          placeholder="მთავარი სათაური"
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                        <input
                          type="text"
                          value={slide.subtitle}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], subtitle: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          placeholder="ქვესათაური / აღწერა"
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                        <input
                          type="text"
                          value={slide.image}
                          onChange={(e) => {
                            const copy = [...siteSettings.heroSlides];
                            copy[idx] = { ...copy[idx], image: e.target.value };
                            setSiteSettings({ ...siteSettings, heroSlides: copy });
                          }}
                          placeholder="ფონის ფოტოს ბმული (URL)"
                          className={`p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <label className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 cursor-pointer flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          ფოტოს ატვირთვა ფაილიდან
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              handleFileUpload(e.target.files?.[0], (base64) => {
                                const copy = [...siteSettings.heroSlides];
                                copy[idx] = { ...copy[idx], image: base64 };
                                setSiteSettings({ ...siteSettings, heroSlides: copy });
                              });
                            }}
                          />
                        </label>
                        <button
                          onClick={() => syncData(siteSettings, products)}
                          className="px-4 py-1.5 rounded-lg bg-amber-500 text-black font-semibold"
                        >
                          სლაიდის შენახვა
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ჩანართი 4: ლოგო & სათაურები */}
              {adminTab === "brand" && (
                <div className="space-y-4 max-w-xl text-xs">
                  <h4 className="font-serif text-lg text-amber-500">ბრენდის სახელი და ლოგო</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={siteSettings.brandName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, brandName: e.target.value })}
                      placeholder="ბრენდის სახელი (მაგ: AURELIA)"
                      className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                    <input
                      type="text"
                      value={siteSettings.brandSubtitle}
                      onChange={(e) => setSiteSettings({ ...siteSettings, brandSubtitle: e.target.value })}
                      placeholder="სლოგანი (მაგ: საიუველირო სახლი • 1998)"
                      className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                    <input
                      type="text"
                      value={siteSettings.logoUrl}
                      onChange={(e) => setSiteSettings({ ...siteSettings, logoUrl: e.target.value })}
                      placeholder="ლოგოს ბმული (ან ატვირთეთ ქვემოდან)"
                      className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                    />
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      ლოგოს ატვირთვა კომპიუტერიდან
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e.target.files?.[0], (b64) =>
                            setSiteSettings({ ...siteSettings, logoUrl: b64 })
                          )
                        }
                      />
                    </label>
                  </div>
                  <button
                    onClick={() => syncData(siteSettings, products)}
                    className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold"
                  >
                    ცვლილებების შენახვა
                  </button>
                </div>
              )}

              {/* ჩანართი 5: ოსტატობის სექცია & 2 ფოტო */}
              {adminTab === "craft" && (
                <div className="space-y-4 max-w-2xl text-xs">
                  <h4 className="font-serif text-lg text-amber-500">„ხელოვნება, რომელიც თაობებს გადაეცემა“ — ტექსტები და ფოტოები</h4>
                  <input
                    type="text"
                    value={siteSettings.craftBadge}
                    onChange={(e) => setSiteSettings({ ...siteSettings, craftBadge: e.target.value })}
                    placeholder="პატარა წარწერა (ქართული საიუველირო მემკვიდრეობა)"
                    className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                  />
                  <input
                    type="text"
                    value={siteSettings.craftTitle}
                    onChange={(e) => setSiteSettings({ ...siteSettings, craftTitle: e.target.value })}
                    placeholder="მთავარი სათაური"
                    className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                  />
                  <textarea
                    rows={3}
                    value={siteSettings.craftDesc}
                    onChange={(e) => setSiteSettings({ ...siteSettings, craftDesc: e.target.value })}
                    placeholder="აღწერის ტექსტი"
                    className={`w-full p-3 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <label className="font-medium block">მარცხენა ფოტო:</label>
                      <input
                        type="text"
                        value={siteSettings.craftImg1}
                        onChange={(e) => setSiteSettings({ ...siteSettings, craftImg1: e.target.value })}
                        placeholder="ფოტოს URL"
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" /> ფაილის ატვირთვა
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e.target.files?.[0], (b64) =>
                              setSiteSettings({ ...siteSettings, craftImg1: b64 })
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium block">მარჯვენა ფოტო:</label>
                      <input
                        type="text"
                        value={siteSettings.craftImg2}
                        onChange={(e) => setSiteSettings({ ...siteSettings, craftImg2: e.target.value })}
                        placeholder="ფოტოს URL"
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" /> ფაილის ატვირთვა
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileUpload(e.target.files?.[0], (b64) =>
                              setSiteSettings({ ...siteSettings, craftImg2: b64 })
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => syncData(siteSettings, products)}
                    className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold"
                  >
                    შენახვა
                  </button>
                </div>
              )}

              {/* ჩანართი 6: კონტაქტი & ქვედა პანელი (Footer) */}
              {adminTab === "footer" && (
                <div className="space-y-4 max-w-2xl text-xs">
                  <h4 className="font-serif text-lg text-amber-500">კონტაქტები, WhatsApp/Messenger და ქვედა პანელი</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="opacity-70 block mb-1">ტელეფონი:</label>
                      <input
                        type="text"
                        value={siteSettings.phone}
                        onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                      />
                    </div>
                    <div>
                      <label className="opacity-70 block mb-1">WhatsApp ნომერი (მაგ: 995555000000):</label>
                      <input
                        type="text"
                        value={siteSettings.whatsapp}
                        onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                      />
                    </div>
                    <div>
                      <label className="opacity-70 block mb-1">Messenger ლინკი (მაგ: https://m.me/yourpage):</label>
                      <input
                        type="text"
                        value={siteSettings.messenger}
                        onChange={(e) => setSiteSettings({ ...siteSettings, messenger: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                      />
                    </div>
                    <div>
                      <label className="opacity-70 block mb-1">მისამართი:</label>
                      <input
                        type="text"
                        value={siteSettings.address}
                        onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                      />
                    </div>
                    <div>
                      <label className="opacity-70 block mb-1">სამუშაო საათები:</label>
                      <input
                        type="text"
                        value={siteSettings.hours}
                        onChange={(e) => setSiteSettings({ ...siteSettings, hours: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                      />
                    </div>
                    <div>
                      <label className="opacity-70 block mb-1">საავტორო უფლებების ტექსტი (Footer):</label>
                      <input
                        type="text"
                        value={siteSettings.copyright}
                        onChange={(e) => setSiteSettings({ ...siteSettings, copyright: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => syncData(siteSettings, products)}
                    className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold"
                  >
                    შენახვა
                  </button>
                </div>
              )}

              {/* ჩანართი 7: შემოსული მოთხოვნები */}
              {adminTab === "inquiries" && (
                <div className="space-y-3">
                  <h4 className="font-serif text-lg text-amber-500">მომხმარებლების მოთხოვნები</h4>
                  {inquiries.length === 0 ? (
                    <p className="text-xs opacity-60">ჯერ მოთხოვნები არ შემოსულა.</p>
                  ) : (
                    inquiries.map((inq) => (
                      <div key={inq.id} className="p-4 rounded-2xl border border-stone-500/20 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-sm">{inq.clientName} — {inq.clientPhone}</div>
                          <div className="text-amber-500">მოდელი: {inq.productName} ({inq.sku}) {inq.size ? `• ზომა: ${inq.size}` : ""}</div>
                          <div className="opacity-50">{inq.date}</div>
                        </div>
                        <button
                          onClick={() => {
                            const updated = inquiries.filter((i) => i.id !== inq.id);
                            setInquiries(updated);
                            syncData(siteSettings, products, updated);
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ==========================================
  // 5. მთავარი საიტი (მომხმარებლის ხედი)
  // ==========================================
  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#faf7f2] text-[#1c1917]"}`}>
      
      {/* HEADER / ნავიგაცია */}
      <header className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b transition-colors shadow-lg ${darkMode ? "bg-[#0c0b0a]/95 border-amber-500/15" : "bg-white/95 border-stone-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* ლოგო */}
          <a href="#" className="flex items-center gap-3 group">
            {siteSettings.logoUrl ? (
              <img src={siteSettings.logoUrl} alt={siteSettings.brandName} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-amber-500/40" />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            <div>
              <span className="font-serif text-xl sm:text-3xl tracking-[0.22em] font-semibold block leading-none">
                {siteSettings.brandName}
              </span>
              <span className="text-[9px] sm:text-xs tracking-[0.18em] text-amber-500/90 uppercase block mt-1">
                {lang === "ka" ? siteSettings.brandSubtitle : (siteSettings.brandSubtitleEn || siteSettings.brandSubtitle)}
              </span>
            </div>
          </a>

          {/* დესკტოპ ნავიგაცია */}
          <nav className="hidden md:flex items-center gap-8 text-sm tracking-wider uppercase">
            <a href="#catalog" className="hover:text-amber-500 transition-colors">
              {lang === "ka" ? "კოლექცია" : "Collection"}
            </a>
            <a href="#craftsmanship" className="hover:text-amber-500 transition-colors">
              {lang === "ka" ? "ოსტატობა" : "Craftsmanship"}
            </a>
            <a href="#contact" className="hover:text-amber-500 transition-colors">
              {lang === "ka" ? "შოურუმი" : "Showroom"}
            </a>
          </nav>

          {/* მარჯვენა ღილაკები */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "ka" ? "en" : "ka")}
              className={`px-3 py-2 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${
                darkMode ? "border-stone-800 bg-stone-900/80 hover:border-amber-500/50" : "border-stone-200 bg-stone-100 hover:border-amber-600"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-500" />
              {lang === "ka" ? "EN" : "GE"}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-full border transition-all ${
                darkMode ? "border-stone-800 bg-stone-900/80 text-amber-400 hover:border-amber-500/50" : "border-stone-200 bg-stone-100 text-stone-700 hover:border-amber-600"
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowFavoritesModal(true)}
              className={`relative p-2.5 rounded-full border transition-all ${
                darkMode ? "border-stone-800 bg-stone-900/80 hover:border-amber-500/50" : "border-stone-200 bg-stone-100 hover:border-amber-600"
              }`}
            >
              <Heart className={`w-4 h-4 ${favorites.length > 0 ? "fill-amber-500 text-amber-500" : ""}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>

          {/* მობილური ვერსიის ღილაკები */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setShowFavoritesModal(true)}
              className={`relative p-2 rounded-full border ${darkMode ? "border-stone-800 bg-stone-900" : "border-stone-200 bg-stone-100"}`}
            >
              <Heart className={`w-4 h-4 ${favorites.length > 0 ? "fill-amber-500 text-amber-500" : ""}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-full border ${darkMode ? "border-stone-800 bg-stone-900 text-amber-400" : "border-stone-200 bg-stone-100 text-stone-800"}`}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* მობილური ჩამოსაშლელი მენიუ */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-b p-5 space-y-4 animate-fadeIn ${darkMode ? "bg-[#0c0b0a] border-stone-800" : "bg-white border-stone-200"}`}>
            <nav className="flex flex-col space-y-3 text-sm tracking-wider uppercase">
              <a href="#catalog" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-500 py-1">
                {lang === "ka" ? "კოლექცია" : "Collection"}
              </a>
              <a href="#craftsmanship" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-500 py-1">
                {lang === "ka" ? "ოსტატობა" : "Craftsmanship"}
              </a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-amber-500 py-1">
                {lang === "ka" ? "შოურუმი" : "Showroom"}
              </a>
            </nav>

            <div className="pt-3 border-t border-stone-500/20 flex items-center gap-2">
              <button
                onClick={() => setLang(lang === "ka" ? "en" : "ka")}
                className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${
                  darkMode ? "border-stone-800 bg-stone-900" : "border-stone-200 bg-stone-100"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                {lang === "ka" ? "EN" : "GE"}
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl border ${
                  darkMode ? "border-stone-800 bg-stone-900 text-amber-400" : "border-stone-200 bg-stone-100 text-stone-700"
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO კარუსელი */}
      {/* HERO კარუსელი */}
      <section className="relative h-[500px] sm:h-[640px] overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <img
            src={activeSlide?.image}
            alt={activeSlide?.title}
            className="w-full h-full object-cover object-center transition-all duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12 sm:pt-0">
          <div className="max-w-xl space-y-3 sm:space-y-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              {lang === "ka" ? activeSlide?.badge : (activeSlide?.badgeEn || activeSlide?.badge)}
            </span>

            <h1 className="font-serif text-2xl sm:text-5xl lg:text-6xl font-normal text-white leading-[1.2] sm:leading-[1.15]">
              {lang === "ka" ? activeSlide?.title : (activeSlide?.titleEn || activeSlide?.title)}
            </h1>

            <p className="text-stone-300 text-xs sm:text-base lg:text-lg leading-relaxed line-clamp-3 sm:line-clamp-none">
              {lang === "ka" ? activeSlide?.subtitle : (activeSlide?.subtitleEn || activeSlide?.subtitle)}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#catalog"
                className="px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-amber-500/25 hover:brightness-110 transition-all"
              >
                {lang === "ka" ? (activeSlide?.buttonText || "კოლექციის ნახვა") : (activeSlide?.buttonTextEn || "Explore Collection")}
              </a>
              <a
                href="#contact"
                className="px-6 py-3 sm:px-7 sm:py-3.5 rounded-full border border-white/30 text-white hover:bg-white/10 text-xs sm:text-sm tracking-wider uppercase transition-all"
              >
                {lang === "ka" ? "შოურუმში ვიზიტი" : "Visit Showroom"}
              </a>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/15 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/15 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* პროგრესის ხაზები / ინდიკატორები */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {slides.map((s, idx) => {
                const isActive = currentSlide % slides.length === idx;
                return (
                  <button
                    key={s.id || idx}
                    onClick={() => setCurrentSlide(idx)}
                    className="relative h-2 rounded-full bg-white/40 overflow-hidden transition-all cursor-pointer"
                    style={{ width: isActive ? "36px" : "10px" }}
                  >
                    {isActive && (
                      <div
                        className="absolute top-0 left-0 h-full bg-amber-400"
                        style={{
                          width: "100%",
                          animation: "fillProgress 6s linear forwards"
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* კატალოგის სექცია და ფილტრები */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-amber-500 block mb-2">
              {lang === "ka" ? "საიუველირო ვიტრინა" : "Fine Jewelry Showcase"}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl">
              {lang === "ka" ? "ჩვენი კოლექცია" : "Our Collection"}
            </h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "ka" ? "ძიება სახელით ან კოდით (AUR-101)..." : "Search by name or SKU..."}
              className={`w-full pl-11 pr-4 py-3 rounded-full text-sm border outline-none transition-all ${
                darkMode
                  ? "bg-stone-900/90 border-stone-800 focus:border-amber-500 text-white"
                  : "bg-white border-stone-200 focus:border-amber-600 text-stone-900"
              }`}
            />
          </div>
        </div>

        <div className={`p-5 rounded-3xl border mb-10 space-y-4 ${darkMode ? "bg-stone-900/50 border-stone-800/80" : "bg-white border-stone-200 shadow-sm"}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider opacity-60 mr-2 flex items-center gap-1">
              <Gem className="w-3.5 h-3.5 text-amber-500" />
              {lang === "ka" ? "კატეგორია:" : "Category:"}
            </span>
            {["ყველა", ...(siteSettings.categories || [])].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : darkMode
                    ? "bg-stone-800/80 text-stone-300 hover:bg-stone-800"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {cat === "ყველა" && lang === "en" ? "All" : cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-500/15">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider opacity-60 mr-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                {lang === "ka" ? "მეტალი:" : "Metal:"}
              </span>
              {["ყველა", ...(siteSettings.metals || [])].map((metal) => (
                <button
                  key={metal}
                  onClick={() => setSelectedMetal(metal)}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all border ${
                    selectedMetal === metal
                      ? "border-amber-500 bg-amber-500/15 text-amber-400 font-medium"
                      : darkMode
                      ? "border-stone-800 text-stone-400 hover:border-stone-700"
                      : "border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {metal === "ყველა" && lang === "en" ? "All" : metal}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={onlyExclusive}
                onChange={(e) => setOnlyExclusive(e.target.checked)}
                className="accent-amber-500 w-4 h-4 rounded"
              />
              <span className="text-amber-500 font-medium">
                {lang === "ka" ? "მხოლოდ ექსკლუზიური მოდელები" : "Exclusive pieces only"}
              </span>
            </label>
          </div>
        </div>

        {/* სამკაულების ბადე */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <p className="text-lg">{lang === "ka" ? "არჩეული ფილტრით სამკაული ვერ მოიძებნა." : "No jewelry found matching your criteria."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {filteredProducts.map((product) => {
              const mainImg = product.images?.[0] || product.image || "https://via.placeholder.com/600";
              return (
                <div
                  key={product.id}
                  className={`group rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col ${
                    darkMode
                      ? "bg-[#141210] border-stone-800/80 hover:border-amber-500/40"
                      : "bg-white border-stone-200/90 hover:border-amber-500 shadow-sm hover:shadow-xl"
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden bg-stone-900">
                    <img
                      src={mainImg}
                      alt={product.name}
                      onClick={() => openProductModal(product)}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {product.exclusive && (
                        <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest bg-black/80 text-amber-400 border border-amber-500/40 backdrop-blur-md">
                          {lang === "ka" ? "ექსკლუზივი" : "Exclusive"}
                        </span>
                      )}
                      {product.oldPrice && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-red-600/90 text-white backdrop-blur-md shadow-md">
                          {lang === "ka" ? "ფასდაკლება" : "Sale"}
                        </span>
                      )}
                    </div>
                    {product.images?.length > 1 && (
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] bg-black/70 text-white backdrop-blur-sm">
                        +{product.images.length} {lang === "ka" ? "ფოტო" : "photos"}
                      </span>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 text-white hover:bg-black transition-all"
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-[11px] opacity-60 mb-1">
                        <span>{product.category}</span>
                        <span>{product.sku}</span>
                      </div>
                      <h3
                        onClick={() => openProductModal(product)}
                        className="font-serif text-xl font-medium cursor-pointer hover:text-amber-500 transition-colors"
                      >
                        {lang === "ka" ? product.name : (product.nameEn || product.name)}
                      </h3>
                      <p className="text-xs opacity-70 mt-1">
                        {product.metal} • {product.karat}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-500/15 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        {product.oldPrice && (
                          <span className="text-xs line-through opacity-50 font-normal">
                            {product.oldPrice}
                          </span>
                        )}
                        <span className="font-serif text-xl text-amber-500 font-semibold leading-tight">
                          {product.price}
                        </span>
                      </div>
                      <button
                        onClick={() => openProductModal(product)}
                        className="px-4 py-2 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {lang === "ka" ? "დეტალურად" : "Details"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ოსტატობის სექცია */}
      <section id="craftsmanship" className={`py-20 border-y ${darkMode ? "bg-[#12100e] border-stone-800/70" : "bg-stone-900 text-white border-stone-800"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-500 block">
              {lang === "ka" ? siteSettings.craftBadge : (siteSettings.craftBadgeEn || siteSettings.craftBadge)}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl leading-tight text-white">
              {lang === "ka" ? siteSettings.craftTitle : (siteSettings.craftTitleEn || siteSettings.craftTitle)}
            </h2>
            <p className="text-stone-300 leading-relaxed text-base sm:text-lg">
              {lang === "ka" ? siteSettings.craftDesc : (siteSettings.craftDescEn || siteSettings.craftDesc)}
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
              <div className="p-2.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center sm:items-start text-center sm:text-left overflow-hidden">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mb-1.5 sm:mb-2 shrink-0" />
                <div className="text-sm sm:text-xl font-serif font-bold text-white leading-tight">100%</div>
                <div className="text-[10px] sm:text-xs text-stone-400 mt-1 leading-tight break-words w-full">
                  {lang === "ka" ? "სერტიფიცირებული" : "Certified Gems"}
                </div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center sm:items-start text-center sm:text-left overflow-hidden">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mb-1.5 sm:mb-2 shrink-0" />
                <div className="text-sm sm:text-xl font-serif font-bold text-white leading-tight">18K / 750°</div>
                <div className="text-[10px] sm:text-xs text-stone-400 mt-1 leading-tight break-words w-full">
                  {lang === "ka" ? "უმაღლესი სინჯი" : "Finest Gold"}
                </div>
              </div>

              <div className="p-2.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center sm:items-start text-center sm:text-left overflow-hidden">
                <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mb-1.5 sm:mb-2 shrink-0" />
                <div className="text-sm sm:text-xl font-serif font-bold text-white leading-tight">
                  {lang === "ka" ? "ხელნაკეთი" : "Handmade"}
                </div>
                <div className="text-[10px] sm:text-xs text-stone-400 mt-1 leading-tight break-words w-full">
                  {lang === "ka" ? "ექსკლუზიური დიზაინი" : "Exclusive Design"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <img
              src={siteSettings.craftImg1}
              alt="Craftsmanship 1"
              className="w-full h-72 sm:h-80 object-cover rounded-3xl border border-amber-500/20 shadow-2xl"
            />
            <img
              src={siteSettings.craftImg2}
              alt="Craftsmanship 2"
              className="w-full h-72 sm:h-80 object-cover rounded-3xl border border-amber-500/20 shadow-2xl mt-8"
            />
          </div>
        </div>
      </section>

      {/* კონტაქტი & ქვედა პანელი */}
      <footer id="contact" className={`pt-16 pb-12 border-t ${darkMode ? "bg-[#090807] border-stone-800" : "bg-stone-100 border-stone-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-stone-500/15">
            <div className="space-y-3">
              <div className="font-serif text-2xl tracking-[0.2em] font-semibold">
                {siteSettings.brandName}
              </div>
              <p className="text-sm opacity-75 leading-relaxed">
                {lang === "ka" ? siteSettings.footerDesc : (siteSettings.footerDescEn || siteSettings.footerDesc)}
              </p>
              <div className="flex items-center gap-3 pt-2">
                {siteSettings.instagram && (
                  <a href={siteSettings.instagram} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition-all">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {siteSettings.facebook && (
                  <a href={siteSettings.facebook} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition-all">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <h4 className="font-serif text-lg text-amber-500 uppercase tracking-wider">
                {lang === "ka" ? "შოურუმი და კონტაქტი" : "Showroom & Contact"}
              </h4>
              <p className="flex items-center gap-2.5 opacity-80">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                {lang === "ka" ? siteSettings.address : (siteSettings.addressEn || siteSettings.address)}
              </p>
              <p className="flex items-center gap-2.5 opacity-80">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                {siteSettings.phone}
              </p>
              <p className="flex items-center gap-2.5 opacity-80">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                {lang === "ka" ? siteSettings.hours : (siteSettings.hoursEn || siteSettings.hours)}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif text-lg text-amber-500 uppercase tracking-wider">
                {lang === "ka" ? "სწრაფი კონსულტაცია" : "Quick Consultation"}
              </h4>
              <p className="text-xs opacity-75">
                {lang === "ka" ? "მოგვწერეთ პირდაპირ WhatsApp-ში ან Messenger-ში:" : "Message us directly via WhatsApp or Messenger:"}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={`https://wa.me/${(siteSettings.whatsapp || "").replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <a
                  href={siteSettings.messenger || "https://m.me/"}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Messenger
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 text-center text-xs opacity-60">
            {siteSettings.copyright}
          </div>
        </div>
      </footer>

      {/* დეტალური მოდალი */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start lg:items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className={`relative w-full max-w-5xl rounded-3xl border overflow-hidden my-auto ${darkMode ? "bg-[#141210] border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"}`}>
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2.5 rounded-full bg-black/80 text-white border border-white/20 hover:bg-black transition-all shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6 bg-black/20 flex flex-col justify-between">
                <div
                  className="relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden bg-stone-900/90 flex items-center justify-center cursor-zoom-in group"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMoveZoom}
                  onClick={() => setLightboxImage(selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0])}
                >
                  <img
                    src={selectedProduct.images?.[activeImageIndex] || selectedProduct.images?.[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain transition-transform duration-200"
                    style={
                      isZoomed
                        ? {
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                            transform: "scale(2.35)"
                          }
                        : {}
                    }
                  />
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs flex items-center gap-1.5 pointer-events-none">
                    <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                    {lang === "ka" ? "მაუსით მიახლოება / გადიდება" : "Hover to Zoom / Click Fullscreen"}
                  </div>

                  {selectedProduct.images?.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length);
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {selectedProduct.images?.length > 1 && (
                  <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                    {selectedProduct.images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          activeImageIndex === idx ? "border-amber-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 space-y-5 max-h-[85vh] overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between gap-2 pr-10">
                    <div className="flex items-center gap-2 text-xs text-amber-500 uppercase tracking-widest">
                      <span>{selectedProduct.category}</span>
                      <span>•</span>
                      <span>{selectedProduct.sku}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleShareProduct(selectedProduct)}
                      className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === "ka" ? "დაკოპირდა!" : "Copied!"}</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{lang === "ka" ? "გაზიარება" : "Share"}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl mt-1">
                    {lang === "ka" ? selectedProduct.name : (selectedProduct.nameEn || selectedProduct.name)}
                  </h2>
                  <div className="flex items-baseline gap-3 mt-2">
                    {selectedProduct.oldPrice && (
                      <span className="font-serif text-lg line-through opacity-50">
                        {selectedProduct.oldPrice}
                      </span>
                    )}
                    <span className="font-serif text-2xl text-amber-500 font-semibold">
                      {selectedProduct.price}
                    </span>
                    {selectedProduct.oldPrice && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-red-600/20 text-red-400 border border-red-500/30">
                        {lang === "ka" ? "ფასდაკლება" : "Sale"}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm opacity-80 leading-relaxed">
                  {lang === "ka" ? selectedProduct.description : (selectedProduct.descriptionEn || selectedProduct.description)}
                </p>

                <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl border text-xs ${darkMode ? "bg-stone-900/60 border-stone-800" : "bg-stone-50 border-stone-200"}`}>
                  <div>
                    <span className="opacity-60 block">{lang === "ka" ? "მეტალი:" : "Metal:"}</span>
                    <span className="font-medium">{selectedProduct.metal}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block">{lang === "ka" ? "სინჯი:" : "Karat:"}</span>
                    <span className="font-medium">{selectedProduct.karat}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block">{lang === "ka" ? "წონა:" : "Weight:"}</span>
                    <span className="font-medium">{selectedProduct.weight}</span>
                  </div>
                  <div>
                    <span className="opacity-60 block">{lang === "ka" ? "ქვები:" : "Gemstones:"}</span>
                    <span className="font-medium">{selectedProduct.stones}</span>
                  </div>
                </div>

                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="uppercase tracking-wider opacity-75">
                        {lang === "ka" ? "აირჩიეთ ზომა:" : "Select Size:"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSizeGuide(!showSizeGuide)}
                        className="text-amber-500 underline hover:text-amber-400"
                      >
                        {lang === "ka" ? "ზომის გზამკვლევი" : "Size Guide"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                            selectedSize === sz
                              ? "bg-amber-500 text-black border-amber-500"
                              : darkMode
                              ? "border-stone-700 hover:border-amber-500/50"
                              : "border-stone-300 hover:border-amber-600"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                    {showSizeGuide && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                        <p className="font-semibold text-amber-400">
                          {lang === "ka" ? "სტანდარტული ზომების ცხრილი:" : "Standard Size Reference:"}
                        </p>
                        <p>16.0 მმ ≈ თითის გარშემოწერილობა 50 მმ (US 5.5)</p>
                        <p>16.5 მმ ≈ თითის გარშემოწერილობა 52 მმ (US 6)</p>
                        <p>17.0 მმ ≈ თითის გარშემოწერილობა 53.5 მმ (US 6.5)</p>
                        <p>17.5 მმ ≈ თითის გარშემოწერილობა 55 მმ (US 7)</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <span className="text-xs uppercase tracking-wider opacity-70 block">
                    {lang === "ka" ? "სწრაფი დაკავშირება ამ მოდელზე:" : "Instant Inquiry for this Piece:"}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={getWhatsAppLink(selectedProduct)}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {lang === "ka" ? "WhatsApp-ში მიწერა" : "Ask on WhatsApp"}
                    </a>
                    <a
                      href={siteSettings.messenger || "https://m.me/"}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      {lang === "ka" ? "Messenger-ში მიწერა" : "Ask on Messenger"}
                    </a>
                  </div>
                </div>

                <form onSubmit={handleSendInquiry} noValidate className="space-y-3 pt-4 border-t border-stone-500/20">
                  <div className="text-xs font-medium text-amber-500 uppercase tracking-wider">
                    {lang === "ka" ? "ან დაგვიტოვეთ ნომერი კონსულტაციისთვის:" : "Or Request a Private Callback:"}
                  </div>
                  {inquirySent ? (
                    <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {lang === "ka" ? "მოთხოვნა მიღებულია! ჩვენი კონსულტანტი მალე დაგიკავშირდებათ." : "Request sent! Our consultant will contact you shortly."}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => {
                            setClientName(e.target.value);
                            if (phoneError) setPhoneError("");
                          }}
                          placeholder={lang === "ka" ? "თქვენი სახელი" : "Your Name"}
                          className={`px-3.5 py-2.5 rounded-xl text-xs border outline-none ${darkMode ? "bg-stone-900 border-stone-700" : "bg-stone-50 border-stone-300"}`}
                        />
                        <input
                          type="tel"
                          value={clientPhone}
                          onChange={(e) => {
                            setClientPhone(e.target.value);
                            if (phoneError) setPhoneError("");
                          }}
                          placeholder={lang === "ka" ? "5XX XX XX XX" : "+995 5XX XX XX XX"}
                          className={`px-3.5 py-2.5 rounded-xl text-xs border outline-none transition-colors ${
                            phoneError
                              ? "border-red-500 bg-red-500/10 text-red-200"
                              : darkMode
                              ? "bg-stone-900 border-stone-700 focus:border-amber-500"
                              : "bg-stone-50 border-stone-300 focus:border-amber-600"
                          }`}
                        />
                      </div>

                      {/* წითელი შეცდომის ტექსტი */}
                      {phoneError && (
                        <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-medium">
                          ⚠️ {phoneError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all"
                      >
                        {lang === "ka" ? "ზარის მოთხოვნა" : "Request Consultation"}
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* სრულ ეკრანზე გადიდებული სურათი (Lightbox) */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white">
            <X className="w-6 h-6" />
          </button>
          <img src={selectedProduct?.images?.[activeImageIndex] || lightboxImage} alt="Fullscreen" className="max-w-full max-h-[80vh] object-contain rounded-xl mb-4" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-60 flex flex-col items-center gap-4 w-full max-w-xs">
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev - 1 + (selectedProduct.images?.length || 0)) % (selectedProduct.images?.length || 0));
                }}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-xs text-white/70 font-medium tracking-widest">
                {activeImageIndex + 1} / {selectedProduct.images?.length || 0}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev + 1) % (selectedProduct.images?.length || 0));
                }}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {selectedProduct.images?.length > 1 && (
              <div className="flex items-center justify-center gap-2 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                {selectedProduct.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(idx);
                    }}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? "border-amber-500 scale-110" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* რჩეულების მოდალი */}
      {showFavoritesModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-3xl border p-6 ${darkMode ? "bg-[#141210] border-stone-800 text-white" : "bg-white border-stone-200 text-stone-900"}`}>
            <div className="flex items-center justify-between pb-4 border-b border-stone-500/20">
              <h3 className="font-serif text-2xl">{lang === "ka" ? "რჩეული სამკაულები" : "Saved Jewelry"}</h3>
              <button onClick={() => setShowFavoritesModal(false)} className="p-2 rounded-full hover:bg-stone-500/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 max-h-96 overflow-y-auto space-y-3">
              {favorites.length === 0 ? (
                <p className="text-center py-8 opacity-60 text-sm">{lang === "ka" ? "რჩეულების სია ცარიელია." : "No saved items yet."}</p>
              ) : (
                products
                  .filter((p) => favorites.includes(p.id))
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl border border-stone-500/15">
                      <div className="flex items-center gap-3">
                        <img src={item.images?.[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
                        <div>
                          <div className="font-serif font-medium">{item.name}</div>
                          <div className="flex items-center gap-2">
                            {item.oldPrice && (
                              <span className="text-xs line-through opacity-50">{item.oldPrice}</span>
                            )}
                            <span className="text-xs text-amber-500 font-semibold">{item.price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setShowFavoritesModal(false);
                            openProductModal(item);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-medium"
                        >
                          {lang === "ka" ? "ნახვა" : "View"}
                        </button>
                        <button onClick={() => toggleFavorite(item.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
         
        </div>
      )}
    </div>
  );
}
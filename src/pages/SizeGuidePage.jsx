import React, { useState, useEffect } from 'react';
import {
  Ruler, Sparkles, AlertCircle, MessageCircle, ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FavoritesModal from '../components/modals/FavoritesModal';
import RingSizerTool, { SIZE_CHART, getClosestSize } from '../components/store/RingSizerTool';

// ყელსაბამის სიგრძეები
const NECKLACE_LENGTHS = [
  {
    length: "40 სმ",
    title: "Choker / ყელზე მომდგარი",
    desc: "ეკვრის ყელის ძირს. იდეალურია ღრმა V-კისრისთვის, ბიუსტჰალტერის ხაზის ზემოთ და ღია მხრების მქონე კაბებისთვის.",
    bestFor: "ღია დეკოლტე, საღამოს კაბა, პერანგის ღია საყელო",
    tag: "მინიმალიზმი"
  },
  {
    length: "45 სმ",
    title: "Princess / პრინცესა (ყველაზე პოპულარული)",
    desc: "ეშვება ლავიწის ძვლის გასწვრივ. ყველაზე უნივერსალური და მოთხოვნადი სიგრძე ქალის ყელსაბამისთვის, უხდება ნებისმიერ გულსაკიდსა და სამოსს.",
    bestFor: "ყოველდღიური ტარება, მაისური, პერანგი, ნებისმიერი ჭრილი",
    tag: "უნივერსალური"
  },
  {
    length: "50 სმ",
    title: "Matinee / მატინე",
    desc: "ჩამოდის ლავიწის ძვლის ქვემოთ, მკერდის დასაწყისამდე. ანიჭებს ელეგანტურ და არისტოკრატულ აქცენტს.",
    bestFor: "დახურული საყელო, როლინგი, კოსტიუმები, მსხვილი კულონი",
    tag: "ელეგანტური"
  },
  {
    length: "55-60 სმ",
    title: "Opera / ოპერა (გრძელი)",
    desc: "ჩამოდის მკერდის ცენტრამდე. საუკეთესოა მსხვილი, მასიური გულსაკიდებისთვის ან რამდენიმე სხვადასხვა ჯაჭვის ერთად (ფენებად) სატარებლად.",
    bestFor: "Layering (ფენებად ტარება), დახურული ზამთრის სამოსი",
    tag: "Layering"
  }
];

// სამაჯურის ზომები
const BRACELET_SIZES = [
  { size: "15 - 16 სმ", label: "XS (ვიწრო მაჯა)", wrist: "13.5 - 14.5 სმ მაჯისთვის", fit: "მჭიდროდ მორგება" },
  { size: "17 - 18 სმ", label: "S / M (სტანდარტული ქალი)", wrist: "15.0 - 16.5 სმ მაჯისთვის", fit: "კომფორტული კლასიკური დაშვება (ყველაზე პოპულარული)" },
  { size: "19 - 20 სმ", label: "L / მამაკაცი", wrist: "17.0 - 18.5 სმ მაჯისთვის", fit: "თავისუფალი დაშვება ქალისთვის ან სტანდარტული კაცისთვის" },
];

export default function SizeGuidePage() {
  const { darkMode, setDarkMode, lang, setLang, siteSettings, favorites } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  // აქტიური კატეგორია
  const [activeCategory, setActiveCategory] = useState("rings"); // "rings" | "necklaces" | "bracelets" | "tips"
  const [selectedDiameter, setSelectedDiameter] = useState(16.5);

  // ყელსაბამის აქტიური სიგრძე
  const [selectedNecklace, setSelectedNecklace] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = lang === "ka"
      ? `სამკაულების ზომის გზამკვლევი — ${siteSettings.brandName || "მატარე"}`
      : `Jewelry Sizing Guide — ${siteSettings.brandName || "MATARE"}`;
  }, [lang, siteSettings.brandName]);

  const closest = getClosestSize(selectedDiameter);

  const cleanPhone = (siteSettings?.whatsapp || "995555000000").replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    lang === "ka"
      ? "გამარჯობა! სამკაულის ზომის შერჩევაზე მჭირდება კონსულტაცია."
      : "Hello! I need consultation choosing my jewelry size."
  )}`;

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors ${darkMode ? "bg-[#0a0a0a] text-[#f5f0e6]" : "bg-[#faf7f2] text-[#1c1917]"}`}>
      <Navbar
        lang={lang} setLang={setLang}
        darkMode={darkMode} setDarkMode={setDarkMode}
        favorites={favorites} setShowFavoritesModal={setShowFavoritesModal}
        isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 pt-28 pb-20">
        <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs opacity-60 mb-6">
            <a href="/" className="hover:text-amber-500 transition-colors">
              {lang === "ka" ? "მთავარი" : "Home"}
            </a>
            <span>/</span>
            <span className="text-amber-500">
              {lang === "ka" ? "ზომის გზამკვლევი" : "Size Guide"}
            </span>
          </nav>

          {/* Hero Section */}
          <header className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-xs uppercase tracking-widest font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === "ka" ? "საერთაშორისო საიუველირო სტანდარტები" : "International Jewelry Standards"}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl tracking-wide font-medium">
              {lang === "ka" ? "სამკაულების ზომის გზამკვლევი" : "Complete Jewelry Sizing Guide"}
            </h1>
            <p className="text-sm sm:text-base opacity-75 leading-relaxed max-w-2xl mx-auto">
              {lang === "ka"
                ? "შეარჩიეთ თქვენი იდეალური ზომა — ბეჭდები, ყელსაბამები და სამაჯურები. გაზომეთ ონლაინ ეკრანზე დადებით ან გაეცანით ზომების საერთაშორისო ცხრილს."
                : "Find your perfect fit for rings, necklaces, and bracelets using our interactive tools and international conversion charts."}
            </p>

            {/* Category Navigation Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setActiveCategory("rings")}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeCategory === "rings"
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                    : "border border-stone-500/20 hover:border-amber-500/50 opacity-80 hover:opacity-100"
                }`}
              >
                💍 {lang === "ka" ? "ბეჭდები" : "Rings"}
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("necklaces")}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeCategory === "necklaces"
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                    : "border border-stone-500/20 hover:border-amber-500/50 opacity-80 hover:opacity-100"
                }`}
              >
                📿 {lang === "ka" ? "ყელსაბამები" : "Necklaces"}
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("bracelets")}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeCategory === "bracelets"
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                    : "border border-stone-500/20 hover:border-amber-500/50 opacity-80 hover:opacity-100"
                }`}
              >
                ✨ {lang === "ka" ? "სამაჯურები" : "Bracelets"}
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("tips")}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeCategory === "tips"
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                    : "border border-stone-500/20 hover:border-amber-500/50 opacity-80 hover:opacity-100"
                }`}
              >
                💡 {lang === "ka" ? "იუველირის რჩევები" : "Expert Tips"}
              </button>
            </div>
          </header>

          {/* 1. SECTION: RINGS (ბეჭდები) */}
          {(activeCategory === "rings" || activeCategory === "all") && (
            <section className="space-y-8 mb-16 animate-fadeIn">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-500/20">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-medium">
                    {lang === "ka" ? "ბეჭდის ზომის ინტერაქტიული საზომი" : "Interactive Ring Sizer"}
                  </h2>
                  <p className="text-xs opacity-60">
                    {lang === "ka" ? "გაზომეთ არსებული ბეჭდით ან თითის გარშემოწერილობით (ISO 8653)" : "Measure with existing ring or finger circumference"}
                  </p>
                </div>
              </div>

              {/* Layout: Interactive Tool on Left, Table on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Interactive Tool Card */}
                <div className={`lg:col-span-7 p-6 rounded-3xl border shadow-xl ${
                  darkMode ? "bg-[#141210] border-amber-500/20" : "bg-white border-stone-200"
                }`}>
                  <RingSizerTool
                    onSizeChange={(size, d) => setSelectedDiameter(d)}
                    showNotice={true}
                    darkMode={darkMode}
                    lang={lang}
                  />
                </div>

                {/* Conversion Table Card */}
                <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-xl space-y-4 ${
                  darkMode ? "bg-[#141210] border-amber-500/20" : "bg-white border-stone-200"
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-500/15">
                    <h3 className="font-serif text-lg font-medium">
                      {lang === "ka" ? "ზომების სრული ცხრილი" : "Size Conversion Chart"}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase font-semibold">
                      ISO 8653
                    </span>
                  </div>

                  <p className="text-xs opacity-75">
                    {lang === "ka"
                      ? "საქართველოში ბეჭდის ზომა უდრის მის შიდა დიამეტრს მილიმეტრებში:"
                      : "In Georgia, ring size equals inner diameter in millimeters:"}
                  </p>

                  <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-stone-500/20 text-[10px] uppercase tracking-wider opacity-60 sticky top-0 backdrop-blur-md">
                          <th className="py-2.5">{lang === "ka" ? "ზომა (EU)" : "Size (EU)"}</th>
                          <th className="py-2.5">{lang === "ka" ? "დიამეტრი" : "Diameter"}</th>
                          <th className="py-2.5">{lang === "ka" ? "გარშემოწერა" : "Circumf."}</th>
                          <th className="py-2.5">{lang === "ka" ? "აშშ (US)" : "US"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-500/10">
                        {SIZE_CHART.map((item) => {
                          const isCurrent = closest.eu === item.eu;
                          return (
                            <tr
                              key={item.eu}
                              onClick={() => setSelectedDiameter(item.diameter)}
                              className={`cursor-pointer transition-colors ${
                                isCurrent
                                  ? "bg-amber-500/15 font-semibold text-amber-500"
                                  : "hover:bg-stone-500/5 opacity-80 hover:opacity-100"
                              }`}
                            >
                              <td className="py-2.5 font-serif text-sm font-semibold">{item.eu}</td>
                              <td className="py-2.5">{item.diameter.toFixed(1)} მმ</td>
                              <td className="py-2.5">{item.circumference.toFixed(1)} მმ</td>
                              <td className="py-2.5">US {item.us}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <a
                    href="/catalog"
                    className="w-full py-3 px-4 rounded-2xl bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <span>{lang === "ka" ? "ბეჭდების კოლექციის ნახვა" : "Browse Rings"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

              </div>
            </section>
          )}

          {/* 2. SECTION: NECKLACES (ყელსაბამები) */}
          {(activeCategory === "necklaces" || activeCategory === "all") && (
            <section className="space-y-8 mb-16 animate-fadeIn">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-500/20">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-medium">
                    {lang === "ka" ? "ყელსაბამებისა და ჯაჭვების სიგრძეების გიდი" : "Necklace & Chain Length Guide"}
                  </h2>
                  <p className="text-xs opacity-60">
                    {lang === "ka" ? "როგორ გამოიყურება სხვადასხვა სიგრძის ყელსაბამი დეკოლტეზე" : "Visual placement guide for standard necklace lengths"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Visual Silhouette & Length Selector */}
                <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-xl flex flex-col items-center text-center space-y-6 ${
                  darkMode ? "bg-[#141210] border-amber-500/20" : "bg-white border-stone-200"
                }`}>
                  <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
                    {lang === "ka" ? "ვიზუალური ილუსტრაცია" : "Visual Length Illustration"}
                  </span>

                  {/* Collarbone / Silhouette Vector Representation */}
                  <div className="relative w-64 h-72 border border-stone-500/20 rounded-2xl bg-stone-500/5 flex items-center justify-center overflow-hidden">
                    {/* Head / Neckline outline */}
                    <svg viewBox="0 0 200 240" className="w-full h-full text-stone-500/30">
                      {/* Neck & Shoulders */}
                      <path
                        d="M 60 0 L 60 70 Q 60 90 20 110 L 0 130 L 0 240 L 200 240 L 200 130 L 180 110 Q 140 90 140 70 L 140 0 Z"
                        fill="currentColor"
                        opacity="0.35"
                      />
                      {/* Collarbone lines */}
                      <path d="M 60 100 Q 100 115 140 100" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
                      
                      {/* 40cm Chain */}
                      <path
                        d="M 75 70 Q 100 110 125 70"
                        stroke={selectedNecklace === 0 ? "#f59e0b" : "currentColor"}
                        strokeWidth={selectedNecklace === 0 ? "3.5" : "1.5"}
                        fill="none"
                        className="transition-all duration-300"
                        opacity={selectedNecklace === 0 ? 1 : 0.4}
                      />
                      {/* 45cm Chain */}
                      <path
                        d="M 72 70 Q 100 135 128 70"
                        stroke={selectedNecklace === 1 ? "#f59e0b" : "currentColor"}
                        strokeWidth={selectedNecklace === 1 ? "3.5" : "1.5"}
                        fill="none"
                        className="transition-all duration-300"
                        opacity={selectedNecklace === 1 ? 1 : 0.4}
                      />
                      {/* 50cm Chain */}
                      <path
                        d="M 70 70 Q 100 160 130 70"
                        stroke={selectedNecklace === 2 ? "#f59e0b" : "currentColor"}
                        strokeWidth={selectedNecklace === 2 ? "3.5" : "1.5"}
                        fill="none"
                        className="transition-all duration-300"
                        opacity={selectedNecklace === 2 ? 1 : 0.4}
                      />
                      {/* 60cm Chain */}
                      <path
                        d="M 68 70 Q 100 195 132 70"
                        stroke={selectedNecklace === 3 ? "#f59e0b" : "currentColor"}
                        strokeWidth={selectedNecklace === 3 ? "3.5" : "1.5"}
                        fill="none"
                        className="transition-all duration-300"
                        opacity={selectedNecklace === 3 ? 1 : 0.4}
                      />

                      {/* Pendant dot on active */}
                      {selectedNecklace === 0 && <circle cx="100" cy="110" r="4.5" fill="#f59e0b" />}
                      {selectedNecklace === 1 && <circle cx="100" cy="135" r="5" fill="#f59e0b" />}
                      {selectedNecklace === 2 && <circle cx="100" cy="160" r="5.5" fill="#f59e0b" />}
                      {selectedNecklace === 3 && <circle cx="100" cy="195" r="6" fill="#f59e0b" />}
                    </svg>

                    <span className="absolute bottom-3 text-[11px] font-mono text-amber-500 font-bold px-3 py-1 rounded-full bg-black/60 border border-amber-500/30">
                      {NECKLACE_LENGTHS[selectedNecklace].length}
                    </span>
                  </div>

                  {/* Length Switcher Buttons */}
                  <div className="grid grid-cols-4 gap-2 w-full text-xs">
                    {NECKLACE_LENGTHS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedNecklace(idx)}
                        className={`py-2 rounded-xl border text-center transition-all ${
                          selectedNecklace === idx
                            ? "bg-amber-500 text-black border-amber-500 font-bold shadow-md"
                            : "border-stone-500/20 hover:border-amber-500/40 opacity-75 hover:opacity-100"
                        }`}
                      >
                        {item.length}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Length Descriptions Cards */}
                <div className="lg:col-span-7 space-y-3">
                  {NECKLACE_LENGTHS.map((item, idx) => {
                    const isSelected = selectedNecklace === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedNecklace(idx)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500 shadow-md"
                            : darkMode
                            ? "bg-[#141210]/60 border-stone-800 hover:border-stone-700"
                            : "bg-white border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-lg text-amber-500">
                              {item.length}
                            </span>
                            <span className="font-medium text-sm">
                              {item.title}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                            isSelected ? "bg-amber-500 text-black" : "bg-stone-500/15 opacity-70"
                          }`}>
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs opacity-80 leading-relaxed mb-2.5">
                          {item.desc}
                        </p>
                        <div className="text-[11px] opacity-70">
                          <span className="font-semibold text-amber-500/90">{lang === "ka" ? "საუკეთესოა:" : "Best for:"}</span>{" "}
                          <span>{item.bestFor}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </section>
          )}

          {/* 3. SECTION: BRACELETS (სამაჯურები) */}
          {(activeCategory === "bracelets" || activeCategory === "all") && (
            <section className="space-y-8 mb-16 animate-fadeIn">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-500/20">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-medium">
                    {lang === "ka" ? "სამაჯურის ზომის შერჩევა" : "Bracelet Sizing Guide"}
                  </h2>
                  <p className="text-xs opacity-60">
                    {lang === "ka" ? "როგორ გავზომოთ მაჯა და რამდენი სანტიმეტრი დავამატოთ თავისუფალი დაშვებისთვის" : "How to measure wrist and calculate ideal ease"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {BRACELET_SIZES.map((b, i) => (
                  <div
                    key={i}
                    className={`p-6 rounded-3xl border space-y-3 ${
                      darkMode ? "bg-[#141210] border-amber-500/20" : "bg-white border-stone-200"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold block">
                      {b.label}
                    </span>
                    <h3 className="font-serif text-2xl font-medium">
                      {b.size}
                    </h3>
                    <div className="text-xs space-y-1.5 pt-2 border-t border-stone-500/15">
                      <p className="opacity-75">
                        <span className="font-semibold text-amber-500">მაჯის გარშემოწერილობა:</span> {b.wrist}
                      </p>
                      <p className="opacity-75">
                        <span className="font-semibold text-amber-500">დაშვება:</span> {b.fit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bracelet measurement instruction */}
              <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                darkMode ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-500/10 border-amber-500/30"
              }`}>
                <div className="space-y-1.5 max-w-2xl text-xs">
                  <h4 className="font-serif text-base font-semibold text-amber-500">
                    {lang === "ka" ? "💡 ოქროს წესი სამაჯურისთვის:" : "💡 Golden Rule for Bracelets:"}
                  </h4>
                  <p className="opacity-80 leading-relaxed">
                    {lang === "ka"
                      ? "გაზომეთ მაჯის გარშემოწერილობა ძვლიდან ოდნავ ზემოთ სანტიმეტრით და მიღებულ რიცხვს დაუმატეთ 1.5 – 2 სმ. ეს მოგცემთ კომფორტულ, ბუნებრივ დაშვებას, რათა სამაჯურმა ხელი არ მოგიჭიროთ."
                      : "Measure wrist snug above the wrist bone and add 1.5 - 2 cm for a comfortable fit."}
                  </p>
                </div>
                <a
                  href="/catalog"
                  className="px-5 py-3 rounded-2xl bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all shrink-0"
                >
                  {lang === "ka" ? "სამაჯურების კატალოგი" : "View Bracelets"}
                </a>
              </div>
            </section>
          )}

          {/* 4. SECTION: JEWELER TIPS (იუველირის რჩევები) */}
          {(activeCategory === "tips" || activeCategory === "all") && (
            <section className="space-y-8 mb-16 animate-fadeIn">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-500/20">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-medium">
                    {lang === "ka" ? "პროფესიონალი იუველირის რჩევები ზომის შერჩევისას" : "Expert Jeweler Sizing Tips"}
                  </h2>
                  <p className="text-xs opacity-60">
                    {lang === "ka" ? "რა უნდა გაითვალისწინოთ შეკვეთამდე, რათა თავიდან აირიდოთ ზომის შეცვლა" : "Crucial details to consider before placing your order"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className={`p-6 rounded-3xl border space-y-3 ${
                  darkMode ? "bg-[#141210] border-stone-800" : "bg-white border-stone-200"
                }`}>
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold font-serif text-base">
                    01
                  </div>
                  <h4 className="font-serif text-base font-semibold">
                    {lang === "ka" ? "დღის დრო და ტემპერატურა" : "Time of Day & Temperature"}
                  </h4>
                  <p className="opacity-75 leading-relaxed">
                    {lang === "ka"
                      ? "თითების ზომა იცვლება დღის განმავლობაში. დილით ან სიცივეში თითი უფრო ვიწროა, ხოლო საღამოს და სიცხეში — ოდნავ ფართოვდება. იდეალური დრო გასაზომად არის დღის მეორე ნახევარი ოთახის ტემპერატურაზე."
                      : "Fingers fluctuate in size throughout the day. Best time to measure is late afternoon at normal room temperature."}
                  </p>
                </div>

                <div className={`p-6 rounded-3xl border space-y-3 ${
                  darkMode ? "bg-[#141210] border-stone-800" : "bg-white border-stone-200"
                }`}>
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold font-serif text-base">
                    02
                  </div>
                  <h4 className="font-serif text-base font-semibold">
                    {lang === "ka" ? "ბეჭდის სიგანე (სისქე)" : "Ring Band Width"}
                  </h4>
                  <p className="opacity-75 leading-relaxed">
                    {lang === "ka"
                      ? "განიერი ბეჭდები (6 მმ და მეტი) თითზე უფრო მჭიდროდ ჯდება, ვიდრე წვრილი კლასიკური ბეჭდები. განიერი მოდელის შეკვეთისას რეკომენდებულია აირჩიოთ ნახევარი (0.5) ზომით მეტი."
                      : "Wide band rings (6mm+) fit tighter. We recommend sizing up by half a size for wide bands."}
                  </p>
                </div>

                <div className={`p-6 rounded-3xl border space-y-3 ${
                  darkMode ? "bg-[#141210] border-stone-800" : "bg-white border-stone-200"
                }`}>
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold font-serif text-base">
                    03
                  </div>
                  <h4 className="font-serif text-base font-semibold">
                    {lang === "ka" ? "სახსრის (მუხლის) გათვალისწინება" : "Knuckle Considerations"}
                  </h4>
                  <p className="opacity-75 leading-relaxed">
                    {lang === "ka"
                      ? "თუ თქვენი თითის სახსარი (მუხლი) შესამჩნევად უფრო განიერია, ვიდრე თითის ფუძე, გაზომეთ როგორც სახსარი, ისე ფუძე და აირჩიეთ საშუალო რიცხვი, რათა ბეჭედმა თავისუფლად გაიაროს."
                      : "If your knuckle is larger than the base of your finger, measure both and choose a size in between."}
                  </p>
                </div>
              </div>

              {/* Assistance Callout */}
              <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                darkMode ? "bg-[#141210] border-amber-500/30" : "bg-white border-stone-200 shadow-sm"
              }`}>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-semibold">
                      {lang === "ka" ? "ვერ გადაწყვიტეთ ზომა? დაგვიკავშირდით პირდაპირ" : "Still unsure about size? Contact us"}
                    </h4>
                    <p className="text-xs opacity-70">
                      {lang === "ka"
                        ? "ჩვენი კონსულტანტი დაგეხმარებათ ზუსტი ზომის შერჩევაში WhatsApp-ის მეშვეობით."
                        : "Our jewelry specialist will help you choose your exact size on WhatsApp."}
                    </p>
                  </div>
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 shadow-lg shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp კონსულტაცია</span>
                </a>
              </div>
            </section>
          )}

        </div>
      </main>

      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={(prod) => {
          setShowFavoritesModal(false);
          window.location.href = `/product/${encodeURIComponent(prod.sku || prod.id)}`;
        }}
      />
    </div>
  );
}

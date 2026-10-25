import React, { useState, useEffect } from 'react';
import {
  Ruler, Sparkles, Sliders, Check, AlertCircle, MessageCircle,
  Plus, Minus, CreditCard, ArrowRight, ArrowLeft, Heart, ChevronDown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FavoritesModal from '../components/modals/FavoritesModal';

// ბეჭდების საერთაშორისო ცხრილი (ISO 8653)
const RING_CHART = [
  { eu: "15.0", diameter: 15.0, circumference: 47.1, us: "4" },
  { eu: "15.5", diameter: 15.5, circumference: 48.7, us: "4.5-5" },
  { eu: "16.0", diameter: 16.0, circumference: 50.3, us: "5.5" },
  { eu: "16.5", diameter: 16.5, circumference: 51.8, us: "6" },
  { eu: "17.0", diameter: 17.0, circumference: 53.4, us: "6.5" },
  { eu: "17.5", diameter: 17.5, circumference: 55.0, us: "7" },
  { eu: "18.0", diameter: 18.0, circumference: 56.5, us: "7.5-8" },
  { eu: "18.5", diameter: 18.5, circumference: 58.1, us: "8.5" },
  { eu: "19.0", diameter: 19.0, circumference: 59.7, us: "9" },
  { eu: "19.5", diameter: 19.5, circumference: 61.3, us: "9.5" },
  { eu: "20.0", diameter: 20.0, circumference: 62.8, us: "10" },
  { eu: "20.5", diameter: 20.5, circumference: 64.4, us: "10.5" },
  { eu: "21.0", diameter: 21.0, circumference: 66.0, us: "11" },
  { eu: "21.5", diameter: 21.5, circumference: 67.5, us: "11.5" },
  { eu: "22.0", diameter: 22.0, circumference: 69.1, us: "12" },
];

const getClosestSize = (d) => {
  let closest = RING_CHART[0];
  let minDiff = Math.abs(d - RING_CHART[0].diameter);
  for (const item of RING_CHART) {
    const diff = Math.abs(d - item.diameter);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
  }
  return closest;
};

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

  // ბეჭდის საზომის მდგომარეობა
  const [ringMethod, setRingMethod] = useState("screen"); // "screen" | "finger" | "table"
  const [diameter, setDiameter] = useState(16.5);
  const [pxPerMm, setPxPerMm] = useState(3.78);
  const [showCalibration, setShowCalibration] = useState(false);
  const [cardWidthPx, setCardWidthPx] = useState(323.5);
  const [fingerCircumference, setFingerCircumference] = useState(52);

  // ყელსაბამის აქტიური სიგრძე
  const [selectedNecklace, setSelectedNecklace] = useState(1); // index

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = lang === "ka"
      ? `სამკაულების ზომის გზამკვლევი — ${siteSettings.brandName || "მატარე"}`
      : `Jewelry Sizing Guide — ${siteSettings.brandName || "MATARE"}`;
  }, [lang, siteSettings.brandName]);

  const closest = getClosestSize(diameter);
  const fingerDiameter = fingerCircumference > 0 ? fingerCircumference / Math.PI : 16.5;
  const closestFinger = getClosestSize(fingerDiameter);

  const cleanPhone = (siteSettings?.whatsapp || "995555000000").replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    lang === "ka"
      ? "გამარჯობა! სამკაულის ზომის შერჩევაზე მჭირდება კონსულტაცია."
      : "Hello! I need consultation choosing my jewelry size."
  )}`;

  const handleCardSlider = (newWidthPx) => {
    setCardWidthPx(newWidthPx);
    setPxPerMm(newWidthPx / 85.60);
  };

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
                  {/* Tool Tabs */}
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-stone-500/10 text-xs font-medium mb-6">
                    <button
                      type="button"
                      onClick={() => setRingMethod("screen")}
                      className={`py-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-2 ${
                        ringMethod === "screen"
                          ? "bg-amber-500 text-black font-semibold shadow"
                          : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lang === "ka" ? "ბეჭდის ეკრანზე დადება" : "Place Ring on Screen"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRingMethod("finger")}
                      className={`py-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-2 ${
                        ringMethod === "finger"
                          ? "bg-amber-500 text-black font-semibold shadow"
                          : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>{lang === "ka" ? "თითის გაზომვა (ქაღალდით)" : "Measure Finger"}</span>
                    </button>
                  </div>

                  {ringMethod === "screen" ? (
                    <div className="space-y-6">
                      <p className="text-xs text-center opacity-75">
                        {lang === "ka"
                          ? "დაადეთ თქვენი ნებისმიერი ბეჭედი ქვედა წრეს და მოარგეთ შიდა კიდე:"
                          : "Place your ring over the circle and match the inner edge:"}
                      </p>

                      {/* Golden Circle Display */}
                      <div className="relative flex items-center justify-center py-6 min-h-[220px]">
                        <div
                          className="rounded-full border-2 border-amber-500 flex items-center justify-center transition-all duration-75 relative"
                          style={{
                            width: `${diameter * pxPerMm}px`,
                            height: `${diameter * pxPerMm}px`,
                            boxShadow: "0 0 40px rgba(245, 158, 11, 0.25), inset 0 0 20px rgba(245, 158, 11, 0.15)",
                          }}
                        >
                          <div className="absolute inset-1.5 rounded-full border border-dashed border-amber-500/40 pointer-events-none" />
                          <div className="text-center px-2 pointer-events-none select-none">
                            <span className="font-serif font-bold text-amber-500 text-2xl block leading-none">
                              {closest.eu}
                            </span>
                            <span className="text-[11px] uppercase tracking-wider opacity-60 block mt-1">
                              {diameter.toFixed(1)} მმ
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Summary Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-center p-3.5 rounded-2xl bg-stone-500/10 border border-stone-500/15">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider opacity-60 block">ზომა (ქართ/EU)</span>
                          <span className="text-lg font-bold text-amber-500 font-serif">{closest.eu}</span>
                        </div>
                        <div className="border-x border-stone-500/20">
                          <span className="text-[10px] uppercase tracking-wider opacity-60 block">შიდა დიამეტრი</span>
                          <span className="text-sm font-semibold">{diameter.toFixed(1)} მმ</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider opacity-60 block">აშშ (US)</span>
                          <span className="text-sm font-semibold">US {closest.us}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setDiameter((prev) => Math.max(14.0, Number((prev - 0.1).toFixed(1))))}
                            className="w-10 h-10 rounded-full border border-stone-500/25 flex items-center justify-center hover:border-amber-500/50 hover:bg-stone-500/10 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="range"
                            min="14.0"
                            max="22.0"
                            step="0.1"
                            value={diameter}
                            onChange={(e) => setDiameter(parseFloat(e.target.value))}
                            className="flex-1 accent-amber-500 cursor-pointer h-2 bg-stone-500/20 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setDiameter((prev) => Math.min(22.0, Number((prev + 0.1).toFixed(1))))}
                            className="w-10 h-10 rounded-full border border-stone-500/25 flex items-center justify-center hover:border-amber-500/50 hover:bg-stone-500/10 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Presets */}
                        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-xs">
                          {["15.5", "16.0", "16.5", "17.0", "17.5", "18.0", "18.5"].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setDiameter(parseFloat(sz))}
                              className={`px-3 py-1.5 rounded-xl border transition-all ${
                                closest.eu === sz
                                  ? "bg-amber-500 text-black border-amber-500 font-semibold"
                                  : "border-stone-500/20 opacity-75 hover:opacity-100"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Screen Calibration Drawer */}
                      <div className="pt-2 border-t border-stone-500/15">
                        <button
                          type="button"
                          onClick={() => setShowCalibration(!showCalibration)}
                          className="w-full text-xs text-amber-500/90 hover:text-amber-500 flex items-center justify-center gap-1.5 underline transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>
                            {showCalibration
                              ? (lang === "ka" ? "კალიბრაციის დამალვა" : "Hide calibration")
                              : (lang === "ka" ? "ეკრანის კალიბრაცია საბანკო ბარათით (100% სიზუსტე)" : "Calibrate screen with credit card")}
                          </span>
                        </button>

                        {showCalibration && (
                          <div className="mt-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2 text-xs animate-fadeIn">
                            <p className="opacity-80 text-[11px]">
                              {lang === "ka"
                                ? "ნებისმიერი საბანკო ბარათის ან პირადობის საერთაშორისო სიგანე ზუსტად 85.6 მმ-ია. დაადეთ ბარათი ქვედა ჩარჩოს და გაასწორეთ სლაიდერი:"
                                : "Standard cards are 85.6 mm wide. Align your card with the outline below:"}
                            </p>
                            <div className="flex justify-center py-2">
                              <div
                                className="h-14 rounded-xl border-2 border-dashed border-amber-500 flex items-center justify-center text-[11px] text-amber-500 bg-amber-500/5"
                                style={{ width: `${cardWidthPx}px`, maxWidth: "100%" }}
                              >
                                💳 ბარათის სიგანე (85.6 მმ)
                              </div>
                            </div>
                            <input
                              type="range"
                              min="260"
                              max="420"
                              step="1"
                              value={cardWidthPx}
                              onChange={(e) => handleCardSlider(parseFloat(e.target.value))}
                              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-500/20 rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-500/10">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                          <p className="opacity-85">შემოიხვიეთ ვიწრო ქაღალდის ზოლი ან ძაფი სასურველ თითზე.</p>
                        </div>
                        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-500/10">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                          <p className="opacity-85">კალმით მონიშნეთ ადგილი, სადაც ზოლი ზუსტად იკვრება ერთმანეთზე.</p>
                        </div>
                        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-500/10">
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                          <p className="opacity-85">გაშალეთ ზოლი და გაზომეთ სახაზავით მილიმეტრებში (მაგ: 53 მმ).</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                        <label className="block text-xs font-medium text-amber-500">
                          შეიყვანეთ მიღებული გარშემოწერილობა (მმ):
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="40"
                            max="75"
                            step="0.5"
                            value={fingerCircumference}
                            onChange={(e) => setFingerCircumference(parseFloat(e.target.value) || 0)}
                            className="w-28 px-3 py-2.5 rounded-xl border border-stone-500/30 bg-transparent text-center font-bold text-xl focus:border-amber-500 focus:outline-none"
                          />
                          <span className="text-xs opacity-60">მმ</span>
                          <div className="flex-1 text-right">
                            <span className="text-[10px] uppercase tracking-wider opacity-60 block">რეკომენდებული ზომა:</span>
                            <span className="text-2xl font-bold font-serif text-amber-500">
                              ზომა {closestFinger.eu}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ⚠️ ცდომილების შენიშვნა */}
                  <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-500 block mb-0.5">
                        {lang === "ka" ? "შენიშვნა ცდომილების შესახებ:" : "Notice on Margin of Error:"}
                      </span>
                      <p className="text-[11px] opacity-80">
                        {lang === "ka"
                          ? "ეკრანის მოდელის, დამცავი ბრონის ან ტელეფონის მასშტაბირების გამო შესაძლოა არსებობდეს მცირე (0.2–0.5 მმ) ცდომილების ალბათობა. თუ ორ ზომას შორის მერყეობთ, უმჯობესია აირჩიოთ ოდნავ დიდი ზომა, ან გაიაროთ უფასო ონლაინ კონსულტაცია ჩვენს სპეციალისტთან."
                          : "Due to device screen scaling or protective glass, a minor margin of error (0.2–0.5 mm) may occur. If between sizes, choose the larger one."}
                      </p>
                    </div>
                  </div>
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
                        {RING_CHART.map((item) => {
                          const isCurrent = closest.eu === item.eu;
                          return (
                            <tr
                              key={item.eu}
                              onClick={() => setDiameter(item.diameter)}
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
                    {lang === "ka" ? "როგორ ეშვება სხვადასხვა სიგრძის ყელსაბამი დეკოლტეზე" : "Visualizing where each necklace falls"}
                  </p>
                </div>
              </div>

              {/* Grid of Length Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {NECKLACE_LENGTHS.map((item, idx) => (
                  <div
                    key={item.length}
                    onClick={() => setSelectedNecklace(idx)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedNecklace === idx
                        ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/15"
                        : darkMode
                        ? "bg-[#141210] border-stone-800 hover:border-amber-500/40"
                        : "bg-white border-stone-200 hover:border-amber-500/40"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-2xl font-bold text-amber-500">
                          {item.length}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-500/10 border border-stone-500/20 font-semibold uppercase tracking-wider">
                          {item.tag}
                        </span>
                      </div>
                      <h3 className="font-serif text-base font-semibold leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs opacity-75 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-stone-500/15 text-[11px] space-y-1">
                      <span className="opacity-50 block uppercase tracking-wider text-[10px]">საუკეთესო შეხამება:</span>
                      <p className="font-medium text-amber-500/90">{item.bestFor}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Silhouette Guide Box */}
              <div className={`p-6 sm:p-8 rounded-3xl border ${darkMode ? "bg-[#141210] border-stone-800" : "bg-white border-stone-200"}`}>
                <div className="max-w-2xl mx-auto text-center space-y-4">
                  <h3 className="font-serif text-xl font-medium">
                    {lang === "ka" ? "როგორ ავარჩიოთ სწორი სიგრძე?" : "How to Pick the Right Length?"}
                  </h3>
                  <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                    {lang === "ka"
                      ? "თუ საჩუქრად ყიდულობთ და ზუსტად არ იცით ადრესატის უპირატესობა — 45 სმ („პრინცესა“) არის 100%-ით უსაფრთხო და ყველაზე მოთხოვნადი არჩევანი, რომელიც ნებისმიერი აღნაგობისა და სიმაღლის ქალს იდეალურად ერგება."
                      : "If buying as a gift, 45 cm (Princess) is universally the most popular choice, fitting almost any neckline gracefully."}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* 3. SECTION: BRACELETS (სამაჯურები) */}
          {(activeCategory === "bracelets" || activeCategory === "all") && (
            <section className="space-y-8 mb-16 animate-fadeIn">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-500/20">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-medium">
                    {lang === "ka" ? "სამაჯურის ზომის სახელმძღვანელო" : "Bracelet Sizing Guide"}
                  </h2>
                  <p className="text-xs opacity-60">
                    {lang === "ka" ? "მაჯის გაზომვა და კომფორტული დაშვების წესი" : "How to measure your wrist for bracelets"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* How to measure */}
                <div className={`lg:col-span-6 p-6 rounded-3xl border space-y-5 ${
                  darkMode ? "bg-[#141210] border-stone-800" : "bg-white border-stone-200"
                }`}>
                  <h3 className="font-serif text-lg font-medium text-amber-500">
                    {lang === "ka" ? "როგორ გავზომოთ მაჯა 2 ნაბიჯში:" : "How to measure wrist:"}
                  </h3>

                  <div className="space-y-3 text-xs leading-relaxed">
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-500/10">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs shrink-0">1</span>
                      <div>
                        <strong className="block font-semibold mb-0.5">მაჯის გარშემოწერილობა:</strong>
                        <p className="opacity-80">შემოიხვიეთ საზომი ლენტი ან ძაფი მაჯის ძვალთან მჭიდროდ (ზედმეტი მოჭერის გარეშე) და ჩაინიშნეთ სანტიმეტრები.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-500/10">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs shrink-0">2</span>
                      <div>
                        <strong className="block font-semibold mb-0.5">+ 1.5 - 2.0 სმ კომფორტისთვის:</strong>
                        <p className="opacity-80">მიღებულ ციფრს დაამატეთ 1.5-დან 2 სმ-მდე. მაგალითად, თუ მაჯა არის 15.5 სმ, თქვენი სამაჯურის ზომაა 17 ან 17.5 სმ.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs space-y-1">
                    <strong className="text-amber-500 block">ჩოგბურთის (ტენისის) სამაჯურების წესი:</strong>
                    <p className="opacity-80">
                      ბრილიანტის ტენისის სამაჯური არასდროს არ უნდა იყოს მჭიდროდ მომდგარი, რათა ხელის მოძრაობისას საკეტზე ზეწოლა არ მოხდეს. ის თავისუფლად უნდა ცურავდეს მაჯაზე.
                    </p>
                  </div>
                </div>

                {/* Sizing Chart */}
                <div className={`lg:col-span-6 p-6 rounded-3xl border space-y-4 ${
                  darkMode ? "bg-[#141210] border-stone-800" : "bg-white border-stone-200"
                }`}>
                  <h3 className="font-serif text-lg font-medium">
                    {lang === "ka" ? "სამაჯურის სტანდარტული ზომები" : "Standard Bracelet Sizes"}
                  </h3>

                  <div className="space-y-3">
                    {BRACELET_SIZES.map((b) => (
                      <div key={b.size} className="p-4 rounded-2xl border border-stone-500/20 space-y-1 hover:border-amber-500/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-lg font-bold text-amber-500">{b.size}</span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-500/10">{b.label}</span>
                        </div>
                        <p className="text-xs opacity-75">{b.wrist}</p>
                        <p className="text-[11px] text-amber-400 font-medium pt-1">{b.fit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 4. SECTION: MASTER JEWELER TIPS (იუველირის ოქროს რჩევები) */}
          {(activeCategory === "tips" || activeCategory === "all") && (
            <section className="space-y-8 mb-16 animate-fadeIn">
              <div className="flex items-center gap-3 pb-3 border-b border-stone-500/20">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-medium">
                    {lang === "ka" ? "იუველირის ოქროს რჩევები ზომის შერჩევისას" : "Master Jeweler Pro Tips"}
                  </h2>
                  <p className="text-xs opacity-60">
                    {lang === "ka" ? "პატარა დეტალები, რომლებიც 100%-იან შედეგს გაძლევთ" : "Expert secrets for flawless sizing"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className={`p-6 rounded-3xl border space-y-3 ${darkMode ? "bg-[#141210] border-stone-800" : "bg-white border-stone-200"}`}>
                  <span className="text-2xl block">🌇</span>
                  <h3 className="font-serif text-base font-semibold">გაიზომეთ საღამოს</h3>
                  <p className="text-xs opacity-75 leading-relaxed">
                    თითის ზომა დღის განმავლობაში იცვლება. დილით ან სიცივეში თითი ოდნავ ვიწროვდება. ყველაზე ზუსტი ზომა მიიღება საღამოს, ოთახის ნორმალურ ტემპერატურაზე.
                  </p>
                </div>

                <div className={`p-6 rounded-3xl border space-y-3 ${darkMode ? "bg-[#141210] border-stone-800" : "bg-white border-stone-200"}`}>
                  <span className="text-2xl block">🦴</span>
                  <h3 className="font-serif text-base font-semibold">თითის სახსრის გათვალისწინება</h3>
                  <p className="text-xs opacity-75 leading-relaxed">
                    თუ თქვენი თითის სახსარი (ძვალი) უფრო განიერია ვიდრე თითის ძირი, გაზომეთ ორივე და აიღეთ საშუალო ზომა, რათა ბეჭედმა სახსარზე თავისუფლად გაიაროს.
                  </p>
                </div>

                <div className={`p-6 rounded-3xl border space-y-3 ${darkMode ? "bg-[#141210] border-stone-800" : "bg-white border-stone-200"}`}>
                  <span className="text-2xl block">💍</span>
                  <h3 className="font-serif text-base font-semibold">განიერი ბეჭდის წესი</h3>
                  <p className="text-xs opacity-75 leading-relaxed">
                    თუ ბეჭედი მასიური ან განიერია (6 მმ-ზე მეტი), თითზე უფრო მჭიდროდ ზის. ამიტომ განიერ მოდელებზე რეკომენდებულია ნახევარი ზომით დიდი (მაგ: 16.5-ის ნაცვლად 17.0).
                  </p>
                </div>

                <div className={`p-6 rounded-3xl border space-y-3 ${darkMode ? "bg-[#141210] border-stone-800" : "bg-white border-stone-200"}`}>
                  <span className="text-2xl block">🎁</span>
                  <h3 className="font-serif text-base font-semibold">საჩუქრად შერჩევა</h3>
                  <p className="text-xs opacity-75 leading-relaxed">
                    თუ საიდუმლო საჩუქარს არჩევთ, აიღეთ მისი რომელიმე ძველი ბეჭედი, რომელიც სასურველ თითზე ერგება, დაადეთ ამ საიტის ეკრანს და 1 წამში გაიგებთ ზუსტ ზომას!
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* CTA Banner: Need assistance? */}
          <div className="p-8 sm:p-12 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-serif text-2xl font-medium">
                {lang === "ka" ? "კვლავ მერყეობთ ზომის შერჩევაზე?" : "Still unsure about your size?"}
              </h3>
              <p className="text-xs sm:text-sm opacity-75 max-w-xl">
                {lang === "ka"
                  ? "ჩვენი გამოცდილი იუველირ-კონსულტანტი სიამოვნებით დაგეხმარებათ სწორი ზომის შერჩევაში WhatsApp-ში ან სატელეფონო ზარით."
                  : "Our master jewelry specialists are happy to assist you in finding the flawless fit via WhatsApp."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <MessageCircle className="w-4 h-4 text-emerald-950" />
                <span>{lang === "ka" ? "WhatsApp კონსულტაცია" : "WhatsApp Help"}</span>
              </a>
              <a
                href="/catalog"
                className="px-6 py-3.5 rounded-full border border-stone-500/30 hover:border-amber-500/50 hover:bg-stone-500/10 font-semibold text-xs uppercase tracking-wider transition-all"
              >
                {lang === "ka" ? "კოლექციის ნახვა" : "View Collection"}
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={() => setShowFavoritesModal(false)}
      />
    </div>
  );
}

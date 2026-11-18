import React, { useState, useEffect } from 'react';
import { Ruler, MessageCircle, ArrowRight, Home, ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { navigateTo } from '../utils/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FavoritesModal from '../components/modals/FavoritesModal';
import RingSizerTool, { SIZE_CHART, getClosestSize } from '../components/store/RingSizerTool';

const NECKLACE_LENGTHS = [
  {
    length: "40 სმ",
    title: "Choker / ყელზე მომდგარი",
    desc: "ეკვრის ყელის ძირს. იდეალურია ღრმა V-კისრისთვის და ღია მხრების მქონე კაბებისთვის.",
    bestFor: "ღია დეკოლტე, საღამოს კაბა, პერანგის ღია საყელო",
    tag: "მინიმალიზმი"
  },
  {
    length: "45 სმ",
    title: "Princess / პრინცესა (ყველაზე პოპულარული)",
    desc: "ეშვება ლავიწის ძვლის გასწვრივ. ყველაზე უნივერსალური სიგრძე ქალის ყელსაბამისთვის.",
    bestFor: "ყოველდღიური ტარება, პერანგი, ნებისმიერი ჭრილი",
    tag: "უნივერსალური"
  },
  {
    length: "50 სმ",
    title: "Matinee / მატინე",
    desc: "ჩამოდის ლავიწის ძვლის ქვემოთ, მკერდის დასაწყისამდე. ანიჭებს არისტოკრატულ აქცენტს.",
    bestFor: "დახურული საყელო, კოსტიუმები, მსხვილი კულონი",
    tag: "ელეგანტური"
  },
  {
    length: "55-60 სმ",
    title: "Opera / ოპერა (გრძელი)",
    desc: "ჩამოდის მკერდის ცენტრამდე. საუკეთესოა რამდენიმე ჯაჭვის ფენებად სატარებლად.",
    bestFor: "Layering (ფენებად ტარება), დახურული სამოსი",
    tag: "Layering"
  }
];

const BRACELET_SIZES = [
  { size: "15 - 16 სმ", label: "XS (ვიწრო მაჯა)", wrist: "13.5 - 14.5 სმ მაჯისთვის", fit: "მჭიდროდ მორგება" },
  { size: "17 - 18 სმ", label: "S / M (სტანდარტული ქალი)", wrist: "15.0 - 16.5 სმ მაჯისთვის", fit: "კომფორტული კლასიკური დაშვება" },
  { size: "19 - 20 სმ", label: "L / მამაკაცი", wrist: "17.0 - 18.5 სმ მაჯისთვის", fit: "თავისუფალი დაშვება" },
];

export default function SizeGuidePage() {
  const { darkMode, setDarkMode, lang, setLang, siteSettings, favorites } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("rings");
  const [selectedDiameter, setSelectedDiameter] = useState(16.5);
  const [selectedNecklace, setSelectedNecklace] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = lang === "ka"
      ? `სამკაულების ზომის გზამკვლევი — ${siteSettings.brandName || "მატარე"}`
      : `Jewelry Sizing Guide — ${siteSettings.brandName || "MATARE"}`;
  }, [lang, siteSettings.brandName]);

  const closest = getClosestSize(selectedDiameter);
  const prefix = lang === "en" ? "/en" : "";
  const cleanPhone = (siteSettings?.whatsapp || "995555000000").replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    lang === "ka"
      ? "გამარჯობა! სამკაულის ზომის შერჩევაზე მჭირდება კონსულტაცია."
      : "Hello! I need consultation choosing my jewelry size."
  )}`;

  const tabs = [
    { id: "rings", label: lang === "ka" ? "ბეჭდები" : "Rings" },
    { id: "necklaces", label: lang === "ka" ? "ყელსაბამები" : "Necklaces" },
    { id: "bracelets", label: lang === "ka" ? "სამაჯურები" : "Bracelets" },
    { id: "tips", label: lang === "ka" ? "იუველირის რჩევები" : "Expert Tips" }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FCFBF8] text-[#2E2A25]">
      <Navbar
        lang={lang} setLang={setLang}
        darkMode={darkMode} setDarkMode={setDarkMode}
        favorites={favorites} setShowFavoritesModal={setShowFavoritesModal}
        isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main id="main-content" className="flex-1 pt-[86px] sm:pt-[100px] pb-20">
        <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Clean Breadcrumbs */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs text-[#857D73] mb-6">
            <a href={prefix || "/"} className="hover:text-[#2E2A25] transition-colors flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>{lang === "ka" ? "მთავარი" : "Home"}</span>
            </a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#2E2A25] font-medium">
              {lang === "ka" ? "ზომის გზამკვლევი" : "Size Guide"}
            </span>
          </nav>

          {/* Airy Editorial Header */}
          <header className="text-center max-w-3xl mx-auto space-y-3.5 mb-12">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F7F2E9] border border-[#EFE6D6] text-[#8A6836] text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>{lang === "ka" ? "საერთაშორისო საიუველირო სტანდარტები" : "International Jewelry Standards"}</span>
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium text-[#2E2A25]">
              {lang === "ka" ? "სამკაულების ზომის გზამკვლევი" : "Jewelry Sizing Guide"}
            </h1>
            <p className="text-sm sm:text-base text-[#6E675E] leading-relaxed max-w-2xl mx-auto">
              {lang === "ka"
                ? "შეარჩიეთ თქვენი იდეალური ზომა — ინტერაქტიული საზომი და ზუსტი სტანდარტები ბეჭდების, ყელსაბამებისა და სამაჯურებისთვის."
                : "Find your perfect fit for rings, necklaces, and bracelets using our interactive tools and conversion charts."}
            </p>

            {/* Light Champagne Pill Category Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? "bg-[#F5EFE4] text-[#7A5B2B] border-[#C9AF82] shadow-[0_2px_10px_rgba(154,119,66,0.12)]"
                      : "bg-white text-[#5C564E] border-[#EFE9DF] hover:border-[#C9AF82] hover:text-[#2E2A25]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {/* RINGS TAB */}
          {activeCategory === "rings" && (
            <section className="space-y-6 mb-12 animate-fadeIn">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white border border-[#EFE9DF] flex items-center justify-center text-[#A88750] shrink-0 shadow-[0_2px_8px_rgba(31,28,24,0.03)]">
                  <Ruler className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#2E2A25]">
                    {lang === "ka" ? "ბეჭდის ზომის ინტერაქტიული საზომი" : "Interactive Ring Sizer"}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#857D73]">
                    {lang === "ka" ? "გაზომეთ არსებული ბეჭდით ან თითის გარშემოწერილობით (ISO 8653)" : "Measure with an existing ring or finger circumference"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Left: Interactive Ring Sizer Card */}
                <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-[#EFE9DF] shadow-[0_4px_24px_rgba(31,28,24,0.03)]">
                  <RingSizerTool
                    externalDiameter={selectedDiameter}
                    onSizeChange={(size, d) => setSelectedDiameter(d)}
                    showNotice={true}
                    lang={lang}
                  />
                </div>

                {/* Right: Complete Conversion Table Card */}
                <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white border border-[#EFE9DF] shadow-[0_4px_24px_rgba(31,28,24,0.03)] space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-[#2E2A25]">
                        {lang === "ka" ? "ზომების სრული ცხრილი" : "Size Conversion Chart"}
                      </h3>
                      <p className="text-xs text-[#857D73] mt-0.5">
                        {lang === "ka" ? "დააკლიკეთ სასურველ ზომას წრის სანახავად" : "Click any row to preview the ring size"}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#FCFBF8] text-[#9A7742] border border-[#EFE9DF] shrink-0">
                      ISO 8653
                    </span>
                  </div>

                  <div className="rounded-2xl border border-[#EFE9DF] overflow-hidden">
                    <div className="overflow-x-auto max-h-[430px] overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-[#EFE9DF] bg-[#FCFBF8] text-[11px] font-medium text-[#857D73] sticky top-0 z-10">
                            <th className="py-3 pl-4">{lang === "ka" ? "ზომა (EU)" : "Size (EU)"}</th>
                            <th className="py-3">{lang === "ka" ? "დიამეტრი" : "Diameter"}</th>
                            <th className="py-3">{lang === "ka" ? "გარშემოწერა" : "Circumf."}</th>
                            <th className="py-3 pr-4">{lang === "ka" ? "აშშ (US)" : "US"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F0E8]">
                          {SIZE_CHART.map((item) => {
                            const isCurrent = closest.eu === item.eu;
                            return (
                              <tr
                                key={item.eu}
                                onClick={() => setSelectedDiameter(item.diameter)}
                                className={`cursor-pointer transition-colors ${
                                  isCurrent
                                    ? "bg-[#F5EFE4] text-[#7A5B2B] font-semibold shadow-[inset_3px_0_0_#B3925B]"
                                    : "hover:bg-[#FCFBF8] text-[#5C564E]"
                                }`}
                              >
                                <td className="py-2.5 pl-4 font-serif text-sm">{item.eu}</td>
                                <td className="py-2.5">{item.diameter.toFixed(1)} მმ</td>
                                <td className="py-2.5">{item.circumference.toFixed(1)} მმ</td>
                                <td className="py-2.5 pr-4">US {item.us}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <a
                    href={`${prefix}/catalog`}
                    className="w-full py-3.5 px-5 rounded-full bg-[#A88750] hover:bg-[#93733E] text-white text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(168,135,80,0.22)]"
                  >
                    <span>{lang === "ka" ? "ბეჭდების კოლექციის ნახვა" : "Browse Rings"}</span>
                    <ArrowRight className="w-4 h-4 stroke-[1.75]" />
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* NECKLACES TAB */}
          {activeCategory === "necklaces" && (
            <section className="space-y-8 mb-12 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white border border-[#EFE9DF] shadow-[0_4px_24px_rgba(31,28,24,0.03)] flex flex-col items-center text-center space-y-5">
                  <span className="text-xs font-medium text-[#9A7742]">
                    {lang === "ka" ? "ვიზუალური ილუსტრაცია" : "Visual Length Guide"}
                  </span>

                  <div className="relative w-64 h-72 rounded-2xl border border-[#EFE9DF] bg-[#FDFBF7] flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 200 240" className="w-full h-full text-[#E5DDD0]">
                      <path
                        d="M 60 0 L 60 70 Q 60 90 20 110 L 0 130 L 0 240 L 200 240 L 200 130 L 180 110 Q 140 90 140 70 L 140 0 Z"
                        fill="currentColor"
                        opacity="0.45"
                      />
                      <path d="M 60 100 Q 100 115 140 100" stroke="#CFC4B2" strokeWidth="1.2" fill="none" opacity="0.7" />
                      {[
                        "M 75 70 Q 100 110 125 70",
                        "M 72 70 Q 100 135 128 70",
                        "M 70 70 Q 100 160 130 70",
                        "M 68 70 Q 100 195 132 70"
                      ].map((d, i) => (
                        <path
                          key={i}
                          d={d}
                          stroke={selectedNecklace === i ? "#A88750" : "#C4B9A8"}
                          strokeWidth={selectedNecklace === i ? "2.5" : "1"}
                          fill="none"
                          opacity={selectedNecklace === i ? 1 : 0.5}
                        />
                      ))}
                      <circle cx="100" cy={[110, 135, 160, 195][selectedNecklace]} r="4.5" fill="#9A7742" />
                    </svg>
                    <span className="absolute bottom-3 text-xs font-medium rounded-full bg-white border border-[#E5D8C1] text-[#7A5B2B] px-3.5 py-1 shadow-xs">
                      {NECKLACE_LENGTHS[selectedNecklace].length}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 w-full text-xs">
                    {NECKLACE_LENGTHS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedNecklace(idx)}
                        className={`py-2 rounded-full border font-medium text-center transition-all cursor-pointer ${
                          selectedNecklace === idx
                            ? "bg-[#F5EFE4] text-[#7A5B2B] border-[#C9AF82] font-semibold"
                            : "bg-[#FCFBF8] border-[#EFE9DF] text-[#5C564E] hover:border-[#C9AF82]"
                        }`}
                      >
                        {item.length}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-3.5">
                  {NECKLACE_LENGTHS.map((item, idx) => {
                    const isSelected = selectedNecklace === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedNecklace(idx)}
                        className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FDFBF7] border-[#C9AF82] shadow-[0_4px_18px_rgba(154,119,66,0.08)]"
                            : "bg-white border-[#EFE9DF] hover:border-[#DFD4C2]"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-serif text-xl font-medium text-[#9A7742]">{item.length}</span>
                            <span className="font-medium text-sm sm:text-base text-[#2E2A25]">{item.title}</span>
                          </div>
                          <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-white border border-[#EFE9DF] text-[#6E675E]">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#5C564E] leading-relaxed mb-2.5">{item.desc}</p>
                        <div className="text-xs text-[#857D73]">
                          <strong className="text-[#2E2A25] font-medium">{lang === "ka" ? "საუკეთესოა:" : "Best for:"}</strong> {item.bestFor}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* BRACELETS TAB */}
          {activeCategory === "bracelets" && (
            <section className="space-y-6 mb-12 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {BRACELET_SIZES.map((b, i) => (
                  <div key={i} className="p-7 rounded-2xl bg-white border border-[#EFE9DF] shadow-[0_4px_20px_rgba(31,28,24,0.03)] space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#F7F2E9] text-xs font-medium text-[#8A6836]">
                      {b.label}
                    </span>
                    <h3 className="font-serif text-3xl font-medium text-[#2E2A25]">{b.size}</h3>
                    <div className="text-xs sm:text-sm text-[#5C564E] space-y-1.5 pt-3 border-t border-[#F5F0E8]">
                      <p><strong className="text-[#2E2A25] font-medium">მაჯა:</strong> {b.wrist}</p>
                      <p><strong className="text-[#2E2A25] font-medium">დაშვება:</strong> {b.fit}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#EFE9DF] shadow-[0_4px_20px_rgba(31,28,24,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-2xl">
                  <h4 className="font-serif text-xl sm:text-2xl font-medium text-[#2E2A25]">
                    {lang === "ka" ? "ოქროს წესი სამაჯურისთვის" : "The Golden Rule for Bracelets"}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5C564E] leading-relaxed">
                    {lang === "ka"
                      ? "გაზომეთ მაჯის გარშემოწერილობა ძვლიდან ოდნავ ზემოთ სანტიმეტრით და მიღებულ რიცხვს დაუმატეთ 1.5 – 2 სმ კომფორტული დაშვებისთვის."
                      : "Measure snug above the wrist bone and add 1.5 - 2 cm for a natural, comfortable drape."}
                  </p>
                </div>
                <a
                  href={`${prefix}/catalog`}
                  className="px-6 py-3.5 rounded-full bg-[#A88750] hover:bg-[#93733E] text-white text-xs sm:text-sm font-medium transition-colors shrink-0 inline-flex items-center gap-2 shadow-[0_4px_14px_rgba(168,135,80,0.22)]"
                >
                  <span>{lang === "ka" ? "სამაჯურების კატალოგი" : "View Bracelets"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75]" />
                </a>
              </div>
            </section>
          )}

          {/* EXPERT TIPS TAB */}
          {activeCategory === "tips" && (
            <section className="space-y-6 mb-12 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    num: "01",
                    title: lang === "ka" ? "დღის დრო და ტემპერატურა" : "Time of Day & Temperature",
                    desc: lang === "ka"
                      ? "თითების ზომა იცვლება დღის განმავლობაში. იდეალური დრო გასაზომად არის დღის მეორე ნახევარი ოთახის ტემპერატურაზე."
                      : "Fingers fluctuate throughout the day. Measure in the late afternoon at room temperature."
                  },
                  {
                    num: "02",
                    title: lang === "ka" ? "ბეჭდის სიგანე (სისქე)" : "Ring Band Width",
                    desc: lang === "ka"
                      ? "განიერი ბეჭდები (6 მმ+) თითზე უფრო მჭიდროდ ჯდება. რეკომენდებულია აირჩიოთ 0.5 ზომით მეტი."
                      : "Wide bands (6mm+) fit tighter. Size up by half a size for comfort."
                  },
                  {
                    num: "03",
                    title: lang === "ka" ? "სახსრის გათვალისწინება" : "Knuckle Considerations",
                    desc: lang === "ka"
                      ? "თუ თითის სახსარი უფრო განიერია, გაზომეთ როგორც სახსარი, ისე ფუძე და აირჩიეთ საშუალო ზომა."
                      : "If your knuckle is wider than the finger base, measure both and select the midpoint."
                  }
                ].map((tip) => (
                  <div key={tip.num} className="p-7 rounded-2xl bg-white border border-[#EFE9DF] shadow-[0_4px_20px_rgba(31,28,24,0.03)] space-y-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#F7F2E9] border border-[#EFE6D6] font-mono text-xs font-medium text-[#9A7742]">
                      {tip.num}
                    </span>
                    <h4 className="font-serif text-xl font-medium text-[#2E2A25]">{tip.title}</h4>
                    <p className="text-xs sm:text-sm text-[#5C564E] leading-relaxed">{tip.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[#EFE9DF] shadow-[0_4px_20px_rgba(31,28,24,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <h4 className="font-serif text-xl sm:text-2xl font-medium text-[#2E2A25]">
                    {lang === "ka" ? "ვერ გადაწყვიტეთ ზომა? დაგვიკავშირდით" : "Still unsure about your size?"}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#5C564E]">
                    {lang === "ka"
                      ? "ჩვენი კონსულტანტი დაგეხმარებათ ზუსტი ზომის შერჩევაში WhatsApp-ის მეშვეობით."
                      : "Our jewelry specialist will guide you to the ideal fit via WhatsApp."}
                  </p>
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-full bg-[#A88750] hover:bg-[#93733E] text-white text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors shrink-0 shadow-[0_4px_14px_rgba(168,135,80,0.22)]"
                >
                  <MessageCircle className="w-4 h-4 stroke-[1.75]" />
                  <span>{lang === "ka" ? "WhatsApp კონსულტაცია" : "WhatsApp Consultation"}</span>
                </a>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={(prod) => {
          setShowFavoritesModal(false);
          navigateTo(`${prefix}/product/${encodeURIComponent(prod.sku || prod.id)}`);
        }}
      />
    </div>
  );
}

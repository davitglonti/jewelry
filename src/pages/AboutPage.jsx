import React, { useState } from 'react';
import { ArrowLeft, MapPin, Phone, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { pick } from '../utils/i18n';
import InfoCards from '../components/store/InfoCards';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CraftsmanshipSection from '../components/store/CraftsmanshipSection';
import FavoritesModal from '../components/modals/FavoritesModal';

export default function AboutPage() {
  const {
    darkMode, setDarkMode,
    lang, setLang,
    siteSettings,
    favorites
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#faf7f2] text-[#1c1917]"}`}>
      <Navbar
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        favorites={favorites}
        setShowFavoritesModal={setShowFavoritesModal}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* ძირითადი კონტენტი (Main Landmark) */}
      <main id="main-content">
        {/* ზედა სათაური (Hero) */}
        <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {lang === "ka" ? "მთავარ გვერდზე დაბრუნება" : "Back to Home"}
            </a>

            <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-wide">
              {lang === "ka"
                ? (siteSettings.aboutHeroTitle || "ჩვენი ისტორია და მემკვიდრეობა")
                : (siteSettings.aboutHeroTitleEn || "Our Story & Heritage")}
            </h1>

            <p className="text-sm sm:text-lg opacity-80 leading-relaxed max-w-2xl mx-auto">
              {lang === "ka"
                ? (siteSettings.aboutHeroSubtitle || `${siteSettings.brandName} — ეს არის ადგილი, სადაც მრავალსაუკუნოვანი ქართული საიუველირო ტრადიცია ხვდება თანამედროვე დახვეწილობას.`)
                : (siteSettings.aboutHeroSubtitleEn || `${siteSettings.brandName} is where centuries-old jewelry traditions meet modern elegance.`)}
            </p>
          </div>
        </section>

        {/* ოსტატობის სექცია */}
        <CraftsmanshipSection
          reverseLayout={true}
          showStats={false}
          showCtaButton={true}
          showExtraStory={true}
        />

        {/* ჩვენი ღირებულებები (4 ბარათი) */}
        <InfoCards
          badgeKey="aboutValuesBadge"
          badgeKeyEn="aboutValuesBadgeEn"
          titleKey="aboutValuesTitle"
          titleKeyEn="aboutValuesTitleEn"
          itemsKey="aboutValues"
          defaultItems={[
            { titleKa: "ბუნებრივი ქვები", titleEn: "Natural Gemstones", descKa: "ვიყენებთ მხოლოდ სერტიფიცირებულ ბრილიანტებსა და ნატურალურ ძვირფას ქვებს.", descEn: "We use only certified diamonds and 100% natural precious gemstones." },
            { titleKa: "უმაღლესი სინჯი", titleEn: "Finest Gold Purity", descKa: "ყველა ნაკეთობა მოწმდება და დადასტურებულია უმაღლესი სინჯით (585° / 750° / 925°).", descEn: "Every piece is hallmarked and verified for authentic karat purity." },
            { titleKa: "საუკუნოვანი გარანტია", titleEn: "Lifetime Warranty", descKa: "ჩვენს ყველა სამკაულს მოყვება ხარისხის სერტიფიკატი და უფასო წმენდა-განახლების სერვისი.", descEn: "Includes an authenticity certificate and complimentary professional cleaning." },
            { titleKa: "ინდივიდუალური მიდგომა", titleEn: "Bespoke Service", descKa: "შესაძლებელია ზომის მორგება და ექსკლუზიური მოდელების ინდივიდუალური შეკვეთა.", descEn: "Custom sizing and personalized consultations for your special moments." }
          ]}
        />

        {/* შოურუმში მოწვევის ბლოკი */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className={`p-8 sm:p-12 rounded-3xl border text-center space-y-6 ${darkMode ? "bg-gradient-to-br from-stone-900 to-[#141210] border-amber-500/30" : "bg-white border-amber-500/40 shadow-xl"}`}>
            <h3 className="font-serif text-2xl sm:text-4xl">
              {lang === "ka" ? "გვეწვიეთ ჩვენს შოურუმში" : "Visit Our Showroom"}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm pt-2">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                {pick(siteSettings, "address", lang)}
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <a href={`tel:${siteSettings.phone || "+995555000000"}`} className="hover:text-amber-500 transition-colors">
                  {siteSettings.phone}
                </a>
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                {lang === "ka" ? siteSettings.hours : (siteSettings.hoursEn || siteSettings.hours)}
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={(item) => {
          window.location.href = `/?item=${encodeURIComponent(item.sku || item.id)}`;
        }}
      />
    </div>
  );
}

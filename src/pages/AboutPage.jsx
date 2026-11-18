import React, { useState } from 'react';
import { ArrowLeft, MapPin, Phone, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { pick } from '../utils/i18n';
import { navigateTo } from '../utils/navigation';
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
    <div className="min-h-screen w-full overflow-x-hidden bg-white text-[#141311]">
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

      <main id="main-content">
        {/* Editorial Heritage Header */}
        <section className="pt-[152px] pb-20 sm:pt-[172px] sm:pb-24 px-4 sm:px-6 lg:px-10 bg-white">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <a
              href={lang === "en" ? "/en" : "/"}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#847E75] hover:text-[#141311] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{lang === "ka" ? "მთავარ გვერდზე დაბრუნება" : "Back to Home"}</span>
            </a>

            <span className="block text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#9D7B48] font-medium pt-2">
              {lang === "ka" ? "საიუველირო სახლის მემკვიდრეობა" : "The Maison Heritage"}
            </span>

            <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#141311] leading-[1.12]">
              {lang === "ka"
                ? (siteSettings.aboutHeroTitle || "ჩვენი ისტორია და მემკვიდრეობა")
                : (siteSettings.aboutHeroTitleEn || "Our Story & Heritage")}
            </h1>

            <div className="w-12 h-[1px] bg-[#9D7B48] mx-auto" />

            <p className="text-sm sm:text-base text-[#5C574F] leading-relaxed max-w-2xl mx-auto font-light">
              {lang === "ka"
                ? (siteSettings.aboutHeroSubtitle || `${siteSettings.brandName} — ეს არის ადგილი, სადაც მრავალსაუკუნოვანი ქართული საიუველირო ტრადიცია ხვდება თანამედროვე დახვეწილობას.`)
                : (siteSettings.aboutHeroSubtitleEn || `${siteSettings.brandName} is where centuries-old jewelry traditions meet modern elegance.`)}
            </p>
          </div>
        </section>

        <CraftsmanshipSection
          reverseLayout={true}
          showStats={false}
          showCtaButton={true}
          showExtraStory={true}
        />

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

        {/* Showroom Invitation */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="p-10 sm:p-16 bg-[#F8F6F2] border border-[#E8E3DB] text-center space-y-6">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[#9D7B48] font-medium block">
              {lang === "ka" ? "თბილისის ბუტიკი" : "Tbilisi Boutique"}
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#141311]">
              {lang === "ka" ? "გვეწვიეთ ჩვენს შოურუმში" : "Visit Our Showroom"}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-8 text-xs sm:text-sm text-[#4A4640] pt-4">
              <span className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#9D7B48] stroke-[1.5]" />
                {pick(siteSettings, "address", lang)}
              </span>
              <span className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#9D7B48] stroke-[1.5]" />
                <a href={`tel:${siteSettings.phone || "+995555000000"}`} className="hover:text-[#141311] transition-colors">
                  {siteSettings.phone}
                </a>
              </span>
              <span className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#9D7B48] stroke-[1.5]" />
                {lang === "ka" ? siteSettings.hours : (siteSettings.hoursEn || siteSettings.hours)}
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={(item) => {
          const prefix = lang === "en" ? "/en" : "";
          navigateTo(`${prefix}/product/${encodeURIComponent(item.sku || item.id)}`);
        }}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { navigateTo } from '../utils/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FavoritesModal from '../components/modals/FavoritesModal';

const ALL = "ALL";

export default function BlogPage() {
  const {
    darkMode, setDarkMode,
    lang, setLang,
    siteSettings,
    articles,
    favorites
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(ALL);
  const [searchQuery, setSearchQuery] = useState("");

  const siteBlogCats = siteSettings?.blogCategories || ["გიდი", "ოქრო", "ბრილიანტი", "მოვლა", "სტილი"];
  const categories = Array.from(new Set([...siteBlogCats, ...articles.map((a) => a.category).filter(Boolean)]));

  const filteredArticles = articles.filter((art) => {
    const matchesCat = selectedCategory === ALL || art.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      art.titleKa?.toLowerCase().includes(q) ||
      art.titleEn?.toLowerCase().includes(q) ||
      art.excerptKa?.toLowerCase().includes(q) ||
      art.excerptEn?.toLowerCase().includes(q) ||
      art.category?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  const openArticle = (art) => {
    const prefix = lang === "en" ? "/en" : "";
    navigateTo(`${prefix}/blog/${encodeURIComponent(art.slug || art.id)}`);
  };

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

      <main id="main-content" className="pt-[140px] sm:pt-[156px] pb-24">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-14 text-center space-y-5 border-b border-[#E8E3DB] mb-14">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[#9D7B48] font-medium block">
            {lang === "ka" ? "საიუველირო ჟურნალი" : "Fine Jewelry Journal"}
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#141311]">
            {lang === "ka" ? "ბლოგი & ექსპერტის რჩევები" : "Journal & Expert Insights"}
          </h1>

          <p className="text-sm sm:text-base text-[#5C574F] max-w-2xl mx-auto leading-relaxed font-light">
            {lang === "ka"
              ? "ყველაფერი ძვირფასი ქვების, ოქროს სინჯების, ბეჭდის ზომის შერჩევისა და საიუველირო მემკვიდრეობის შესახებ."
              : "Discover guides on gemstones, gold purities, ring sizing, and timeless craftsmanship."}
          </p>

          <div className="pt-4 max-w-lg mx-auto space-y-6">
            <div className="relative">
              <Search className="w-4 h-4 text-[#847E75] stroke-[1.5] absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={lang === "ka" ? "სტატიების ძიება" : "Search articles"}
                placeholder={lang === "ka" ? "ძიება სტატიებში (მაგ: ბრილიანტი, ზომა)..." : "Search articles..."}
                className="w-full pl-7 pr-4 py-2.5 text-sm bg-transparent border-b border-[#D6CFC4] focus:border-[#141311] outline-none text-[#141311] placeholder:text-[#9C958B] transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(ALL)}
                className={`px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] border transition-colors cursor-pointer ${
                  selectedCategory === ALL
                    ? "bg-[#141311] text-white border-[#141311]"
                    : "bg-white text-[#4A4640] border-[#E8E3DB] hover:border-[#141311]"
                }`}
              >
                {lang === "ka" ? "ყველა" : "All"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] border transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#141311] text-white border-[#141311]"
                      : "bg-white text-[#4A4640] border-[#E8E3DB] hover:border-[#141311]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20 text-[#847E75]">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-[#9D7B48] stroke-[1.25]" />
              <p className="font-serif text-xl">{lang === "ka" ? "სტატიები ვერ მოიძებნა." : "No articles found."}</p>
            </div>
          ) : (
            <div className="space-y-16">
              {featuredArticle && (
                <article
                  onClick={() => openArticle(featuredArticle)}
                  className="group cursor-pointer bg-[#F8F6F2] border border-[#E8E3DB] grid grid-cols-1 lg:grid-cols-12 items-stretch overflow-hidden"
                >
                  <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-[#EFECE6]">
                    <img
                      src={featuredArticle.image}
                      alt={lang === "ka" ? featuredArticle.titleKa : (featuredArticle.titleEn || featuredArticle.titleKa)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="eager"
                    />
                  </div>

                  <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center space-y-5">
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[#847E75]">
                      <span className="text-[#9D7B48] font-medium">{featuredArticle.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {featuredArticle.date}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lang === "ka" ? featuredArticle.readTime : (featuredArticle.readTimeEn || featuredArticle.readTime)}
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-4xl font-light text-[#141311] group-hover:text-[#9D7B48] transition-colors leading-tight">
                      {lang === "ka" ? featuredArticle.titleKa : (featuredArticle.titleEn || featuredArticle.titleKa)}
                    </h2>

                    <p className="text-sm text-[#5C574F] leading-relaxed line-clamp-3 font-light">
                      {lang === "ka" ? featuredArticle.excerptKa : (featuredArticle.excerptEn || featuredArticle.excerptKa)}
                    </p>

                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#141311] border-b border-[#141311] pb-1 group-hover:text-[#9D7B48] group-hover:border-[#9D7B48] transition-colors">
                        {lang === "ka" ? "სრულად წაკითხვა" : "Read Full Story"}
                        <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                      </span>
                    </div>
                  </div>
                </article>
              )}

              {remainingArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {remainingArticles.map((art) => (
                    <article
                      key={art.id}
                      onClick={() => openArticle(art)}
                      className="group cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="relative aspect-[16/11] overflow-hidden bg-[#F4F1EC] border border-[#EFECE6]">
                          <img
                            src={art.image}
                            alt={lang === "ka" ? art.titleKa : (art.titleEn || art.titleKa)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>

                        <div className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.16em] text-[#847E75]">
                          <span className="text-[#9D7B48] font-medium">{art.category}</span>
                          <span>·</span>
                          <span>{art.date}</span>
                          <span>·</span>
                          <span>{lang === "ka" ? art.readTime : (art.readTimeEn || art.readTime)}</span>
                        </div>

                        <h3 className="font-serif text-xl sm:text-2xl font-light text-[#141311] group-hover:text-[#9D7B48] transition-colors leading-snug">
                          {lang === "ka" ? art.titleKa : (art.titleEn || art.titleKa)}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#5C574F] leading-relaxed line-clamp-3 font-light">
                          {lang === "ka" ? art.excerptKa : (art.excerptEn || art.excerptKa)}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#EFECE6]">
                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#141311] group-hover:text-[#9D7B48] transition-colors">
                          {lang === "ka" ? "სრულად წაკითხვა" : "Read More"}
                          <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={(product) => {
          const prefix = lang === "en" ? "/en" : "";
          navigateTo(`${prefix}/product/${encodeURIComponent(product.sku || product.id)}`);
        }}
      />
    </div>
  );
}

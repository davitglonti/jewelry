import React, { useState } from 'react';
import { Search, Clock, Calendar, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
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
    window.location.href = `/blog/${encodeURIComponent(art.slug || art.id)}`;
  };

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

      <main id="main-content" className="pt-28 pb-20">
        {/* ზედა სათაურის ბლოკი */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs uppercase tracking-[0.2em] bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <Sparkles className="w-3.5 h-3.5" />
            {lang === "ka" ? "საიუველირო ჟურნალი" : "Fine Jewelry Journal"}
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-wide">
            {lang === "ka" ? "ბლოგი & ექსპერტის რჩევები" : "Journal & Expert Insights"}
          </h1>

          <p className="text-sm sm:text-base opacity-75 max-w-2xl mx-auto leading-relaxed">
            {lang === "ka"
              ? "ყველაფერი ძვირფასი ქვების, ოქროს სინჯების, ბეჭდის ზომის შერჩევისა და საიუველირო მემკვიდრეობის შესახებ."
              : "Discover guides on gemstones, gold purities, ring sizing, and timeless craftsmanship."}
          </p>

          {/* ძიება და კატეგორიები */}
          <div className="pt-6 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-amber-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={lang === "ka" ? "სტატიების ძიება" : "Search articles"}
                placeholder={lang === "ka" ? "ძიება სტატიებში (მაგ: ბრილიანტი, ზომა)..." : "Search articles..."}
                className={`w-full pl-11 pr-4 py-3 rounded-full text-sm border outline-none transition-all ${
                  darkMode
                    ? "bg-stone-900/90 border-stone-800 focus:border-amber-500 text-white"
                    : "bg-white border-stone-200 focus:border-amber-600 text-stone-900 shadow-sm"
                }`}
              />
            </div>

            {/* კატეგორიის ფილტრები */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setSelectedCategory(ALL)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === ALL
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : darkMode
                    ? "bg-stone-900 text-stone-300 hover:bg-stone-800"
                    : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {lang === "ka" ? "ყველა" : "All"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : darkMode
                      ? "bg-stone-900 text-stone-300 hover:bg-stone-800"
                      : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* სტატიების სია */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20 opacity-60">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-amber-500 opacity-60" />
              <p className="text-lg">
                {lang === "ka" ? "სტატიები ვერ მოიძებნა." : "No articles found."}
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* გამორჩეული პირველი სტატია (Hero Card) */}
              {featuredArticle && (
                <article
                  onClick={() => openArticle(featuredArticle)}
                  className={`group cursor-pointer rounded-3xl overflow-hidden border grid grid-cols-1 lg:grid-cols-2 gap-8 items-center transition-all ${
                    darkMode
                      ? "bg-[#141210] border-stone-800 hover:border-amber-500/40"
                      : "bg-white border-stone-200 hover:border-amber-500 shadow-sm hover:shadow-xl"
                  }`}
                >
                  <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full overflow-hidden bg-stone-900">
                    <img
                      src={featuredArticle.image}
                      alt={lang === "ka" ? featuredArticle.titleKa : (featuredArticle.titleEn || featuredArticle.titleKa)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="eager"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-amber-500 text-black shadow-lg">
                      {featuredArticle.category}
                    </span>
                  </div>

                  <div className="p-6 sm:p-10 space-y-4">
                    <div className="flex items-center gap-4 text-xs opacity-60">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {featuredArticle.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {lang === "ka" ? featuredArticle.readTime : (featuredArticle.readTimeEn || featuredArticle.readTime)}
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-4xl font-normal group-hover:text-amber-500 transition-colors leading-tight">
                      {lang === "ka" ? featuredArticle.titleKa : (featuredArticle.titleEn || featuredArticle.titleKa)}
                    </h2>

                    <p className="text-sm opacity-75 leading-relaxed line-clamp-3">
                      {lang === "ka" ? featuredArticle.excerptKa : (featuredArticle.excerptEn || featuredArticle.excerptKa)}
                    </p>

                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 group-hover:gap-3 transition-all">
                        {lang === "ka" ? "სრულად წაკითხვა" : "Read Full Story"}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              )}

              {/* დანარჩენი სტატიების ბადე */}
              {remainingArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {remainingArticles.map((art) => (
                    <article
                      key={art.id}
                      onClick={() => openArticle(art)}
                      className={`group cursor-pointer rounded-3xl overflow-hidden border flex flex-col transition-all ${
                        darkMode
                          ? "bg-[#141210] border-stone-800 hover:border-amber-500/40"
                          : "bg-white border-stone-200 hover:border-amber-500 shadow-sm hover:shadow-xl"
                      }`}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                        <img
                          src={art.image}
                          alt={lang === "ka" ? art.titleKa : (art.titleEn || art.titleKa)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-black/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                          {art.category}
                        </span>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-xs opacity-60">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-500" />
                              {art.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-500" />
                              {lang === "ka" ? art.readTime : (art.readTimeEn || art.readTime)}
                            </span>
                          </div>

                          <h3 className="font-serif text-xl font-normal group-hover:text-amber-500 transition-colors leading-snug">
                            {lang === "ka" ? art.titleKa : (art.titleEn || art.titleKa)}
                          </h3>

                          <p className="text-xs opacity-75 leading-relaxed line-clamp-3">
                            {lang === "ka" ? art.excerptKa : (art.excerptEn || art.excerptKa)}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-500/15">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-500 group-hover:gap-2.5 transition-all">
                            {lang === "ka" ? "სრულად წაკითხვა" : "Read More"}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />

      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectProduct={(product) => {
          window.location.href = `/product/${encodeURIComponent(product.sku || product.id)}`;
        }}
      />
    </div>
  );
}

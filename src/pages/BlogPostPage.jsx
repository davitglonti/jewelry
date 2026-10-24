import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Share2, Check, MessageCircle, Send, Sparkles, BookOpen } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FavoritesModal from '../components/modals/FavoritesModal';

export default function BlogPostPage({ slugProp }) {
  const rawPath = window.location.pathname;
  const currentSlug = slugProp || rawPath.replace('/blog/', '').replace(/\/$/, '');

  const {
    darkMode, setDarkMode,
    lang, setLang,
    siteSettings,
    articles,
    favorites
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const article = articles.find(
    (a) => a.slug === currentSlug || a.id === currentSlug
  ) || articles[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSlug]);

  useEffect(() => {
    if (article) {
      const brand = siteSettings.brandName || "AURELIA";
      const title = lang === "ka" ? article.titleKa : (article.titleEn || article.titleKa);
      document.title = `${title} — ${brand}`;
    }
    return () => {
      const brand = siteSettings.brandName || "AURELIA";
      document.title = `${brand} — საიუველირო სახლი`;
    };
  }, [article, lang, siteSettings.brandName]);

  if (!article) {
    return (
      <div className={`min-h-screen flex flex-col justify-between ${darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#faf7f2] text-[#1c1917]"}`}>
        <Navbar
          lang={lang} setLang={setLang}
          darkMode={darkMode} setDarkMode={setDarkMode}
          favorites={favorites} setShowFavoritesModal={setShowFavoritesModal}
          isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <div className="py-28 text-center space-y-4 px-4">
          <h2 className="font-serif text-3xl text-amber-500">სტატია ვერ მოიძებნა</h2>
          <a href="/blog" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-black font-semibold text-xs uppercase">
            <ArrowLeft className="w-4 h-4" /> ბლოგზე დაბრუნება
          </a>
        </div>
        <Footer darkMode={darkMode} lang={lang} siteSettings={siteSettings} />
      </div>
    );
  }

  const title = lang === "ka" ? article.titleKa : (article.titleEn || article.titleKa);
  const content = lang === "ka" ? article.contentKa : (article.contentEn || article.contentKa);
  const readTime = lang === "ka" ? article.readTime : (article.readTimeEn || article.readTime);

  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const relatedArticles = articles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  // Markdown-ის მარტივი და ელეგანტური რენდერი
  const renderFormattedContent = (text) => {
    if (!text) return null;
    const blocks = text.split('\n\n');

    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-serif text-xl sm:text-2xl text-amber-400 mt-8 mb-3 font-medium">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="font-serif text-2xl sm:text-3xl text-amber-500 mt-10 mb-4 font-normal">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- '));
        return (
          <ul key={idx} className="space-y-2 my-4 pl-4 list-disc marker:text-amber-500">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="text-sm sm:text-base leading-relaxed opacity-85">
                {item.replace('- ', '')}
              </li>
            ))}
          </ul>
        );
      }
      if (/^\d+\./.test(trimmed)) {
        const items = trimmed.split('\n').filter((l) => /^\d+\./.test(l.trim()));
        return (
          <ol key={idx} className="space-y-2 my-4 pl-4 list-decimal marker:text-amber-500">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="text-sm sm:text-base leading-relaxed opacity-85">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        );
      }
      return (
        <p key={idx} className="text-sm sm:text-base leading-relaxed opacity-85 my-4">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${darkMode ? "bg-[#0c0b0a] text-[#f5f0e6]" : "bg-[#faf7f2] text-[#1c1917]"}`}>
      {/* Schema.org BlogPosting for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": title,
          "image": article.image,
          "datePublished": article.date,
          "author": {
            "@type": "Organization",
            "name": siteSettings.brandName || "AURELIA"
          },
          "publisher": {
            "@type": "Organization",
            "name": siteSettings.brandName || "AURELIA",
            "logo": {
              "@type": "ImageObject",
              "url": siteSettings.logoUrl || "https://www.matare.store/logo.png"
            }
          },
          "description": lang === "ka" ? article.excerptKa : (article.excerptEn || article.excerptKa)
        })
      }} />

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
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ნავიგაციის ზოლი */}
          <div className="py-4">
            <a
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === "ka" ? "ბლოგზე დაბრუნება" : "Back to Journal"}
            </a>
          </div>

          {/* სათაურის ბლოკი */}
          <header className="space-y-4 pt-4 pb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-amber-500 text-black">
                {article.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs opacity-60">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {article.date}
              </span>
              <span className="opacity-40">•</span>
              <span className="flex items-center gap-1.5 text-xs opacity-60">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {readTime}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-normal leading-tight">
              {title}
            </h1>

            <p className="text-base sm:text-lg opacity-75 leading-relaxed font-light">
              {lang === "ka" ? article.excerptKa : (article.excerptEn || article.excerptKa)}
            </p>

            {/* გაზიარების ზოლი */}
            <div className="pt-4 border-t border-stone-500/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold text-sm">
                  A
                </div>
                <div>
                  <span className="text-xs font-medium block">{siteSettings.brandName || "AURELIA"}</span>
                  <span className="text-[10px] opacity-60 block">საიუველირო სახლი • რედაქცია</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(title + " — " + shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on WhatsApp"
                  className="p-2.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on Facebook"
                  className="p-2.5 rounded-full bg-blue-700 hover:bg-blue-600 text-white transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  aria-label="Copy link"
                  className="px-3.5 py-2 rounded-full border border-stone-500/30 text-xs font-medium flex items-center gap-1.5 hover:border-amber-500 transition-all"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-500" />}
                  {copiedLink ? (lang === "ka" ? "დაკოპირდა!" : "Copied!") : (lang === "ka" ? "ლინკის კოპირება" : "Copy Link")}
                </button>
              </div>
            </div>
          </header>

          {/* მთავარი ფოტო */}
          <div className="aspect-[16/9] rounded-3xl overflow-hidden border border-stone-500/20 mb-10 shadow-xl bg-stone-900">
            <img
              src={article.image}
              alt={title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* სტატიის ძირითადი შინაარსი */}
          <div className={`p-6 sm:p-10 rounded-3xl border ${
            darkMode ? "bg-[#141210] border-stone-800" : "bg-white border-stone-200 shadow-sm"
          }`}>
            <div className="prose prose-invert max-w-none">
              {renderFormattedContent(content)}
            </div>
          </div>

          {/* ბოლო CTA ბლოკი */}
          <div className="my-14 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 text-center space-y-4">
            <span className="text-xs uppercase tracking-widest text-amber-400 block font-semibold">
              {lang === "ka" ? "ექსკლუზიური კოლექცია" : "Fine Jewelry Collection"}
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-normal">
              {lang === "ka" ? "აღმოაჩინეთ თქვენი იდეალური სამკაული" : "Discover Your Perfect Piece"}
            </h3>
            <p className="text-xs sm:text-sm opacity-75 max-w-md mx-auto">
              {lang === "ka"
                ? "დაათვალიერეთ ხელნაკეთი ბეჭდები, ყელსაბამები და სამაჯურები ჩვენს კატალოგში."
                : "Explore handcrafted rings, necklaces, and bespoke pieces in our catalog."}
            </p>
            <div className="pt-2">
              <a
                href="/#catalog"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {lang === "ka" ? "კოლექციის დათვალიერება" : "Explore Collection"}
              </a>
            </div>
          </div>

          {/* სხვა სტატიები */}
          {relatedArticles.length > 0 && (
            <section className="pt-8 border-t border-stone-500/20 space-y-6">
              <h4 className="font-serif text-2xl text-amber-500">
                {lang === "ka" ? "ასევე წაიკითხეთ:" : "Recommended Reading:"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedArticles.map((rel) => (
                  <a
                    key={rel.id}
                    href={`/blog/${encodeURIComponent(rel.slug || rel.id)}`}
                    className={`group rounded-2xl overflow-hidden border p-4 space-y-3 block transition-all ${
                      darkMode ? "bg-[#141210] border-stone-800 hover:border-amber-500/40" : "bg-white border-stone-200 hover:border-amber-500 shadow-sm"
                    }`}
                  >
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-stone-900">
                      <img
                        src={rel.image}
                        alt={lang === "ka" ? rel.titleKa : (rel.titleEn || rel.titleKa)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 block">
                      {rel.category}
                    </span>
                    <h5 className="font-serif text-sm font-medium group-hover:text-amber-500 transition-colors line-clamp-2">
                      {lang === "ka" ? rel.titleKa : (rel.titleEn || rel.titleKa)}
                    </h5>
                  </a>
                ))}
              </div>
            </section>
          )}
        </article>
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

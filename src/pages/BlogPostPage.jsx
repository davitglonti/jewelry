import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Share2, Check, MessageCircle, Send } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { navigateTo } from '../utils/navigation';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FavoritesModal from '../components/modals/FavoritesModal';

export default function BlogPostPage({ slugProp }) {
  const rawPath = window.location.pathname;
  const match = rawPath.match(/\/blog\/([^/?#]+)/);
  const currentSlug = slugProp || (match ? decodeURIComponent(match[1]) : '');

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
      const brand = siteSettings.brandName || "MATARE";
      const title = lang === "ka" ? article.titleKa : (article.titleEn || article.titleKa);
      document.title = `${title} — ${brand}`;
    }
    return () => {
      const brand = siteSettings.brandName || "MATARE";
      document.title = `${brand} — საიუველირო სახლი`;
    };
  }, [article, lang, siteSettings.brandName]);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-white text-[#141311]">
        <Navbar
          lang={lang} setLang={setLang}
          darkMode={darkMode} setDarkMode={setDarkMode}
          favorites={favorites} setShowFavoritesModal={setShowFavoritesModal}
          isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <div className="pt-40 pb-24 text-center space-y-4 px-4">
          <h2 className="font-serif text-3xl font-light">სტატია ვერ მოიძებნა</h2>
          <a href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-[#141311] text-white text-xs uppercase tracking-[0.18em]">
            <ArrowLeft className="w-4 h-4" /> ბლოგზე დაბრუნება
          </a>
        </div>
        <Footer lang={lang} siteSettings={siteSettings} />
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

  const relatedArticles = articles.filter((a) => a.id !== article.id).slice(0, 3);

  const renderFormattedContent = (text) => {
    if (!text) return null;
    const blocks = text.split('\n\n');

    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-serif text-xl sm:text-2xl text-[#141311] mt-10 mb-3 font-normal">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="font-serif text-2xl sm:text-3xl text-[#141311] mt-12 mb-4 font-light border-b border-[#E8E3DB] pb-2">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- '));
        return (
          <ul key={idx} className="space-y-2.5 my-5 pl-5 list-disc marker:text-[#9D7B48]">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="text-sm sm:text-base text-[#4A4640] leading-relaxed font-light">
                {item.replace('- ', '')}
              </li>
            ))}
          </ul>
        );
      }
      if (/^\d+\./.test(trimmed)) {
        const items = trimmed.split('\n').filter((l) => /^\d+\./.test(l.trim()));
        return (
          <ol key={idx} className="space-y-2.5 my-5 pl-5 list-decimal marker:text-[#9D7B48]">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="text-sm sm:text-base text-[#4A4640] leading-relaxed font-light">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        );
      }
      return (
        <p key={idx} className="text-sm sm:text-base text-[#4A4640] leading-relaxed font-light my-5">
          {trimmed}
        </p>
      );
    });
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

      <main id="main-content" className="pt-[104px] sm:pt-[120px] pb-24">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pb-6">
            <a
              href={lang === "en" ? "/en/blog" : "/blog"}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#847E75] hover:text-[#141311] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
              {lang === "ka" ? "ბლოგზე დაბრუნება" : "Back to Journal"}
            </a>
          </div>

          <header className="space-y-5 pb-10">
            <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#847E75]">
              <span className="text-[#9D7B48] font-medium">{article.category}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {article.date}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {readTime}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#141311] leading-[1.15]">
              {title}
            </h1>

            <p className="text-base sm:text-lg text-[#5C574F] leading-relaxed font-light">
              {lang === "ka" ? article.excerptKa : (article.excerptEn || article.excerptKa)}
            </p>

            <div className="pt-5 border-t border-[#E8E3DB] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F8F6F2] border border-[#E8E3DB] text-[#141311] flex items-center justify-center font-serif text-sm">
                  {(siteSettings.brandName || "M").charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-medium text-[#141311] block">{siteSettings.brandName || "MATARE"}</span>
                  <span className="text-[10px] text-[#847E75] uppercase tracking-[0.12em] block">Editorial Atelier</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(title + " — " + shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on WhatsApp"
                  className="w-9 h-9 border border-[#E8E3DB] text-[#4A4640] hover:border-[#141311] hover:text-[#141311] flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-4 h-4 stroke-[1.5]" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on Facebook"
                  className="w-9 h-9 border border-[#E8E3DB] text-[#4A4640] hover:border-[#141311] hover:text-[#141311] flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4 stroke-[1.5]" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  aria-label="Copy link"
                  className="px-3.5 h-9 border border-[#E8E3DB] text-[#141311] hover:border-[#141311] text-[10px] uppercase tracking-[0.16em] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#2E7D52]" /> : <Share2 className="w-3.5 h-3.5 text-[#9D7B48] stroke-[1.5]" />}
                  {copiedLink ? (lang === "ka" ? "დაკოპირდა!" : "Copied!") : (lang === "ka" ? "ლინკის კოპირება" : "Copy Link")}
                </button>
              </div>
            </div>
          </header>

          <div className="aspect-[16/9] overflow-hidden border border-[#E8E3DB] mb-12 bg-[#F4F1EC]">
            <img
              src={article.image}
              alt={title}
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>

          <div className="max-w-3xl mx-auto">
            {renderFormattedContent(content)}
          </div>

          <div className="my-16 p-10 sm:p-14 bg-[#F8F6F2] border border-[#E8E3DB] text-center space-y-4">
            <span className="text-[10px] uppercase tracking-[0.26em] text-[#9D7B48] block font-medium">
              {lang === "ka" ? "ექსკლუზიური კოლექცია" : "Fine Jewelry Collection"}
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-light text-[#141311]">
              {lang === "ka" ? "აღმოაჩინეთ თქვენი იდეალური სამკაული" : "Discover Your Perfect Piece"}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C574F] max-w-md mx-auto font-light">
              {lang === "ka"
                ? "დაათვალიერეთ ხელნაკეთი ბეჭდები, ყელსაბამები და სამაჯურები ჩვენს კატალოგში."
                : "Explore handcrafted rings, necklaces, and bespoke pieces in our catalog."}
            </p>
            <div className="pt-2">
              <a
                href={lang === "en" ? "/en/catalog" : "/catalog"}
                className="inline-block px-8 py-3.5 bg-[#141311] text-white hover:bg-[#2C2A26] text-[11px] uppercase tracking-[0.2em] transition-colors"
              >
                {lang === "ka" ? "კოლექციის დათვალიერება" : "Explore Collection"}
              </a>
            </div>
          </div>

          {relatedArticles.length > 0 && (
            <section className="pt-12 border-t border-[#E8E3DB] space-y-8">
              <h4 className="font-serif text-2xl font-light text-[#141311]">
                {lang === "ka" ? "ასევე წაიკითხეთ" : "Recommended Reading"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedArticles.map((rel) => (
                  <a
                    key={rel.id}
                    href={`${lang === "en" ? "/en" : ""}/blog/${encodeURIComponent(rel.slug || rel.id)}`}
                    className="group space-y-3 block"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-[#F4F1EC] border border-[#EFECE6]">
                      <img
                        src={rel.image}
                        alt={lang === "ka" ? rel.titleKa : (rel.titleEn || rel.titleKa)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#9D7B48] block">
                      {rel.category}
                    </span>
                    <h5 className="font-serif text-base font-normal text-[#141311] group-hover:text-[#9D7B48] transition-colors line-clamp-2">
                      {lang === "ka" ? rel.titleKa : (rel.titleEn || rel.titleKa)}
                    </h5>
                  </a>
                ))}
              </div>
            </section>
          )}
        </article>
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

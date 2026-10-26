import React, { useState } from 'react';
import { BookOpen, ExternalLink, Plus, Tag, X, Edit3, Upload, Link as LinkIcon, Trash2 } from 'lucide-react';
import { handleFileUpload } from '../../utils/imageUtils';

export default function AdminBlogTab({
  articles = [],
  setArticles,
  syncArticles,
  siteSettings = {},
  setSiteSettings,
  products = [],
  syncData,
  darkMode = true
}) {
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleImageInput, setArticleImageInput] = useState('');
  const [newBlogCategoryInput, setNewBlogCategoryInput] = useState('');

  const currentBlogCategories =
    siteSettings.blogCategories && siteSettings.blogCategories.length > 0
      ? siteSettings.blogCategories
      : ['გიდი', 'ოქრო', 'ბრილიანტი', 'მოვლა', 'სტილი'];

  const handleAddBlogCategory = () => {
    const val = newBlogCategoryInput.trim();
    if (!val) return;
    if (currentBlogCategories.includes(val)) {
      alert('ეს კატეგორია უკვე არსებობს!');
      return;
    }
    const updated = {
      ...siteSettings,
      blogCategories: [...currentBlogCategories, val]
    };
    setSiteSettings(updated);
    syncData(updated, products);
    setNewBlogCategoryInput('');
  };

  const handleDeleteBlogCategory = (cat) => {
    if (currentBlogCategories.length <= 1) {
      alert('მინიმუმ ერთი კატეგორია უნდა დარჩეს!');
      return;
    }
    const updated = {
      ...siteSettings,
      blogCategories: currentBlogCategories.filter((c) => c !== cat)
    };
    setSiteSettings(updated);
    syncData(updated, products);
  };

  const handleSaveArticle = () => {
    if (!editingArticle.titleKa?.trim()) {
      alert('გთხოვთ შეიყვანოთ სტატიის სათაური ქართულად!');
      return;
    }
    const cleanSlug = (editingArticle.slug || editingArticle.id)
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleanSlug) {
      alert('გთხოვთ შეიყვანოთ სწორი URL სლაგი!');
      return;
    }

    const prepared = {
      ...editingArticle,
      slug: cleanSlug,
      date: editingArticle.date || new Date().toISOString().split('T')[0]
    };

    const list = articles || [];
    const exists = list.some((a) => a.id === prepared.id);
    const updated = exists
      ? list.map((a) => (a.id === prepared.id ? prepared : a))
      : [prepared, ...list];

    setArticles(updated);
    syncArticles(updated);
    setEditingArticle(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            სტატიების სია ({articles.length})
          </h3>
          <p className="text-xs opacity-70 mt-1">
            სტატიები განკუთვნილია საიტის SEO ოპტიმიზაციისთვის და მომხმარებლებისთვის რჩევების გასაზიარებლად.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/blog"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl border border-stone-700 hover:border-amber-500 text-xs flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            ბლოგის ნახვა
          </a>
          <button
            type="button"
            onClick={() =>
              setEditingArticle({
                id: 'art-' + Date.now(),
                slug: '',
                titleKa: '',
                titleEn: '',
                category: currentBlogCategories[0] || 'გიდი',
                categoryEn: 'Guide',
                readTime: '4 წთ',
                readTimeEn: '4 min read',
                date: new Date().toISOString().split('T')[0],
                image: '',
                excerptKa: '',
                excerptEn: '',
                contentKa: '',
                contentEn: ''
              })
            }
            className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold flex items-center gap-1.5 hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            ახალი სტატია
          </button>
        </div>
      </div>

      {/* BLOG CATEGORIES MANAGEMENT */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
          darkMode ? 'bg-stone-900/40 border-stone-800' : 'bg-stone-50 border-stone-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h4 className="font-serif text-sm font-semibold text-amber-500 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            ბლოგის კატეგორიები ({currentBlogCategories.length})
          </h4>
          <span className="text-[11px] opacity-60">
            ეს კატეგორიები ავტომატურად გამოჩნდება სტატიის დამატებისას და საიტზე ფილტრში
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newBlogCategoryInput}
            onChange={(e) => setNewBlogCategoryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddBlogCategory();
              }
            }}
            placeholder="ახალი კატეგორიის სახელი (მაგ: საჩუქრების იდეები, მოვლა, ისტორია)"
            className={`flex-1 p-2.5 rounded-xl text-xs border ${
              darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
            }`}
          />
          <button
            type="button"
            onClick={handleAddBlogCategory}
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-semibold hover:brightness-110 transition-all shrink-0 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            კატეგორიის დამატება
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {currentBlogCategories.map((cat) => (
            <span
              key={cat}
              className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border ${
                darkMode
                  ? 'bg-stone-800/80 border-stone-700 text-stone-200'
                  : 'bg-white border-stone-200 text-stone-800 shadow-sm'
              }`}
            >
              <span className="font-medium">{cat}</span>
              <button
                type="button"
                onClick={() => handleDeleteBlogCategory(cat)}
                className="text-stone-400 hover:text-red-400 transition-colors"
                title={`წაშლა: ${cat}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* MODAL / EDITOR */}
      {editingArticle && (
        <div
          className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${
            darkMode ? 'bg-stone-900/95 border-amber-500/40' : 'bg-stone-50 border-amber-500'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-stone-500/20">
            <h4 className="font-serif text-lg text-amber-500 flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              {editingArticle.id && articles.some((a) => a.id === editingArticle.id)
                ? 'სტატიის რედაქტირება'
                : 'ახალი სტატიის დამატება'}
            </h4>
            <button
              type="button"
              onClick={() => setEditingArticle(null)}
              className="p-1 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5 opacity-70" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold block text-amber-500">სათაური (ქართულად) *</label>
                <input
                  type="text"
                  placeholder="მაგ: როგორ შევარჩიოთ ბეჭდის ზომა სწორად"
                  value={editingArticle.titleKa || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updates = { titleKa: val };
                    if (!editingArticle.slug || editingArticle.slug.trim() === '') {
                      updates.slug = val
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-');
                    }
                    setEditingArticle({ ...editingArticle, ...updates });
                  }}
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block text-amber-500">Title (English)</label>
                <input
                  type="text"
                  placeholder="e.g. How to Choose the Right Ring Size"
                  value={editingArticle.titleEn || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, titleEn: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            {/* Slug & Category & ReadTime & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-semibold block">URL სლაგი (slug) *</label>
                <input
                  type="text"
                  placeholder="how-to-choose-ring-size"
                  value={editingArticle.slug || ''}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-_]/g, '-')
                        .replace(/--+/g, '-')
                    })
                  }
                  className={`w-full p-2.5 rounded-xl border font-mono text-[11px] ${
                    darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
                <span className="text-[10px] opacity-60">ლინკი: /blog/{editingArticle.slug || '...'}</span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-amber-500">კატეგორია *</label>
                <select
                  value={editingArticle.category || currentBlogCategories[0] || 'გიდი'}
                  onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border cursor-pointer font-medium ${
                    darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                  }`}
                >
                  {Array.from(new Set([...currentBlogCategories, editingArticle.category].filter(Boolean))).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">კითხვის დრო</label>
                <input
                  type="text"
                  placeholder="4 წთ / 4 min"
                  value={editingArticle.readTime || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, readTime: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">გამოქვეყნების თარიღი</label>
                <input
                  type="date"
                  value={editingArticle.date || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, date: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            {/* Cover Photo */}
            <div className="space-y-2 pt-2">
              <label className="font-semibold block text-amber-500">მთავარი ფოტო (Cover Image)</label>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-black font-semibold cursor-pointer shrink-0 hover:brightness-110 transition-all">
                  <Upload className="w-4 h-4" />
                  ფოტოს ატვირთვა
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      handleFileUpload(file, (base64) => {
                        setEditingArticle((prev) => ({ ...prev, image: base64 }));
                      });
                    }}
                  />
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 w-full">
                  <input
                    type="url"
                    value={articleImageInput}
                    onChange={(e) => setArticleImageInput(e.target.value)}
                    placeholder="ან ჩასვით ფოტოს ლინკი (https://...)"
                    className={`w-full sm:flex-1 p-2.5 rounded-xl border ${
                      darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!articleImageInput.trim()) return;
                      setEditingArticle({ ...editingArticle, image: articleImageInput.trim() });
                      setArticleImageInput('');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-700 text-white flex items-center justify-center gap-1 shrink-0 hover:bg-stone-600 transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    დამატება
                  </button>
                </div>
              </div>

              {editingArticle.image && (
                <div className="relative w-48 h-28 rounded-xl overflow-hidden border border-amber-500/40 mt-2 group">
                  <img src={editingArticle.image} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setEditingArticle((prev) => ({ ...prev, image: '' }))}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                    title="ფოტოს წაშლა"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Excerpts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="font-semibold block">მოკლე ანონსი / აღწერა (ქართულად) *</label>
                <textarea
                  rows={3}
                  placeholder="მოკლე შეჯამება, რომელიც გამოჩნდება ბლოგის ბარათზე და Google-ის საძიებო შედეგებში..."
                  value={editingArticle.excerptKa || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerptKa: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold block">Short Excerpt (English)</label>
                <textarea
                  rows={3}
                  placeholder="Short excerpt for card and meta description..."
                  value={editingArticle.excerptEn || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerptEn: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${
                    darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            {/* Full Markdown Content */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold block text-amber-500">სტატიის სრული შინაარსი (ქართულად) *</label>
                  <span className="text-[11px] opacity-60">მხარდაჭერილია Markdown (# სათაური, **მუქი**, - სია)</span>
                </div>
                <textarea
                  rows={12}
                  placeholder="დაწერეთ სტატიის სრული ტექსტი აქ...&#10;&#10;### ქვესათაური&#10;ტექსტი...&#10;&#10;- პუნქტი 1&#10;- პუნქტი 2"
                  value={editingArticle.contentKa || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, contentKa: e.target.value })}
                  className={`w-full p-3 rounded-xl border font-mono text-xs leading-relaxed ${
                    darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-amber-500">Full Content (English)</label>
                <textarea
                  rows={8}
                  placeholder="Full article text in English..."
                  value={editingArticle.contentEn || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, contentEn: e.target.value })}
                  className={`w-full p-3 rounded-xl border font-mono text-xs leading-relaxed ${
                    darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'
                  }`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-500/20">
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="px-5 py-2.5 rounded-xl border border-stone-600 hover:bg-stone-800 transition-colors"
              >
                გაუქმება
              </button>
              <button
                type="button"
                onClick={handleSaveArticle}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-semibold hover:brightness-110 transition-all shadow-md"
              >
                შენახვა & გამოქვეყნება
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ARTICLES LIST */}
      <div className="space-y-3">
        {articles.length === 0 ? (
          <div className="text-center py-12 opacity-60 text-xs">
            სტატიები ჯერ არ არის დამატებული. დააჭირეთ „ახალი სტატია“ ღილაკს.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((art) => (
              <div
                key={art.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                  darkMode
                    ? 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                    : 'bg-white border-stone-200 shadow-sm hover:border-amber-500/40'
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-800 shrink-0">
                    {art.image ? (
                      <img src={art.image} alt={art.titleKa} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-500">
                        <BookOpen className="w-6 h-6 opacity-40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-medium">
                        {art.category || 'გიდი'}
                      </span>
                      <span className="text-[10px] opacity-50">{art.date}</span>
                      {art.readTime && <span className="text-[10px] opacity-50">• {art.readTime}</span>}
                    </div>
                    <h4 className="font-serif text-sm font-semibold line-clamp-1">{art.titleKa}</h4>
                    {art.titleEn && <p className="text-[11px] opacity-60 line-clamp-1">{art.titleEn}</p>}
                    <p className="text-[10px] font-mono text-amber-500/80 mt-1 truncate">/blog/{art.slug}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-500/15 text-xs">
                  <a
                    href={`/blog/${art.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-500 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    ნახვა
                  </a>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingArticle({ ...art })}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-amber-400" />
                      რედაქტირება
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`ნამდვილად გსურთ სტატიის „${art.titleKa}“ წაშლა?`)) {
                          const updated = articles.filter((a) => a.id !== art.id);
                          setArticles(updated);
                          syncArticles(updated);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-colors"
                      title="წაშლა"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Plus, Trash2, Upload, Sliders } from 'lucide-react';
import { handleFileUpload } from '../../utils/imageUtils';
import ValueCardsEditor, { DEFAULT_VALUE_CARDS } from './ValueCardsEditor';

export default function AdminHomeTab({
  homeSubTab = 'carousel',
  setHomeSubTab,
  siteSettings = {},
  setSiteSettings,
  products = [],
  syncData,
  darkMode = true
}) {
  return (
    <div className="space-y-6">
      {/* Home SubTabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
        {[
          { id: 'carousel', label: 'ზედა კარუსელი (Hero)' },
          { id: 'craft', label: 'ოსტატობა & ღირებულებები' }
        ].map((sub) => (
          <button
            key={sub.id}
            type="button"
            onClick={() => setHomeSubTab(sub.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              homeSubTab === sub.id
                ? 'bg-amber-500 text-black font-semibold'
                : darkMode
                ? 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* Subtab 1: Hero Carousel */}
      {homeSubTab === 'carousel' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-lg text-amber-500">ზედა კარუსელის სლაიდები</h4>
            <button
              type="button"
              onClick={() => {
                const newSlide = {
                  id: Date.now(),
                  badge: 'ახალი კოლექცია',
                  badgeEn: 'New Collection',
                  title: 'სათაური ქართულად',
                  titleEn: 'Title in English',
                  subtitle: 'აღწერა ქართულად...',
                  subtitleEn: 'Description in English...',
                  buttonText: 'კოლექციის ნახვა',
                  buttonTextEn: 'Explore Collection',
                  image:
                    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80'
                };
                const updated = {
                  ...siteSettings,
                  heroSlides: [...(siteSettings.heroSlides || []), newSlide]
                };
                setSiteSettings(updated);
                syncData(updated, products);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold flex items-center gap-1.5 hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" />
              სლაიდის დამატება
            </button>
          </div>

          {(siteSettings.heroSlides || []).map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="p-4 rounded-2xl border border-stone-500/20 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">სლაიდი #{idx + 1}</span>
                {siteSettings.heroSlides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...siteSettings,
                        heroSlides: siteSettings.heroSlides.filter((_, i) => i !== idx)
                      };
                      setSiteSettings(updated);
                      syncData(updated, products);
                    }}
                    className="text-red-400 flex items-center gap-1 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> წაშლა
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="opacity-60 block mb-1">ბეიჯი (GE):</label>
                  <input
                    type="text"
                    value={slide.badge || ''}
                    onChange={(e) => {
                      const copy = [...siteSettings.heroSlides];
                      copy[idx] = { ...copy[idx], badge: e.target.value };
                      setSiteSettings({ ...siteSettings, heroSlides: copy });
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Badge (EN):</label>
                  <input
                    type="text"
                    value={slide.badgeEn || ''}
                    onChange={(e) => {
                      const copy = [...siteSettings.heroSlides];
                      copy[idx] = { ...copy[idx], badgeEn: e.target.value };
                      setSiteSettings({ ...siteSettings, heroSlides: copy });
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">მთავარი სათაური (GE):</label>
                  <input
                    type="text"
                    value={slide.title || ''}
                    onChange={(e) => {
                      const copy = [...siteSettings.heroSlides];
                      copy[idx] = { ...copy[idx], title: e.target.value };
                      setSiteSettings({ ...siteSettings, heroSlides: copy });
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Main Title (EN):</label>
                  <input
                    type="text"
                    value={slide.titleEn || ''}
                    onChange={(e) => {
                      const copy = [...siteSettings.heroSlides];
                      copy[idx] = { ...copy[idx], titleEn: e.target.value };
                      setSiteSettings({ ...siteSettings, heroSlides: copy });
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="opacity-60 block mb-1">აღწერა / ქვესათაური (GE):</label>
                  <textarea
                    rows={2}
                    value={slide.subtitle || ''}
                    onChange={(e) => {
                      const copy = [...siteSettings.heroSlides];
                      copy[idx] = { ...copy[idx], subtitle: e.target.value };
                      setSiteSettings({ ...siteSettings, heroSlides: copy });
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="opacity-60 block mb-1">Subtitle (EN):</label>
                  <textarea
                    rows={2}
                    value={slide.subtitleEn || ''}
                    onChange={(e) => {
                      const copy = [...siteSettings.heroSlides];
                      copy[idx] = { ...copy[idx], subtitleEn: e.target.value };
                      setSiteSettings({ ...siteSettings, heroSlides: copy });
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">ღილაკის ტექსტი (GE):</label>
                  <input
                    type="text"
                    value={slide.buttonText || ''}
                    onChange={(e) => {
                      const copy = [...siteSettings.heroSlides];
                      copy[idx] = { ...copy[idx], buttonText: e.target.value };
                      setSiteSettings({ ...siteSettings, heroSlides: copy });
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Button Text (EN):</label>
                  <input
                    type="text"
                    value={slide.buttonTextEn || ''}
                    onChange={(e) => {
                      const copy = [...siteSettings.heroSlides];
                      copy[idx] = { ...copy[idx], buttonTextEn: e.target.value };
                      setSiteSettings({ ...siteSettings, heroSlides: copy });
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="opacity-60 block mb-1">ფონის ფოტოს ბმული (URL ან ატვირთვა):</label>
                  <input
                    type="text"
                    value={slide.image || ''}
                    onChange={(e) => {
                      const copy = [...siteSettings.heroSlides];
                      copy[idx] = { ...copy[idx], image: e.target.value };
                      setSiteSettings({ ...siteSettings, heroSlides: copy });
                    }}
                    className={`w-full p-2.5 rounded-xl border ${
                      darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 cursor-pointer flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  ფოტოს ატვირთვა ფაილიდან
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleFileUpload(e.target.files?.[0], (base64) => {
                        const copy = [...siteSettings.heroSlides];
                        copy[idx] = { ...copy[idx], image: base64 };
                        setSiteSettings({ ...siteSettings, heroSlides: copy });
                      });
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => syncData(siteSettings, products)}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-black font-semibold hover:brightness-110 transition-all"
                >
                  სლაიდის შენახვა
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 2: Craft & Value Cards */}
      {homeSubTab === 'craft' && (
        <div className="space-y-4 max-w-3xl text-xs">
          <h4 className="font-serif text-lg text-amber-500">
            „ხელოვნება, რომელიც თაობებს გადაეცემა“ — ტექსტები და ფოტოები
          </h4>
          <input
            type="text"
            value={siteSettings.craftBadge || ''}
            onChange={(e) => setSiteSettings({ ...siteSettings, craftBadge: e.target.value })}
            placeholder="პატარა წარწერა"
            className={`w-full p-3 rounded-xl border ${
              darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
            }`}
          />
          <input
            type="text"
            value={siteSettings.craftTitle || ''}
            onChange={(e) => setSiteSettings({ ...siteSettings, craftTitle: e.target.value })}
            placeholder="მთავარი სათაური"
            className={`w-full p-3 rounded-xl border ${
              darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
            }`}
          />
          <textarea
            rows={3}
            value={siteSettings.craftDesc || ''}
            onChange={(e) => setSiteSettings({ ...siteSettings, craftDesc: e.target.value })}
            placeholder="აღწერის ტექსტი"
            className={`w-full p-3 rounded-xl border ${
              darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
            }`}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="font-medium block">მარცხენა ფოტო:</label>
              <input
                type="text"
                value={siteSettings.craftImg1 || ''}
                onChange={(e) => setSiteSettings({ ...siteSettings, craftImg1: e.target.value })}
                placeholder="ფოტოს URL"
                className={`w-full p-2.5 rounded-xl border ${
                  darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 cursor-pointer hover:bg-amber-500/30 transition-colors">
                <Upload className="w-3.5 h-3.5" /> ფაილის ატვირთვა
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e.target.files?.[0], (b64) =>
                      setSiteSettings({ ...siteSettings, craftImg1: b64 })
                    )
                  }
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="font-medium block">მარჯვენა ფოტო:</label>
              <input
                type="text"
                value={siteSettings.craftImg2 || ''}
                onChange={(e) => setSiteSettings({ ...siteSettings, craftImg2: e.target.value })}
                placeholder="ფოტოს URL"
                className={`w-full p-2.5 rounded-xl border ${
                  darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 text-amber-400 cursor-pointer hover:bg-amber-500/30 transition-colors">
                <Upload className="w-3.5 h-3.5" /> ფაილის ატვირთვა
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e.target.files?.[0], (b64) =>
                      setSiteSettings({ ...siteSettings, craftImg2: b64 })
                    )
                  }
                />
              </label>
            </div>
          </div>

          <ValueCardsEditor
            darkMode={darkMode}
            sectionTitle="მთავარი გვერდის ღირებულებების ბარათები (4 ბარათი)"
            sectionSubtitle="ეს ბარათები გამოჩნდება მხოლოდ მთავარ გვერდზე. („ჩვენს შესახებ“ გვერდის ბარათები იმართება მე-8 ტაბიდან)."
            badgeKa={siteSettings.homeValuesBadge || siteSettings.aboutValuesBadge || 'რატომ გვირჩევენ ჩვენ'}
            badgeEn={siteSettings.homeValuesBadgeEn || 'Why Choose Us'}
            onBadgeKaChange={(val) => setSiteSettings({ ...siteSettings, homeValuesBadge: val })}
            onBadgeEnChange={(val) => setSiteSettings({ ...siteSettings, homeValuesBadgeEn: val })}
            titleKa={siteSettings.homeValuesTitle || siteSettings.aboutValuesTitle || 'ჩვენი სტანდარტი და ღირებულებები'}
            titleEn={siteSettings.homeValuesTitleEn || 'Our Standards & Values'}
            onTitleKaChange={(val) => setSiteSettings({ ...siteSettings, homeValuesTitle: val })}
            onTitleEnChange={(val) => setSiteSettings({ ...siteSettings, homeValuesTitleEn: val })}
            cards={
              siteSettings.homeValues?.length === 4
                ? siteSettings.homeValues
                : siteSettings.aboutValues?.length === 4
                ? siteSettings.aboutValues
                : DEFAULT_VALUE_CARDS
            }
            onCardChange={(idx, field, val) => {
              const base =
                siteSettings.homeValues?.length === 4
                  ? [...siteSettings.homeValues]
                  : siteSettings.aboutValues?.length === 4
                  ? [...siteSettings.aboutValues]
                  : DEFAULT_VALUE_CARDS.map((c) => ({ ...c }));
              base[idx] = { ...base[idx], [field]: val };
              setSiteSettings({ ...siteSettings, homeValues: base });
            }}
          />

          <button
            type="button"
            onClick={() => syncData(siteSettings, products)}
            className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold hover:brightness-110 transition-all"
          >
            შენახვა
          </button>
        </div>
      )}
    </div>
  );
}

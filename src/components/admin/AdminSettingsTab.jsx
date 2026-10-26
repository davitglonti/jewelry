import React, { useState } from 'react';
import {
  Phone, Globe, ImageIcon, Tag, Upload, Save, HelpCircle,
  Truck, ShieldCheck, Sparkles, Plus, Edit3, X, Trash2
} from 'lucide-react';
import { handleFileUpload } from '../../utils/imageUtils';
import ValueCardsEditor, { DEFAULT_VALUE_CARDS } from './ValueCardsEditor';
import { DEFAULT_FAQ_ITEMS, DEFAULT_PRODUCT_ASSURANCE } from '../../data/defaultSettings';

export default function AdminSettingsTab({
  siteSubTab = 'contacts',
  setSiteSubTab,
  siteSettings = {},
  setSiteSettings,
  products = [],
  inquiries = [],
  syncData,
  darkMode = true
}) {
  const [editingFaq, setEditingFaq] = useState(null);

  const currentFaqList =
    siteSettings.faqItems && siteSettings.faqItems.length > 0
      ? siteSettings.faqItems
      : DEFAULT_FAQ_ITEMS;

  const currentAssurance =
    siteSettings.productAssurance && siteSettings.productAssurance.length === 3
      ? siteSettings.productAssurance
      : DEFAULT_PRODUCT_ASSURANCE;

  return (
    <div className="space-y-6">
      {/* Subtabs navigation bar */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'contacts', label: 'საკონტაქტო & სოციალური' },
          { id: 'branding', label: 'ბრენდინგი & ლოგო' },
          { id: 'about', label: 'ჩვენს შესახებ (About)' },
          { id: 'faq', label: 'FAQ & გარანტიები' }
        ].map((sub) => (
          <button
            key={sub.id}
            type="button"
            onClick={() => setSiteSubTab(sub.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              siteSubTab === sub.id
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

      {/* SUBTAB 1: CONTACTS & SOCIALS */}
      {siteSubTab === 'contacts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* საკონტაქტო მონაცემები */}
            <div
              className={`p-6 rounded-2xl border space-y-4 ${
                darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 pb-3 border-b border-stone-800/80">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-stone-100">საკონტაქტო მონაცემები</h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    ეს მონაცემები ავტომატურად ისახება ჰედერში, ფუტერში, FAQ-სა და საკონტაქტო ფანჯარაში.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block mb-1.5 font-medium text-stone-300">მთავარი ტელეფონის ნომერი:</label>
                  <input
                    type="text"
                    value={siteSettings.phone || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                    placeholder="+995 555 12 34 56"
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#1c1a17] border-stone-800 focus:border-amber-500 text-stone-200'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-stone-300">საკონტაქტო ელფოსტა:</label>
                  <input
                    type="email"
                    value={siteSettings.email || siteSettings.contactEmail || ''}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, email: e.target.value, contactEmail: e.target.value })
                    }
                    placeholder="info@matare.store"
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#1c1a17] border-stone-800 focus:border-amber-500 text-stone-200'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-stone-300">მისამართი (საწარმო / შოურუმი):</label>
                  <input
                    type="text"
                    value={siteSettings.address || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                    placeholder="თბილისი, საქართველო (საწარმო & შოურუმი)"
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#1c1a17] border-stone-800 focus:border-amber-500 text-stone-200'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-stone-300">სამუშაო საათები:</label>
                  <input
                    type="text"
                    value={siteSettings.hours || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, hours: e.target.value })}
                    placeholder="ორშაბათი - შაბათი: 10:00 - 19:00"
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#1c1a17] border-stone-800 focus:border-amber-500 text-stone-200'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-stone-300">საავტორო უფლებები (Footer Copyright):</label>
                  <input
                    type="text"
                    value={siteSettings.copyright || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, copyright: e.target.value })}
                    placeholder="© 2026 მატარე. ყველა უფლება დაცულია."
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#1c1a17] border-stone-800 focus:border-amber-500 text-stone-200'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* სოციალური ქსელები */}
            <div
              className={`p-6 rounded-2xl border space-y-4 ${
                darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 pb-3 border-b border-stone-800/80">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-stone-100">სოციალური ქსელები</h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    აქტიური ბმულები თქვენს სოციალურ პროფილებთან და მესენჯერებთან.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block mb-1.5 font-medium text-stone-300">Facebook გვერდის ბმული:</label>
                  <input
                    type="text"
                    value={siteSettings.facebook || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#1c1a17] border-stone-800 focus:border-amber-500 text-stone-200'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-stone-300">Instagram პროფილის ბმული:</label>
                  <input
                    type="text"
                    value={siteSettings.instagram || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#1c1a17] border-stone-800 focus:border-amber-500 text-stone-200'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-stone-300">WhatsApp პირდაპირი ჩატი (URL ან ნომერი):</label>
                  <input
                    type="text"
                    value={siteSettings.whatsapp || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                    placeholder="https://wa.me/995555123456"
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#1c1a17] border-stone-800 focus:border-amber-500 text-stone-200'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-stone-300">Messenger პირდაპირი ბმული:</label>
                  <input
                    type="text"
                    value={siteSettings.messenger || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, messenger: e.target.value })}
                    placeholder="https://m.me/yourpage"
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#1c1a17] border-stone-800 focus:border-amber-500 text-stone-200'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => syncData(siteSettings, products, inquiries)}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10 transition-all active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>ცვლილებების შენახვა</span>
          </button>
        </div>
      )}

      {/* SUBTAB 2: BRANDING & LOGO */}
      {siteSubTab === 'branding' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ლოგო & ფავიკონი */}
            <div
              className={`p-6 rounded-2xl border space-y-4 ${
                darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 pb-3 border-b border-stone-800/80">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-stone-100">ლოგო & ფავიკონი</h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    ეს ლოგო ისახება საიტის ჰედერში, ფუტერში და ბრაუზერის ჩანართში (Favicon).
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block mb-1.5 font-medium text-stone-300">ლოგოს სურათის ბმული (URL):</label>
                  <input
                    type="text"
                    value={siteSettings.logoUrl || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, logoUrl: e.target.value })}
                    placeholder="https://... ან ატვირთეთ ქვემოდან"
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#1c1a17] border-stone-800 focus:border-amber-500 text-stone-200'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black transition-all cursor-pointer font-medium active:scale-95">
                    <Upload className="w-4 h-4" />
                    <span>ლოგოს ატვირთვა კომპიუტერიდან</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e.target.files?.[0], (b64) =>
                          setSiteSettings({ ...siteSettings, logoUrl: b64 })
                        )
                      }
                    />
                  </label>

                  {siteSettings.logoUrl && (
                    <div className="w-12 h-12 rounded-xl border border-stone-700 bg-black/40 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={siteSettings.logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ბრენდის იდენტობა */}
            <div
              className={`p-6 rounded-2xl border space-y-4 ${
                darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3 pb-3 border-b border-stone-800/80">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-stone-100">ბრენდის იდენტობა</h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    ბრენდის სახელი, ბრაუზერის სათაური და საძიებო სისტემების მეტა-მონაცემები.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block mb-1.5 font-medium text-stone-300">ბრენდის სახელი (საიტზე შიგნით):</label>
                  <input
                    type="text"
                    value={siteSettings.brandName || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, brandName: e.target.value })}
                    placeholder="მაგ: AURELIA / მატარე"
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#1c1a17] border-stone-800 focus:border-amber-500 text-stone-200'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-stone-300">ბრაუზერის სათაური (Tab-ში რაც წერია):</label>
                  <input
                    type="text"
                    value={siteSettings.browserTitle || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, browserTitle: e.target.value })}
                    placeholder="მაგ: მატარე — საიუველირო სახლი"
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
                      darkMode
                        ? 'bg-[#1c1a17] border-stone-800 focus:border-amber-500 text-stone-200'
                        : 'bg-stone-50 border-stone-300 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => syncData(siteSettings, products, inquiries)}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10 transition-all active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>ცვლილებების შენახვა</span>
          </button>
        </div>
      )}

      {/* SUBTAB 3: ABOUT PAGE */}
      {siteSubTab === 'about' && (
        <div className="space-y-6 max-w-3xl text-xs">
          <h4 className="font-serif text-lg text-amber-500">„ჩვენს შესახებ“ გვერდის მართვა</h4>

          <div className="space-y-3">
            <label className="font-medium block text-amber-400">თავი / სათაური (Hero Section):</label>
            <input
              type="text"
              value={siteSettings.aboutHeroTitle || ''}
              onChange={(e) => setSiteSettings({ ...siteSettings, aboutHeroTitle: e.target.value })}
              placeholder="მთავარი სათაური (ქართულად)"
              className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
            />
            <input
              type="text"
              value={siteSettings.aboutHeroTitleEn || ''}
              onChange={(e) => setSiteSettings({ ...siteSettings, aboutHeroTitleEn: e.target.value })}
              placeholder="Main Title (English)"
              className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
            />
            <textarea
              rows={2}
              value={siteSettings.aboutHeroSubtitle || ''}
              onChange={(e) => setSiteSettings({ ...siteSettings, aboutHeroSubtitle: e.target.value })}
              placeholder="ქვესათაური / აღწერა (ქართულად)"
              className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
            />
            <textarea
              rows={2}
              value={siteSettings.aboutHeroSubtitleEn || ''}
              onChange={(e) => setSiteSettings({ ...siteSettings, aboutHeroSubtitleEn: e.target.value })}
              placeholder="Subtitle (English)"
              className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
            />
          </div>

          <div className="space-y-3 pt-4 border-t border-stone-500/20">
            <label className="font-medium block text-amber-400">დამატებითი ისტორია / აბზაცი:</label>
            <textarea
              rows={4}
              value={siteSettings.aboutExtraText || ''}
              onChange={(e) => setSiteSettings({ ...siteSettings, aboutExtraText: e.target.value })}
              placeholder="ტექსტი რომელიც ჩნდება 'ჩვენს შესახებ' გვერდზე..."
              className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
            />
          </div>

          <ValueCardsEditor
            darkMode={darkMode}
            sectionTitle="„ჩვენს შესახებ“ გვერდის ღირებულებების ბარათები (4 ბარათი)"
            sectionSubtitle="ეს ბარათები გამოჩნდება მხოლოდ „ჩვენს შესახებ“ (/about) გვერდზე. (მთავარი გვერდის ბარათები იმართება მე-5 ტაბიდან)."
            badgeKa={siteSettings.aboutValuesBadge || 'რატომ გვირჩევენ ჩვენ'}
            badgeEn={siteSettings.aboutValuesBadgeEn || 'Why Choose Us'}
            onBadgeKaChange={(val) => setSiteSettings({ ...siteSettings, aboutValuesBadge: val })}
            onBadgeEnChange={(val) => setSiteSettings({ ...siteSettings, aboutValuesBadgeEn: val })}
            titleKa={siteSettings.aboutValuesTitle || 'ჩვენი სტანდარტი და ღირებულებები'}
            titleEn={siteSettings.aboutValuesTitleEn || 'Our Standards & Values'}
            onTitleKaChange={(val) => setSiteSettings({ ...siteSettings, aboutValuesTitle: val })}
            onTitleEnChange={(val) => setSiteSettings({ ...siteSettings, aboutValuesTitleEn: val })}
            cards={siteSettings.aboutValues?.length === 4 ? siteSettings.aboutValues : DEFAULT_VALUE_CARDS}
            onCardChange={(idx, field, val) => {
              const base =
                siteSettings.aboutValues?.length === 4
                  ? [...siteSettings.aboutValues]
                  : DEFAULT_VALUE_CARDS.map((c) => ({ ...c }));
              base[idx] = { ...base[idx], [field]: val };
              setSiteSettings({ ...siteSettings, aboutValues: base });
            }}
          />

          <button
            type="button"
            onClick={() => syncData(siteSettings, products)}
            className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold mt-4 hover:brightness-110 transition-all"
          >
            ცვლილებების შენახვა
          </button>
        </div>
      )}

      {/* SUBTAB 4: FAQ & PRODUCT ASSURANCE */}
      {siteSubTab === 'faq' && (
        <div className="space-y-10">
          {/* SECTION 1: FAQ MANAGEMENT */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-500/20">
              <div>
                <h3 className="font-serif text-xl flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-500" />
                  ხშირად დასმული კითხვები (FAQ) ({currentFaqList.length})
                </h3>
                <p className="text-xs opacity-70 mt-1">
                  ეს კითხვა-პასუხები გამოდის მთავარი გვერდის ბოლოში და გადაეცემა Google-ს საძიებო შედეგებში Rich Snippets-ისთვის.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingFaq({
                    id: 'faq-' + Date.now(),
                    questionKa: '',
                    questionEn: '',
                    answerKa: '',
                    answerEn: ''
                  })
                }
                className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-semibold flex items-center gap-1.5 hover:brightness-110 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                ახალი კითხვის დამატება
              </button>
            </div>

            {/* MODAL / FORM FOR FAQ ITEM */}
            {editingFaq && (
              <div
                className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
                  darkMode ? 'bg-stone-900/95 border-amber-500/40' : 'bg-stone-50 border-amber-500'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-3 border-stone-500/20">
                  <h4 className="font-serif text-base text-amber-500 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    {currentFaqList.some((f) => f.id === editingFaq.id)
                      ? 'კითხვის რედაქტირება'
                      : 'ახალი კითხვის დამატება'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingFaq(null)}
                    className="p-1 rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-5 h-5 opacity-70" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold block text-amber-500">კითხვა (ქართულად) *</label>
                      <input
                        type="text"
                        value={editingFaq.questionKa || ''}
                        onChange={(e) => setEditingFaq({ ...editingFaq, questionKa: e.target.value })}
                        placeholder="მაგ: როგორ შევარჩიო ბეჭდის ზომა სწორად?"
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold block text-amber-500">Question (English)</label>
                      <input
                        type="text"
                        value={editingFaq.questionEn || ''}
                        onChange={(e) => setEditingFaq({ ...editingFaq, questionEn: e.target.value })}
                        placeholder="e.g. How do I choose the right ring size?"
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold block">პასუხი (ქართულად) *</label>
                      <textarea
                        rows={4}
                        value={editingFaq.answerKa || ''}
                        onChange={(e) => setEditingFaq({ ...editingFaq, answerKa: e.target.value })}
                        placeholder="დაწერეთ ამომწურავი პასუხი ქართულად..."
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold block">Answer (English)</label>
                      <textarea
                        rows={4}
                        value={editingFaq.answerEn || ''}
                        onChange={(e) => setEditingFaq({ ...editingFaq, answerEn: e.target.value })}
                        placeholder="Write the answer in English..."
                        className={`w-full p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-stone-300 text-stone-900'}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-500/20">
                    <button
                      type="button"
                      onClick={() => setEditingFaq(null)}
                      className="px-4 py-2 rounded-xl border border-stone-600 hover:bg-stone-800 transition-colors"
                    >
                      გაუქმება
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editingFaq.questionKa?.trim() || !editingFaq.answerKa?.trim()) {
                          alert('გთხოვთ შეიყვანოთ კითხვა და პასუხი ქართულად!');
                          return;
                        }
                        const exists = currentFaqList.some((f) => f.id === editingFaq.id);
                        const updated = exists
                          ? currentFaqList.map((f) => (f.id === editingFaq.id ? editingFaq : f))
                          : [...currentFaqList, editingFaq];
                        const newSettings = { ...siteSettings, faqItems: updated };
                        setSiteSettings(newSettings);
                        syncData(newSettings, products);
                        setEditingFaq(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-amber-500 text-black font-semibold hover:brightness-110 transition-all"
                    >
                      კითხვის შენახვა
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ ITEMS LIST */}
            <div className="space-y-3">
              {currentFaqList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    darkMode ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="font-serif text-sm font-semibold flex items-center gap-2">
                      <span className="text-amber-500 font-mono text-xs">#{idx + 1}</span>
                      <span>{item.questionKa}</span>
                    </div>
                    {item.questionEn && <p className="text-[11px] opacity-60 italic">{item.questionEn}</p>}
                    <p className="text-xs opacity-75 line-clamp-2 pt-1">{item.answerKa}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setEditingFaq({ ...item })}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      რედაქტირება
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentFaqList.length <= 1) {
                          alert('მინიმუმ ერთი კითხვა უნდა დარჩეს!');
                          return;
                        }
                        if (window.confirm(`ნამდვილად გსურთ კითხვის „${item.questionKa}“ წაშლა?`)) {
                          const updated = currentFaqList.filter((f) => f.id !== item.id);
                          const newSettings = { ...siteSettings, faqItems: updated };
                          setSiteSettings(newSettings);
                          syncData(newSettings, products);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-colors"
                      title="წაშლა"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: PRODUCT ASSURANCE CARDS */}
          <div className="space-y-6 pt-6 border-t border-stone-500/20">
            <div>
              <h3 className="font-serif text-xl flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                პროდუქტის გვერდის 3 გარანტიის ბარათი
              </h3>
              <p className="text-xs opacity-70 mt-1">
                ეს 3 ბარათი ჩნდება თითოეული სამკაულის გვერდზე, ფოტოსა და ღილაკების ქვემოთ (მიწოდება, სერტიფიკატი, უვადო მოვლა).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {currentAssurance.map((card, idx) => {
                const Icon = idx === 0 ? Truck : idx === 1 ? ShieldCheck : Sparkles;
                return (
                  <div
                    key={card.id || idx}
                    className={`p-5 rounded-2xl border space-y-4 ${
                      darkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-white border-stone-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-amber-500 font-serif font-medium pb-2 border-b border-stone-500/15">
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>ბარათი #{idx + 1}</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-semibold block">სათაური (ქართულად):</label>
                        <input
                          type="text"
                          value={card.titleKa || ''}
                          onChange={(e) => {
                            const next = [...currentAssurance];
                            next[idx] = { ...next[idx], titleKa: e.target.value };
                            setSiteSettings({ ...siteSettings, productAssurance: next });
                          }}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold block">Title (English):</label>
                        <input
                          type="text"
                          value={card.titleEn || ''}
                          onChange={(e) => {
                            const next = [...currentAssurance];
                            next[idx] = { ...next[idx], titleEn: e.target.value };
                            setSiteSettings({ ...siteSettings, productAssurance: next });
                          }}
                          className={`w-full p-2.5 rounded-xl border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold block">პუნქტები (ქართულად, თითო ახალ ხაზზე):</label>
                        <textarea
                          rows={5}
                          value={card.descKa || ''}
                          onChange={(e) => {
                            const next = [...currentAssurance];
                            next[idx] = { ...next[idx], descKa: e.target.value };
                            setSiteSettings({ ...siteSettings, productAssurance: next });
                          }}
                          className={`w-full p-2.5 rounded-xl border font-mono text-[11px] ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold block">Points (English, one per line):</label>
                        <textarea
                          rows={5}
                          value={card.descEn || ''}
                          onChange={(e) => {
                            const next = [...currentAssurance];
                            next[idx] = { ...next[idx], descEn: e.target.value };
                            setSiteSettings({ ...siteSettings, productAssurance: next });
                          }}
                          className={`w-full p-2.5 rounded-xl border font-mono text-[11px] ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => syncData(siteSettings, products)}
              className="px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold text-xs sm:text-sm hover:brightness-110 transition-all shadow-md"
            >
              გარანტიების შენახვა
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

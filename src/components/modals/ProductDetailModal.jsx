import React, { useState } from 'react';
import { ArrowLeft, X, Check, Share2, ArrowLeftRight } from 'lucide-react';
import { pick, formatPrice, calculateDiscountPercent } from '../../utils/i18n';
import { shareProductLink } from '../../utils/shareUtils';
import { useStore } from '../../context/StoreContext';
import StockStatusBadge from '../store/StockStatusBadge';
import RingSizerModal from './RingSizerModal';
import ProductMediaGallery from '../store/ProductMediaGallery';
import ProductSpecsTable from '../store/ProductSpecsTable';
import ProductActionButtons from '../store/ProductActionButtons';

export default function ProductDetailModal({
  selectedProduct,
  onClose,
  activeImageIndex,
  setActiveImageIndex,
  selectedSize,
  setSelectedSize,
  setLightboxImage
}) {
  const { darkMode, lang, siteSettings, products, inquiries, setInquiries, syncData, compareList, toggleCompare } = useStore();

  const [showRingSizer, setShowRingSizer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!selectedProduct) return null;

  const active360Url = selectedProduct.video360 || (
    (selectedProduct.sku === 'AUR-101' || selectedProduct.sku === 'AUR-198')
      ? 'https://cloudinary-res.cloudinary.com/video/upload/w_600,c_fill,q_auto/dpr_auto/360_demo.mp4'
      : null
  );

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto animate-fadeIn ${darkMode ? 'bg-[#0c0b0a] text-[#f5f0e6]' : 'bg-[#fcfbf9] text-[#1c1917]'}`}>
      
      {/* ზედა ნავიგაცია */}
      <div className={`sticky top-0 z-40 px-6 py-4 border-b backdrop-blur-md flex items-center justify-between ${
        darkMode ? 'bg-[#121110]/90 border-stone-800' : 'bg-white/90 border-stone-200'
      }`}>
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all ${
            darkMode ? 'bg-stone-800 hover:bg-stone-700 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ka' ? 'კატალოგში დაბრუნება' : 'Back to Catalog'}</span>
        </button>

        <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
          {selectedProduct.sku} • {selectedProduct.category}
        </span>

        <button
          onClick={onClose}
          aria-label={lang === 'ka' ? 'დახურვა' : 'Close'}
          className={`p-2.5 rounded-full border transition-all ${
            darkMode ? 'border-stone-800 bg-stone-900 text-white hover:bg-stone-800' : 'border-stone-200 bg-stone-100 text-stone-800 hover:bg-stone-200'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full max-w-none px-3 sm:px-5 lg:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 xl:gap-12 items-start">
          
          {/* მარცხენა მხარე: ფოტოების გალერეა + Zoom + 360 */}
          <ProductMediaGallery
            images={selectedProduct.images}
            productName={selectedProduct.name}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
            active360Url={active360Url}
            setLightboxImage={setLightboxImage}
            darkMode={darkMode}
            lang={lang}
          />

          {/* მარჯვენა მხარე: ტექსტები, ფასი, ზომები და ფორმები */}
          <div className="space-y-5 sm:space-y-6">
            <div>
              {/* Category, SKU & Actions Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="inline-flex items-center gap-2 min-w-0">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25 font-semibold uppercase tracking-wider text-[11px] truncate">
                    {selectedProduct.category}
                  </span>
                  <span className="font-mono text-stone-400 text-xs shrink-0">
                    #{selectedProduct.sku}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      shareProductLink(selectedProduct, lang, () => {
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      })
                    }
                    className={`h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                      copiedLink
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-stone-500/10 border-stone-500/20 text-stone-300 hover:text-amber-400 hover:border-amber-500/40 hover:bg-stone-500/20'
                    }`}
                    title={lang === 'ka' ? 'ბმულის გაზიარება' : 'Share link'}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] font-semibold">{lang === 'ka' ? 'დაკოპირდა!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[11px]">{lang === 'ka' ? 'გაზიარება' : 'Share'}</span>
                      </>
                    )}
                  </button>

                  {/* Compare Button */}
                  <button
                    type="button"
                    onClick={() => toggleCompare(selectedProduct.id)}
                    className={`h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                      compareList?.includes(selectedProduct.id)
                        ? 'bg-amber-500 text-black border-amber-500 font-semibold shadow-md shadow-amber-500/20'
                        : 'bg-stone-500/10 border-stone-500/20 text-stone-300 hover:text-amber-400 hover:border-amber-500/40 hover:bg-stone-500/20'
                    }`}
                    title={lang === 'ka' ? 'შედარების სიაში დამატება' : 'Compare'}
                  >
                    <ArrowLeftRight className={`w-3.5 h-3.5 ${compareList?.includes(selectedProduct.id) ? 'text-black' : 'text-amber-500'}`} />
                    <span className="text-[11px]">
                      {compareList?.includes(selectedProduct.id)
                        ? (lang === 'ka' ? 'შედარებაშია ✓' : 'In Compare ✓')
                        : (lang === 'ka' ? 'შედარება' : 'Compare')}
                    </span>
                  </button>
                </div>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl mt-3 font-normal leading-tight">
                {lang === 'ka' ? selectedProduct.name : (selectedProduct.nameEn || selectedProduct.name)}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-serif text-2xl sm:text-3xl text-amber-500 font-semibold">
                    {formatPrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.oldPrice && (
                    <span className="font-serif text-lg line-through opacity-40">
                      {formatPrice(selectedProduct.oldPrice)}
                    </span>
                  )}
                </div>

                {(() => {
                  const discountPct = calculateDiscountPercent(selectedProduct.price, selectedProduct.oldPrice);
                  if (!discountPct) return null;
                  return (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-red-600 text-white shadow-sm flex items-center gap-1">
                      <span>{lang === 'ka' ? 'ფასდაკლება' : 'Sale'}</span>
                      <span className="font-mono font-bold bg-black/25 px-1 rounded">-{discountPct}%</span>
                    </span>
                  );
                })()}

                <div className="sm:ml-auto">
                  <StockStatusBadge
                    status={selectedProduct.stockStatus || 'in_stock'}
                    lang={lang}
                    showSubtext={true}
                  />
                </div>
              </div>
            </div>

            {selectedProduct.description && (
              <p className="text-sm sm:text-base opacity-80 leading-relaxed">
                {pick(selectedProduct, 'description', lang)}
              </p>
            )}

            {/* Specifications Cards */}
            <ProductSpecsTable product={selectedProduct} darkMode={darkMode} lang={lang} />

            {/* Actions: Size Selector, WhatsApp/Messenger, Consultation Callback Form */}
            <ProductActionButtons
              product={selectedProduct}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              onOpenRingSizer={() => setShowRingSizer(true)}
              darkMode={darkMode}
              lang={lang}
              siteSettings={siteSettings}
              inquiries={inquiries}
              setInquiries={setInquiries}
              syncData={syncData}
              products={products}
            />
          </div>

        </div>
      </div>

      <RingSizerModal
        isOpen={showRingSizer}
        onClose={() => setShowRingSizer(false)}
        onSelectSize={(newSize) => {
          const match = selectedProduct?.sizes?.find(
            (s) => s === newSize || s.startsWith(newSize) || newSize.startsWith(s)
          );
          setSelectedSize(match || newSize);
        }}
        availableSizes={selectedProduct?.sizes || []}
        productName={lang === 'ka' ? selectedProduct?.name : (selectedProduct?.nameEn || selectedProduct?.name)}
      />
    </div>
  );
}

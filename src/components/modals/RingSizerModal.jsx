import React, { useState, useId } from 'react';
import { X, Ruler, Check, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import RingSizerTool from '../store/RingSizerTool';

export default function RingSizerModal({
  isOpen,
  onClose,
  onSelectSize,
  availableSizes = [],
  productName = 'ბეჭედი'
}) {
  const { darkMode, lang, siteSettings } = useStore();
  const [currentMatchedSize, setCurrentMatchedSize] = useState('16.5');
  const [currentDiameter, setCurrentDiameter] = useState(16.5);
  const titleId = useId();

  if (!isOpen) return null;

  const cleanPhone = (siteSettings?.whatsapp || '995555000000').replace(/[^0-9]/g, '');
  const waMessage =
    lang === 'ka'
      ? `გამარჯობა! მაინტერესებს კონსულტაცია ბეჭდის (${productName}) ზომის შერჩევაზე. ჩემი გაზომილი ზომაა დაახლოებით: ${currentMatchedSize} (შიდა დიამეტრი ~${currentDiameter.toFixed(1)} მმ).`
      : `Hello! I need assistance choosing the right ring size for ${productName}. My measured size is approx: ${currentMatchedSize} (diameter ~${currentDiameter.toFixed(1)} mm).`;
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

  const handleApplySize = () => {
    if (onSelectSize) {
      onSelectSize(currentMatchedSize);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all ${
          darkMode ? 'bg-[#121110] border-amber-500/20 text-[#f5f0e6]' : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-stone-500/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h3 id={titleId} className="font-serif text-lg sm:text-xl font-medium tracking-wide">
                {lang === 'ka' ? 'ბეჭდის ზომის საზომი' : 'Ring Size Guide'}
              </h3>
              <p className="text-[11px] opacity-60">
                {lang === 'ka' ? 'გაიგეთ თქვენი ზუსტი ზომა ონლაინ' : 'Measure your size directly on screen'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'ka' ? 'დახურვა' : 'Close'}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-500/10 transition-colors opacity-70 hover:opacity-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Interactive Ring Sizer Tool */}
        <div className="p-5">
          <RingSizerTool
            onSizeChange={(size, d) => {
              setCurrentMatchedSize(size);
              setCurrentDiameter(d);
            }}
            showNotice={true}
            darkMode={darkMode}
            lang={lang}
          />
        </div>

        {/* Footer Actions */}
        <div className="p-5 pt-2 border-t border-stone-500/15 flex flex-col sm:flex-row items-center gap-2.5">
          {onSelectSize && (
            <button
              type="button"
              onClick={handleApplySize}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Check className="w-4 h-4" />
              <span>
                {lang === 'ka'
                  ? `ამ ზომის არჩევა (${currentMatchedSize})`
                  : `Select Size (${currentMatchedSize})`}
              </span>
            </button>
          )}

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-stone-500/25 hover:border-amber-500/50 hover:bg-stone-500/10 text-xs font-medium transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>{lang === 'ka' ? 'WhatsApp კონსულტაცია' : 'WhatsApp Help'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

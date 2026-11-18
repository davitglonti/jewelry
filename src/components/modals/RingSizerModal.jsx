import React, { useState, useId } from 'react';
import { X, Ruler, Check, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import RingSizerTool from '../store/RingSizerTool';

export default function RingSizerModal({
  isOpen,
  onClose,
  onSelectSize,
  productName = 'ბეჭედი'
}) {
  const { lang, siteSettings } = useStore();
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
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#EAE4DB] text-[#1F1C18] shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EAE4DB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF8F4] border border-[#EAE4DB] flex items-center justify-center text-[#9A7742]">
              <Ruler className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h3 id={titleId} className="font-serif text-xl font-medium text-[#1F1C18]">
                {lang === 'ka' ? 'ბეჭდის ზომის საზომი' : 'Ring Size Guide'}
              </h3>
              <p className="text-xs text-[#787168]">
                {lang === 'ka' ? 'გაიგეთ თქვენი ზუსტი ზომა ონლაინ' : 'Measure your size directly on screen'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'ka' ? 'დახურვა' : 'Close'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#787168] hover:text-[#1F1C18] hover:bg-[#FAF8F4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        <div className="p-6">
          <RingSizerTool
            onSizeChange={(size, d) => {
              setCurrentMatchedSize(size);
              setCurrentDiameter(d);
            }}
            showNotice={true}
            lang={lang}
          />
        </div>

        <div className="p-6 pt-4 border-t border-[#EAE4DB] flex flex-col sm:flex-row items-center gap-2.5 bg-[#FAF8F4]">
          {onSelectSize && (
            <button
              type="button"
              onClick={handleApplySize}
              className="w-full sm:flex-1 py-3 px-5 rounded-full bg-[#1F1C18] hover:bg-[#35302A] text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[1.75]" />
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
            className="w-full sm:w-auto py-3 px-5 rounded-full bg-white border border-[#D9D1C5] text-[#1F1C18] hover:border-[#1F1C18] text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-[#9A7742] stroke-[1.75]" />
            <span>{lang === 'ka' ? 'WhatsApp კონსულტაცია' : 'WhatsApp Help'}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

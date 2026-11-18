import React from 'react';

export default function ProductSpecsTable({ product, lang = 'ka' }) {
  if (!product) return null;

  const formatWeight = (rawWeight) => {
    if (!rawWeight) return null;
    const str = String(rawWeight).trim();
    if (!str) return null;
    const cleaned = str.replace(/\s*(გრ|g|gr)\.?$/gi, '').trim();
    const unit = lang === 'ka' ? 'გრ' : 'g';
    return cleaned ? `${cleaned} ${unit}` : str;
  };

  const specs = [
    { label: lang === 'ka' ? 'მეტალი' : 'Metal', value: product.metal },
    { label: lang === 'ka' ? 'სინჯი' : 'Karat', value: product.karat },
    { label: lang === 'ka' ? 'წონა' : 'Weight', value: formatWeight(product.weight) },
    { label: lang === 'ka' ? 'ქვები' : 'Gemstones', value: product.stones }
  ].filter((s) => s.value && String(s.value).trim());

  if (specs.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {specs.map((item, i) => (
        <div
          key={i}
          className="px-4 py-3 rounded-xl bg-[#FAF8F4] border border-[#EAE4DB] flex flex-col justify-between"
        >
          <span className="block text-[11px] font-medium text-[#9A7742] mb-0.5">
            {item.label}
          </span>
          <span
            className="font-medium text-xs sm:text-sm text-[#1F1C18] leading-snug"
            title={String(item.value)}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

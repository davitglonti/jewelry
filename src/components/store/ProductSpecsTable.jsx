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
    <div className="space-y-2.5 pt-1">
      <h3 className="font-serif text-lg font-normal text-[#1F1C18]">
        {lang === 'ka' ? 'მახასიათებლები' : 'Specifications'}
      </h3>

      <div className="bg-[#F4F1EA] rounded-2xl p-4 px-6 flex flex-wrap items-center justify-between gap-4 text-xs">
        {specs.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-[#787168] font-normal">{item.label}</span>
            <span className="font-medium text-[#1F1C18]" title={String(item.value)}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

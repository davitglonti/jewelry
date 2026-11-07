import React from 'react';

export default function ProductSpecsTable({ product, darkMode = true, lang = 'ka' }) {
  if (!product) return null;

  const formatWeight = (rawWeight) => {
    if (!rawWeight) return null;
    const str = String(rawWeight).trim();
    if (!str) return null;
    // Strip trailing weight units if already present in the data to avoid "გრ გრ"
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
    <div
      className={`grid ${
        specs.length > 2 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'
      } gap-2.5 p-3.5 sm:p-4 rounded-2xl border transition-all ${
        darkMode ? 'bg-stone-900/40 border-stone-800' : 'bg-white border-stone-200/80 shadow-xs'
      }`}
    >
      {specs.map((item, i) => (
        <div
          key={i}
          className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
            darkMode
              ? 'bg-stone-800/40 border-stone-700/50 hover:border-amber-500/30'
              : 'bg-stone-50 border-stone-200/80 hover:border-amber-500/40'
          }`}
        >
          <span
            className={`block text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold mb-1 ${
              darkMode ? 'text-amber-400/90' : 'text-amber-600/90'
            }`}
          >
            {item.label}
          </span>
          <span
            className={`font-medium text-xs sm:text-sm leading-snug break-words ${
              darkMode ? 'text-stone-100' : 'text-stone-900'
            }`}
            title={String(item.value)}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

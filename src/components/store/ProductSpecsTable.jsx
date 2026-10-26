import React from 'react';

export default function ProductSpecsTable({ product, darkMode = true, lang = 'ka' }) {
  if (!product) return null;

  const specs = [
    { label: lang === 'ka' ? 'მეტალი' : 'Metal', value: product.metal },
    { label: lang === 'ka' ? 'სინჯი' : 'Karat', value: product.karat },
    {
      label: lang === 'ka' ? 'წონა' : 'Weight',
      value: product.weight ? `${product.weight} ${lang === 'ka' ? 'გრ' : 'g'}` : null
    },
    { label: lang === 'ka' ? 'ქვები' : 'Gemstones', value: product.stones }
  ].filter((s) => s.value && String(s.value).trim());

  if (specs.length === 0) return null;

  return (
    <div
      className={`grid ${specs.length > 2 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'} gap-2.5 p-3 sm:p-4 rounded-2xl border ${
        darkMode ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-200/80 shadow-xs'
      }`}
    >
      {specs.map((item, i) => (
        <div
          key={i}
          className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
            darkMode ? 'bg-stone-800/60 border-stone-700/60' : 'bg-stone-50 border-stone-200/80'
          }`}
        >
          <span
            className={`block text-[10px] sm:text-[11px] uppercase tracking-wider font-medium mb-0.5 ${
              darkMode ? 'text-amber-400/90' : 'text-amber-600/90'
            }`}
          >
            {item.label}
          </span>
          <span
            className={`font-semibold text-xs sm:text-sm block truncate ${
              darkMode ? 'text-stone-100' : 'text-stone-900'
            }`}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// src/data/avatarPresets.js

/**
 * ექსკლუზიური საიუველირო ავატარების ნაკრები მომხმარებლებისთვის.
 * ყველა ავატარი არის მსუბუქი, ელეგანტური ოქროსფერი SVG Data URI,
 * რომელიც მყისიერად იტვირთება და უნაკლოდ ჩანს ნებისმიერ ეკრანზე.
 */

const createSvgDataUrl = (svgInner) => {
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F5D061" />
        <stop offset="50%" stop-color="#E5A638" />
        <stop offset="100%" stop-color="#B37D14" />
      </linearGradient>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1A1815" />
        <stop offset="100%" stop-color="#0D0C0A" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="2.5" />
    ${svgInner}
  </svg>`.replace(/\s+/g, ' ').trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`;
};

export const AVATAR_PRESETS = [
  {
    id: 'ring',
    nameKa: 'ბრილიანტის ბეჭედი',
    nameEn: 'Diamond Ring',
    emoji: '💍',
    url: createSvgDataUrl(`
      <!-- Ring Band -->
      <circle cx="50" cy="58" r="22" fill="none" stroke="url(#goldGrad)" stroke-width="5" />
      <!-- Diamond Setting -->
      <polygon points="50,22 62,35 38,35" fill="url(#goldGrad)" opacity="0.9" />
      <polygon points="38,35 50,22 50,45" fill="#FFEAA7" opacity="0.7" />
      <polygon points="50,22 62,35 50,45" fill="#F5D061" />
      <polygon points="38,35 50,45 62,35" fill="#D49A24" />
      <!-- Sparkle -->
      <circle cx="34" cy="24" r="2" fill="#FFF" />
      <path d="M34,20 L34,28 M30,24 L38,24" stroke="#FFF" stroke-width="1" />
    `)
  },
  {
    id: 'flower',
    nameKa: 'ლოტოსის ყვავილი',
    nameEn: 'Lotus Flower',
    emoji: '🌸',
    url: createSvgDataUrl(`
      <!-- Lotus Petals -->
      <path d="M50,22 C44,36 44,54 50,66 C56,54 56,36 50,22 Z" fill="url(#goldGrad)" />
      <path d="M50,34 C34,40 28,54 36,66 C42,62 46,54 50,46 Z" fill="url(#goldGrad)" opacity="0.85" />
      <path d="M50,34 C66,40 72,54 64,66 C58,62 54,54 50,46 Z" fill="url(#goldGrad)" opacity="0.85" />
      <path d="M50,46 C30,50 22,66 30,74 C38,72 44,66 50,58 Z" fill="url(#goldGrad)" opacity="0.65" />
      <path d="M50,46 C70,50 78,66 70,74 C62,72 56,66 50,58 Z" fill="url(#goldGrad)" opacity="0.65" />
      <circle cx="50" cy="58" r="4" fill="#FFEAA7" />
    `)
  },
  {
    id: 'crown',
    nameKa: 'სამეფო გვირგვინი',
    nameEn: 'Royal Crown',
    emoji: '👑',
    url: createSvgDataUrl(`
      <!-- Crown Base -->
      <path d="M26,68 L74,68 L72,74 L28,74 Z" fill="url(#goldGrad)" />
      <circle cx="34" cy="71" r="1.5" fill="#1A1815" />
      <circle cx="50" cy="71" r="1.5" fill="#1A1815" />
      <circle cx="66" cy="71" r="1.5" fill="#1A1815" />
      <!-- Crown Spikes -->
      <polygon points="26,65 30,42 40,56 50,32 60,56 70,42 74,65" fill="url(#goldGrad)" />
      <!-- Jewels on tips -->
      <circle cx="30" cy="40" r="3" fill="#FFEAA7" />
      <circle cx="50" cy="30" r="4" fill="#FFEAA7" />
      <circle cx="70" cy="40" r="3" fill="#FFEAA7" />
      <!-- Center Gem -->
      <polygon points="50,50 54,56 50,62 46,56" fill="#FFF" />
    `)
  },
  {
    id: 'diamond',
    nameKa: 'ბრილიანტი',
    nameEn: 'Brilliant Diamond',
    emoji: '💎',
    url: createSvgDataUrl(`
      <!-- Faceted Gem -->
      <polygon points="32,36 68,36 82,50 50,78 18,50" fill="url(#goldGrad)" />
      <polygon points="32,36 68,36 60,50 40,50" fill="#FFEAA7" opacity="0.9" />
      <polygon points="32,36 40,50 18,50" fill="#F5D061" opacity="0.7" />
      <polygon points="68,36 82,50 60,50" fill="#D49A24" opacity="0.7" />
      <polygon points="40,50 60,50 50,78" fill="#FFF" opacity="0.85" />
      <polygon points="18,50 40,50 50,78" fill="#B37D14" opacity="0.8" />
      <polygon points="60,50 82,50 50,78" fill="#E5A638" opacity="0.8" />
      <!-- Shine -->
      <circle cx="72" cy="30" r="2.5" fill="#FFF" />
      <path d="M72,24 L72,36 M66,30 L78,30" stroke="#FFF" stroke-width="1.2" />
    `)
  },
  {
    id: 'necklace',
    nameKa: 'მარგალიტის ყელსაბამი',
    nameEn: 'Pearl Necklace',
    emoji: '📿',
    url: createSvgDataUrl(`
      <!-- Chain/Pearls -->
      <path d="M26,34 Q50,72 74,34" fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-dasharray="1 4" stroke-linecap="round" />
      <!-- Pearl beads -->
      <circle cx="28" cy="38" r="3" fill="#FFEAA7" />
      <circle cx="34" cy="46" r="3.2" fill="#FFEAA7" />
      <circle cx="42" cy="52" r="3.4" fill="#FFEAA7" />
      <circle cx="58" cy="52" r="3.4" fill="#FFEAA7" />
      <circle cx="66" cy="46" r="3.2" fill="#FFEAA7" />
      <circle cx="72" cy="38" r="3" fill="#FFEAA7" />
      <!-- Center Pendant Pearl Drop -->
      <circle cx="50" cy="56" r="5" fill="#FFF" stroke="url(#goldGrad)" stroke-width="1" />
      <path d="M50,61 C48,66 48,72 50,74 C52,72 52,66 50,61 Z" fill="url(#goldGrad)" />
      <circle cx="50" cy="74" r="2" fill="#FFEAA7" />
    `)
  },
  {
    id: 'butterfly',
    nameKa: 'ოქროს პეპელა',
    nameEn: 'Golden Butterfly',
    emoji: '🦋',
    url: createSvgDataUrl(`
      <!-- Butterfly Wings -->
      <path d="M50,52 C46,32 26,24 24,42 C22,54 42,58 50,54 Z" fill="url(#goldGrad)" />
      <path d="M50,52 C54,32 74,24 76,42 C78,54 58,58 50,54 Z" fill="url(#goldGrad)" />
      <path d="M50,56 C44,60 30,64 34,74 C38,80 48,68 50,60 Z" fill="url(#goldGrad)" opacity="0.8" />
      <path d="M50,56 C56,60 70,64 66,74 C62,80 52,68 50,60 Z" fill="url(#goldGrad)" opacity="0.8" />
      <!-- Body and Antennae -->
      <ellipse cx="50" cy="56" rx="2" ry="12" fill="#FFEAA7" />
      <path d="M49,45 Q44,36 38,36" fill="none" stroke="#FFEAA7" stroke-width="1.2" stroke-linecap="round" />
      <path d="M51,45 Q56,36 62,36" fill="none" stroke="#FFEAA7" stroke-width="1.2" stroke-linecap="round" />
    `)
  },
  {
    id: 'moon',
    nameKa: 'მთვარე და ვარსკვლავი',
    nameEn: 'Crescent & Star',
    emoji: '🌙',
    url: createSvgDataUrl(`
      <!-- Crescent Moon -->
      <path d="M54,24 C38,24 26,36 26,52 C26,68 38,80 54,80 C44,74 38,64 38,52 C38,40 44,30 54,24 Z" fill="url(#goldGrad)" />
      <!-- Large Star -->
      <polygon points="64,36 66,42 72,42 67,46 69,52 64,48 59,52 61,46 56,42 62,42" fill="#FFEAA7" />
      <!-- Small Sparkle Star -->
      <circle cx="70" cy="62" r="2" fill="#FFF" />
      <path d="M70,57 L70,67 M65,62 L75,62" stroke="#FFF" stroke-width="1" />
    `)
  },
  {
    id: 'dove',
    nameKa: 'ოქროს მტრედი',
    nameEn: 'Golden Dove',
    emoji: '🕊️',
    url: createSvgDataUrl(`
      <!-- Dove Body & Wing -->
      <path d="M68,36 C64,34 58,34 54,38 L42,48 C34,44 26,48 24,56 C32,56 40,54 44,56 L34,74 C44,70 50,64 54,58 L64,54 C72,50 76,42 68,36 Z" fill="url(#goldGrad)" />
      <path d="M50,44 C44,30 32,24 24,26 C30,36 38,44 48,46 Z" fill="url(#goldGrad)" opacity="0.85" />
      <!-- Eye -->
      <circle cx="68" cy="40" r="1.5" fill="#1A1815" />
      <!-- Olive Leaf -->
      <path d="M72,42 Q78,40 82,44 Q76,46 72,42 Z" fill="#FFEAA7" />
    `)
  }
];

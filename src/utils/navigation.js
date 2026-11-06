// src/utils/navigation.js

// მეორადი გვერდების prefetch რუკა — ლინკზე მაუსის მიტანისას (hover) ფონურად იტვირთება
const routePreloaders = {
  '/about': () => import('../pages/AboutPage'),
  '/blog': () => import('../pages/BlogPage'),
  '/size-guide': () => import('../pages/SizeGuidePage'),
  '/sizes': () => import('../pages/SizeGuidePage'),
  '/ring-size': () => import('../pages/SizeGuidePage'),
  '/login': () => import('../pages/LoginPage'),
  '/register': () => import('../pages/RegisterPage'),
  '/profile': () => import('../pages/ProfilePage'),
  '/forgot-password': () => import('../pages/LoginPage'),
  '/reset-password': () => import('../pages/LoginPage'),
  '/checkout': () => import('../pages/CheckoutPage'),
  '/buy': () => import('../pages/CheckoutPage'),
};

/**
 * აბრუნებს მიმდინარე ენას URL-ის მიხედვით ('en' ან 'ka')
 */
export function getCurrentLang() {
  if (typeof window === 'undefined') return 'ka';
  const path = window.location.pathname;
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'ka';
}

/**
 * გარდაქმნის ნებისმიერ შიდა path-ს სასურველი ენის მიხედვით:
 * მაგ: ('/catalog', 'en') -> '/en/catalog'
 *     ('/en/catalog', 'ka') -> '/catalog'
 *     ('/', 'en') -> '/en'
 *     ('/en', 'ka') -> '/'
 */
export function localizePath(path, targetLang = 'ka') {
  if (!path) return targetLang === 'en' ? '/en' : '/';

  // მოვაცილოთ არსებული /en პრეფიქსი
  let clean = path;
  if (clean === '/en') clean = '/';
  else if (clean.startsWith('/en/')) clean = clean.substring(3);

  if (!clean.startsWith('/')) clean = '/' + clean;

  if (targetLang === 'en') {
    return clean === '/' ? '/en' : `/en${clean}`;
  }
  return clean;
}

/**
 * ყოფს URL path-ს ენად და მარშრუტად:
 * მაგ: '/en/catalog' -> { lang: 'en', route: '/catalog' }
 *     '/catalog' -> { lang: 'ka', route: '/catalog' }
 *     '/en' -> { lang: 'en', route: '/' }
 */
export function parsePath(pathname) {
  const clean = pathname ? pathname.replace(/\/+$/, '') || '/' : '/';
  if (clean === '/en' || clean.startsWith('/en/')) {
    const route = clean.substring(3) || '/';
    return { lang: 'en', route };
  }
  return { lang: 'ka', route: clean };
}

/**
 * ენის გადართვა URL-ის ავტომატური სინქრონიზაციით:
 * გადაჰყავს მომხმარებელი იდენტურ გვერდზე მეორე ენის URL-ით.
 */
export function switchLanguage(targetLang) {
  if (typeof window === 'undefined') return;
  const currentPath = window.location.pathname;
  const search = window.location.search || '';
  const hash = window.location.hash || '';
  const targetUrl = localizePath(currentPath, targetLang) + search + hash;
  navigateTo(targetUrl);
}

export function prefetchRoute(pathname) {
  if (!pathname) return;
  let clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/en') clean = '/';
  else if (clean.startsWith('/en/')) clean = clean.substring(3);
  if (!clean.startsWith('/')) clean = '/' + clean;

  if (routePreloaders[clean]) {
    try {
      routePreloaders[clean]();
    } catch {}
  } else if (clean.startsWith('/blog/')) {
    try {
      import('../pages/BlogPostPage');
    } catch {}
  }
}

/**
 * SPA (Single Page Application) კლიენტური ნავიგაცია.
 * ცვლის URL-ს და გვერდის კონტენტს მომენტალურად, ბრაუზერის თავიდან გადატვირთვის გარეშე.
 */
export function navigateTo(url) {
  if (typeof window === 'undefined' || !url) return;

  // გარე ბმულების შემთხვევაში ჩვეულებრივი გადამისამართება
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.location.href = url;
    return;
  }

  // ჰეშ-ბმულები მიმდინარე გვერდზე (მაგ: #contact, #craftsmanship)
  if (url.startsWith('#')) {
    const el = document.querySelector(url);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }

  // მთავარი გვერდის ჰეშ-ბმულები (მაგ: /#contact, /en/#contact)
  const isEnHome = window.location.pathname === '/en' || window.location.pathname === '/en/';
  const isKaHome = window.location.pathname === '/' || window.location.pathname === '';
  if ((url.startsWith('/#') && isKaHome) || (url.startsWith('/en/#') && isEnHome)) {
    const hash = '#' + url.split('#')[1];
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }

  const [pathOnly] = url.split(/(?=[?#])/);
  const isSamePath = pathOnly === window.location.pathname;

  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));

  if (url.includes('#')) {
    const hash = '#' + url.split('#')[1];
    setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  } else if (!isSamePath) {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

/**
 * გლობალური ლინკების დამჭერი (SPA Link Interceptor & Prefetcher).
 * საიტის ნებისმიერ <a href="..."> ბმულს აქცევს მყისიერ SPA გადასვლად
 * და მაუსის მიტანისას (hover) წინასწარ ტვირთავს გვერდის კოდს (Prefetch).
 */
export function initSpaNavigation() {
  if (typeof window === 'undefined') return () => {};

  const handleClick = (e) => {
    // იგნორირება თუ დაჭერილია Ctrl, Cmd, Shift, Alt ან შუა ღილაკი (ახალ ტაბში გასახსნელად)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
      return;
    }

    const anchor = e.target.closest('a');
    if (!anchor) return;

    // იგნორირება თუ აქვს target="_blank", download ატრიბუტი ან data-native
    if (anchor.target === '_blank' || anchor.hasAttribute('download') || anchor.dataset.native) {
      return;
    }

    const href = anchor.getAttribute('href');
    if (!href) return;

    // იგნორირება გარე ბმულებზე, მეილზე ან ტელეფონზე
    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:')
    ) {
      return;
    }

    // ჰეშ-ბმული იმავე გვერდზე
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const isEnHome = window.location.pathname === '/en' || window.location.pathname === '/en/';
    const isKaHome = window.location.pathname === '/' || window.location.pathname === '';
    if ((href.startsWith('/#') && isKaHome) || (href.startsWith('/en/#') && isEnHome)) {
      e.preventDefault();
      const hash = '#' + href.split('#')[1];
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // ვაჩერებთ ბრაუზერის სრულ გადატვირთვას და გადავდივართ მყისიერად SPA რეჟიმში
    e.preventDefault();
    navigateTo(href);
  };

  // მაუსის მიტანისას (hover) ან თითის შეხებისას (mobile touch) წინასწარ ვტვირთავთ გვერდს
  const handlePointerOver = (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href && (href.startsWith('/') || href.startsWith('/en'))) {
      prefetchRoute(href.split('?')[0]);
    }
  };

  document.addEventListener('click', handleClick);
  document.addEventListener('mouseover', handlePointerOver, { passive: true });
  document.addEventListener('touchstart', handlePointerOver, { passive: true });

  return () => {
    document.removeEventListener('click', handleClick);
    document.removeEventListener('mouseover', handlePointerOver);
    document.removeEventListener('touchstart', handlePointerOver);
  };
}

import { describe, it, expect, beforeEach } from 'vitest';
import { getCurrentLang, localizePath, parsePath } from '../../src/utils/navigation';

describe('Navigation & i18n URL Routing', () => {
  describe('parsePath', () => {
    it('correctly parses Georgian root path', () => {
      expect(parsePath('/')).toEqual({ lang: 'ka', route: '/' });
      expect(parsePath('')).toEqual({ lang: 'ka', route: '/' });
    });

    it('correctly parses Georgian secondary routes', () => {
      expect(parsePath('/catalog')).toEqual({ lang: 'ka', route: '/catalog' });
      expect(parsePath('/about')).toEqual({ lang: 'ka', route: '/about' });
      expect(parsePath('/product/AUR-101')).toEqual({ lang: 'ka', route: '/product/AUR-101' });
      expect(parsePath('/blog/my-first-post')).toEqual({ lang: 'ka', route: '/blog/my-first-post' });
      expect(parsePath('/profile')).toEqual({ lang: 'ka', route: '/profile' });
    });

    it('correctly parses English root path', () => {
      expect(parsePath('/en')).toEqual({ lang: 'en', route: '/' });
      expect(parsePath('/en/')).toEqual({ lang: 'en', route: '/' });
    });

    it('correctly parses English secondary routes', () => {
      expect(parsePath('/en/catalog')).toEqual({ lang: 'en', route: '/catalog' });
      expect(parsePath('/en/about')).toEqual({ lang: 'en', route: '/about' });
      expect(parsePath('/en/product/AUR-101')).toEqual({ lang: 'en', route: '/product/AUR-101' });
      expect(parsePath('/en/blog/my-first-post')).toEqual({ lang: 'en', route: '/blog/my-first-post' });
      expect(parsePath('/en/profile')).toEqual({ lang: 'en', route: '/profile' });
    });
  });

  describe('localizePath', () => {
    it('converts Georgian routes to English routes', () => {
      expect(localizePath('/', 'en')).toBe('/en');
      expect(localizePath('', 'en')).toBe('/en');
      expect(localizePath('/catalog', 'en')).toBe('/en/catalog');
      expect(localizePath('/about', 'en')).toBe('/en/about');
      expect(localizePath('/profile', 'en')).toBe('/en/profile');
      expect(localizePath('/product/AUR-101', 'en')).toBe('/en/product/AUR-101');
    });

    it('converts English routes to Georgian routes', () => {
      expect(localizePath('/en', 'ka')).toBe('/');
      expect(localizePath('/en/', 'ka')).toBe('/');
      expect(localizePath('/en/catalog', 'ka')).toBe('/catalog');
      expect(localizePath('/en/about', 'ka')).toBe('/about');
      expect(localizePath('/en/profile', 'ka')).toBe('/profile');
      expect(localizePath('/en/product/AUR-101', 'ka')).toBe('/product/AUR-101');
    });

    it('is idempotent when target language already matches', () => {
      expect(localizePath('/en/catalog', 'en')).toBe('/en/catalog');
      expect(localizePath('/catalog', 'ka')).toBe('/catalog');
      expect(localizePath('/en', 'en')).toBe('/en');
      expect(localizePath('/', 'ka')).toBe('/');
    });
  });

  describe('getCurrentLang', () => {
    it('returns en when window.location.pathname starts with /en', () => {
      window.history.pushState({}, '', '/en/catalog');
      expect(getCurrentLang()).toBe('en');

      window.history.pushState({}, '', '/en');
      expect(getCurrentLang()).toBe('en');
    });

    it('returns ka when window.location.pathname is standard root or page', () => {
      window.history.pushState({}, '', '/catalog');
      expect(getCurrentLang()).toBe('ka');

      window.history.pushState({}, '', '/');
      expect(getCurrentLang()).toBe('ka');

      window.history.pushState({}, '', '/product/AUR-101');
      expect(getCurrentLang()).toBe('ka');
    });
  });
});

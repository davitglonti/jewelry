import { describe, it, expect } from 'vitest';
import { getWhatsAppLink } from '../../src/utils/shareUtils';

describe('shareUtils', () => {
  const dummyProduct = {
    id: 'prod-101',
    sku: 'AUR-101',
    name: 'მარადიული ბრილიანტის ბეჭედი',
    nameEn: 'Eternal Diamond Ring',
    price: '4,500 ₾',
    oldPrice: '5,000 ₾'
  };

  const dummySettings = {
    whatsapp: '+995 555 12 34 56'
  };

  it('generates correct Georgian WhatsApp link with clean phone and product info', () => {
    const url = getWhatsAppLink(dummyProduct, dummySettings, 'ka', '17.5');
    expect(url).toContain('https://wa.me/995555123456');
    expect(url).toContain(encodeURIComponent('AUR-101'));
    expect(url).toContain(encodeURIComponent('17.5'));
    expect(url).toContain(encodeURIComponent('4,500 ₾'));
  });

  it('generates correct English WhatsApp link when lang is en', () => {
    const url = getWhatsAppLink(dummyProduct, dummySettings, 'en', '16.0');
    expect(url).toContain('https://wa.me/995555123456');
    expect(url).toContain(encodeURIComponent('Eternal Diamond Ring'));
    expect(url).toContain(encodeURIComponent('SKU: AUR-101'));
    expect(url).toContain(encodeURIComponent('Size: 16.0'));
  });

  it('handles fallback phone when siteSettings.whatsapp is missing', () => {
    const url = getWhatsAppLink(dummyProduct, {}, 'ka');
    expect(url).toContain('https://wa.me/995555000000');
  });
});

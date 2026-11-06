import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutPage from '../../src/pages/CheckoutPage';
import { StoreContext } from '../../src/context/StoreContext';
import { AuthContext } from '../../src/context/AuthContext';

describe('CheckoutPage', () => {
  const dummyProducts = [
    {
      id: 'aur-101',
      name: 'ოქროს ბეჭედი ბრილიანტით',
      nameEn: 'Gold Diamond Ring',
      sku: 'AUR-101',
      price: 2500,
      sizes: ['16.0', '16.5', '17.0', '17.5'],
      images: ['/test.jpg']
    },
    {
      id: 'aur-102',
      name: 'მარგალიტის ყელსაბამი',
      nameEn: 'Pearl Necklace',
      sku: 'AUR-102',
      price: 1800,
      sizes: [],
      images: ['/test2.jpg']
    }
  ];

  const mockStore = {
    darkMode: true,
    setDarkMode: vi.fn(),
    lang: 'ka',
    setLang: vi.fn(),
    siteSettings: {
      brandName: 'MATARE',
      whatsapp: '+995599000000',
      deliveryPriceTbilisi: 6,
      deliveryPriceRegional: 10,
      giftPackagingPrice: 5
    },
    products: dummyProducts,
    favorites: ['aur-101'],
    inquiries: [],
    setInquiries: vi.fn(),
    syncData: vi.fn(),
    setShowFavoritesModal: vi.fn()
  };

  const mockAuth = {
    user: {
      displayName: 'დავით გლონტი',
      email: 'davdav@gmail.com'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    delete window.location;
    window.location = new URL('http://localhost:5173/checkout?productId=aur-101&size=16.5');
    localStorage.clear();
  });

  const renderWithProviders = (storeOverrides = {}, authOverrides = {}) => {
    return render(
      <AuthContext.Provider value={{ ...mockAuth, ...authOverrides }}>
        <StoreContext.Provider value={{ ...mockStore, ...storeOverrides }}>
          <CheckoutPage />
        </StoreContext.Provider>
      </AuthContext.Provider>
    );
  };

  it('renders checkout page with preselected product and chosen size from URL', () => {
    renderWithProviders();

    expect(screen.getByText(/შეკვეთის გაფორმება/i)).toBeInTheDocument();
    expect(screen.getByText('ოქროს ბეჭედი ბრილიანტით')).toBeInTheDocument();

    const sizeSelect = screen.getByTestId('item-size-select');
    expect(sizeSelect).toBeInTheDocument();
    expect(sizeSelect.value).toBe('16.5');
  });

  it('allows user to change the size for the item in order summary', () => {
    renderWithProviders();

    const sizeSelect = screen.getByTestId('item-size-select');
    expect(sizeSelect.value).toBe('16.5');

    fireEvent.change(sizeSelect, { target: { value: '17.5' } });
    expect(sizeSelect.value).toBe('17.5');
  });

  it('validates and applies VIP promo code VIP-AURELIA10 giving 10% discount', () => {
    renderWithProviders();

    const promoInput = screen.getByPlaceholderText(/VIP პრომო კოდი/i);
    const applyBtn = screen.getByRole('button', { name: /გააქტიურება/i });

    // Invalid code first
    fireEvent.change(promoInput, { target: { value: 'WRONG' } });
    fireEvent.click(applyBtn);
    expect(screen.getByText(/არასწორი პრომო კოდი/i)).toBeInTheDocument();

    // Valid promo
    fireEvent.change(promoInput, { target: { value: 'VIP-AURELIA10' } });
    fireEvent.click(applyBtn);

    expect(screen.getByText(/-10% VIP ფასდაკლება/i)).toBeInTheDocument();
  });

  it('validates phone and address for courier delivery and submits order successfully', async () => {
    const handleSetInquiries = vi.fn();
    const handleSyncData = vi.fn();

    renderWithProviders({
      setInquiries: handleSetInquiries,
      syncData: handleSyncData
    });

    // Verify showroom options are completely removed
    expect(screen.queryByText(/შოურუმში გატანა/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/შოურუმში გადახდა/i)).not.toBeInTheDocument();

    // Verify courier delivery rate in Tbilisi
    expect(screen.getByText(/თბილისის მასშტაბით/i)).toBeInTheDocument();

    const phoneInput = screen.getByPlaceholderText(/5XX XX XX XX/i);
    const addressInput = screen.getByPlaceholderText(/ჭავჭავაძის/i);

    fireEvent.change(phoneInput, { target: { value: '599 11 22 33' } });
    fireEvent.change(addressInput, { target: { value: 'ჭავჭავაძის გამზ. 15' } });

    // Gift packaging selection (+5 GEL)
    const giftCheckbox = screen.getByRole('checkbox');
    expect(screen.getByText(/სასაჩუქრე ექსკლუზიური შეფუთვა ბრენდირებული ყუთით \(\+5 ₾\)/i)).toBeInTheDocument();
    fireEvent.click(giftCheckbox);

    const submitBtn = screen.getByRole('button', { name: /შეკვეთის დადასტურება/i });
    const form = submitBtn.closest('form');
    fireEvent.submit(form);

    // Verify submission
    await waitFor(() => {
      expect(handleSetInquiries).toHaveBeenCalledTimes(1);
    });

    const orderData = handleSetInquiries.mock.calls[0][0][0];
    expect(orderData.clientName).toBe('დავით გლონტი');
    expect(orderData.clientPhone).toBe('599112233');
    expect(orderData.items[0].size).toBe('16.5');
    expect(orderData.shippingFee).toBe(6);
    expect(orderData.giftFee).toBe(5);
    expect(orderData.totalPrice).toBe(2500 + 6 + 5);

    // Shows order confirmation screen
    expect(screen.getByText(/მადლობას გიხდით არჩევანისთვის/i)).toBeInTheDocument();
    expect(screen.getByText(/#MTR-/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /WhatsApp-ით დაკავშირება/i })).toBeInTheDocument();
  });
});

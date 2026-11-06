// tests/pages/OrderTrackingPage.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderTrackingPage from '../../src/pages/OrderTrackingPage';
import { StoreContext } from '../../src/context/StoreContext';
import { AuthContext } from '../../src/context/AuthContext';
import { getOrderStepIndex, getDefaultEstimatedDelivery } from '../../src/components/order/OrderTrackingTimeline';

describe('OrderTrackingPage & Tracking System', () => {
  const dummyInquiries = [
    {
      id: 'MTR-123456',
      date: '06/11/2026, 12:00:00',
      clientName: 'დავით გლონტი',
      clientPhone: '599112233',
      clientEmail: 'datiglonti@gmail.com',
      deliveryMethod: 'კურიერით (თბილისი)',
      city: 'თბილისი',
      address: 'თბილისი, ჭავჭავაძის გამზ. 24',
      status: 'გზაშია',
      estimatedDelivery: 'დღეს 18:00-მდე',
      courierNote: 'კურიერი: ლევანი, 599 00 11 22',
      totalPrice: 2506,
      items: [
        { id: 'p1', name: 'ბრილიანტის ბეჭედი', price: 2500, size: '16.5' }
      ]
    },
    {
      id: 'MTR-654321',
      date: '05/11/2026, 10:00:00',
      clientName: 'გიორგი ბერიძე',
      clientPhone: '577998877',
      status: 'ახალი შეკვეთა',
      city: 'ბათუმი',
      address: 'ბათუმი, რუსთაველის 10',
      totalPrice: 1200,
      items: [
        { id: 'p2', name: 'ოქროს სამაჯური', price: 1200 }
      ]
    }
  ];

  const mockStore = {
    darkMode: true,
    setDarkMode: vi.fn(),
    lang: 'ka',
    setLang: vi.fn(),
    siteSettings: {
      brandName: 'MATARE',
      whatsapp: '+995599000000'
    },
    products: [],
    favorites: [],
    inquiries: dummyInquiries,
    setInquiries: vi.fn(),
    syncData: vi.fn(),
    setShowFavoritesModal: vi.fn()
  };

  const mockAuth = {
    user: null,
    userRole: 'guest'
  };

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={mockAuth}>
        <StoreContext.Provider value={mockStore}>
          <OrderTrackingPage />
        </StoreContext.Provider>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    delete window.location;
    window.location = new URL('http://localhost:5173/track');
    localStorage.clear();
  });

  it('renders order tracking search interface', () => {
    renderComponent();
    expect(screen.getByText(/შეკვეთის სტატუსის შემოწმება/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/MTR-XXXXXX/i)).toBeInTheDocument();
  });

  it('finds and displays live order details, stage, and ETA by order code', () => {
    renderComponent();

    const input = screen.getByPlaceholderText(/MTR-XXXXXX/i);
    const submitBtn = screen.getByRole('button', { name: /შემოწმება/i });

    fireEvent.change(input, { target: { value: 'MTR-123456' } });
    fireEvent.click(submitBtn);

    // Displays order ID
    expect(screen.getByText('#MTR-123456')).toBeInTheDocument();

    // Displays ETA and Courier information
    expect(screen.getByText(/დღეს 18:00-მდე/i)).toBeInTheDocument();
    expect(screen.getByText(/კურიერი: ლევანი/i)).toBeInTheDocument();

    // Displays Active Stage: Out for delivery (გზაშია კურიერთან)
    expect(screen.getAllByText(/გზაშია კურიერთან/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/ბრილიანტის ბეჭედი/i)).toBeInTheDocument();
  });

  it('finds order by phone number digits', () => {
    renderComponent();

    const input = screen.getByPlaceholderText(/MTR-XXXXXX/i);
    const submitBtn = screen.getByRole('button', { name: /შემოწმება/i });

    fireEvent.change(input, { target: { value: '599112233' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText('#MTR-123456')).toBeInTheDocument();
  });

  it('shows not found state when invalid order code entered', () => {
    renderComponent();

    const input = screen.getByPlaceholderText(/MTR-XXXXXX/i);
    const submitBtn = screen.getByRole('button', { name: /შემოწმება/i });

    fireEvent.change(input, { target: { value: 'MTR-999999' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/შეკვეთა ვერ მოიძებნა/i)).toBeInTheDocument();
  });

  it('correctly calculates step indices and default delivery estimates', () => {
    expect(getOrderStepIndex('ახალი შეკვეთა')).toBe(0);
    expect(getOrderStepIndex('მუშავდება')).toBe(1);
    expect(getOrderStepIndex('შეფუთულია')).toBe(2);
    expect(getOrderStepIndex('გზაშია')).toBe(3);
    expect(getOrderStepIndex('ჩაბარებულია')).toBe(4);
    expect(getOrderStepIndex('გაუქმებულია')).toBe(-1);

    const tbilisiOrder = { city: 'თბილისი' };
    expect(getDefaultEstimatedDelivery(tbilisiOrder, 'ka')).toContain('დღესვე 19:00-მდე');

    const regionalOrder = { city: 'ბათუმი' };
    expect(getDefaultEstimatedDelivery(regionalOrder, 'ka')).toBe('1-3 სამუშაო დღეში');
  });

  it('automatically opens and displays order when accessed via email tracking link (?id=MTR-123456)', () => {
    delete window.location;
    window.location = new URL('http://localhost:5173/track?id=MTR-123456');

    renderComponent();

    // Directly renders order from email link without needing manual search button click
    expect(screen.getByText('#MTR-123456')).toBeInTheDocument();
    expect(screen.getByText(/დღეს 18:00-მდე/i)).toBeInTheDocument();
    expect(screen.getByText(/ბრილიანტის ბეჭედი/i)).toBeInTheDocument();
  });
});

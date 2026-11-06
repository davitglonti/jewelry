// tests/components/QuickBuyModal.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickBuyModal from '../../src/components/modals/QuickBuyModal';
import { StoreContext } from '../../src/context/StoreContext';

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { displayName: 'გიორგი მაისურაძე', email: 'giorgi@example.com' }
  })
}));

const renderWithContext = (ui, contextOverrides = {}) => {
  const defaultContext = {
    darkMode: true,
    lang: 'ka',
    siteSettings: { whatsapp: '+995599000000' },
    inquiries: [],
    setInquiries: vi.fn(),
    syncData: vi.fn(),
    products: [],
    ...contextOverrides
  };

  return render(
    <StoreContext.Provider value={defaultContext}>
      {ui}
    </StoreContext.Provider>
  );
};

describe('QuickBuyModal component', () => {
  const sampleItems = [
    { id: 'ring-1', name: 'სიდნი', price: 1000, sku: 'AUR-001' }
  ];

  it('renders nothing when isOpen is false', () => {
    const { container } = renderWithContext(
      <QuickBuyModal isOpen={false} onClose={vi.fn()} items={sampleItems} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with product details and prefilled name when open', () => {
    renderWithContext(
      <QuickBuyModal isOpen={true} onClose={vi.fn()} items={sampleItems} />
    );

    expect(screen.getByText('შეკვეთის გაფორმება')).toBeInTheDocument();
    expect(screen.getByText('სიდნი')).toBeInTheDocument();
    expect(screen.getByDisplayValue('გიორგი მაისურაძე')).toBeInTheDocument();
  });

  it('validates phone number on form submit', () => {
    renderWithContext(
      <QuickBuyModal isOpen={true} onClose={vi.fn()} items={sampleItems} />
    );

    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form);

    expect(screen.getByText(/შეიყვანეთ სწორი ქართული მობილურის ნომერი/i)).toBeInTheDocument();
  });

  it('completes order successfully when valid details are provided', () => {
    const handleSuccess = vi.fn();
    renderWithContext(
      <QuickBuyModal isOpen={true} onClose={vi.fn()} items={sampleItems} onSuccess={handleSuccess} />
    );

    const phoneInput = screen.getByPlaceholderText('555 12 34 56');
    fireEvent.change(phoneInput, { target: { value: '599 11 22 33' } });

    const addressInput = screen.getByPlaceholderText(/თბილისი/i);
    fireEvent.change(addressInput, { target: { value: 'ჭავჭავაძის გამზ. 20' } });

    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form);

    expect(screen.getByText(/შეკვეთა მიღებულია!/i)).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp-ით დაკავშირება/i)).toBeInTheDocument();
    expect(handleSuccess).toHaveBeenCalled();
  });
});

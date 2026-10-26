import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductActionButtons from '../../src/components/store/ProductActionButtons';

describe('ProductActionButtons component', () => {
  const dummyProduct = {
    id: 'prod-42',
    name: 'მარადიული ბრილიანტის ბეჭედი',
    nameEn: 'Eternal Diamond Ring',
    sku: 'AUR-DIAMOND-01',
    price: '4,500 ₾',
    sizes: ['16.0', '16.5', '17.0', '17.5']
  };

  const dummySettings = {
    whatsapp: '+995599000000',
    messenger: 'https://m.me/matare'
  };

  it('renders nothing if product is missing', () => {
    const { container } = render(<ProductActionButtons product={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders sizes list and triggers setSelectedSize on click', () => {
    const handleSetSize = vi.fn();
    render(
      <ProductActionButtons
        product={dummyProduct}
        selectedSize="16.5"
        setSelectedSize={handleSetSize}
        lang="ka"
      />
    );

    expect(screen.getByText(/აირჩიეთ ზომა:/i)).toBeInTheDocument();
    expect(screen.getByText('(16.5)')).toBeInTheDocument();

    const size17Btn = screen.getByRole('button', { name: '17.0' });
    fireEvent.click(size17Btn);

    expect(handleSetSize).toHaveBeenCalledWith('17.0');
  });

  it('triggers onOpenRingSizer when ring sizer link is clicked', () => {
    const handleOpenSizer = vi.fn();
    render(
      <ProductActionButtons
        product={dummyProduct}
        onOpenRingSizer={handleOpenSizer}
        lang="ka"
      />
    );

    const sizerBtn = screen.getByRole('button', { name: /ზომის ონლაინ საზომი/i });
    fireEvent.click(sizerBtn);

    expect(handleOpenSizer).toHaveBeenCalledTimes(1);
  });

  it('renders WhatsApp link with product details and target blank', () => {
    render(
      <ProductActionButtons
        product={dummyProduct}
        siteSettings={dummySettings}
        selectedSize="17.0"
        lang="ka"
      />
    );

    const waLink = screen.getByRole('link', { name: /WhatsApp-ში მიწერა/i });
    expect(waLink).toBeInTheDocument();
    expect(waLink.getAttribute('href')).toContain('https://wa.me/995599000000');
    expect(waLink.getAttribute('href')).toContain('AUR-DIAMOND-01');
    expect(waLink.getAttribute('target')).toBe('_blank');
  });

  it('shows validation error when consultation form is submitted without a name', () => {
    render(
      <ProductActionButtons
        product={dummyProduct}
        siteSettings={dummySettings}
        lang="ka"
      />
    );

    const submitBtn = screen.getByRole('button', { name: /ზარის მოთხოვნა/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/გთხოვთ შეიყვანოთ თქვენი სახელი/i)).toBeInTheDocument();
  });

  it('shows validation error when invalid Georgian phone number is provided', () => {
    render(
      <ProductActionButtons
        product={dummyProduct}
        siteSettings={dummySettings}
        lang="ka"
      />
    );

    const nameInput = screen.getByPlaceholderText(/თქვენი სახელი/i);
    const phoneInput = screen.getByPlaceholderText(/5XX XX XX XX/i);
    const submitBtn = screen.getByRole('button', { name: /ზარის მოთხოვნა/i });

    fireEvent.change(nameInput, { target: { value: 'გიორგი' } });
    fireEvent.change(phoneInput, { target: { value: '12345' } }); // invalid phone
    fireEvent.click(submitBtn);

    expect(screen.getByText(/შეიყვანეთ სწორი ქართული ნომერი/i)).toBeInTheDocument();
  });

  it('successfully submits valid inquiry, calls setInquiries and syncData, and shows success message', () => {
    const handleSetInquiries = vi.fn();
    const handleSyncData = vi.fn();

    render(
      <ProductActionButtons
        product={dummyProduct}
        siteSettings={dummySettings}
        selectedSize="16.5"
        inquiries={[]}
        setInquiries={handleSetInquiries}
        syncData={handleSyncData}
        lang="ka"
      />
    );

    const nameInput = screen.getByPlaceholderText(/თქვენი სახელი/i);
    const phoneInput = screen.getByPlaceholderText(/5XX XX XX XX/i);
    const submitBtn = screen.getByRole('button', { name: /ზარის მოთხოვნა/i });

    fireEvent.change(nameInput, { target: { value: 'ნინო' } });
    fireEvent.change(phoneInput, { target: { value: '599 12 34 56' } });
    fireEvent.click(submitBtn);

    expect(handleSetInquiries).toHaveBeenCalledTimes(1);
    const savedInquiries = handleSetInquiries.mock.calls[0][0];
    expect(savedInquiries.length).toBe(1);
    expect(savedInquiries[0].clientName).toBe('ნინო');
    expect(savedInquiries[0].clientPhone).toBe('599123456');
    expect(savedInquiries[0].sku).toBe('AUR-DIAMOND-01');
    expect(savedInquiries[0].size).toBe('16.5');

    expect(handleSyncData).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/მოთხოვნა მიღებულია!/i)).toBeInTheDocument();
  });
});

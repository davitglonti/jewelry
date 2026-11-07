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

  it('renders Buy Now button with selected size and navigates to checkout on click', async () => {
    const navModule = await import('../../src/utils/navigation');
    const navigateSpy = vi.spyOn(navModule, 'navigateTo').mockImplementation(() => {});

    render(
      <ProductActionButtons
        product={dummyProduct}
        selectedSize="17.0"
        lang="ka"
      />
    );

    const buyBtn = screen.getByRole('button', { name: /ახლავე შეძენა/i });
    expect(buyBtn).toBeInTheDocument();
    expect(screen.getByText(/ზომა: 17.0/i)).toBeInTheDocument();

    fireEvent.click(buyBtn);
    expect(navigateSpy).toHaveBeenCalledWith(
      expect.stringContaining('/checkout?productId=prod-42&size=17.0')
    );
    navigateSpy.mockRestore();
  });

  it('renders Buy Now button in English when lang is en', async () => {
    render(
      <ProductActionButtons
        product={dummyProduct}
        selectedSize="17.0"
        lang="en"
      />
    );

    expect(screen.getByRole('button', { name: /Buy Now \(Instant Checkout\)/i })).toBeInTheDocument();
    expect(screen.getByText(/Size: 17.0/i)).toBeInTheDocument();
  });

  it('navigates to checkout using sku if id is missing', async () => {
    const navModule = await import('../../src/utils/navigation');
    const navigateSpy = vi.spyOn(navModule, 'navigateTo').mockImplementation(() => {});

    const productWithoutId = {
      sku: 'SKU-ONLY-99',
      name: 'ოქროს სამაჯური',
      sizes: []
    };

    render(
      <ProductActionButtons
        product={productWithoutId}
        lang="en"
      />
    );

    const buyBtn = screen.getByRole('button', { name: /Buy Now/i });
    fireEvent.click(buyBtn);

    expect(navigateSpy).toHaveBeenCalledWith(
      expect.stringContaining('/en/checkout?sku=SKU-ONLY-99')
    );
    navigateSpy.mockRestore();
  });
});

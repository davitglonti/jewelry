import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../../src/components/store/ProductCard';
import { StoreContext } from '../../src/context/StoreContext';

const renderWithContext = (ui, contextOverrides = {}) => {
  const defaultContext = {
    darkMode: true,
    lang: 'ka',
    favorites: [],
    toggleFavorite: vi.fn(),
    compareList: [],
    toggleCompare: vi.fn(),
    siteSettings: { brandName: 'MATARE' },
    ...contextOverrides
  };

  return render(
    <StoreContext.Provider value={defaultContext}>
      {ui}
    </StoreContext.Provider>
  );
};

describe('ProductCard component', () => {
  const dummyProduct = {
    id: 'p-1',
    sku: 'AUR-101',
    name: 'ოქროს ბეჭედი ბრილიანტით',
    nameEn: 'Gold Diamond Ring',
    price: '3,200 ₾',
    oldPrice: '4,000 ₾',
    category: 'ბეჭდები',
    stockStatus: 'in_stock',
    exclusive: true,
    images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg']
  };

  it('renders product details correctly', () => {
    renderWithContext(<ProductCard product={dummyProduct} />);

    expect(screen.getByText('ოქროს ბეჭედი ბრილიანტით')).toBeInTheDocument();
    expect(screen.getByText(/AUR-101/)).toBeInTheDocument();
    expect(screen.getByText('3,200 ₾')).toBeInTheDocument();
    expect(screen.getByText('4,000 ₾')).toBeInTheDocument();
    expect(screen.getAllByText('-20%').length).toBeGreaterThan(0);
    expect(screen.getByText('ექსკლუზივი')).toBeInTheDocument();
  });

  it('calls onClick when product card is clicked', () => {
    const handleClick = vi.fn();
    renderWithContext(<ProductCard product={dummyProduct} onClick={handleClick} />);

    const cardArticle = screen.getByRole('article');
    fireEvent.click(cardArticle);

    expect(handleClick).toHaveBeenCalledWith(dummyProduct);
  });

  it('calls toggleFavorite when favorite button is clicked without triggering card onClick', () => {
    const handleFavorite = vi.fn();
    const handleClick = vi.fn();

    renderWithContext(
      <ProductCard product={dummyProduct} onClick={handleClick} />,
      { toggleFavorite: handleFavorite }
    );

    const favButton = screen.getByLabelText(/რჩეულებში დამატება/i);
    fireEvent.click(favButton);

    expect(handleFavorite).toHaveBeenCalledWith('p-1');
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('calls toggleCompare when compare button is clicked', () => {
    const handleCompare = vi.fn();
    const handleClick = vi.fn();

    renderWithContext(
      <ProductCard product={dummyProduct} onClick={handleClick} />,
      { toggleCompare: handleCompare }
    );

    const compareButton = screen.getByTitle(/შედარებაში დამატება/i);
    fireEvent.click(compareButton);

    expect(handleCompare).toHaveBeenCalledWith('p-1');
    expect(handleClick).not.toHaveBeenCalled();
  });
});

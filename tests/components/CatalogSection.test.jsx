import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CatalogSection from '../../src/components/store/CatalogSection';
import { StoreContext } from '../../src/context/StoreContext';

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'test-user' }, isAuthenticated: true })
}));

const renderWithContext = (ui, contextOverrides = {}) => {
  const defaultContext = {
    darkMode: true,
    lang: 'ka',
    favorites: [],
    toggleFavorite: vi.fn(),
    compareList: [],
    toggleCompare: vi.fn(),
    siteSettings: { brandName: 'MATARE' },
    products: [],
    ...contextOverrides
  };

  return render(
    <StoreContext.Provider value={defaultContext}>
      {ui}
    </StoreContext.Provider>
  );
};

describe('CatalogSection component', () => {
  const mockProducts = [
    { id: '1', name: 'Product 1 (Standard)', sku: 'AUR-001', showOnHome: true, exclusive: false, price: '100 ₾' },
    { id: '2', name: 'Product 2 (Standard)', sku: 'AUR-002', showOnHome: true, exclusive: false, price: '200 ₾' },
    { id: '3', name: 'Product 3 (Exclusive)', sku: 'AUR-003', showOnHome: true, exclusive: true, price: '300 ₾' },
    { id: '4', name: 'Product 4 (Standard)', sku: 'AUR-004', showOnHome: true, exclusive: false, price: '400 ₾' },
    { id: '5', name: 'Product 5 (Exclusive 2)', sku: 'AUR-005', showOnHome: true, exclusive: true, price: '500 ₾' },
  ];

  it('automatically sorts exclusive products to the front of the home collection', () => {
    renderWithContext(<CatalogSection openProductModal={vi.fn()} />, {
      products: mockProducts
    });

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(5);

    // Exclusive items (Product 3 and Product 5) must be the first 2 items
    expect(articles[0]).toHaveTextContent('Product 3 (Exclusive)');
    expect(articles[1]).toHaveTextContent('Product 5 (Exclusive 2)');

    // Non-exclusive items must follow after in original order
    expect(articles[2]).toHaveTextContent('Product 1 (Standard)');
    expect(articles[3]).toHaveTextContent('Product 2 (Standard)');
    expect(articles[4]).toHaveTextContent('Product 4 (Standard)');
  });

  it('caps the showcase at maximum 5 pieces', () => {
    const sixProducts = [
      ...mockProducts,
      { id: '6', name: 'Product 6 (Extra)', sku: 'AUR-006', showOnHome: true, exclusive: false, price: '600 ₾' }
    ];

    renderWithContext(<CatalogSection openProductModal={vi.fn()} />, {
      products: sixProducts
    });

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(5);
    expect(screen.queryByText('Product 6 (Extra)')).not.toBeInTheDocument();
  });

  it('renders section title and collection count in Georgian and English', () => {
    const { rerender } = renderWithContext(<CatalogSection openProductModal={vi.fn()} />, {
      lang: 'ka',
      products: mockProducts
    });

    expect(screen.getByText('ჩვენი კოლექცია')).toBeInTheDocument();
    expect(screen.getByText('საიუველირო ვიტრინა')).toBeInTheDocument();
    expect(screen.getByText(/სრული კოლექცია \(5\)/)).toBeInTheDocument();

    rerender(
      <StoreContext.Provider value={{
        darkMode: true,
        lang: 'en',
        favorites: [],
        toggleFavorite: vi.fn(),
        compareList: [],
        toggleCompare: vi.fn(),
        siteSettings: { brandName: 'MATARE' },
        products: mockProducts
      }}>
        <CatalogSection openProductModal={vi.fn()} />
      </StoreContext.Provider>
    );

    expect(screen.getByText('Our Collection')).toBeInTheDocument();
    expect(screen.getByText('Fine Jewelry Showcase')).toBeInTheDocument();
    expect(screen.getByText(/Explore All \(5\)/)).toBeInTheDocument();
  });

  it('displays empty state when no products are present', () => {
    renderWithContext(<CatalogSection openProductModal={vi.fn()} />, {
      products: []
    });

    expect(screen.getByText(/სამკაულები მალე დაემატება/i)).toBeInTheDocument();
  });
});

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductStoryHighlights from '../../src/components/store/ProductStoryHighlights';

describe('ProductStoryHighlights component', () => {
  const sampleProduct = {
    id: 'p-1',
    name: 'საყურეები Lumina Drop',
    price: 3400
  };

  it('renders nothing if product is missing', () => {
    const { container } = render(<ProductStoryHighlights product={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders guaranteed express delivery banner in Georgian', () => {
    render(<ProductStoryHighlights product={sampleProduct} lang="ka" darkMode={true} />);

    expect(screen.getByText('დაზღვეული ექსპრეს მიწოდება')).toBeInTheDocument();
    expect(screen.getByText('უფასო')).toBeInTheDocument();
    expect(screen.getByText(/თბილისში დღესვე • რეგიონებში 24-48 საათში/i)).toBeInTheDocument();
  });

  it('renders guaranteed express delivery banner in English when lang is en', () => {
    render(<ProductStoryHighlights product={sampleProduct} lang="en" darkMode={false} />);

    expect(screen.getByText('Guaranteed Express Delivery')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('renders craftsmanship, assay stamp, and complete unboxing package details by default', () => {
    render(<ProductStoryHighlights product={sampleProduct} lang="ka" darkMode={true} />);

    expect(screen.getByText(/ავთენტური სინჯი და სერტიფიკატი:/i)).toBeInTheDocument();
    expect(screen.getByText(/ხელით დამუშავებული ოსტატობა:/i)).toBeInTheDocument();
    expect(screen.getByText(/სრული სასაჩუქრე კომპლექტი:/i)).toBeInTheDocument();
    expect(screen.getByText(/საფირმო ხავერდის ყუთი/i)).toBeInTheDocument();
  });

  it('renders custom per-product highlights when defined in product', () => {
    const customProduct = {
      ...sampleProduct,
      highlights: [
        { title: 'ინდივიდუალური გრავირება:', desc: 'უფასო გრავირება 10 სიმბოლომდე' },
        { title: 'პლატინის სინჯი:', desc: '950° უმაღლესი სინჯის პლატინა' }
      ]
    };

    render(<ProductStoryHighlights product={customProduct} lang="ka" darkMode={true} />);

    expect(screen.getByText(/ინდივიდუალური გრავირება:/i)).toBeInTheDocument();
    expect(screen.getByText(/უფასო გრავირება 10 სიმბოლომდე/i)).toBeInTheDocument();
    expect(screen.getByText(/პლატინის სინჯი:/i)).toBeInTheDocument();
  });
});

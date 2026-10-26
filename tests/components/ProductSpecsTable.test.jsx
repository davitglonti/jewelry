import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductSpecsTable from '../../src/components/store/ProductSpecsTable';

describe('ProductSpecsTable component', () => {
  const fullProduct = {
    metal: 'ყვითელი ოქრო',
    karat: '585 (14K)',
    weight: '3.45',
    stones: 'ბრილიანტი 0.35ct'
  };

  it('renders nothing when product is null or undefined', () => {
    const { container } = render(<ProductSpecsTable product={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when all spec fields are empty or whitespace', () => {
    const emptyProduct = { metal: '', karat: '   ', weight: null, stones: undefined };
    const { container } = render(<ProductSpecsTable product={emptyProduct} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Georgian labels and values by default', () => {
    render(<ProductSpecsTable product={fullProduct} lang="ka" darkMode={true} />);

    expect(screen.getByText('მეტალი')).toBeInTheDocument();
    expect(screen.getByText('ყვითელი ოქრო')).toBeInTheDocument();

    expect(screen.getByText('სინჯი')).toBeInTheDocument();
    expect(screen.getByText('585 (14K)')).toBeInTheDocument();

    expect(screen.getByText('წონა')).toBeInTheDocument();
    expect(screen.getByText('3.45 გრ')).toBeInTheDocument();

    expect(screen.getByText('ქვები')).toBeInTheDocument();
    expect(screen.getByText('ბრილიანტი 0.35ct')).toBeInTheDocument();
  });

  it('renders English labels and weight unit when lang is en', () => {
    const englishProduct = {
      metal: 'Yellow Gold',
      karat: '14K',
      weight: '4.2',
      stones: 'Diamond 0.50ct'
    };

    render(<ProductSpecsTable product={englishProduct} lang="en" darkMode={false} />);

    expect(screen.getByText('Metal')).toBeInTheDocument();
    expect(screen.getByText('Yellow Gold')).toBeInTheDocument();

    expect(screen.getByText('Karat')).toBeInTheDocument();
    expect(screen.getByText('14K')).toBeInTheDocument();

    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('4.2 g')).toBeInTheDocument();

    expect(screen.getByText('Gemstones')).toBeInTheDocument();
    expect(screen.getByText('Diamond 0.50ct')).toBeInTheDocument();
  });

  it('filters out empty spec fields and only displays available ones', () => {
    const partialProduct = {
      metal: 'თეთრი ოქრო',
      karat: '750'
    };

    render(<ProductSpecsTable product={partialProduct} lang="ka" />);

    expect(screen.getByText('მეტალი')).toBeInTheDocument();
    expect(screen.getByText('თეთრი ოქრო')).toBeInTheDocument();
    expect(screen.getByText('სინჯი')).toBeInTheDocument();
    expect(screen.getByText('750')).toBeInTheDocument();

    expect(screen.queryByText('წონა')).not.toBeInTheDocument();
    expect(screen.queryByText('ქვები')).not.toBeInTheDocument();
  });
});

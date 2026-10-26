import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RingSizerTool, { SIZE_CHART } from '../../src/components/store/RingSizerTool';

describe('RingSizerTool component', () => {
  it('renders default ring measurement tab with initial size 16.5', () => {
    render(<RingSizerTool lang="ka" />);

    expect(screen.getByText('ბეჭდით')).toBeInTheDocument();
    expect(screen.getByText('თითით')).toBeInTheDocument();
    expect(screen.getByText('ცხრილი')).toBeInTheDocument();

    // Size 16.5 is default
    expect(screen.getAllByText('16.5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('16.5 მმ').length).toBeGreaterThan(0);
  });

  it('triggers onSizeChange when quick size button is clicked', () => {
    const handleSizeChange = vi.fn();
    render(<RingSizerTool onSizeChange={handleSizeChange} lang="ka" />);

    const button18 = screen.getByRole('button', { name: '18.0' });
    fireEvent.click(button18);

    expect(handleSizeChange).toHaveBeenCalledWith('18.0', 18);
  });

  it('triggers onSizeChange when minus or plus buttons are clicked', () => {
    const handleSizeChange = vi.fn();
    render(<RingSizerTool onSizeChange={handleSizeChange} lang="ka" />);

    const plusButton = screen.getByLabelText('ზომის გაზრდა');
    fireEvent.click(plusButton);

    // Initial is 16.5 + 0.1 = 16.6 (closest is 16.5)
    expect(handleSizeChange).toHaveBeenCalledWith('16.5', 16.6);
  });

  it('switches to finger measurement tab and computes ring size from circumference', () => {
    const handleSizeChange = vi.fn();
    render(<RingSizerTool onSizeChange={handleSizeChange} lang="ka" />);

    const fingerTab = screen.getByRole('button', { name: /თითით/i });
    fireEvent.click(fingerTab);

    expect(screen.getByText(/შემოიხვიეთ ვიწრო ქაღალდის ზოლი/i)).toBeInTheDocument();

    // Find circumference number input
    const numInput = screen.getByRole('spinbutton');
    expect(numInput).toBeInTheDocument();

    // 53.4 mm circumference / PI ≈ 17.0 mm diameter -> Size 17.0
    fireEvent.change(numInput, { target: { value: '53.4' } });

    expect(handleSizeChange).toHaveBeenCalledWith('17.0', expect.any(Number));
    expect(screen.getByText(/ზომა 17.0/i)).toBeInTheDocument();
  });

  it('switches to size chart table tab and renders ISO 8653 size table', () => {
    render(<RingSizerTool lang="ka" />);

    const tableTab = screen.getByRole('button', { name: /ცხრილი/i });
    fireEvent.click(tableTab);

    expect(screen.getByText('ზომა (EU)')).toBeInTheDocument();
    expect(screen.getByText('გარშემოწერილობა')).toBeInTheDocument();

    // Check that some rows from SIZE_CHART exist
    expect(screen.getAllByText('15.0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('22.0').length).toBeGreaterThan(0);
  });

  it('renders English labels when lang is en', () => {
    render(<RingSizerTool lang="en" />);

    expect(screen.getByText('With Ring')).toBeInTheDocument();
    expect(screen.getByText('Finger')).toBeInTheDocument();
    expect(screen.getByText('Chart')).toBeInTheDocument();
  });
});

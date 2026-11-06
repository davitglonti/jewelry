import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminInquiriesTab from '../../src/components/admin/AdminInquiriesTab';

describe('AdminInquiriesTab component', () => {
  const dummyProducts = [
    {
      id: 'prod-101',
      name: 'ბრილიანტის ბეჭედი «Aurelia»',
      sku: 'AUR-101',
      price: 3200,
      sizes: ['16.0', '16.5', '17.0']
    }
  ];

  const dummyInquiries = [
    {
      id: 'MTR-782910',
      date: '11/6/2026, 12:30:00 PM',
      clientName: 'გიორგი მაისურაძე',
      clientPhone: '599 12 34 56',
      clientEmail: 'giorgi@gmail.com',
      deliveryMethod: 'კურიერით (თბილისი)',
      city: 'თბილისი',
      address: 'ჭავჭავაძის 12, ბინა 4',
      paymentMethod: 'ონლაინ ბარათით',
      paymentStatus: 'გადახდილია',
      isGift: true,
      status: 'ახალი შეკვეთა',
      totalPrice: 3200,
      items: [
        {
          id: 'prod-101',
          name: 'ბრილიანტის ბეჭედი «Aurelia»',
          sku: 'AUR-101',
          price: 3200,
          size: '17.0'
        }
      ]
    },
    {
      id: 'inq-99',
      date: '11/5/2026, 10:00:00 AM',
      clientName: 'ანა კაპანაძე',
      clientPhone: '555 98 76 54',
      productName: 'ოქროს ყელსაბამი',
      sku: 'AUR-202',
      size: 'სტანდარტული',
      price: 1500,
      status: 'მუშავდება'
    }
  ];

  const mockSettings = {
    brandName: 'MATARE',
    showroomAddress: 'მ. კოსტავას 75, თბილისი'
  };

  it('renders empty message when no inquiries are present', () => {
    render(
      <AdminInquiriesTab
        inquiries={[]}
        setInquiries={vi.fn()}
        products={dummyProducts}
        siteSettings={mockSettings}
      />
    );

    expect(screen.getByText(/შეკვეთები არ მოიძებნა/i)).toBeInTheDocument();
  });

  it('renders KPI stats and order cards with correct customer details, sizes and amounts', () => {
    render(
      <AdminInquiriesTab
        inquiries={dummyInquiries}
        setInquiries={vi.fn()}
        products={dummyProducts}
        siteSettings={mockSettings}
      />
    );

    // Header & KPI
    expect(screen.getByText(/შეკვეთებისა და გაყიდვების ცენტრი/i)).toBeInTheDocument();
    expect(screen.getByText('გიორგი მაისურაძე')).toBeInTheDocument();
    expect(screen.getByText('ანა კაპანაძე')).toBeInTheDocument();

    // Size badge
    expect(screen.getByText('17.0')).toBeInTheDocument();
    expect(screen.getByText(/სასაჩუქრე ყუთი/i)).toBeInTheDocument();
  });

  it('filters orders by search query', () => {
    render(
      <AdminInquiriesTab
        inquiries={dummyInquiries}
        setInquiries={vi.fn()}
        products={dummyProducts}
        siteSettings={mockSettings}
      />
    );

    const searchInput = screen.getByPlaceholderText(/მოძებნეთ შეკვეთის კოდით/i);
    fireEvent.change(searchInput, { target: { value: 'ანა' } });

    expect(screen.getByText('ანა კაპანაძე')).toBeInTheDocument();
    expect(screen.queryByText('გიორგი მაისურაძე')).not.toBeInTheDocument();
  });

  it('updates order status and calls syncData', () => {
    const handleSetInquiries = vi.fn();
    const handleSyncData = vi.fn();

    render(
      <AdminInquiriesTab
        inquiries={dummyInquiries}
        setInquiries={handleSetInquiries}
        syncData={handleSyncData}
        products={dummyProducts}
        siteSettings={mockSettings}
      />
    );

    const statusSelects = screen.getAllByRole('combobox');
    const firstStatusSelect = statusSelects.find((s) => s.value === 'ახალი შეკვეთა');
    expect(firstStatusSelect).toBeDefined();

    fireEvent.change(firstStatusSelect, { target: { value: 'ჩაბარებულია' } });

    expect(handleSetInquiries).toHaveBeenCalledTimes(1);
    expect(handleSyncData).toHaveBeenCalledTimes(1);
    const updatedList = handleSetInquiries.mock.calls[0][0];
    expect(updatedList[0].status).toBe('ჩაბარებულია');
  });

  it('opens printable invoice modal when print button is clicked', () => {
    render(
      <AdminInquiriesTab
        inquiries={dummyInquiries}
        setInquiries={vi.fn()}
        products={dummyProducts}
        siteSettings={mockSettings}
      />
    );

    const printButtons = screen.getAllByTitle(/ინვოისის ბეჭდვა/i);
    fireEvent.click(printButtons[0]);

    expect(screen.getByText(/ოფიციალური ინვოისი \/ შეკვეთის ბარათი/i)).toBeInTheDocument();
    expect(screen.getByText(/ხელმოწერა \/ ბეჭედი/i)).toBeInTheDocument();
    expect(screen.getByText(/სულ გადასახდელი:/i)).toBeInTheDocument();
  });

  it('allows deleting an order after confirmation', () => {
    const handleSetInquiries = vi.fn();
    const handleSyncData = vi.fn();

    render(
      <AdminInquiriesTab
        inquiries={dummyInquiries}
        setInquiries={handleSetInquiries}
        syncData={handleSyncData}
        products={dummyProducts}
        siteSettings={mockSettings}
      />
    );

    const deleteButtons = screen.getAllByTitle(/შეკვეთის წაშლა/i);
    fireEvent.click(deleteButtons[0]);

    const confirmBtn = screen.getByRole('button', { name: /დიახ, წაშლა/i });
    fireEvent.click(confirmBtn);

    expect(handleSetInquiries).toHaveBeenCalledTimes(1);
    expect(handleSyncData).toHaveBeenCalledTimes(1);
    const updatedList = handleSetInquiries.mock.calls[0][0];
    expect(updatedList.length).toBe(1);
    expect(updatedList[0].id).toBe('inq-99');
  });
});

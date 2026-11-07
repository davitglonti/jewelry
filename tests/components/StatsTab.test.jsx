import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StatsTab from '../../src/components/admin/StatsTab';

// Mock Firestore
const mockProductStats = [
  {
    id: 'p-1',
    data: () => ({
      views: 120,
      uniqueViews: 90,
      favoritesCount: 15,
      comparesCount: 8,
      lastViewedAt: new Date(),
    })
  },
  {
    id: 'p-2',
    data: () => ({
      views: 50,
      uniqueViews: 40,
      favoritesCount: 25, // top wishlist!
      comparesCount: 4,
      lastViewedAt: new Date(),
    })
  }
];

const mockUsers = [
  {
    id: 'u-1',
    data: () => ({
      uid: 'u-1',
      displayName: 'გიორგი ბერიძე',
      email: 'giorgi@example.com',
      provider: 'google',
      createdAt: new Date(),
      lastLoginAt: new Date(),
    })
  },
  {
    id: 'u-2',
    data: () => ({
      uid: 'u-2',
      displayName: 'ნინო კაპანაძე',
      email: 'nino@example.com',
      provider: 'password',
      createdAt: new Date(),
      lastLoginAt: new Date(),
    })
  }
];

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, name) => ({ name })),
  getDocs: vi.fn(async (col) => {
    if (col.name === 'productStats') return mockProductStats;
    if (col.name === 'users') return mockUsers;
    return [];
  }),
  doc: vi.fn((db, col, id) => ({ path: `${col}/${id}`, id })),
  deleteDoc: vi.fn(),
}));

vi.mock('../../src/lib/firebase', () => ({
  db: { _dummy: true },
}));

describe('StatsTab component', () => {
  const dummyProducts = [
    { id: 'p-1', sku: 'AUR-001', name: 'ბრილიანტის ბეჭედი', price: '3,500 ₾' },
    { id: 'p-2', sku: 'AUR-002', name: 'ოქროს ყელსაბამი', price: '2,200 ₾' },
    { id: 'p-3', sku: 'AUR-003', name: 'მარგალიტის საყურე', price: '1,800 ₾' },
  ];

  const dummyInquiries = [
    {
      id: 'ord-1',
      clientEmail: 'giorgi@example.com',
      clientName: 'გიორგი ბერიძე',
      totalPrice: 3500,
      date: new Date().toISOString(),
      sku: 'AUR-001'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders top KPI cards and daily activity trend chart on overview tab', async () => {
    render(<StatsTab products={dummyProducts} inquiries={dummyInquiries} darkMode={true} lang="ka" />);

    // Check main title
    expect(screen.getByText('ანალიტიკა და სტატისტიკის ცენტრი')).toBeInTheDocument();

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByText('170')).toBeInTheDocument(); // 120 + 50 views
    });

    // Check registered users count (2)
    expect(screen.getByText('2')).toBeInTheDocument();

    // Check trend chart
    expect(screen.getByText('დღიური აქტივობის დინამიკა')).toBeInTheDocument();
  });

  it('switches to registered users tab and displays user list with orders and emails', async () => {
    render(<StatsTab products={dummyProducts} inquiries={dummyInquiries} darkMode={true} lang="ka" />);

    await waitFor(() => {
      expect(screen.getByText(/რეგისტრირებული მომხმარებლები/i)).toBeInTheDocument();
    });

    // Click "რეგისტრირებული მომხმარებლები" sub-tab
    const usersTabBtn = screen.getByRole('button', { name: /რეგისტრირებული მომხმარებლები/i });
    fireEvent.click(usersTabBtn);

    // Assert user names are visible
    expect(screen.getByText('გიორგი ბერიძე')).toBeInTheDocument();
    expect(screen.getByText('giorgi@example.com')).toBeInTheDocument();
    expect(screen.getByText('ნინო კაპანაძე')).toBeInTheDocument();
    expect(screen.getByText('nino@example.com')).toBeInTheDocument();

    // Giorgi has 1 order correlated from inquiries
    expect(screen.getByText(/1 შეკვეთა/i)).toBeInTheDocument();
  });

  it('switches to wishlist tab and displays top wishlisted jewelry pieces', async () => {
    render(<StatsTab products={dummyProducts} inquiries={dummyInquiries} darkMode={true} lang="ka" />);

    await waitFor(() => {
      expect(screen.getByText(/რჩეულები & მოთხოვნა/i)).toBeInTheDocument();
    });

    const wishlistTabBtn = screen.getByRole('button', { name: /რჩეულები & მოთხოვნა/i });
    fireEvent.click(wishlistTabBtn);

    // p-2 has 25 favorites, p-1 has 15 favorites
    expect(screen.getAllByText('ოქროს ყელსაბამი').length).toBeGreaterThan(0);
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('supports time range filter switching', async () => {
    render(<StatsTab products={dummyProducts} inquiries={dummyInquiries} darkMode={true} lang="ka" />);

    const todayBtn = screen.getByRole('button', { name: 'დღეს' });
    fireEvent.click(todayBtn);

    const monthBtn = screen.getByRole('button', { name: 'მიმდინარე თვე' });
    fireEvent.click(monthBtn);

    expect(screen.getByText('ანალიტიკა და სტატისტიკის ცენტრი')).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';

describe('Popularity Sorting Logic', () => {
  const products = [
    { id: '1', sku: 'AUR-101', name: 'Ring 1', createdAt: 100 },
    { id: '2', sku: 'AUR-102', name: 'Ring 2', createdAt: 200 },
    { id: '3', sku: 'AUR-103', name: 'Ring 3', createdAt: 300 },
    { id: '4', sku: 'AUR-104', name: 'Ring 4', createdAt: 400 },
  ];

  const popularityMap = {
    'AUR-101': 15,
    '2': 42,
    'AUR-103': 15,
    // AUR-104 has 0 views / unlisted
  };

  const sortProductsByPopularity = (items, popMap) => {
    return [...items].sort((a, b) => {
      const viewsA = Number(popMap[a.id] ?? popMap[a.sku] ?? popMap[a.sku?.toLowerCase()] ?? 0);
      const viewsB = Number(popMap[b.id] ?? popMap[b.sku] ?? popMap[b.sku?.toLowerCase()] ?? 0);
      if (viewsB !== viewsA) {
        return viewsB - viewsA;
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  };

  it('sorts highest viewed products first', () => {
    const sorted = sortProductsByPopularity(products, popularityMap);
    // 'Ring 2' has 42 views -> 1st
    expect(sorted[0].sku).toBe('AUR-102');
  });

  it('breaks ties using newest created date first', () => {
    const sorted = sortProductsByPopularity(products, popularityMap);
    // 'AUR-103' (15 views, createdAt 300) comes before 'AUR-101' (15 views, createdAt 100)
    expect(sorted[1].sku).toBe('AUR-103');
    expect(sorted[2].sku).toBe('AUR-101');
  });

  it('places items with zero or missing views at the end sorted by date', () => {
    const sorted = sortProductsByPopularity(products, popularityMap);
    expect(sorted[3].sku).toBe('AUR-104');
  });
});

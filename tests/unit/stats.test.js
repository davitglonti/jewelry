import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackProductView } from '../../src/lib/stats';

// Mock firebase/firestore
const mockSetDoc = vi.fn();
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db, col, id) => ({ path: `${col}/${id}`, id })),
  setDoc: (...args) => mockSetDoc(...args),
  increment: vi.fn((n) => ({ __op: 'increment', value: n })),
  serverTimestamp: vi.fn(() => ({ __op: 'serverTimestamp' })),
}));

// Mock firebase
vi.mock('../../src/lib/firebase', () => ({
  db: { _dummy: true },
  auth: { currentUser: null },
}));

describe('trackProductView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('tracks view and unique view on first visit', async () => {
    localStorage.setItem('matare_visitor_id', 'test_user');
    await trackProductView('p-101');

    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const [statRef, data, options] = mockSetDoc.mock.calls[0];
    expect(statRef.id).toBe('p-101');
    expect(data.views.value).toBe(1);
    expect(data.uniqueViews.value).toBe(1);
    expect(options).toEqual({ merge: true });

    // Session and Local flags must be set
    expect(sessionStorage.getItem('matare_view_session_p-101_test_user')).toBe('1');
    expect(localStorage.getItem('matare_view_ever_p-101_test_user')).toBe('1');
  });

  it('does not re-track if already viewed in same session', async () => {
    localStorage.setItem('matare_visitor_id', 'test_user');
    sessionStorage.setItem('matare_view_session_p-101_test_user', '1');

    await trackProductView('p-101');

    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('tracks regular view but not unique view if viewed previously on device but new session', async () => {
    localStorage.setItem('matare_visitor_id', 'test_user');
    localStorage.setItem('matare_view_ever_p-101_test_user', '1');

    await trackProductView('p-101');

    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const [, data] = mockSetDoc.mock.calls[0];
    expect(data.views.value).toBe(1);
    expect(data.uniqueViews.value).toBe(0); // Not unique!
  });

  it('skips tracking when admin is logged in or on admin route', async () => {
    localStorage.setItem('isAdmin', 'true');

    await trackProductView('p-101');

    expect(mockSetDoc).not.toHaveBeenCalled();
  });
});

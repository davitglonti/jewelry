import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncUserProfileToFirestore } from '../../src/lib/userSync';

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((db, col, id) => ({ path: `${col}/${id}`, id })),
  getDoc: (...args) => mockGetDoc(...args),
  setDoc: (...args) => mockSetDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  serverTimestamp: vi.fn(() => ({ __op: 'serverTimestamp' })),
}));

vi.mock('../../src/lib/firebase', () => ({
  db: { _dummy: true },
}));

describe('syncUserProfileToFirestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates new user profile in Firestore when document does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => false,
      data: () => null,
    });

    const mockUser = {
      uid: 'user_123',
      email: 'Davit@example.com',
      displayName: 'Davit Glonti',
      photoURL: 'https://example.com/avatar.jpg',
      providerData: [{ providerId: 'google.com' }]
    };

    await syncUserProfileToFirestore(mockUser, { isNewUser: true, provider: 'google' });

    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const [userRef, data, options] = mockSetDoc.mock.calls[0];
    expect(userRef.id).toBe('user_123');
    expect(data.email).toBe('davit@example.com');
    expect(data.displayName).toBe('Davit Glonti');
    expect(data.provider).toBe('google');
    expect(data.ordersCount).toBe(0);
    expect(options).toEqual({ merge: true });
  });

  it('updates lastLoginAt when existing user logs in', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        displayName: 'Existing User',
        email: 'user@example.com',
        photoURL: 'https://example.com/photo.jpg',
      }),
    });

    const mockUser = {
      uid: 'user_456',
      email: 'user@example.com',
      displayName: 'Existing User',
    };

    await syncUserProfileToFirestore(mockUser);

    expect(mockSetDoc).not.toHaveBeenCalled();
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    const [userRef, updates] = mockUpdateDoc.mock.calls[0];
    expect(userRef.id).toBe('user_456');
    expect(updates.lastLoginAt).toBeDefined();
  });

  it('handles empty user or missing uid gracefully without error', async () => {
    await expect(syncUserProfileToFirestore(null)).resolves.toBeUndefined();
    await expect(syncUserProfileToFirestore({})).resolves.toBeUndefined();
    expect(mockGetDoc).not.toHaveBeenCalled();
  });
});

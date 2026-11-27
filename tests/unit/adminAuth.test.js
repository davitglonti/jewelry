import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkUserIsAdmin,
  generateSecureTempPassword,
  removeAdminAccount,
  toggleAdminAccountStatus,
  updateAdminRole,
  createAdminAccountApi,
  resendAdminInviteApi
} from '../../src/lib/adminAuth';

describe('Admin & Moderator RBAC Authorization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateSecureTempPassword', () => {
    it('generates cryptographically strong temporary password containing letters, numbers and symbol', () => {
      const pwd = generateSecureTempPassword();
      expect(typeof pwd).toBe('string');
      expect(pwd.length).toBeGreaterThanOrEqual(12);
      expect(/[0-9]/.test(pwd)).toBe(true);
      expect(/[#$@!]/.test(pwd)).toBe(true);
    });
  });

  describe('checkUserIsAdmin & Server-Verified Role Assignment', () => {
    it('verifies Super Admin via /api/check-admin without exposing owner email in client bundle', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isAdmin: true,
          isSuperAdmin: true,
          role: 'superadmin',
          mustChangePassword: false,
          email: 'owner@example.com',
        }),
      });

      const user = {
        email: 'owner@example.com',
        getIdToken: async () => 'fake-id-token',
      };
      const res = await checkUserIsAdmin(user, null);
      expect(res.isAdmin).toBe(true);
      expect(res.isSuperAdmin).toBe(true);
      expect(res.role).toBe('superadmin');
      expect(res.mustChangePassword).toBe(false);
    });

    it('rejects unauthenticated or non-admin users', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isAdmin: false,
          isSuperAdmin: false,
          role: '',
          mustChangePassword: false,
          email: 'user@example.com',
        }),
      });

      expect((await checkUserIsAdmin(null, null)).isAdmin).toBe(false);
      expect(
        (await checkUserIsAdmin({ email: 'user@example.com', getIdToken: async () => 'tok' }, null)).isAdmin
      ).toBe(false);
    });
  });

  describe('Super Admin Protection Rules', () => {
    it('strictly forbids deleting the protected super admin', async () => {
      const dummyDb = {};
      await expect(removeAdminAccount(dummyDb, 'owner@example.com', 'owner@example.com')).rejects.toThrow(
        /მთავარი ადმინისტრატორის წაშლა შეუძლებელია/
      );
    });

    it('strictly forbids changing the role of the protected super admin', async () => {
      const dummyDb = {};
      await expect(updateAdminRole(dummyDb, 'owner@example.com', 'moderator', 'owner@example.com')).rejects.toThrow(
        /მთავარი ადმინისტრატორის როლის შეცვლა შეუძლებელია/
      );
    });

    it('strictly forbids deactivating the protected super admin', async () => {
      const dummyDb = {};
      await expect(toggleAdminAccountStatus(dummyDb, 'owner@example.com', false, 'owner@example.com')).rejects.toThrow(
        /მთავარი ადმინისტრატორის სტატუსის შეცვლა შეუძლებელია/
      );
    });
  });

  describe('createAdminAccountApi & resendAdminInviteApi', () => {
    it('throws when currentUser is null or undefined', async () => {
      await expect(createAdminAccountApi(null, { email: 'test@example.com' })).rejects.toThrow(
        /საჭიროა მთავარი ადმინისტრატორის ავტორიზაცია/
      );
      await expect(resendAdminInviteApi(null, { email: 'test@example.com' })).rejects.toThrow(
        /საჭიროა მთავარი ადმინისტრატორის ავტორიზაცია/
      );
    });
  });
});

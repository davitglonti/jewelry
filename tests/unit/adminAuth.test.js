import { describe, it, expect, vi } from 'vitest';
import {
  SUPER_ADMIN_EMAIL,
  isSuperAdmin,
  checkUserIsAdmin,
  addAdminAccount,
  removeAdminAccount,
  toggleAdminAccountStatus
} from '../../src/lib/adminAuth';

describe('Admin Authorization & RBAC', () => {
  describe('isSuperAdmin', () => {
    it('returns true for datiglonti@gmail.com', () => {
      expect(isSuperAdmin('datiglonti@gmail.com')).toBe(true);
      expect(isSuperAdmin('DATIGLONTI@GMAIL.COM')).toBe(true);
      expect(isSuperAdmin('  datiglonti@gmail.com  ')).toBe(true);
    });

    it('returns false for non-superadmin emails', () => {
      expect(isSuperAdmin('someone@gmail.com')).toBe(false);
      expect(isSuperAdmin('admin@matare.store')).toBe(false);
      expect(isSuperAdmin('')).toBe(false);
      expect(isSuperAdmin(null)).toBe(false);
      expect(isSuperAdmin(undefined)).toBe(false);
    });
  });

  describe('checkUserIsAdmin', () => {
    it('returns false when user is null or has no email', async () => {
      const res1 = await checkUserIsAdmin(null, null);
      expect(res1.isAdmin).toBe(false);

      const res2 = await checkUserIsAdmin({}, null);
      expect(res2.isAdmin).toBe(false);
    });

    it('recognizes Super Admin immediately without database read', async () => {
      const user = { email: 'datiglonti@gmail.com' };
      const res = await checkUserIsAdmin(user, null);
      expect(res.isAdmin).toBe(true);
      expect(res.isSuperAdmin).toBe(true);
      expect(res.email).toBe('datiglonti@gmail.com');
    });

    it('returns false for normal registered users when not in Firestore', async () => {
      const user = { email: 'regularuser@example.com' };
      const res = await checkUserIsAdmin(user, null);
      expect(res.isAdmin).toBe(false);
      expect(res.isSuperAdmin).toBe(false);
    });
  });

  describe('addAdminAccount validation', () => {
    it('rejects invalid email formats', async () => {
      const dummyDb = {};
      await expect(addAdminAccount(dummyDb, 'invalid-email', 'datiglonti@gmail.com')).rejects.toThrow();
      await expect(addAdminAccount(dummyDb, '', 'datiglonti@gmail.com')).rejects.toThrow();
    });

    it('rejects adding the super admin email', async () => {
      const dummyDb = {};
      await expect(addAdminAccount(dummyDb, 'datiglonti@gmail.com', 'datiglonti@gmail.com')).rejects.toThrow(
        /მთავარ ადმინისტრატორს/
      );
    });
  });

  describe('removeAdminAccount protection', () => {
    it('strictly forbids deleting the super admin', async () => {
      const dummyDb = {};
      await expect(removeAdminAccount(dummyDb, 'datiglonti@gmail.com')).rejects.toThrow(
        /მთავარი ადმინისტრატორის წაშლა შეუძლებელია/
      );
    });
  });

  describe('toggleAdminAccountStatus protection', () => {
    it('strictly forbids deactivating the super admin', async () => {
      const dummyDb = {};
      await expect(toggleAdminAccountStatus(dummyDb, 'datiglonti@gmail.com', false)).rejects.toThrow(
        /მთავარი ადმინისტრატორის სტატუსის შეცვლა შეუძლებელია/
      );
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  SUPER_ADMIN_EMAIL,
  isSuperAdmin,
  checkUserIsAdmin,
  generateSecureTempPassword,
  removeAdminAccount,
  toggleAdminAccountStatus,
  updateAdminRole,
  createAdminAccountApi,
  resendAdminInviteApi
} from '../../src/lib/adminAuth';

describe('Admin & Moderator RBAC Authorization', () => {
  describe('isSuperAdmin', () => {
    it('returns true for datiglonti@gmail.com regardless of case or spaces', () => {
      expect(isSuperAdmin('datiglonti@gmail.com')).toBe(true);
      expect(isSuperAdmin('DATIGLONTI@GMAIL.COM')).toBe(true);
      expect(isSuperAdmin('  datiglonti@gmail.com  ')).toBe(true);
    });

    it('returns false for other emails', () => {
      expect(isSuperAdmin('moderator@matare.store')).toBe(false);
      expect(isSuperAdmin('admin@matare.store')).toBe(false);
      expect(isSuperAdmin('')).toBe(false);
      expect(isSuperAdmin(null)).toBe(false);
    });
  });

  describe('generateSecureTempPassword', () => {
    it('generates secure temporary password containing characters, numbers and symbol', () => {
      const pwd = generateSecureTempPassword();
      expect(typeof pwd).toBe('string');
      expect(pwd.length).toBeGreaterThanOrEqual(8);
      expect(/[0-9]/.test(pwd)).toBe(true);
      expect(/[#$@!]/.test(pwd)).toBe(true);
    });
  });

  describe('checkUserIsAdmin & Role Assignment', () => {
    it('recognizes Super Admin with superadmin role and mustChangePassword=false', async () => {
      const user = { email: 'datiglonti@gmail.com' };
      const res = await checkUserIsAdmin(user, null);
      expect(res.isAdmin).toBe(true);
      expect(res.isSuperAdmin).toBe(true);
      expect(res.role).toBe('superadmin');
      expect(res.mustChangePassword).toBe(false);
    });

    it('rejects unauthenticated or non-admin users', async () => {
      expect((await checkUserIsAdmin(null, null)).isAdmin).toBe(false);
      expect((await checkUserIsAdmin({ email: 'user@example.com' }, null)).isAdmin).toBe(false);
    });
  });

  describe('Super Admin Protection Rules', () => {
    it('strictly forbids deleting the super admin', async () => {
      const dummyDb = {};
      await expect(removeAdminAccount(dummyDb, 'datiglonti@gmail.com')).rejects.toThrow(
        /მთავარი ადმინისტრატორის წაშლა შეუძლებელია/
      );
    });

    it('strictly forbids changing the role of the super admin', async () => {
      const dummyDb = {};
      await expect(updateAdminRole(dummyDb, 'datiglonti@gmail.com', 'moderator')).rejects.toThrow(
        /მთავარი ადმინისტრატორის როლის შეცვლა შეუძლებელია/
      );
    });

    it('strictly forbids deactivating the super admin', async () => {
      const dummyDb = {};
      await expect(toggleAdminAccountStatus(dummyDb, 'datiglonti@gmail.com', false)).rejects.toThrow(
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

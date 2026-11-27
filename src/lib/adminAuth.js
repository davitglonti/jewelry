// src/lib/adminAuth.js

import { isStrongPassword, getPasswordValidationMessage } from '../utils/passwordValidation';

/**
 * შემთხვევითი დროებითი პაროლის გენერირება კრიპტოგრაფიულად უსაფრთხო გენერატორით
 */
export function generateSecureTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789#$@!';
  const bytes = new Uint8Array(12);
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let pwd = 'Mat#9';
  for (let i = 0; i < bytes.length; i++) {
    pwd += chars[bytes[i] % chars.length];
  }
  return pwd;
}

/**
 * ამოწმებს მომხმარებლის ადმინისტრატორულ სტატუსს და როლს სერვერის ან Firestore-ის გავლით:
 * - Super Admin (სრული წვდომა)
 * - Admin (სრული წვდომა)
 * - Moderator (შეზღუდული წვდომა: მხოლოდ პროდუქცია და ბლოგი)
 *
 * @param {object|null} user - Firebase Auth user ობიექტი
 * @param {object|null} db - Firestore ობიექტი
 * @returns {Promise<{isAdmin: boolean, isSuperAdmin: boolean, role: string, mustChangePassword: boolean, email: string}>}
 */
export async function checkUserIsAdmin(user, db) {
  if (!user || !user.email) {
    return { isAdmin: false, isSuperAdmin: false, role: '', mustChangePassword: false, email: '' };
  }

  const email = user.email.trim().toLowerCase();

  // 1. სერვერული გადამოწმება (/api/check-admin) — არ ამჟღავნებს მფლობელის ელფოსტას კლიენტის ბანდლში
  if (typeof user.getIdToken === 'function' && typeof fetch === 'function') {
    try {
      const token = await user.getIdToken();
      if (token) {
        const res = await fetch('/api/check-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });
        if (res && res.ok) {
          const data = await res.json();
          if (data && typeof data.isAdmin === 'boolean') {
            return {
              isAdmin: Boolean(data.isAdmin),
              isSuperAdmin: Boolean(data.isSuperAdmin),
              role: data.role || '',
              status: data.status || 'active',
              hasJoined: Boolean(data.hasJoined),
              mustChangePassword: Boolean(data.mustChangePassword),
              email: data.email || email,
              addedBy: data.addedBy || '',
              addedAt: data.addedAt || null,
            };
          }
        }
      }
    } catch {
      // Fallback to Firestore /admins check below
    }
  }

  // 2. დინამიური ადმინისტრატორი / მოდერატორი Firestore-ში
  if (db) {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'admins', email);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.isActive !== false) {
          const isOwnerRole = data.role === 'superadmin' || data.isSuperAdmin === true;
          const role = isOwnerRole ? 'superadmin' : data.role === 'moderator' ? 'moderator' : 'admin';

          return {
            isAdmin: true,
            isSuperAdmin: isOwnerRole,
            role,
            status: data.status || 'active',
            hasJoined: Boolean(data.hasJoined),
            mustChangePassword: Boolean(data.mustChangePassword),
            email,
            addedBy: data.addedBy || '',
            addedAt: data.addedAt || null,
          };
        }
      }
    } catch (err) {
      console.warn('Admin check error:', err);
    }
  }

  return { isAdmin: false, isSuperAdmin: false, role: '', mustChangePassword: false, email };
}

/**
 * პირველი შესვლისას პაროლის სავალდებულო განახლება
 */
export async function completePasswordChange(user, db, newPassword) {
  if (!user) throw new Error('ავტორიზაცია არ მოიძებნა');
  if (!isStrongPassword(newPassword)) {
    throw new Error(
      getPasswordValidationMessage(newPassword, 'ka') ||
      'ახალი პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს, დიდ და პატარა ასოებს, და ციფრს ან სიმბოლოს.'
    );
  }

  // 1. Firebase Auth-ში პაროლის შეცვლა
  const { updatePassword } = await import('firebase/auth');
  await updatePassword(user, newPassword);

  // 2. Firestore-ში mustChangePassword: false განახლება
  if (db && user.email) {
    const cleanEmail = user.email.trim().toLowerCase();
    const { doc, updateDoc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'admins', cleanEmail), {
      mustChangePassword: false,
      passwordChangedAt: Date.now()
    });
  }

  return { success: true };
}

/**
 * კითხულობს ყველა ადმინისტრატორისა და მოდერატორის სიას სერვერიდან ან Firestore-იდან
 */
export async function getAdminsList(db, currentUser = null) {
  if (currentUser && typeof currentUser.getIdToken === 'function' && typeof fetch === 'function') {
    try {
      const token = await currentUser.getIdToken();
      if (token) {
        const res = await fetch('/api/check-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ includeAdminsList: true }),
        });
        if (res && res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.adminsList)) {
            return data.adminsList;
          }
        }
      }
    } catch (err) {
      console.warn('API admins list fallback notice:', err?.message);
    }
  }

  const list = [];
  if (!db) return list;

  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'admins'));
    snap.forEach((d) => {
      const data = d.data();
      const docEmail = (data.email || d.id).toLowerCase();
      const hasJoined = Boolean(data.hasJoined || data.joinedAt || data.passwordChangedAt);
      const status = data.status ? data.status : (hasJoined ? 'active' : 'pending');
      const isOwner = Boolean(data.isSuperAdmin || data.role === 'superadmin');

      list.push({
        id: d.id,
        email: docEmail,
        role: isOwner ? 'superadmin' : (data.role === 'moderator' ? 'moderator' : 'admin'),
        isSuperAdmin: isOwner,
        isActive: data.isActive !== false,
        status,
        hasJoined,
        joinedAt: data.joinedAt || null,
        invitedAt: data.invitedAt || data.addedAt || null,
        mustChangePassword: Boolean(data.mustChangePassword),
        addedAt: data.addedAt || null,
        addedBy: data.addedBy || 'ადმინი'
      });
    });
  } catch (err) {
    console.error('Failed to load admins list:', err);
  }

  return list;
}

/**
 * ახალი თანამშრომლის მოწვევა და უფლების მინიჭება
 * აგზავნის ელ-წერილს პაროლის დაყენების ბმულით (Serverless API Resend + Firebase Admin)
 */
export async function createAdminAccountApi(currentUser, { email, role = 'admin', origin = '' }) {
  if (!currentUser) throw new Error('საჭიროა მთავარი ადმინისტრატორის ავტორიზაცია');
  const token = await currentUser.getIdToken();

  const clientOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');

  const response = await fetch('/api/create-admin-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ email, role, origin: clientOrigin })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'მოწვევის გაგზავნა ვერ მოხერხდა');
  }

  return data;
}

/**
 * მოწვევის / პაროლის დაყენების ბმულის ხელახლა გაგზავნა
 */
export async function resendAdminInviteApi(currentUser, { email, role = 'admin', origin = '' }) {
  return createAdminAccountApi(currentUser, { email, role, origin });
}

async function assertNotSuperAdminDoc(db, cleanEmail, protectedEmail = '') {
  if (!cleanEmail) throw new Error('ელფოსტა არავალიდურია');
  if (protectedEmail && cleanEmail === protectedEmail.trim().toLowerCase()) {
    return true;
  }
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'admins', cleanEmail));
    if (snap && snap.exists() && (snap.data()?.isSuperAdmin || snap.data()?.role === 'superadmin')) {
      return true;
    }
  } catch {}
  return false;
}

/**
 * როლის შეცვლა (admin <-> moderator)
 */
export async function updateAdminRole(db, email, newRole, protectedEmail = '') {
  if (!db) throw new Error('მონაცემთა ბაზა მიუწვდომელია');
  const cleanEmail = (email || '').trim().toLowerCase();
  if (await assertNotSuperAdminDoc(db, cleanEmail, protectedEmail)) {
    throw new Error('მთავარი ადმინისტრატორის როლის შეცვლა შეუძლებელია');
  }

  const role = newRole === 'moderator' ? 'moderator' : 'admin';
  const { doc, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'admins', cleanEmail), { role });
  return { success: true, role };
}

/**
 * ადმინისტრატორის წაშლა Firestore-იდან
 */
export async function removeAdminAccount(db, email, protectedEmail = '') {
  if (!db) throw new Error('მონაცემთა ბაზა მიუწვდომელია');
  const cleanEmail = (email || '').trim().toLowerCase();
  if (await assertNotSuperAdminDoc(db, cleanEmail, protectedEmail)) {
    throw new Error('მთავარი ადმინისტრატორის წაშლა შეუძლებელია');
  }

  const { doc, deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'admins', cleanEmail));
  return { success: true };
}

/**
 * ადმინისტრატორის სტატუსის შეცვლა (აქტიური / დეაქტივირებული)
 */
export async function toggleAdminAccountStatus(db, email, isActive, protectedEmail = '') {
  if (!db) throw new Error('მონაცემთა ბაზა მიუწვდომელია');
  const cleanEmail = (email || '').trim().toLowerCase();
  if (await assertNotSuperAdminDoc(db, cleanEmail, protectedEmail)) {
    throw new Error('მთავარი ადმინისტრატორის სტატუსის შეცვლა შეუძლებელია');
  }

  const { doc, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'admins', cleanEmail), {
    isActive: Boolean(isActive)
  });
  return { success: true };
}

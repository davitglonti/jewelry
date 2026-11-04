// src/lib/adminAuth.js

/**
 * მთავარი ადმინისტრატორის (Super Admin / მფლობელი) ელფოსტა.
 * ამ ანგარიშს ყოველთვის აქვს სრული წვდომა და მისი წაშლა/დაბლოკვა შეუძლებელია.
 */
export const SUPER_ADMIN_EMAIL = 'datiglonti@gmail.com';

/**
 * ამოწმებს, არის თუ არა ელფოსტა მთავარი ადმინისტრატორი
 */
export function isSuperAdmin(email) {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * ამოწმებს მომხმარებლის ადმინისტრატორულ სტატუსს:
 * 1. თუ არის Super Admin (datiglonti@gmail.com) -> ავტომატურად true
 * 2. სხვა შემთხვევაში Firestore-ის 'admins' კოლექციაში ეძებს ჩანაწერს
 * 
 * @param {object|null} user - Firebase Auth user ობიექტი
 * @param {object|null} db - Firestore ობიექტი
 * @returns {Promise<{isAdmin: boolean, isSuperAdmin: boolean, email: string}>}
 */
export async function checkUserIsAdmin(user, db) {
  if (!user || !user.email) {
    return { isAdmin: false, isSuperAdmin: false, email: '' };
  }

  const email = user.email.trim().toLowerCase();

  // 1. მთავარი ადმინისტრატორი
  if (isSuperAdmin(email)) {
    return { isAdmin: true, isSuperAdmin: true, email };
  }

  // 2. დინამიური ადმინისტრატორი Firestore-ში
  if (db) {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'admins', email);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.isActive !== false) {
          return {
            isAdmin: true,
            isSuperAdmin: false,
            email,
            addedBy: data.addedBy || '',
            addedAt: data.addedAt || null
          };
        }
      }
    } catch (err) {
      console.warn('Admin check error:', err);
    }
  }

  return { isAdmin: false, isSuperAdmin: false, email };
}

/**
 * კითხულობს ყველა ადმინისტრატორის სიას (Super Admin + Firestore-ის ადმინები)
 */
export async function getAdminsList(db) {
  const list = [
    {
      id: 'super-admin',
      email: SUPER_ADMIN_EMAIL,
      role: 'Super Admin',
      isSuperAdmin: true,
      isActive: true,
      addedAt: null,
      addedBy: 'სისტემის მფლობელი'
    }
  ];

  if (!db) return list;

  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'admins'));
    snap.forEach((d) => {
      const data = d.data();
      const docEmail = (data.email || d.id).toLowerCase();
      if (docEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
        list.push({
          id: d.id,
          email: docEmail,
          role: data.role || 'admin',
          isSuperAdmin: false,
          isActive: data.isActive !== false,
          addedAt: data.addedAt || null,
          addedBy: data.addedBy || 'ადმინი'
        });
      }
    });
  } catch (err) {
    console.error('Failed to load admins list:', err);
  }

  return list;
}

/**
 * ახალი ადმინისტრატორის დამატება Firestore-ში
 */
export async function addAdminAccount(db, email, currentAdminEmail) {
  if (!db) throw new Error('მონაცემთა ბაზა მიუწვდომელია');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error('გთხოვთ მიუთითოთ სწორი ელფოსტის მისამართი');
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('ეს ელფოსტა უკვე წარმოადგენს მთავარ ადმინისტრატორს');
  }

  const { doc, setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'admins', cleanEmail), {
    email: cleanEmail,
    role: 'admin',
    isActive: true,
    addedBy: currentAdminEmail || SUPER_ADMIN_EMAIL,
    addedAt: Date.now()
  });

  return { success: true, email: cleanEmail };
}

/**
 * ადმინისტრატორის წაშლა Firestore-იდან
 */
export async function removeAdminAccount(db, email) {
  if (!db) throw new Error('მონაცემთა ბაზა მიუწვდომელია');
  const cleanEmail = (email || '').trim().toLowerCase();
  if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('მთავარი ადმინისტრატორის წაშლა შეუძლებელია');
  }

  const { doc, deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'admins', cleanEmail));
  return { success: true };
}

/**
 * ადმინისტრატორის სტატუსის შეცვლა (აქტიური / დეაქტივირებული)
 */
export async function toggleAdminAccountStatus(db, email, isActive) {
  if (!db) throw new Error('მონაცემთა ბაზა მიუწვდომელია');
  const cleanEmail = (email || '').trim().toLowerCase();
  if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error('მთავარი ადმინისტრატორის სტატუსის შეცვლა შეუძლებელია');
  }

  const { doc, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'admins', cleanEmail), {
    isActive: Boolean(isActive)
  });
  return { success: true };
}

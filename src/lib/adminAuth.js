// src/lib/adminAuth.js

/**
 * მთავარი ადმინისტრატორის (Super Admin / მფლობელი) ელფოსტა.
 * ამ ანგარიშს ყოველთვის აქვს სრული წვდომა და მისი წაშლა/დაბლოკვა შეუძლებელია.
 */
export const SUPER_ADMIN_EMAIL = 'datiglonti@gmail.com';

/**
 * შემთხვევითი დროებითი პაროლის გენერირება (მაგ: Matare#8429)
 */
export function generateSecureTempPassword() {
  const words = ['Matare', 'Aurelia', 'Jewelry', 'Gold', 'Diamond'];
  const symbols = ['#', '$', '@', '!'];
  const word = words[Math.floor(Math.random() * words.length)];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${word}${symbol}${num}`;
}

/**
 * ამოწმებს, არის თუ არა ელფოსტა მთავარი ადმინისტრატორი
 */
export function isSuperAdmin(email) {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * ამოწმებს მომხმარებლის ადმინისტრატორულ სტატუსს და როლს:
 * - Super Admin (სრული წვდომა)
 * - Admin (სრული წვდომა)
 * - Moderator (შეზღუდული წვდომა: მხოლოდ პროდუქცია და ბლოგი)
 * 
 * ასევე ამოწმებს, უწევს თუ არა პირველი შესვლისას პაროლის შეცვლა (mustChangePassword)
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

  // 1. მთავარი ადმინისტრატორი (Super Admin)
  if (isSuperAdmin(email)) {
    return {
      isAdmin: true,
      isSuperAdmin: true,
      role: 'superadmin',
      mustChangePassword: false,
      email
    };
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
          const role = data.role === 'moderator' ? 'moderator' : 'admin';

          // თუ მომხმარებელი პირველად შემოვიდა (მოლოდინში იყო), სტატუსი აქტიურზე გადავიყვანოთ
          if (data.status !== 'active' || !data.hasJoined) {
            try {
              const { updateDoc } = await import('firebase/firestore');
              await updateDoc(docRef, {
                status: 'active',
                hasJoined: true,
                joinedAt: Date.now()
              });
            } catch {
              fetch('/api/activate-admin-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
              }).catch(() => {});
            }
          }

          return {
            isAdmin: true,
            isSuperAdmin: false,
            role,
            status: 'active',
            hasJoined: true,
            mustChangePassword: Boolean(data.mustChangePassword),
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

  return { isAdmin: false, isSuperAdmin: false, role: '', mustChangePassword: false, email };
}

/**
 * პირველი შესვლისას პაროლის სავალდებულო განახლება
 */
export async function completePasswordChange(user, db, newPassword) {
  if (!user) throw new Error('ავტორიზაცია არ მოიძებნა');
  if (!newPassword || newPassword.length < 6) {
    throw new Error('ახალი პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს');
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
 * კითხულობს ყველა ადმინისტრატორისა და მოდერატორის სიას
 */
export async function getAdminsList(db) {
  const list = [
    {
      id: 'super-admin',
      email: SUPER_ADMIN_EMAIL,
      role: 'superadmin',
      isSuperAdmin: true,
      isActive: true,
      status: 'active',
      hasJoined: true,
      mustChangePassword: false,
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
        const hasJoined = Boolean(data.hasJoined || data.joinedAt || data.passwordChangedAt);
        const status = data.status ? data.status : (hasJoined ? 'active' : 'pending');

        list.push({
          id: d.id,
          email: docEmail,
          role: data.role === 'moderator' ? 'moderator' : 'admin',
          isSuperAdmin: false,
          isActive: data.isActive !== false,
          status,
          hasJoined,
          joinedAt: data.joinedAt || null,
          invitedAt: data.invitedAt || data.addedAt || null,
          mustChangePassword: Boolean(data.mustChangePassword),
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

/**
 * როლის შეცვლა (admin <-> moderator)
 */
export async function updateAdminRole(db, email, newRole) {
  if (!db) throw new Error('მონაცემთა ბაზა მიუწვდომელია');
  const cleanEmail = (email || '').trim().toLowerCase();
  if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
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

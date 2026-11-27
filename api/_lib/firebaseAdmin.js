import admin from 'firebase-admin';

export const SUPER_ADMIN_EMAIL = 'datiglonti@gmail.com';

export function initFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'jewelry-4fdb3';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';

    if (!clientEmail || !rawKey) {
      throw new Error('Firebase Admin credentials (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY) are not configured');
    }

    rawKey = rawKey.trim();
    if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
      rawKey = rawKey.slice(1, -1);
    }
    const privateKey = rawKey.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  return admin;
}

export function getAdminDb() {
  return initFirebaseAdmin().firestore();
}

export function getAdminAuth() {
  return initFirebaseAdmin().auth();
}

export async function verifyAuthToken(req) {
  const authHeader = req?.headers?.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  try {
    const auth = getAdminAuth();
    return await auth.verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function verifyAdminRole(req, allowedRoles = ['superadmin', 'admin']) {
  const decoded = await verifyAuthToken(req);
  if (!decoded || !decoded.email) return null;

  const email = decoded.email.toLowerCase().trim();
  if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
    if (!allowedRoles.includes('superadmin')) return null;
    return { decoded, email, role: 'superadmin', isSuperAdmin: true };
  }

  const db = getAdminDb();
  const snap = await db.collection('admins').doc(email).get();
  if (!snap.exists) return null;

  const data = snap.data() || {};
  if (data.isActive === false) return null;

  const role = data.role === 'moderator' ? 'moderator' : 'admin';
  if (!allowedRoles.includes(role)) return null;

  return { decoded, email, role, isSuperAdmin: false, adminData: data };
}

export function stripPrivateSettings(settings) {
  if (!settings || typeof settings !== 'object') return {};
  const { promoCodes, ...publicSettings } = settings;
  return publicSettings;
}

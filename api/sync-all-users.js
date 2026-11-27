// api/sync-all-users.js
import admin from 'firebase-admin';
import { getAdminAuth, getAdminDb, verifyAdminRole } from './_lib/firebaseAdmin.js';
import { setCorsHeaders } from './_lib/security.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res, 'POST, GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const adminCtx = await verifyAdminRole(req, ['superadmin', 'admin']);
    if (!adminCtx) {
      return res.status(403).json({ error: 'წვდომა აკრძალულია: მხოლოდ ადმინისტრატორს აქვს უფლება' });
    }

    const auth = getAdminAuth();
    const db = getAdminDb();

    const listResult = await auth.listUsers(1000);
    const usersBatch = listResult.users;

    let count = 0;
    const sanitizedUsers = [];

    for (const u of usersBatch) {
      const userRef = db.collection('users').doc(u.uid);
      const email = u.email ? u.email.toLowerCase().trim() : '';
      const displayName = u.displayName || (email ? email.split('@')[0] : 'მომხმარებელი');
      const photoURL = u.photoURL || '';
      const isGoogle = (u.providerData || []).some((p) => p.providerId === 'google.com');
      const provider = isGoogle ? 'google' : 'password';

      const createdAtDate = u.metadata.creationTime ? new Date(u.metadata.creationTime) : new Date();
      const lastLoginDate = u.metadata.lastSignInTime ? new Date(u.metadata.lastSignInTime) : createdAtDate;

      const userRecord = {
        id: u.uid,
        uid: u.uid,
        email,
        displayName,
        photoURL,
        provider,
        createdAt: admin.firestore.Timestamp.fromDate(createdAtDate),
        lastLoginAt: admin.firestore.Timestamp.fromDate(lastLoginDate),
      };

      await userRef.set(userRecord, { merge: true });
      sanitizedUsers.push({
        ...userRecord,
        createdAt: createdAtDate.toISOString(),
        lastLoginAt: lastLoginDate.toISOString(),
      });
      count++;
    }

    return res.status(200).json({
      success: true,
      syncedCount: count,
      users: sanitizedUsers,
      message: `სრულად დასინქრონირდა ${count} მომხმარებელი`,
    });
  } catch (err) {
    console.error('sync-all-users error:', err);
    return res.status(500).json({ error: err.message || 'სინქრონიზაციის შეცდომა' });
  }
}

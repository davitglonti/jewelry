// api/sync-all-users.js
import admin from 'firebase-admin';

const SUPER_ADMIN_EMAIL = 'datiglonti@gmail.com';

function initFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'jewelry-4fdb3';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';

    if (!clientEmail || !rawKey) {
      throw new Error('Firebase Admin-ის პარამეტრები (CLIENT_EMAIL / PRIVATE_KEY) არ არის მითითებული');
    }

    rawKey = rawKey.trim();
    if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
      rawKey = rawKey.slice(1, -1);
    }
    if (rawKey.startsWith("'") && rawKey.endsWith("'")) {
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
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    initFirebaseAdmin();

    // 1. ავტორიზაციის შემოწმება (მხოლოდ ადმინისტრატორს)
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return res.status(401).json({ error: 'ავტორიზაციის ტოკენი არ არის მითითებული' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const callerEmail = (decodedToken.email || '').toLowerCase().trim();

    // ვამოწმებთ არის თუ არა ადმინისტრატორი
    const db = admin.firestore();
    const adminDoc = await db.collection('admins').doc(callerEmail).get();
    const isSuper = callerEmail === SUPER_ADMIN_EMAIL.toLowerCase();
    const isAdmin = adminDoc.exists && adminDoc.data()?.role === 'admin' && adminDoc.data()?.isActive !== false;

    if (!isSuper && !isAdmin) {
      return res.status(403).json({ error: 'წვდომა აკრძალულია: მხოლოდ ადმინისტრატორს აქვს უფლება' });
    }

    // 2. Firebase Auth-ის მომხმარებელთა წამოღება
    const listResult = await admin.auth().listUsers(1000);
    const usersBatch = listResult.users;

    // 3. Firestore /users-ში სინქრონიზაცია და ფორმატირება
    let count = 0;
    const sanitizedUsers = [];

    for (const u of usersBatch) {
      const userRef = db.collection('users').doc(u.uid);
      const email = u.email ? u.email.toLowerCase().trim() : '';
      const displayName = u.displayName || (email ? email.split('@')[0] : 'მომხმარებელი');
      const photoURL = u.photoURL || '';
      const isGoogle = (u.providerData || []).some(p => p.providerId === 'google.com');
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
      message: `სრულად დასინქრონირდა ${count} მომხმარებელი`
    });
  } catch (err) {
    console.error('sync-all-users error:', err);
    return res.status(500).json({ error: err.message || 'სინქრონიზაციის შეცდომა' });
  }
}

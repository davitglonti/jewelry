// api/activate-admin-account.js
import admin from 'firebase-admin';

function initFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'jewelry-4fdb3';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';

    if (!clientEmail || !rawKey) return;

    rawKey = rawKey.trim();
    if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.slice(1, -1);
    if (rawKey.startsWith("'") && rawKey.endsWith("'")) rawKey = rawKey.slice(1, -1);
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    initFirebaseAdmin();
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = (body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const firestore = admin.firestore();
    const docRef = firestore.collection('admins').doc(email);
    const snap = await docRef.get();

    if (snap.exists) {
      await docRef.set({
        status: 'active',
        hasJoined: true,
        joinedAt: Date.now()
      }, { merge: true });
    }

    return res.status(200).json({ success: true, email });
  } catch (err) {
    console.error('activate-admin-account error:', err);
    return res.status(500).json({ error: err.message });
  }
}

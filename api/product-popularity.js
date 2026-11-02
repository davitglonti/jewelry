// api/product-popularity.js
import admin from 'firebase-admin';

function getAdminFirestore() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'jewelry-4fdb3';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';

    if (!clientEmail || !rawKey) {
      throw new Error('Firebase Admin-ის პარამეტრები არ არის მითითებული');
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

  return admin.firestore();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Vercel Edge Cache: 5 წუთი ქეშირება, 10 წუთამდე stale-while-revalidate (ზოგავს Firebase reads)
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('productStats').get();
    const popularity = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      popularity[doc.id] = typeof data.views === 'number' ? data.views : 0;
    });

    return res.status(200).json({
      success: true,
      popularity,
    });
  } catch (err) {
    console.error('Error fetching product popularity:', err);
    return res.status(500).json({
      error: err.message || 'Failed to fetch product popularity',
      popularity: {},
    });
  }
}

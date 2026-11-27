// api/product-popularity.js
import { getAdminDb } from './_lib/firebaseAdmin.js';
import { setCorsHeaders } from './_lib/security.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res, 'GET, OPTIONS', 'Content-Type');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const db = getAdminDb();
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

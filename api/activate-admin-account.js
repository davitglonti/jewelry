// api/activate-admin-account.js
import { getAdminDb, SUPER_ADMIN_EMAIL, verifyAuthToken } from './_lib/firebaseAdmin.js';
import { setCorsHeaders, parseBody } from './_lib/security.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded || !decoded.email) {
      return res.status(401).json({ error: 'ავტორიზაცია აუცილებელია' });
    }

    const callerEmail = decoded.email.trim().toLowerCase();
    const body = parseBody(req);
    const requestedEmail = (body.email || callerEmail).trim().toLowerCase();

    if (requestedEmail !== callerEmail && callerEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: 'სხვა მომხმარებლის ანგარიშის გააქტიურება აკრძალულია' });
    }

    const firestore = getAdminDb();
    const docRef = firestore.collection('admins').doc(requestedEmail);
    const snap = await docRef.get();

    if (!snap.exists || snap.data()?.isActive === false) {
      return res.status(403).json({ error: 'ადმინისტრატორის ჩანაწერი ვერ მოიძებნა ან გაუქმებულია' });
    }

    await docRef.set(
      {
        status: 'active',
        hasJoined: true,
        joinedAt: Date.now(),
      },
      { merge: true }
    );

    return res.status(200).json({ success: true, email: requestedEmail });
  } catch (err) {
    console.error('activate-admin-account error:', err);
    return res.status(500).json({ error: 'აქტივაციის სერვერული შეცდომა' });
  }
}

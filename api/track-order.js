import { getAdminDb, SUPER_ADMIN_EMAIL, verifyAuthToken } from './_lib/firebaseAdmin.js';
import { setCorsHeaders, parseBody, getClientIp, checkRateLimit } from './_lib/security.js';
import { sanitizeOrderForPublicTracking } from './_lib/orders.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const ip = getClientIp(req);
  const rl = checkRateLimit(`track-order:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'ძალიან ბევრი მოთხოვნაა. სცადეთ მოგვიანებით.' });
  }

  try {
    const body = parseBody(req);
    const rawQuery = String(body.query || '').trim();
    const cleanQuery = rawQuery.toLowerCase().replace(/^#/, '');

    if (!cleanQuery) {
      return res.status(400).json({ error: 'მიუთითეთ შეკვეთის კოდი ან ტელეფონის ნომერი' });
    }

    const db = getAdminDb();
    const decoded = await verifyAuthToken(req);
    const callerEmail = decoded?.email ? decoded.email.toLowerCase().trim() : '';

    let isAdminCaller = false;
    if (callerEmail) {
      if (callerEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
        isAdminCaller = true;
      } else {
        const adminSnap = await db.collection('admins').doc(callerEmail).get();
        if (adminSnap.exists && adminSnap.data()?.isActive !== false && adminSnap.data()?.role === 'admin') {
          isAdminCaller = true;
        }
      }
    }

    const cleanedDigits = cleanQuery.replace(/[^0-9]/g, '');
    let matchedOrder = null;

    // 1. Direct lookup in /inquiries collection by ID
    if (cleanQuery.startsWith('mtr-') || cleanQuery.length >= 4) {
      const upperId = rawQuery.trim().replace(/^#/, '').toUpperCase();
      const docSnap = await db.collection('inquiries').doc(upperId).get();
      if (docSnap.exists) {
        matchedOrder = { id: docSnap.id, ...docSnap.data() };
      }
    }

    // 2. Phone lookup in /inquiries collection (requires >= 9 digits to avoid enumeration)
    if (!matchedOrder && cleanedDigits.length >= 9) {
      const normalizedDigits = cleanedDigits.replace(/^995/, '');
      const candidates = [cleanedDigits, normalizedDigits, `995${normalizedDigits}`, `+995${normalizedDigits}`];
      for (const phoneCandidate of candidates) {
        const qSnap = await db
          .collection('inquiries')
          .where('clientPhone', '==', phoneCandidate)
          .limit(5)
          .get();
        if (!qSnap.empty) {
          const docs = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          docs.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
          matchedOrder = docs[0];
          break;
        }
      }
    }

    // 3. Fallback to legacy aurelia/storeData.inquiries for older orders not yet migrated
    if (!matchedOrder && (cleanQuery.startsWith('mtr-') || cleanedDigits.length >= 9)) {
      const storeSnap = await db.collection('aurelia').doc('storeData').get();
      const legacyList = storeSnap.exists && Array.isArray(storeSnap.data()?.inquiries) ? storeSnap.data().inquiries : [];
      matchedOrder =
        legacyList.find((inq) => {
          if (inq?.id && inq.id.toLowerCase().replace(/^#/, '') === cleanQuery) return true;
          if (cleanedDigits.length >= 9 && inq?.clientPhone) {
            const p = String(inq.clientPhone).replace(/[^0-9]/g, '');
            return p.endsWith(cleanedDigits.slice(-9));
          }
          return false;
        }) || null;
    }

    if (!matchedOrder) {
      return res.status(404).json({ found: false, order: null });
    }

    const isOwner =
      isAdminCaller ||
      (callerEmail && matchedOrder.clientEmail && matchedOrder.clientEmail.toLowerCase().trim() === callerEmail);

    return res.status(200).json({
      found: true,
      order: sanitizeOrderForPublicTracking(matchedOrder, isOwner),
    });
  } catch (err) {
    console.error('track-order error:', err);
    return res.status(500).json({ error: 'შეკვეთის შემოწმების შეცდომა' });
  }
}

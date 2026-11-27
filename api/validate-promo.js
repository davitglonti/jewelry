import { getAdminDb } from './_lib/firebaseAdmin.js';
import { setCorsHeaders, parseBody, getClientIp, checkRateLimit } from './_lib/security.js';
import { loadStoreConfig, evaluatePromoCode } from './_lib/orders.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const ip = getClientIp(req);
  const rl = checkRateLimit(`validate-promo:${ip}`, 25, 60_000);
  if (!rl.allowed) {
    return res.status(429).json({
      valid: false,
      error: 'ძალიან ბევრი მცდელობაა. გთხოვთ სცადოთ 1 წუთში.',
    });
  }

  try {
    const body = parseBody(req);
    const lang = body.lang === 'en' ? 'en' : 'ka';
    const subtotal = Number(body.subtotal) || 0;

    const db = getAdminDb();
    const { promoCodes } = await loadStoreConfig(db);
    const result = evaluatePromoCode(promoCodes, body.code, subtotal, lang);

    if (!result.valid) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('validate-promo error:', err);
    return res.status(500).json({
      valid: false,
      error: 'პრომო კოდის შემოწმება ვერ მოხერხდა',
    });
  }
}

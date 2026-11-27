// api/send-order-tracking.js
import { getAdminDb, verifyAdminRole, verifyAuthToken } from './_lib/firebaseAdmin.js';
import { setCorsHeaders, parseBody, resolveSafeOrigin, getClientIp, checkRateLimit } from './_lib/security.js';
import { buildCustomerOrderEmailHtml, sendResendEmail } from './_lib/orders.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const ip = getClientIp(req);
  const rl = checkRateLimit(`order-track-mail:${ip}`, 10, 10 * 60_000);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    const adminCtx = await verifyAdminRole(req, ['superadmin', 'admin']);
    const decodedUser = adminCtx ? adminCtx.decoded : await verifyAuthToken(req);

    if (!decodedUser || !decodedUser.email) {
      return res.status(401).json({ error: 'ავტორიზაცია აუცილებელია' });
    }

    const body = parseBody(req);
    const reqOrder = body.order || {};
    const orderId = String(reqOrder.id || body.orderId || '').trim();

    if (!orderId) {
      return res.status(400).json({ error: 'შეკვეთის კოდი აუცილებელია' });
    }

    const db = getAdminDb();
    const orderSnap = await db.collection('inquiries').doc(orderId).get();
    if (!orderSnap.exists) {
      return res.status(404).json({ error: 'შეკვეთა ვერ მოიძებნა' });
    }

    const dbOrder = { id: orderSnap.id, ...orderSnap.data() };
    const callerEmail = decodedUser.email.toLowerCase().trim();
    const orderOwnerEmail = (dbOrder.clientEmail || '').toLowerCase().trim();

    if (!adminCtx && callerEmail !== orderOwnerEmail) {
      return res.status(403).json({ error: 'წვდომა აკრძალულია' });
    }

    const targetEmail = orderOwnerEmail || (adminCtx ? String(reqOrder.clientEmail || body.email || '').trim().toLowerCase() : '');
    if (!targetEmail) {
      return res.status(400).json({ error: 'ელფოსტის მისამართი არ არის მითითებული' });
    }

    const baseUrl = resolveSafeOrigin(body.origin);
    const trackingLink = `${baseUrl}/track?id=${encodeURIComponent(dbOrder.id)}`;

    if (!process.env.RESEND_API_KEY) {
      return res.status(200).json({
        success: true,
        simulated: true,
        message: 'Email tracking simulated locally',
        trackingLink,
      });
    }

    const resendRes = await sendResendEmail({
      to: targetEmail,
      subject: `თქვენი შეკვეთის თრექინგი #${dbOrder.id} — მატარე`,
      html: buildCustomerOrderEmailHtml(dbOrder, trackingLink),
    });

    if (!resendRes.ok) {
      console.error('Resend order tracking email error:', resendRes.data);
      return res.status(502).json({
        success: false,
        error: resendRes.data?.message || 'Resend error',
      });
    }

    return res.status(200).json({
      success: true,
      data: resendRes.data,
      trackingLink,
    });
  } catch (err) {
    console.error('Error in send-order-tracking:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

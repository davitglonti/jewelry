// api/send-order-notification.js
import { getAdminDb, verifyAdminRole } from './_lib/firebaseAdmin.js';
import { setCorsHeaders, parseBody, resolveSafeOrigin, getClientIp, checkRateLimit } from './_lib/security.js';
import { loadStoreConfig, buildAdminOrderEmailHtml, buildCustomerOrderEmailHtml, sendResendEmail } from './_lib/orders.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const ip = getClientIp(req);
  const rl = checkRateLimit(`order-notif:${ip}`, 10, 10 * 60_000);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    const body = parseBody(req);
    const reqOrder = body.order || {};
    const orderId = String(reqOrder.id || body.orderId || '').trim();
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const db = getAdminDb();
    const adminCtx = await verifyAdminRole(req, ['superadmin', 'admin']);

    // Verify order exists in Firestore (blocks arbitrary unauthenticated spam relay)
    const orderRef = db.collection('inquiries').doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      return res.status(404).json({ error: 'შეკვეთა ბაზაში ვერ მოიძებნა' });
    }

    const dbOrder = { id: orderSnap.id, ...orderSnap.data() };
    if (!adminCtx && dbOrder.notificationSent) {
      return res.status(200).json({ success: true, alreadySent: true });
    }

    const { settings } = await loadStoreConfig(db);
    // NEVER trust arbitrary body.adminEmail from unauthenticated callers
    const adminRecipient =
      settings?.email ||
      settings?.contactEmail ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.RESEND_TO_EMAIL ||
      'info@matare.store';

    const baseUrl = resolveSafeOrigin(body.origin);
    const trackingLink = `${baseUrl}/track?id=${encodeURIComponent(dbOrder.id)}`;
    const adminLink = `${baseUrl}/admin?tab=inquiries&id=${encodeURIComponent(dbOrder.id)}`;

    if (!process.env.RESEND_API_KEY) {
      return res.status(200).json({
        success: true,
        simulated: true,
        message: 'Notification emails simulated successfully',
      });
    }

    const emailPromises = [
      sendResendEmail({
        to: adminRecipient,
        subject: `🔔 ახალი შეკვეთა #${dbOrder.id} — ${dbOrder.clientName || 'მომხმარებელი'} (${dbOrder.totalPrice} ₾)`,
        html: buildAdminOrderEmailHtml(dbOrder, adminLink),
      }).catch((e) => console.error('Failed sending admin email:', e)),
    ];

    if (dbOrder.clientEmail) {
      emailPromises.push(
        sendResendEmail({
          to: dbOrder.clientEmail,
          subject: `თქვენი შეკვეთა #${dbOrder.id} მიღებულია — მატარე`,
          html: buildCustomerOrderEmailHtml(dbOrder, trackingLink),
        }).catch((e) => console.error('Failed sending customer email:', e))
      );
    }

    await Promise.allSettled(emailPromises);
    await orderRef.set({ notificationSent: true }, { merge: true });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error in send-order-notification:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

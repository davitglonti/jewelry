import crypto from 'node:crypto';
import { getAdminDb, verifyAuthToken } from './_lib/firebaseAdmin.js';
import { setCorsHeaders, parseBody, resolveSafeOrigin, getClientIp, checkRateLimit } from './_lib/security.js';
import {
  parseNumericPrice,
  loadStoreConfig,
  evaluatePromoCode,
  buildAdminOrderEmailHtml,
  buildCustomerOrderEmailHtml,
  sendResendEmail,
} from './_lib/orders.js';
import { DEFAULT_PRODUCTS } from '../src/data/defaultProducts.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const ip = getClientIp(req);
  const rl = checkRateLimit(`create-order:${ip}`, 10, 10 * 60_000);
  if (!rl.allowed) {
    return res.status(429).json({
      error: 'ძალიან ბევრი მოთხოვნაა. გთხოვთ სცადოთ რამდენიმე წუთში.',
    });
  }

  try {
    const body = parseBody(req);
    const lang = body.lang === 'en' ? 'en' : 'ka';

    const clientName = String(body.clientName || '').trim();
    const cleanedPhone = String(body.clientPhone || '').replace(/[\s\-()]/g, '');
    const clientEmail = String(body.clientEmail || '').trim().toLowerCase();
    const deliveryType = body.deliveryType === 'showroom' ? 'showroom' : 'courier';
    const city = String(body.city || 'თბილისი').trim().slice(0, 80);
    const address = String(body.address || '').trim().slice(0, 300);
    const paymentType = body.paymentType === 'cod' ? 'cod' : 'card';
    const isGift = Boolean(body.isGift);
    const notes = String(body.notes || '').trim().slice(0, 500);
    const requestedItems = Array.isArray(body.items) ? body.items : [];
    const promoCode = String(body.promoCode || '').trim().toUpperCase();

    if (!clientName || clientName.length > 120) {
      return res.status(400).json({
        error: lang === 'ka' ? 'გთხოვთ შეიყვანოთ სწორი სახელი და გვარი' : 'Please enter a valid full name',
      });
    }

    if (!/^(\+?995)?5\d{8}$/.test(cleanedPhone)) {
      return res.status(400).json({
        error:
          lang === 'ka'
            ? 'შეიყვანეთ სწორი ქართული მობილურის ნომერი (მაგ: 555 12 34 56)'
            : 'Please enter a valid Georgian phone number (e.g. 555 12 34 56)',
      });
    }

    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return res.status(400).json({
        error: lang === 'ka' ? 'გთხოვთ მიუთითოთ სწორი ელფოსტა' : 'Please enter a valid email address',
      });
    }

    if (deliveryType === 'courier' && !address) {
      return res.status(400).json({
        error: lang === 'ka' ? 'გთხოვთ მიუთითოთ მიწოდების მისამართი' : 'Please enter delivery address',
      });
    }

    if (requestedItems.length === 0 || requestedItems.length > 25) {
      return res.status(400).json({
        error: lang === 'ka' ? 'შეკვეთის სია ცარიელია ან აჭარბებს ლიმიტს' : 'Invalid order items list',
      });
    }

    const db = getAdminDb();
    const decodedUser = await verifyAuthToken(req);

    // Load authoritative catalog and pricing configuration from Firestore
    const [productsSnap, storeConfig] = await Promise.all([
      db.collection('products').get(),
      loadStoreConfig(db),
    ]);

    const catalogList = productsSnap.empty
      ? DEFAULT_PRODUCTS
      : productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const resolvedItems = [];
    for (const reqItem of requestedItems) {
      const targetId = String(reqItem?.id || '').trim().toLowerCase();
      const targetSku = String(reqItem?.sku || '').trim().toLowerCase();
      const match = catalogList.find(
        (p) =>
          (targetId && String(p.id || '').toLowerCase() === targetId) ||
          (targetSku && String(p.sku || '').toLowerCase() === targetSku)
      );

      if (!match) {
        return res.status(400).json({
          error:
            lang === 'ka'
              ? 'არჩეული სამკაული კატალოგში ვერ მოიძებნა'
              : 'One or more selected items could not be found in catalog',
        });
      }

      const itemSize =
        String(reqItem?.size || '').trim().slice(0, 30) ||
        (Array.isArray(match.sizes) && match.sizes.length > 0 ? String(match.sizes[0]) : '') ||
        'სტანდარტული';

      resolvedItems.push({
        id: match.id,
        name: match.name || 'სამკაული',
        price: match.price,
        sku: match.sku || match.id,
        size: itemSize,
      });
    }

    const rawSubtotal = resolvedItems.reduce((sum, it) => sum + parseNumericPrice(it.price), 0);

    const { settings, promoCodes, promoSource } = storeConfig;
    const parseRate = (val, fallback) => {
      if (val === null || val === undefined || val === '') return fallback;
      const n = Number(val);
      return Number.isFinite(n) && n >= 0 ? n : fallback;
    };

    const deliveryPriceTbilisi = parseRate(settings?.deliveryPriceTbilisi, 6);
    const deliveryPriceRegional = parseRate(settings?.deliveryPriceRegional, 10);
    const giftPackagingPrice = parseRate(settings?.giftPackagingPrice, 5);

    let appliedPromo = null;
    let discountAmount = 0;

    if (promoCode) {
      const evalResult = evaluatePromoCode(promoCodes, promoCode, rawSubtotal, lang);
      if (!evalResult.valid) {
        return res.status(400).json({ error: evalResult.error });
      }
      appliedPromo = evalResult.promo;

      if (appliedPromo.type === 'fixed') {
        discountAmount = Math.min(rawSubtotal, appliedPromo.value);
      } else if (appliedPromo.type === 'percentage') {
        discountAmount = Math.round(rawSubtotal * appliedPromo.percent);
      }
    }

    const isTbilisi = city === 'თბილისი';
    const baseShippingFee = deliveryType === 'showroom' ? 0 : isTbilisi ? deliveryPriceTbilisi : deliveryPriceRegional;
    const shippingFee = appliedPromo?.type === 'free_shipping' ? 0 : baseShippingFee;
    const giftFee = isGift ? giftPackagingPrice : 0;
    const finalTotal = Math.max(0, rawSubtotal - discountAmount) + shippingFee + giftFee;

    // Generate collision-safe order ID
    let orderId = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `MTR-${crypto.randomInt(100000, 1000000)}`;
      const existing = await db.collection('inquiries').doc(candidate).get();
      if (!existing.exists) {
        orderId = candidate;
        break;
      }
    }
    if (!orderId) {
      orderId = `MTR-${Date.now().toString().slice(-6)}`;
    }

    const showroomAddr = settings?.address || 'თბილისი, რუსთაველის გამზ. #24';
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleString('ka-GE'),
      createdAtMs: Date.now(),
      userId: decodedUser?.uid || null,
      clientName,
      clientPhone: cleanedPhone,
      clientEmail,
      deliveryMethod: deliveryType === 'showroom' ? 'შოურუმში გატანა' : `კურიერით (${city})`,
      city: deliveryType === 'showroom' ? 'თბილისი' : city,
      address: deliveryType === 'showroom' ? showroomAddr : `${city}, ${address}`,
      paymentMethod: paymentType === 'card' ? 'ონლაინ ბარათით' : 'კურიერთან გადახდა',
      // Critical security fix: payment status MUST remain pending until verified by payment gateway or admin
      paymentStatus: 'გადასახდელია',
      isGift,
      giftFee,
      shippingFee,
      notes,
      items: resolvedItems,
      itemsCount: resolvedItems.length,
      productName: resolvedItems
        .map((it) => `${it.name}${it.size && it.size !== 'სტანდარტული' ? ` (ზომა: ${it.size})` : ''}`)
        .join(', '),
      sku: resolvedItems.map((it) => it.sku).join(', '),
      totalPrice: finalTotal,
      rawSubtotal,
      discountAmount,
      promoApplied: appliedPromo?.code || null,
      status: 'ახალი შეკვეთა',
      notificationSent: true,
    };

    // Persist order into private /inquiries collection and atomically increment coupon usage
    await db.runTransaction(async (tx) => {
      const orderRef = db.collection('inquiries').doc(orderId);
      let privateRef = null;
      let nextPromoCodes = null;

      if (appliedPromo) {
        privateRef = db.collection('aurelia').doc('privateConfig');
        const privateSnap = await tx.get(privateRef);
        const currentList =
          privateSnap.exists && Array.isArray(privateSnap.data()?.promoCodes) && privateSnap.data().promoCodes.length > 0
            ? privateSnap.data().promoCodes
            : promoSource === 'legacySettings'
            ? promoCodes
            : promoCodes;

        nextPromoCodes = currentList.map((c) => {
          if (c?.code?.toUpperCase() === appliedPromo.code) {
            if (c.maxUses && (c.usedCount || 0) >= c.maxUses) {
              throw new Error('PROMO_EXHAUSTED');
            }
            return { ...c, usedCount: (c.usedCount || 0) + 1 };
          }
          return c;
        });
      }

      tx.set(orderRef, newOrder);
      if (privateRef && nextPromoCodes) {
        tx.set(privateRef, { promoCodes: nextPromoCodes, updatedAt: new Date().toISOString() }, { merge: true });
      }
    });

    // Send notifications server-side using authoritative order data
    const baseUrl = resolveSafeOrigin(body.origin);
    const trackingLink = `${baseUrl}/track?id=${encodeURIComponent(orderId)}`;
    const adminLink = `${baseUrl}/admin?tab=inquiries&id=${encodeURIComponent(orderId)}`;
    const adminRecipient =
      settings?.email ||
      settings?.contactEmail ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.RESEND_TO_EMAIL ||
      'info@matare.store';

    const emailTasks = [
      sendResendEmail({
        to: adminRecipient,
        subject: `🔔 ახალი შეკვეთა #${orderId} — ${clientName} (${finalTotal} ₾)`,
        html: buildAdminOrderEmailHtml(newOrder, adminLink),
      }).catch((e) => console.error('Admin order email error:', e)),
    ];

    if (clientEmail) {
      emailTasks.push(
        sendResendEmail({
          to: clientEmail,
          subject: `თქვენი შეკვეთა #${orderId} მიღებულია — მატარე`,
          html: buildCustomerOrderEmailHtml(newOrder, trackingLink),
        }).catch((e) => console.error('Customer order email error:', e))
      );
    }

    await Promise.allSettled(emailTasks);

    return res.status(200).json({
      success: true,
      order: newOrder,
    });
  } catch (err) {
    if (err?.message === 'PROMO_EXHAUSTED') {
      return res.status(400).json({
        error: 'პრომო კოდის გამოყენების ლიმიტი ამოწურულია',
      });
    }
    console.error('create-order error:', err);
    return res.status(500).json({
      error: 'შეკვეთის შექმნისას დაფიქსირდა სერვერული შეცდომა',
    });
  }
}

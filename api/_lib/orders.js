import { escapeHtml } from './security.js';

export const DEFAULT_PROMO_CODES = [
  {
    id: 'promo-vip10',
    code: 'VIP-AURELIA10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 0,
    maxUses: null,
    usedCount: 0,
    isActive: true,
    expiresAt: null,
    description: '-10% VIP ფასდაკლება',
  },
  {
    id: 'promo-matare10',
    code: 'MATARE10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 0,
    maxUses: null,
    usedCount: 0,
    isActive: true,
    expiresAt: null,
    description: '10% ფასდაკლება პირველ შეკვეთაზე',
  },
  {
    id: 'promo-freeship',
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    minOrderAmount: 200,
    maxUses: null,
    usedCount: 0,
    isActive: true,
    expiresAt: null,
    description: 'უფასო საკურიერო მიწოდება (200₾-ზე ზემოთ)',
  },
];

export function parseNumericPrice(val) {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  const cleaned = String(val || '0').replace(/,/g, '').replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function loadStoreConfig(db) {
  const [storeSnap, privateSnap] = await Promise.all([
    db.collection('aurelia').doc('storeData').get(),
    db.collection('aurelia').doc('privateConfig').get(),
  ]);

  const storeData = storeSnap.exists ? storeSnap.data() || {} : {};
  const settings = storeData.settings || {};
  const privateData = privateSnap.exists ? privateSnap.data() || {} : {};

  let promoCodes = null;
  let promoSource = 'default';
  if (Array.isArray(privateData.promoCodes) && privateData.promoCodes.length > 0) {
    promoCodes = privateData.promoCodes;
    promoSource = 'privateConfig';
  } else if (Array.isArray(settings.promoCodes) && settings.promoCodes.length > 0) {
    promoCodes = settings.promoCodes;
    promoSource = 'legacySettings';
  } else {
    promoCodes = DEFAULT_PROMO_CODES;
  }

  return { storeData, settings, promoCodes, promoSource };
}

export function evaluatePromoCode(promoCodes, rawCode, rawSubtotal, lang = 'ka') {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) {
    return { valid: false, error: lang === 'ka' ? 'შეიყვანეთ პრომო კოდი' : 'Enter promo code' };
  }

  const list = Array.isArray(promoCodes) && promoCodes.length > 0 ? promoCodes : DEFAULT_PROMO_CODES;
  const match = list.find((c) => c?.code?.toUpperCase() === code);

  if (!match || match.isActive === false) {
    return { valid: false, error: lang === 'ka' ? 'არასწორი პრომო კოდი' : 'Invalid promo code' };
  }

  if (match.expiresAt) {
    const exp = new Date(match.expiresAt);
    if (!isNaN(exp.getTime()) && exp < new Date()) {
      return { valid: false, error: lang === 'ka' ? 'პრომო კოდს ვადა გაუვიდა' : 'Promo code has expired' };
    }
  }

  if (match.maxUses && (match.usedCount || 0) >= match.maxUses) {
    return {
      valid: false,
      error: lang === 'ka' ? 'პრომო კოდის გამოყენების ლიმიტი ამოწურულია' : 'Promo code usage limit reached',
    };
  }

  if (match.minOrderAmount && rawSubtotal < match.minOrderAmount) {
    return {
      valid: false,
      error:
        lang === 'ka'
          ? `პრომო კოდი მოითხოვს მინიმუმ ${match.minOrderAmount} ₾ შეკვეთას`
          : `Promo code requires minimum order of ${match.minOrderAmount} GEL`,
    };
  }

  const label =
    match.description ||
    (match.type === 'percentage'
      ? `-${match.value}% ${match.code === 'VIP-AURELIA10' ? 'VIP ფასდაკლება' : 'ფასდაკლება'}`
      : match.type === 'free_shipping'
      ? lang === 'ka'
        ? 'უფასო მიწოდება'
        : 'Free Shipping'
      : `-${match.value} ₾ ფასდაკლება`);

  const percent = match.type === 'percentage' ? (Number(match.value) || 0) / 100 : 0;

  return {
    valid: true,
    promo: {
      id: match.id || code,
      code: match.code,
      type: match.type || 'percentage',
      value: Number(match.value) || 0,
      percent,
      label,
    },
  };
}

function buildOrderItemsHtml(items) {
  return (items || [])
    .map(
      (it) => `
      <tr style="border-bottom: 1px solid #292524;">
        <td style="padding: 12px 0; color: #f5f0e6; font-size: 13px; font-weight: 500;">
          ${escapeHtml(it.name || 'სამკაული')}
          ${it.sku ? `<span style="color: #a8a29e; font-size: 11px; margin-left: 6px;">(#${escapeHtml(it.sku)})</span>` : ''}
          ${it.size ? `<br/><span style="color: #f59e0b; font-size: 11px;">ზომა: ${escapeHtml(it.size)}</span>` : ''}
        </td>
        <td align="right" style="padding: 12px 0; color: #f59e0b; font-size: 13px; font-family: monospace; font-weight: 700;">
          ${escapeHtml(it.price || 0)} ₾
        </td>
      </tr>
    `
    )
    .join('');
}

export function buildAdminOrderEmailHtml(order, adminLink) {
  const safeId = escapeHtml(order.id || '');
  const itemsHtml = buildOrderItemsHtml(order.items);
  return `<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <title>ახალი შეკვეთა #${safeId} — მატარე</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0b0a; color: #f5f0e6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c0b0a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #141210; border: 1px solid #292524; border-radius: 24px; padding: 36px 32px; box-shadow: 0 25px 50px rgba(0,0,0,0.85);">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="display: inline-block; padding: 6px 14px; border-radius: 20px; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #f59e0b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                🔔 ახალი ონლაინ შეკვეთა
              </span>
              <h1 style="margin: 14px 0 4px; font-family: Georgia, serif; font-size: 28px; color: #f5f0e6; letter-spacing: 2px;">#${safeId}</h1>
              <p style="margin: 0; font-size: 12px; color: #a8a29e;">თარიღი: ${escapeHtml(order.date || new Date().toLocaleString('ka-GE'))}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; background-color: #1c1a17; border-radius: 16px; border: 1px solid #292524;">
              <h3 style="margin: 0 0 12px; font-size: 13px; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px;">👤 მყიდველის მონაცემები</h3>
              <p style="margin: 4px 0; font-size: 13px;"><strong>სახელი:</strong> ${escapeHtml(order.clientName || 'მითითებული არ არის')}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>ტელეფონი:</strong> <a href="tel:${escapeHtml(order.clientPhone || '')}" style="color: #f59e0b; text-decoration: none; font-weight: bold;">${escapeHtml(order.clientPhone || '—')}</a></p>
              ${order.clientEmail ? `<p style="margin: 4px 0; font-size: 13px;"><strong>ელფოსტა:</strong> <a href="mailto:${escapeHtml(order.clientEmail)}" style="color: #f59e0b; text-decoration: none;">${escapeHtml(order.clientEmail)}</a></p>` : ''}
              <p style="margin: 4px 0; font-size: 13px;"><strong>მისამართი:</strong> ${escapeHtml(order.address || order.city || 'თბილისი')}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>გადახდის მეთოდი:</strong> ${escapeHtml(order.paymentMethod || 'კურიერთან')}</p>
              ${order.isGift ? `<p style="margin: 4px 0; font-size: 13px; color: #ec4899;"><strong>🎁 სასაჩუქრე შეფუთვა:</strong> დიახ (+${escapeHtml(order.giftFee || 5)} ₾)</p>` : ''}
              ${order.promoApplied ? `<p style="margin: 4px 0; font-size: 13px; color: #10b981;"><strong>🎟️ გამოყენებული პრომო კოდი:</strong> ${escapeHtml(order.promoApplied)} (-${escapeHtml(order.discountAmount || 0)} ₾)</p>` : ''}
              ${order.notes ? `<p style="margin: 8px 0 0; padding-top: 8px; border-top: 1px solid #292524; font-size: 12px; color: #d6d3d1;"><strong>კომენტარი:</strong> <em>„${escapeHtml(order.notes)}“</em></p>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 0 12px;">
              <h3 style="margin: 0 0 12px; font-size: 13px; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px;">🛍️ შეკვეთილი სამკაულები</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 20px; background-color: #1c1a17; border-radius: 16px; border: 1px solid #292524;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #a8a29e;">სამკაულების ჯამი:</td>
                  <td align="right" style="padding: 4px 0; font-family: monospace;">${escapeHtml(order.rawSubtotal || order.totalPrice)} ₾</td>
                </tr>
                ${order.discountAmount ? `
                <tr>
                  <td style="padding: 4px 0; color: #10b981;">ფასდაკლება (${escapeHtml(order.promoApplied)}):</td>
                  <td align="right" style="padding: 4px 0; color: #10b981; font-family: monospace;">-${escapeHtml(order.discountAmount)} ₾</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 4px 0; color: #a8a29e;">საკურიერო მიწოდება:</td>
                  <td align="right" style="padding: 4px 0; font-family: monospace;">${escapeHtml(order.shippingFee || 0)} ₾</td>
                </tr>
                ${order.giftFee ? `
                <tr>
                  <td style="padding: 4px 0; color: #a8a29e;">სასაჩუქრე შეფუთვა:</td>
                  <td align="right" style="padding: 4px 0; font-family: monospace;">+${escapeHtml(order.giftFee)} ₾</td>
                </tr>` : ''}
                <tr style="border-top: 1px solid #292524;">
                  <td style="padding: 12px 0 0; font-size: 16px; font-weight: bold; color: #f5f0e6;">სულ გადასახდელი:</td>
                  <td align="right" style="padding: 12px 0 0; font-size: 18px; font-weight: bold; font-family: monospace; color: #f59e0b;">${escapeHtml(order.totalPrice)} ₾</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 28px 0 10px;">
              <a href="${escapeHtml(adminLink)}" style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #000000; text-decoration: none; font-size: 13px; font-weight: bold; border-radius: 14px; text-transform: uppercase; letter-spacing: 1px;">
                შეკვეთის ნახვა ადმინ პანელში →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildCustomerOrderEmailHtml(order, trackingLink) {
  const safeId = escapeHtml(order.id || '');
  const itemsHtml = buildOrderItemsHtml(order.items);
  return `<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <title>თქვენი შეკვეთა #${safeId} მიღებულია — მატარე</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0b0a; color: #f5f0e6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c0b0a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #141210; border: 1px solid #292524; border-radius: 28px; padding: 44px 36px; box-shadow: 0 25px 50px rgba(0,0,0,0.85);">
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 32px; letter-spacing: 5px; color: #f59e0b; text-transform: uppercase;">MATARE</h1>
              <p style="margin: 6px 0 0; font-size: 11px; letter-spacing: 3px; color: #a8a29e; text-transform: uppercase;">საიუველირო სახლი</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 0; border-top: 1px solid #292524; border-bottom: 1px solid #292524;">
              <h2 style="margin: 0 0 12px; font-size: 20px; color: #f5f0e6; font-weight: 600;">
                გმადლობთ, ${escapeHtml(order.clientName || 'პატივცემულო მომხმარებელო')}!
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #d6d3d1;">
                თქვენი შეკვეთა <strong style="color: #f59e0b;">#${safeId}</strong> წარმატებით გაფორმდა და გადაეცა ჩვენს საიუველირო ატელიეს. ჩვენი კურიერი უახლოეს დროში დაგიკავშირდებათ მითითებულ ნომერზე (${escapeHtml(order.clientPhone || '')}).
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                ${itemsHtml}
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #292524;">
                <tr>
                  <td style="font-size: 14px; color: #a8a29e;">ჯამური თანხა:</td>
                  <td align="right" style="font-size: 18px; font-weight: bold; font-family: monospace; color: #f59e0b;">${escapeHtml(order.totalPrice)} ₾</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 32px 0 20px;">
              <a href="${escapeHtml(trackingLink)}" style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #000000; text-decoration: none; font-size: 13px; font-weight: bold; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
                შეკვეთის ლაივ-თრექინგი →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 20px; text-align: center; border-top: 1px solid #292524;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #78716c;">
                კითხვების შემთხვევაში მოგვწერეთ WhatsApp-ზე ან დაგვირეკეთ ცხელ ხაზზე.
              </p>
              <p style="margin: 0; font-size: 11px; color: #57534e;">
                © მატარე • www.matare.store
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendResendEmail({ to, subject, html }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return { ok: true, simulated: true };
  }
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'მატარე <noreply@matare.store>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function maskPersonName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => (part.length <= 1 ? part : `${part[0]}***`))
    .join(' ');
}

export function sanitizeOrderForPublicTracking(order, isAuthorizedOwner = false) {
  if (!order) return null;
  if (isAuthorizedOwner) return order;
  return {
    id: order.id,
    date: order.date,
    status: order.status || 'ახალი შეკვეთა',
    deliveryMethod: order.deliveryMethod,
    city: order.city,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    totalPrice: order.totalPrice,
    estimatedDelivery: order.estimatedDelivery,
    courierNote: order.courierNote,
    items: Array.isArray(order.items)
      ? order.items.map((it) => ({
          id: it.id,
          name: it.name,
          sku: it.sku,
          size: it.size,
          price: it.price,
        }))
      : [],
    productName: order.productName,
    clientName: maskPersonName(order.clientName),
  };
}

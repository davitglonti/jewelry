// api/send-order-notification.js

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const order = body.order || {};
    const clientOrigin = (body.origin || '').toString().trim();
    const adminEmailOverride = (body.adminEmail || '').toString().trim().toLowerCase();

    // Determine base URL for links
    let baseUrl = 'https://www.matare.store';
    if (clientOrigin && (clientOrigin.includes('localhost') || clientOrigin.includes('127.0.0.1'))) {
      baseUrl = clientOrigin.replace(/\/+$/, '');
    }

    const trackingLink = `${baseUrl}/track?id=${encodeURIComponent(order.id || '')}`;
    const adminLink = `${baseUrl}/admin?tab=inquiries&id=${encodeURIComponent(order.id || '')}`;

    const itemsHtml = (order.items || []).map((it) => `
      <tr style="border-bottom: 1px solid #292524;">
        <td style="padding: 12px 0; color: #f5f0e6; font-size: 13px; font-weight: 500;">
          ${it.name || 'სამკაული'}
          ${it.sku ? `<span style="color: #a8a29e; font-size: 11px; margin-left: 6px;">(#${it.sku})</span>` : ''}
          ${it.size ? `<br/><span style="color: #f59e0b; font-size: 11px;">ზომა: ${it.size}</span>` : ''}
        </td>
        <td align="right" style="padding: 12px 0; color: #f59e0b; font-size: 13px; font-family: monospace; font-weight: 700;">
          ${it.price || 0} ₾
        </td>
      </tr>
    `).join('');

    // 1. ADMIN NOTIFICATION EMAIL TEMPLATE
    const adminEmailHtml = `
<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <title>ახალი შეკვეთა #${order.id} — მატარე</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0b0a; color: #f5f0e6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c0b0a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #141210; border: 1px solid #292524; border-radius: 24px; padding: 36px 32px; box-shadow: 0 25px 50px rgba(0,0,0,0.85);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="display: inline-block; padding: 6px 14px; border-radius: 20px; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #f59e0b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">
                🔔 ახალი ონლაინ შეკვეთა
              </span>
              <h1 style="margin: 14px 0 4px; font-family: Georgia, serif; font-size: 28px; color: #f5f0e6; letter-spacing: 2px;">#${order.id}</h1>
              <p style="margin: 0; font-size: 12px; color: #a8a29e;">თარიღი: ${order.date || new Date().toLocaleString('ka-GE')}</p>
            </td>
          </tr>

          <!-- Client Info Card -->
          <tr>
            <td style="padding: 20px; background-color: #1c1a17; border-radius: 16px; border: 1px solid #292524;">
              <h3 style="margin: 0 0 12px; font-size: 13px; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px;">👤 მყიდველის მონაცემები</h3>
              <p style="margin: 4px 0; font-size: 13px;"><strong>სახელი:</strong> ${order.clientName || 'მითითებული არ არის'}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>ტელეფონი:</strong> <a href="tel:${order.clientPhone}" style="color: #f59e0b; text-decoration: none; font-weight: bold;">${order.clientPhone || '—'}</a></p>
              ${order.clientEmail ? `<p style="margin: 4px 0; font-size: 13px;"><strong>ელფოსტა:</strong> <a href="mailto:${order.clientEmail}" style="color: #f59e0b; text-decoration: none;">${order.clientEmail}</a></p>` : ''}
              <p style="margin: 4px 0; font-size: 13px;"><strong>მისამართი:</strong> ${order.address || order.city || 'თბილისი'}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>გადახდის მეთოდი:</strong> ${order.paymentMethod || 'კურიერთან'}</p>
              ${order.isGift ? `<p style="margin: 4px 0; font-size: 13px; color: #ec4899;"><strong>🎁 სასაჩუქრე შეფუთვა:</strong> დიახ (+5 ₾)</p>` : ''}
              ${order.promoApplied ? `<p style="margin: 4px 0; font-size: 13px; color: #10b981;"><strong>🎟️ გამოყენებული პრომო კოდი:</strong> ${order.promoApplied} (-${order.discountAmount || 0} ₾)</p>` : ''}
              ${order.notes ? `<p style="margin: 8px 0 0; padding-top: 8px; border-top: 1px solid #292524; font-size: 12px; color: #d6d3d1;"><strong>კომენტარი:</strong> <em>„${order.notes}“</em></p>` : ''}
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 24px 0 12px;">
              <h3 style="margin: 0 0 12px; font-size: 13px; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px;">🛍️ შეკვეთილი სამკაულები</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Summary Breakdown -->
          <tr>
            <td style="padding: 16px 20px; background-color: #1c1a17; border-radius: 16px; border: 1px solid #292524;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #a8a29e;">სამკაულების ჯამი:</td>
                  <td align="right" style="padding: 4px 0; font-family: monospace;">${order.rawSubtotal || order.totalPrice} ₾</td>
                </tr>
                ${order.discountAmount ? `
                <tr>
                  <td style="padding: 4px 0; color: #10b981;">ფასდაკლება (${order.promoApplied}):</td>
                  <td align="right" style="padding: 4px 0; color: #10b981; font-family: monospace;">-${order.discountAmount} ₾</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 4px 0; color: #a8a29e;">საკურიერო მიწოდება:</td>
                  <td align="right" style="padding: 4px 0; font-family: monospace;">${order.shippingFee || 0} ₾</td>
                </tr>
                ${order.giftFee ? `
                <tr>
                  <td style="padding: 4px 0; color: #a8a29e;">სასაჩუქრე შეფუთვა:</td>
                  <td align="right" style="padding: 4px 0; font-family: monospace;">+${order.giftFee} ₾</td>
                </tr>` : ''}
                <tr style="border-top: 1px solid #292524;">
                  <td style="padding: 12px 0 0; font-size: 16px; font-weight: bold; color: #f5f0e6;">სულ გადასახდელი:</td>
                  <td align="right" style="padding: 12px 0 0; font-size: 18px; font-weight: bold; font-family: monospace; color: #f59e0b;">${order.totalPrice} ₾</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding: 28px 0 10px;">
              <a href="${adminLink}" style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #000000; text-decoration: none; font-size: 13px; font-weight: bold; border-radius: 14px; text-transform: uppercase; letter-spacing: 1px;">
                შეკვეთის ნახვა ადმინ პანელში →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // 2. CUSTOMER CONFIRMATION EMAIL TEMPLATE
    const customerEmailHtml = `
<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <title>თქვენი შეკვეთა #${order.id} მიღებულია — მატარე</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0b0a; color: #f5f0e6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c0b0a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #141210; border: 1px solid #292524; border-radius: 28px; padding: 44px 36px; box-shadow: 0 25px 50px rgba(0,0,0,0.85);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 32px; letter-spacing: 5px; color: #f59e0b; text-transform: uppercase;">MATARE</h1>
              <p style="margin: 6px 0 0; font-size: 11px; letter-spacing: 3px; color: #a8a29e; text-transform: uppercase;">საიუველირო სახლი</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 0; border-top: 1px solid #292524; border-bottom: 1px solid #292524;">
              <h2 style="margin: 0 0 12px; font-size: 20px; color: #f5f0e6; font-weight: 600;">
                გმადლობთ, ${order.clientName || 'პატივცემულო მომხმარებელო'}!
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #d6d3d1;">
                თქვენი შეკვეთა <strong style="color: #f59e0b;">#${order.id}</strong> წარმატებით გაფორმდა და გადაეცა ჩვენს საიუველირო ატელიეს. ჩვენი კურიერი უახლოეს დროში დაგიკავშირდებათ მითითებულ ნომერზე (${order.clientPhone || ''}).
              </p>

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                ${itemsHtml}
              </table>

              <!-- Total row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #292524;">
                <tr>
                  <td style="font-size: 14px; color: #a8a29e;">ჯამური თანხა:</td>
                  <td align="right" style="font-size: 18px; font-weight: bold; font-family: monospace; color: #f59e0b;">${order.totalPrice} ₾</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tracking Button -->
          <tr>
            <td align="center" style="padding: 32px 0 20px;">
              <a href="${trackingLink}" style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #000000; text-decoration: none; font-size: 13px; font-weight: bold; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
                შეკვეთის ლაივ-თრექინგი →
              </a>
            </td>
          </tr>

          <!-- Footer -->
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
</html>
    `;

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'მატარე <noreply@matare.store>';
    const adminRecipient = adminEmailOverride || process.env.ADMIN_NOTIFICATION_EMAIL || process.env.RESEND_TO_EMAIL || 'info@matare.store';

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY is not defined. Simulating order notification emails.');
      return res.status(200).json({
        success: true,
        simulated: true,
        adminRecipient,
        customerRecipient: order.clientEmail || null,
        message: 'Notification emails simulated successfully'
      });
    }

    const emailPromises = [];

    // 1. Dispatch Admin Email
    emailPromises.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [adminRecipient],
          subject: `🔔 ახალი შეკვეთა #${order.id} — ${order.clientName || 'მომხმარებელი'} (${order.totalPrice} ₾)`,
          html: adminEmailHtml,
        }),
      }).catch((e) => console.error('Failed sending admin email:', e))
    );

    // 2. Dispatch Customer Email if provided
    if (order.clientEmail) {
      emailPromises.push(
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [order.clientEmail],
            subject: `თქვენი შეკვეთა #${order.id} მიღებულია — მატარე`,
            html: customerEmailHtml,
          }),
        }).catch((e) => console.error('Failed sending customer email:', e))
      );
    }

    await Promise.allSettled(emailPromises);

    return res.status(200).json({
      success: true,
      adminRecipient,
      customerRecipient: order.clientEmail || null
    });
  } catch (err) {
    console.error('Error in send-order-notification:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}

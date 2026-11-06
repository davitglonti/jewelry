// api/send-order-tracking.js

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

    const email = (order.clientEmail || body.email || '').toString().trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: 'ელფოსტის მისამართი არ არის მითითებული' });
    }

    // Determine base URL
    let baseUrl = 'https://www.matare.store';
    if (clientOrigin && (clientOrigin.includes('localhost') || clientOrigin.includes('127.0.0.1'))) {
      baseUrl = clientOrigin.replace(/\/+$/, '');
    }

    const trackingLink = `${baseUrl}/track?id=${encodeURIComponent(order.id || '')}`;

    const itemsHtml = (order.items || []).map((it) => `
      <tr style="border-bottom: 1px solid #292524;">
        <td style="padding: 12px 0; color: #f5f0e6; font-size: 13px; font-weight: 500;">
          ${it.name || 'სამკაული'} ${it.size ? `<span style="color: #f59e0b; font-size: 11px;">(ზომა: ${it.size})</span>` : ''}
        </td>
        <td align="right" style="padding: 12px 0; color: #f59e0b; font-size: 13px; font-family: monospace; font-weight: 700;">
          ${it.price || 0} ₾
        </td>
      </tr>
    `).join('');

    const emailHtml = `
<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>თქვენი შეკვეთის თრექინგი — მატარე</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0b0a; color: #f5f0e6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c0b0a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #141210; border: 1px solid #292524; border-radius: 28px; padding: 44px 36px; box-shadow: 0 25px 50px rgba(0,0,0,0.85);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 32px; letter-spacing: 5px; color: #f59e0b; text-transform: uppercase;">MATARE</h1>
              <p style="margin: 6px 0 0; font-size: 11px; letter-spacing: 3px; color: #a8a29e; text-transform: uppercase;">საიუველირო სახლი</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 24px 0; border-top: 1px solid #292524; border-bottom: 1px solid #292524;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #f59e0b; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px;">
                შეკვეთა მიღებულია • #${order.id}
              </span>

              <h2 style="margin: 0 0 12px; font-size: 20px; color: #ffffff; font-weight: 500;">
                მადლობას გიხდით შენაძენისთვის!
              </h2>

              <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: #d6d3d1;">
                მოგესალმებით, <strong>${order.clientName || 'ძვირფასო მომხმარებელო'}</strong>. თქვენი შეკვეთა წარმატებით დარეგისტრირდა Matare-ს საიუველირო ატელიეში.
              </p>

              <!-- Items List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0 20px; border-top: 1px solid #292524;">
                ${itemsHtml}
                <tr>
                  <td style="padding: 14px 0; color: #a8a29e; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                    სულ გადასახდელი:
                  </td>
                  <td align="right" style="padding: 14px 0; color: #f59e0b; font-size: 18px; font-family: monospace; font-weight: 700;">
                    ${order.totalPrice || 0} ₾
                  </td>
                </tr>
              </table>

              <!-- Delivery details -->
              <div style="background-color: #1a1715; border: 1px solid #292524; border-radius: 16px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px; color: #a8a29e; line-height: 1.5;">
                <div style="color: #ffffff; font-weight: 600; margin-bottom: 4px;">🚚 მიწოდების დეტალები:</div>
                <div>${order.deliveryMethod || 'საკურიერო მიწოდება'} — ${order.address || 'თბილისი'}</div>
              </div>

              <!-- CTA Button to Track Live -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${trackingLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000000; font-weight: 700; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; padding: 15px 36px; border-radius: 14px; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);">
                      შეკვეთის ლაივ-თრექინგი & სტატუსი →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 8px; font-size: 12px; color: #78716c; text-align: center; line-height: 1.5;">
                ამ ბმულზე ნებისმიერ დროს შეგიძლიათ ნახოთ ნაკეთობის დამზადების ეტაპი, კონდიცია და კურიერის მოახლოების დრო.
              </p>

              <p style="margin: 0; font-size: 11px; color: #f59e0b; word-break: break-all; text-align: center; line-height: 1.5;">
                <a href="${trackingLink}" style="color: #f59e0b; text-decoration: underline;">${trackingLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; text-align: center;">
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

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY is not defined. Email tracking simulated.');
      return res.status(200).json({
        success: true,
        simulated: true,
        message: 'Email dispatch simulated locally',
        trackingLink
      });
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'მატარე <noreply@matare.store>';

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: `თქვენი შეკვეთის თრექინგი #${order.id} — მატარე`,
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend order tracking email error:', resendData);
      return res.status(200).json({
        success: false,
        error: resendData.message || 'Resend error',
        trackingLink
      });
    }

    return res.status(200).json({
      success: true,
      data: resendData,
      trackingLink
    });
  } catch (err) {
    console.error('Error in send-order-tracking:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}

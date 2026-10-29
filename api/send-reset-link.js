// api/send-reset-link.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getAdminAuth() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'jewelry-4fdb3';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
    const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

    if (!clientEmail || !privateKey) {
      throw new Error('Firebase Admin-ის პარამეტრები (CLIENT_EMAIL / PRIVATE_KEY) არ არის მითითებული');
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return getAuth();
}

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
    const email = (body.email || '').toString().trim().toLowerCase();
    const clientOrigin = (body.origin || '').toString().trim();

    if (!email) {
      return res.status(400).json({ error: 'გთხოვთ მიუთითოთ ელფოსტის მისამართი' });
    }

    const auth = getAdminAuth();

    // 1. შევამოწმოთ არსებობს თუ არა მომხმარებელი
    try {
      await auth.getUserByEmail(email);
    } catch (userErr) {
      if (userErr.code === 'auth/user-not-found') {
        return res.status(404).json({
          code: 'auth/user-not-found',
          error: 'ამ ელფოსტით დარეგისტრირებული მომხმარებელი ვერ მოიძებნა.',
        });
      }
      throw userErr;
    }

    // 2. დავაგენერიროთ Firebase-ის ოფიციალური reset link
    const firebaseLink = await auth.generatePasswordResetLink(email);

    // 3. ამოვიღოთ oobCode
    const parsed = new URL(firebaseLink);
    const oobCode = parsed.searchParams.get('oobCode');

    if (!oobCode) {
      throw new Error('აღდგენის კოდის გენერირება ვერ მოხერხდა');
    }

    // 4. შევქმნათ ჩვენი საკუთარი ბრენდირებული ლინკი (matare.store ან localhost)
    let baseUrl = 'https://www.matare.store';
    if (clientOrigin && (clientOrigin.includes('localhost') || clientOrigin.includes('127.0.0.1'))) {
      baseUrl = clientOrigin.replace(/\/+$/, '');
    }
    const brandedResetLink = `${baseUrl}/reset-password?mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}`;

    // 5. გავაგზავნოთ Resend-ის მეშვეობით
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY არ არის მითითებული');
    }

    const emailHtml = `
<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>პაროლის აღდგენა — მატარე</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0b0a; color: #f5f0e6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c0b0a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #141210; border: 1px solid #292524; border-radius: 28px; padding: 44px 36px; box-shadow: 0 25px 50px rgba(0,0,0,0.8);">
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 30px; letter-spacing: 5px; color: #f59e0b; text-transform: uppercase;">მატარე</h1>
              <p style="margin: 6px 0 0; font-size: 11px; letter-spacing: 2px; color: #a8a29e; text-transform: uppercase;">საიუველირო სახლი</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 0; border-top: 1px solid #292524; border-bottom: 1px solid #292524;">
              <h2 style="margin: 0 0 14px; font-size: 20px; color: #ffffff; font-weight: 500;">პაროლის აღდგენა</h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #d6d3d1;">
                მოგესალმებით, თქვენს ანგარიშზე (<strong>${email}</strong>) დაფიქსირდა პაროლის აღდგენის მოთხოვნა.
              </p>
              <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.6; color: #d6d3d1;">
                ახალი პაროლის დასაყენებლად გთხოვთ დააჭიროთ ქვემოთ მოცემულ ოქროსფერ ღილაკს:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${brandedResetLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000000; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; padding: 15px 36px; border-radius: 14px; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);">
                      ახალი პაროლის დაყენება →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 28px 0 8px; font-size: 12px; color: #78716c; text-align: center;">
                თუ ღილაკი არ მუშაობს, შეგიძლიათ გადახვიდეთ პირდაპირ ამ ბმულზე:
              </p>
              <p style="margin: 0; font-size: 11px; color: #f59e0b; word-break: break-all; text-align: center; line-height: 1.5;">
                <a href="${brandedResetLink}" style="color: #f59e0b; text-decoration: underline;">${brandedResetLink}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #78716c;">
                თუ ეს მოთხოვნა თქვენ არ გაგიგზავნიათ, შეგიძლიათ უბრალოდ უგულებელყოთ ეს შეტყობინება. თქვენი ანგარიში დაცულია.
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

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'მატარე <onboarding@resend.dev>';

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: 'პაროლის აღდგენა — მატარე',
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend error:', resendData);
      if (resendData?.message?.includes('testing emails to your own email address')) {
        return res.status(403).json({
          code: 'resend/domain-not-verified',
          error: `Resend ტესტურ რეჟიმში მეილს აგზავნის მხოლოდ თქვენს ანგარიშზე (datiglonti@gmail.com). სხვა მომხმარებლებზე გასაგზავნად გთხოვთ დაამატოთ matare.store resend.com/domains-ში.`,
          resetLink: brandedResetLink,
        });
      }
      throw new Error(resendData.message || 'Resend-ით მეილის გაგზავნა ვერ მოხერხდა');
    }

    return res.status(200).json({
      success: true,
      message: 'პაროლის აღდგენის ბმული წარმატებით გაიგზავნა!',
      id: resendData.id,
      resetLink: brandedResetLink,
    });
  } catch (err) {
    console.error('send-reset-link error:', err);
    return res.status(500).json({
      error: err.message || 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ ხელახლა.',
    });
  }
}

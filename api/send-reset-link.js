// api/send-reset-link.js
import { getAdminAuth } from './_lib/firebaseAdmin.js';
import { setCorsHeaders, parseBody, resolveSafeOrigin, escapeHtml, getClientIp, checkRateLimit } from './_lib/security.js';
import { sendResendEmail } from './_lib/orders.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res, 'POST, OPTIONS', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = parseBody(req);
    const email = (body.email || '').toString().trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'გთხოვთ მიუთითოთ სწორი ელფოსტის მისამართი' });
    }

    // Strict rate limit per IP and per email to stop reset floods
    const ip = getClientIp(req);
    const ipLimit = checkRateLimit(`reset-ip:${ip}`, 8, 10 * 60_000);
    const emailLimit = checkRateLimit(`reset-email:${email}`, 3, 10 * 60_000);
    if (!ipLimit.allowed || !emailLimit.allowed) {
      return res.status(429).json({
        error: 'ძალიან ბევრი მცდელობაა. გთხოვთ სცადოთ რამდენიმე წუთში.',
      });
    }

    const auth = getAdminAuth();

    // Prevent user email enumeration: return identical success message if user doesn't exist
    try {
      await auth.getUserByEmail(email);
    } catch (userErr) {
      if (userErr.code === 'auth/user-not-found') {
        return res.status(200).json({
          success: true,
          message: 'თუ მითითებული ელფოსტა რეგისტრირებულია, პაროლის აღდგენის ბმული გამოიგზავნა.',
        });
      }
      throw userErr;
    }

    const firebaseLink = await auth.generatePasswordResetLink(email);
    const parsed = new URL(firebaseLink);
    const oobCode = parsed.searchParams.get('oobCode');

    if (!oobCode) {
      throw new Error('აღდგენის კოდის გენერირება ვერ მოხერხდა');
    }

    const baseUrl = resolveSafeOrigin(body.origin);
    const brandedResetLink = `${baseUrl}/reset-password?mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}`;

    const safeEmail = escapeHtml(email);
    const safeLink = escapeHtml(brandedResetLink);

    const emailHtml = `<!DOCTYPE html>
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
                მოგესალმებით, თქვენს ანგარიშზე (<strong>${safeEmail}</strong>) დაფიქსირდა პაროლის აღდგენის მოთხოვნა.
              </p>
              <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.6; color: #d6d3d1;">
                ახალი პაროლის დასაყენებლად გთხოვთ დააჭიროთ ქვემოთ მოცემულ ოქროსფერ ღილაკს:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${safeLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000000; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; text-decoration: none; padding: 15px 36px; border-radius: 14px; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);">
                      ახალი პაროლის დაყენება →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 28px 0 8px; font-size: 12px; color: #78716c; text-align: center;">
                თუ ღილაკი არ მუშაობს, შეგიძლიათ გადახვიდეთ პირდაპირ ამ ბმულზე:
              </p>
              <p style="margin: 0; font-size: 11px; color: #f59e0b; word-break: break-all; text-align: center; line-height: 1.5;">
                <a href="${safeLink}" style="color: #f59e0b; text-decoration: underline;">${safeLink}</a>
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
</html>`;

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY არ არის მითითებული');
    }

    const resendRes = await sendResendEmail({
      to: email,
      subject: 'პაროლის აღდგენა — მატარე',
      html: emailHtml,
    });

    if (!resendRes.ok) {
      console.error('Resend error:', resendRes.data);
      if (resendRes.data?.message?.includes('testing emails to your own email address')) {
        // CRITICAL: Never leak resetLink in error response!
        return res.status(403).json({
          code: 'resend/domain-not-verified',
          error: 'Resend დომენი არ არის დადასტურებული სხვა მისამართებზე გასაგზავნად.',
        });
      }
      throw new Error(resendRes.data?.message || 'Resend-ით მეილის გაგზავნა ვერ მოხერხდა');
    }

    // CRITICAL: Never expose resetLink / oobCode in the JSON response!
    return res.status(200).json({
      success: true,
      message: 'თუ მითითებული ელფოსტა რეგისტრირებულია, პაროლის აღდგენის ბმული გამოიგზავნა.',
    });
  } catch (err) {
    console.error('send-reset-link error:', err);
    return res.status(500).json({
      error: 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ ხელახლა.',
    });
  }
}

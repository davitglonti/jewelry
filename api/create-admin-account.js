// api/create-admin-account.js
import { getAdminAuth, getAdminDb, verifyAdminRole, SUPER_ADMIN_EMAIL } from './_lib/firebaseAdmin.js';
import { setCorsHeaders, parseBody, resolveSafeOrigin, escapeHtml } from './_lib/security.js';
import { sendResendEmail } from './_lib/orders.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // 1. Only Super Admin may invite/create admin accounts
    const adminCtx = await verifyAdminRole(req, ['superadmin']);
    if (!adminCtx) {
      return res.status(403).json({ error: 'მხოლოდ მთავარ ადმინისტრატორს აქვს ახალი ანგარიშების შექმნის უფლება' });
    }

    const body = parseBody(req);
    const email = (body.email || '').trim().toLowerCase();
    const role = body.role === 'moderator' ? 'moderator' : 'admin';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'გთხოვთ მიუთითოთ სწორი ელფოსტა' });
    }

    if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(400).json({ error: 'მთავარი ადმინისტრატორის ანგარიში უკვე არსებობს' });
    }

    const auth = getAdminAuth();
    try {
      await auth.getUserByEmail(email);
    } catch {
      await auth.createUser({
        email,
        emailVerified: true,
      });
    }

    const firestore = getAdminDb();
    const docRef = firestore.collection('admins').doc(email);
    const existingSnap = await docRef.get();
    const existingData = existingSnap.exists ? existingSnap.data() : {};
    const alreadyJoined = Boolean(existingData.hasJoined || existingData.joinedAt || existingData.status === 'active');

    await docRef.set(
      {
        email,
        role,
        isActive: true,
        status: alreadyJoined ? 'active' : 'pending',
        hasJoined: alreadyJoined,
        joinedAt: existingData.joinedAt || null,
        mustChangePassword: false,
        invitedBy: adminCtx.email,
        invitedAt: Date.now(),
        addedBy: existingData.addedBy || adminCtx.email,
        addedAt: existingData.addedAt || Date.now(),
      },
      { merge: true }
    );

    const firebaseLink = await auth.generatePasswordResetLink(email);
    const parsed = new URL(firebaseLink);
    const oobCode = parsed.searchParams.get('oobCode');

    if (!oobCode) {
      throw new Error('აღდგენის კოდის გენერირება ვერ მოხერხდა');
    }

    const baseUrl = resolveSafeOrigin(body.origin);
    const inviteLink = `${baseUrl}/reset-password?mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}&from=admin&role=${encodeURIComponent(role)}`;

    const roleTitle = role === 'moderator' ? 'კონტენტ-მოდერატორი' : 'სრული ადმინისტრატორი';
    const roleDesc =
      role === 'moderator'
        ? 'თქვენ მოგენიჭათ პროდუქციის და ბლოგების მართვის უფლება.'
        : 'თქვენ მოგენიჭათ საიტისა და კატალოგის სრული მართვის უფლება.';

    const safeEmail = escapeHtml(email);
    const safeRoleTitle = escapeHtml(roleTitle);
    const safeRoleDesc = escapeHtml(roleDesc);
    const safeInviteLink = escapeHtml(inviteLink);
    const safeBaseUrl = escapeHtml(baseUrl);

    const emailHtml = `<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>მოწვევა «მატარე»-ს სამუშაო პანელზე</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0b0a; color: #f5f0e6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0c0b0a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #141210; border: 1px solid #292524; border-radius: 28px; padding: 44px 36px; box-shadow: 0 25px 50px rgba(0,0,0,0.8);">
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 32px; letter-spacing: 5px; color: #f59e0b; text-transform: uppercase;">მატარე</h1>
              <p style="margin: 6px 0 0; font-size: 11px; letter-spacing: 2px; color: #a8a29e; text-transform: uppercase;">საიუველირო სახლი</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 0; border-top: 1px solid #292524; border-bottom: 1px solid #292524;">
              <div style="text-align: center; margin-bottom: 18px;">
                <span style="display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #f59e0b;">
                  ${safeRoleTitle}
                </span>
              </div>
              <h2 style="margin: 0 0 14px; font-size: 21px; color: #ffffff; font-weight: 600; text-align: center;">
                მოწვევა სამუშაო პანელზე
              </h2>
              <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: #d6d3d1;">
                მოგესალმებით! თქვენს ანგარიშს (<strong>${safeEmail}</strong>) მიენიჭა <strong>${safeRoleTitle}</strong>-ის უფლებამოსილება საიუველირო სახლ «მატარე»-ს სამართავ პანელში.
              </p>
              <p style="margin: 0 0 20px; font-size: 13px; line-height: 1.6; color: #a8a29e;">
                ${safeRoleDesc}
              </p>
              <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.6; color: #d6d3d1;">
                სისტემაში პირველად შემოსასვლელად და თქვენი პირადი პაროლის დასაყენებლად, გთხოვთ დააჭიროთ ქვემოთ მოცემულ ოქროსფერ ღილაკს:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${safeInviteLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000000; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; text-decoration: none; padding: 15px 36px; border-radius: 14px; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);">
                      პაროლის დაყენება და გააქტიურება →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 28px 0 8px; font-size: 12px; color: #78716c; text-align: center;">
                თუ ღილაკი არ იხსნება, გადადით პირდაპირ ამ ბმულზე:
              </p>
              <p style="margin: 0; font-size: 11px; color: #f59e0b; word-break: break-all; text-align: center; line-height: 1.5;">
                <a href="${safeInviteLink}" style="color: #f59e0b; text-decoration: underline;">${safeInviteLink}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #78716c;">
                პაროლის დაყენების შემდეგ ადმინ პანელზე შესვლა შეგიძლიათ ბმულზე: <a href="${safeBaseUrl}/admin" style="color: #f59e0b; text-decoration: none;">${safeBaseUrl}/admin</a>
              </p>
              <p style="margin: 8px 0 0; font-size: 11px; color: #57534e;">
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

    let emailSent = false;
    let emailError = null;
    if (process.env.RESEND_API_KEY) {
      try {
        const resendRes = await sendResendEmail({
          to: email,
          subject: `მოწვევა «მატარე»-ს სამუშაო პანელზე (${roleTitle})`,
          html: emailHtml,
        });
        emailSent = resendRes.ok;
        if (!resendRes.ok) {
          emailError = resendRes.data?.message || 'Resend error';
        }
      } catch (mailErr) {
        emailError = mailErr.message;
      }
    }

    return res.status(200).json({
      success: true,
      email,
      role,
      inviteLink,
      emailSent,
      emailError,
      message: emailSent
        ? `მოწვევის წერილი წარმატებით გაეგზავნა ${email}-ს (${roleTitle})`
        : `უფლებები მიენიჭა ${email}-ს (${roleTitle}). შეგიძლიათ გამოიყენოთ ქვემოთ მოცემული პირდაპირი ბმული.`,
    });
  } catch (err) {
    console.error('Create Admin Account API Error:', err);
    return res.status(500).json({
      error: err.message || 'ანგარიშის შექმნისას დაფიქსირდა შეცდომა',
    });
  }
}

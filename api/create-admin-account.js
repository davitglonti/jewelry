// api/create-admin-account.js
import admin from 'firebase-admin';

const SUPER_ADMIN_EMAIL = 'datiglonti@gmail.com';

function initFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'jewelry-4fdb3';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let rawKey = process.env.FIREBASE_PRIVATE_KEY || '';

    if (!clientEmail || !rawKey) {
      throw new Error('Firebase Admin-ის პარამეტრები (CLIENT_EMAIL / PRIVATE_KEY) არ არის მითითებული');
    }

    rawKey = rawKey.trim();
    if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
      rawKey = rawKey.slice(1, -1);
    }
    if (rawKey.startsWith("'") && rawKey.endsWith("'")) {
      rawKey = rawKey.slice(1, -1);
    }
    const privateKey = rawKey.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    initFirebaseAdmin();

    // 1. ავტორიზაციის შემოწმება (მხოლოდ Super Admin-ს შეუძლია)
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return res.status(401).json({ error: 'ავტორიზაციის ტოკენი არ არის მითითებული' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const callerEmail = (decodedToken.email || '').toLowerCase().trim();

    if (callerEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ error: 'მხოლოდ მთავარ ადმინისტრატორს აქვს ახალი ანგარიშების შექმნის უფლება' });
    }

    // 2. პარამეტრების ვალიდაცია
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = (body.email || '').trim().toLowerCase();
    const role = body.role === 'moderator' ? 'moderator' : 'admin';
    const clientOrigin = (body.origin || '').toString().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'გთხოვთ მიუთითოთ სწორი ელფოსტა' });
    }

    if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(400).json({ error: 'მთავარი ადმინისტრატორის ანგარიში უკვე არსებობს' });
    }

    // 3. მომხმარებლის შექმნა ან მოძიება Firebase Auth-ში
    try {
      await admin.auth().getUserByEmail(email);
    } catch (notFoundErr) {
      // თუ არ არსებობს, ვქმნით მომხმარებელს (პაროლს თვითონ დააყენებს მიღებული ბმულით)
      await admin.auth().createUser({
        email,
        emailVerified: true,
      });
    }

    // 4. Firestore-ში როლის შენახვა
    const firestore = admin.firestore();
    await firestore.collection('admins').doc(email).set({
      email,
      role, // 'admin' ან 'moderator'
      isActive: true,
      mustChangePassword: false,
      invitedBy: callerEmail,
      invitedAt: Date.now(),
      addedBy: callerEmail,
      addedAt: Date.now()
    }, { merge: true });

    // 5. Firebase Admin-ით პაროლის დაყენების/აღდგენის ბმულის გენერირება
    const firebaseLink = await admin.auth().generatePasswordResetLink(email);
    const parsed = new URL(firebaseLink);
    const oobCode = parsed.searchParams.get('oobCode');

    if (!oobCode) {
      throw new Error('აღდგენის კოდის გენერირება ვერ მოხერხდა');
    }

    let baseUrl = 'https://www.matare.store';
    if (clientOrigin && (clientOrigin.includes('localhost') || clientOrigin.includes('127.0.0.1'))) {
      baseUrl = clientOrigin.replace(/\/+$/, '');
    }
    const inviteLink = `${baseUrl}/reset-password?mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}&from=admin&role=${encodeURIComponent(role)}`;

    // 6. მოწვევის წერილის გაგზავნა Resend-ის მეშვეობით
    const resendApiKey = process.env.RESEND_API_KEY;
    const roleTitle = role === 'moderator' ? 'კონტენტ-მოდერატორი' : 'სრული ადმინისტრატორი';
    const roleDesc = role === 'moderator'
      ? 'თქვენ მოგენიჭათ პროდუქციის და ბლოგების მართვის უფლება.'
      : 'თქვენ მოგენიჭათ საიტისა და კატალოგის სრული მართვის უფლება.';

    let emailSent = false;
    let emailError = null;

    if (resendApiKey) {
      try {
        const emailHtml = `
<!DOCTYPE html>
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
                  ${roleTitle}
                </span>
              </div>
              <h2 style="margin: 0 0 14px; font-size: 21px; color: #ffffff; font-weight: 600; text-align: center;">
                მოწვევა სამუშაო პანელზე
              </h2>
              <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6; color: #d6d3d1;">
                მოგესალმებით! თქვენს ანგარიშს (<strong>${email}</strong>) მიენიჭა <strong>${roleTitle}</strong>-ის უფლებამოსილება საიუველირო სახლ «მატარე»-ს სამართავ პანელში.
              </p>
              <p style="margin: 0 0 20px; font-size: 13px; line-height: 1.6; color: #a8a29e;">
                ${roleDesc}
              </p>
              <p style="margin: 0 0 28px; font-size: 14px; line-height: 1.6; color: #d6d3d1;">
                სისტემაში პირველად შემოსასვლელად და თქვენი პირადი პაროლის დასაყენებლად, გთხოვთ დააჭიროთ ქვემოთ მოცემულ ოქროსფერ ღილაკს:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${inviteLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #000000; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase; text-decoration: none; padding: 15px 36px; border-radius: 14px; box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);">
                      პაროლის დაყენება და გააქტიურება →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 28px 0 8px; font-size: 12px; color: #78716c; text-align: center;">
                თუ ღილაკი არ იხსნება, გადადით პირდაპირ ამ ბმულზე:
              </p>
              <p style="margin: 0; font-size: 11px; color: #f59e0b; word-break: break-all; text-align: center; line-height: 1.5;">
                <a href="${inviteLink}" style="color: #f59e0b; text-decoration: underline;">${inviteLink}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #78716c;">
                პაროლის დაყენების შემდეგ ადმინ პანელზე შესვლა შეგიძლიათ ბმულზე: <a href="${baseUrl}/admin" style="color: #f59e0b; text-decoration: none;">${baseUrl}/admin</a>
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
</html>
`;

        const fromAddress = 'მატარე <noreply@matare.store>';
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [email],
            subject: `მოწვევა «მატარე»-ს სამუშაო პანელზე (${roleTitle})`,
            html: emailHtml,
          }),
        });

        const resendData = await resendRes.json();
        if (resendRes.ok) {
          emailSent = true;
        } else {
          console.warn('Resend invitation warning:', resendData);
          emailError = resendData?.message || 'Resend error';
        }
      } catch (mailErr) {
        console.warn('Invitation email sending failed:', mailErr);
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
        : `უფლებები მიენიჭა ${email}-ს (${roleTitle}). შეგიძლიათ გამოიყენოთ ქვემოთ მოცემული პირდაპირი ბმული.`
    });

  } catch (err) {
    console.error('Create Admin Account API Error:', err);
    return res.status(500).json({
      error: err.message || 'ანგარიშის შექმნისას დაფიქსირდა შეცდომა'
    });
  }
}

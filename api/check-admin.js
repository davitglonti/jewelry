// api/check-admin.js
import { getAdminDb, verifyAdminRole, verifyAuthToken, SUPER_ADMIN_EMAIL } from './_lib/firebaseAdmin.js';
import { setCorsHeaders, parseBody } from './_lib/security.js';

export default async function handler(req, res) {
  setCorsHeaders(req, res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const decoded = await verifyAuthToken(req);
    if (!decoded || !decoded.email) {
      return res.status(401).json({
        isAdmin: false,
        isSuperAdmin: false,
        role: '',
        mustChangePassword: false,
        email: '',
      });
    }

    const body = parseBody(req);
    const callerEmail = decoded.email.toLowerCase().trim();

    if (body.action === 'activate') {
      const requestedEmail = String(body.email || callerEmail).trim().toLowerCase();
      if (requestedEmail !== callerEmail && callerEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
        return res.status(403).json({ error: 'სხვა მომხმარებლის ანგარიშის გააქტიურება აკრძალულია' });
      }
      const db = getAdminDb();
      const docRef = db.collection('admins').doc(requestedEmail);
      const snap = await docRef.get();
      if (!snap.exists || snap.data()?.isActive === false) {
        return res.status(403).json({ error: 'ადმინისტრატორის ჩანაწერი ვერ მოიძებნა ან გაუქმებულია' });
      }
      await docRef.set(
        { status: 'active', hasJoined: true, joinedAt: Date.now() },
        { merge: true }
      );
      return res.status(200).json({ success: true, email: requestedEmail });
    }

    const adminCtx = await verifyAdminRole(req, ['superadmin', 'admin', 'moderator']);
    if (!adminCtx) {
      return res.status(200).json({
        isAdmin: false,
        isSuperAdmin: false,
        role: '',
        mustChangePassword: false,
        email: callerEmail,
      });
    }

    const db = getAdminDb();

    // Activate pending invited admin on first verified login if needed
    if (!adminCtx.isSuperAdmin && adminCtx.adminData && (adminCtx.adminData.status !== 'active' || !adminCtx.adminData.hasJoined)) {
      await db.collection('admins').doc(adminCtx.email).set(
        {
          status: 'active',
          hasJoined: true,
          joinedAt: Date.now(),
        },
        { merge: true }
      );
    }

    const response = {
      isAdmin: true,
      isSuperAdmin: adminCtx.isSuperAdmin,
      role: adminCtx.role,
      status: 'active',
      hasJoined: true,
      mustChangePassword: Boolean(adminCtx.adminData?.mustChangePassword),
      email: adminCtx.email,
      addedBy: adminCtx.adminData?.addedBy || '',
      addedAt: adminCtx.adminData?.addedAt || null,
    };

    if (body.includeAdminsList && ['superadmin', 'admin'].includes(adminCtx.role)) {
      const snap = await db.collection('admins').get();
      const list = [
        {
          id: 'super-admin',
          email: SUPER_ADMIN_EMAIL,
          role: 'superadmin',
          isSuperAdmin: true,
          isActive: true,
          status: 'active',
          hasJoined: true,
          mustChangePassword: false,
          addedAt: null,
          addedBy: 'სისტემის მფლობელი',
        },
      ];

      snap.forEach((d) => {
        const data = d.data() || {};
        const docEmail = (data.email || d.id).toLowerCase();
        if (docEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
          const hasJoined = Boolean(data.hasJoined || data.joinedAt || data.passwordChangedAt);
          const status = data.status ? data.status : hasJoined ? 'active' : 'pending';
          list.push({
            id: d.id,
            email: docEmail,
            role: data.role === 'moderator' ? 'moderator' : 'admin',
            isSuperAdmin: false,
            isActive: data.isActive !== false,
            status,
            hasJoined,
            joinedAt: data.joinedAt || null,
            invitedAt: data.invitedAt || data.addedAt || null,
            mustChangePassword: Boolean(data.mustChangePassword),
            addedAt: data.addedAt || null,
            addedBy: data.addedBy || 'ადმინი',
          });
        }
      });

      response.adminsList = list;
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error('check-admin error:', err);
    return res.status(500).json({ error: 'ადმინისტრატორის სტატუსის შემოწმების შეცდომა' });
  }
}

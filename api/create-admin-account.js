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
    const password = (body.password || '').trim();
    const role = body.role === 'moderator' ? 'moderator' : 'admin';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'გთხოვთ მიუთითოთ სწორი ელფოსტა' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'დროებითი პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან' });
    }

    if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return res.status(400).json({ error: 'მთავარი ადმინისტრატორის ანგარიში უკვე არსებობს' });
    }

    // 3. მომხმარებლის შექმნა ან განახლება Firebase Auth-ში
    let authUser;
    try {
      authUser = await admin.auth().getUserByEmail(email);
      // თუ უკვე არსებობს, ვუახლებთ პაროლს
      await admin.auth().updateUser(authUser.uid, { password });
    } catch (notFoundErr) {
      // თუ არ არსებობს, ვქმნით ახალ მომხმარებელს
      authUser = await admin.auth().createUser({
        email,
        password,
        emailVerified: true,
      });
    }

    // 4. Firestore-ში როლისა და mustChangePassword: true ჩანაწერის შენახვა
    const firestore = admin.firestore();
    await firestore.collection('admins').doc(email).set({
      email,
      role, // 'admin' ან 'moderator'
      isActive: true,
      mustChangePassword: true,
      addedBy: callerEmail,
      addedAt: Date.now()
    }, { merge: true });

    return res.status(200).json({
      success: true,
      email,
      role,
      temporaryPassword: password,
      message: `ანგარიში ${email} წარმატებით შეიქმნა (${role === 'moderator' ? 'მოდერატორი' : 'ადმინისტრატორი'})`
    });

  } catch (err) {
    console.error('Create Admin Account API Error:', err);
    return res.status(500).json({
      error: err.message || 'ანგარიშის შექმნისას დაფიქსირდა შეცდომა'
    });
  }
}

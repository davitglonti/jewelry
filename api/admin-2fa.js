import crypto from 'node:crypto';
import admin from 'firebase-admin';
import { getAdminDb, verifyAdminRole } from './_lib/firebaseAdmin.js';
import { setCorsHeaders, parseBody, getClientIp, checkRateLimit } from './_lib/security.js';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const SESSION_COOKIE_NAME = 'matare_2fa_session';

function getSigningKey() {
  const explicit = process.env.ADMIN_2FA_SECRET || process.env.FIREBASE_PRIVATE_KEY;
  if (!explicit) {
    throw new Error('2FA signing secret is not configured');
  }
  return crypto.createHash('sha256').update(explicit).digest();
}

function generateTotpSecret(length = 16) {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += BASE32_ALPHABET[bytes[i] % BASE32_ALPHABET.length];
  }
  return out;
}

function base32Decode(str) {
  let bits = 0;
  let value = 0;
  const output = [];
  const clean = String(str || '').replace(/[\s-]/g, '').toUpperCase();
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

function computeTotp(secret, timeStep) {
  const key = base32Decode(secret);
  if (!key.length) return null;
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(timeStep), 0);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)) %
    1000000;
  return String(code).padStart(6, '0');
}

function verifyTotpCode(secret, code, window = 1) {
  const cleanCode = String(code || '').replace(/\D/g, '').trim();
  if (!secret || cleanCode.length !== 6) return false;
  const step = Math.floor(Date.now() / 30000);
  for (let offset = -window; offset <= window; offset++) {
    const expected = computeTotp(secret, step + offset);
    if (expected && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(cleanCode))) {
      return true;
    }
  }
  return false;
}

function signPayload(payloadObj) {
  const encoded = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSigningKey()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySignedPayload(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', getSigningKey()).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (data.exp && Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const header = req?.headers?.cookie || '';
  const map = {};
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      map[k] = decodeURIComponent(v);
    }
  });
  return map;
}

function setSessionCookie(req, res, email, expiresAt) {
  const token = signPayload({ email, exp: expiresAt, kind: '2fa_session' });
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(String(req?.headers?.host || ''));
  const isHttps = !isLocal && (req?.headers?.['x-forwarded-proto'] === 'https' || process.env.VERCEL === '1');
  const maxAgeSec = Math.max(60, Math.floor((expiresAt - Date.now()) / 1000));
  const flags = [`Path=/`, `HttpOnly`, `SameSite=Strict`, `Max-Age=${maxAgeSec}`];
  if (isHttps) flags.push('Secure');
  res.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; ${flags.join('; ')}`);
  return token;
}

function getVerified2faSession(req, email) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE_NAME] || '';
  const verified = verifySignedPayload(token);
  if (verified && verified.kind === '2fa_session' && verified.email === email) {
    return verified;
  }
  return null;
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
}

export default async function handler(req, res) {
  setCorsHeaders(req, res, 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const authCtx = await verifyAdminRole(req, ['superadmin', 'admin']);
    if (!authCtx) {
      return res.status(403).json({ error: 'წვდომა აკრძალულია: საჭიროა ადმინისტრატორის ავტორიზაცია' });
    }

    const { email } = authCtx;
    const db = getAdminDb();
    const adminRef = db.collection('admins').doc(email);
    const body = parseBody(req);
    const action = String(body.action || 'status');

    if (action === 'lock') {
      clearSessionCookie(res);
      return res.status(200).json({ success: true, unlocked: false });
    }

    if (action === 'status') {
      const snap = await adminRef.get();
      const data = snap.exists ? snap.data() || {} : {};
      const twoFactorEnabled = Boolean(data.twoFactorEnabled && data.totpSecret);

      if (!twoFactorEnabled) {
        const secret = generateTotpSecret(16);
        const setupToken = signPayload({ email, secret, exp: Date.now() + 15 * 60_000, kind: '2fa_setup' });
        return res.status(200).json({
          twoFactorEnabled: false,
          unlocked: false,
          setupSecret: secret,
          setupToken,
        });
      }

      const verified = getVerified2faSession(req, email);
      const unlocked = Boolean(verified);

      return res.status(200).json({
        twoFactorEnabled: true,
        unlocked,
        expiresAt: unlocked ? verified.exp : null,
      });
    }

    if (action === 'init-reset') {
      const snap = await adminRef.get();
      const data = snap.exists ? snap.data() || {} : {};
      const alreadyEnabled = Boolean(data.twoFactorEnabled && data.totpSecret);

      if (alreadyEnabled) {
        const verifiedSession = getVerified2faSession(req, email);
        const hasValidCode = verifyTotpCode(data.totpSecret, body.currentCode);
        if (!verifiedSession && !hasValidCode) {
          const ip = getClientIp(req);
          checkRateLimit(`admin-2fa-reset:${email}:${ip}`, 5, 5 * 60_000);
          return res.status(403).json({
            error: '2FA-ის გადატვირთვისთვის საჭიროა აქტიური 2FA სესია ან მიმდინარე კოდის დადასტურება',
          });
        }
      }

      const secret = generateTotpSecret(16);
      const setupToken = signPayload({
        email,
        secret,
        resetAuthorized: true,
        exp: Date.now() + 15 * 60_000,
        kind: '2fa_setup',
      });
      clearSessionCookie(res);
      return res.status(200).json({
        setupSecret: secret,
        setupToken,
      });
    }

    if (action === 'activate') {
      const setupData = verifySignedPayload(body.setupToken);
      if (!setupData || setupData.kind !== '2fa_setup' || setupData.email !== email) {
        return res.status(400).json({ error: '2FA დაყენების სესიას ვადა გაუვიდა. სცადეთ თავიდან.' });
      }

      const snap = await adminRef.get();
      const data = snap.exists ? snap.data() || {} : {};
      const alreadyEnabled = Boolean(data.twoFactorEnabled && data.totpSecret);
      if (alreadyEnabled && !setupData.resetAuthorized) {
        return res.status(403).json({
          error: 'არსებული 2FA გასაღების გადასაწერად საჭიროა ავტორიზებული გადატვირთვა',
        });
      }

      if (!verifyTotpCode(setupData.secret, body.code)) {
        return res.status(400).json({ error: 'არასწორი კოდია. შეამოწმეთ აპლიკაცია და სცადეთ ხელახლა.' });
      }

      await adminRef.set(
        {
          email,
          totpSecret: setupData.secret,
          twoFactorEnabled: true,
          twoFactorCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      const expiresAt = Date.now() + 30 * 60_000;
      setSessionCookie(req, res, email, expiresAt);

      return res.status(200).json({
        success: true,
        twoFactorEnabled: true,
        unlocked: true,
        expiresAt,
      });
    }

    if (action === 'verify') {
      const ip = getClientIp(req);
      const rl = checkRateLimit(`admin-2fa:${email}:${ip}`, 5, 5 * 60_000);
      if (!rl.allowed) {
        return res.status(429).json({
          error: 'ძალიან ბევრი არასწორი მცდელობაა. გთხოვთ სცადოთ 5 წუთში.',
        });
      }

      const snap = await adminRef.get();
      const data = snap.exists ? snap.data() || {} : {};
      if (!data.twoFactorEnabled || !data.totpSecret) {
        return res.status(400).json({ error: '2FA გასაღები არ მოიძებნა' });
      }

      if (!verifyTotpCode(data.totpSecret, body.code)) {
        return res.status(400).json({ error: 'არასწორი კოდია. სცადეთ ხელახლა.' });
      }

      const ttlMs = body.remember30Mins ? 30 * 60_000 : 15 * 60_000;
      const expiresAt = Date.now() + ttlMs;
      setSessionCookie(req, res, email, expiresAt);

      return res.status(200).json({
        success: true,
        unlocked: true,
        expiresAt,
      });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('admin-2fa error:', err);
    return res.status(500).json({ error: '2FA სერვისის შეცდომა' });
  }
}

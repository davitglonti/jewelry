// src/utils/totp.js
/**
 * RFC 6238 TOTP (Time-Based One-Time Password) სუფთა იმპორტებისა და ბიბლიოთეკების გარეშე
 * იყენებს სტანდარტულ Web Crypto API-ს (HMAC-SHA1).
 * სრულად თავსებადია Google Authenticator, Microsoft Authenticator და Apple Passwords-თან.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * გენერირებს შემთხვევით Base32 გასაღებს Google Authenticator-ისთვის.
 * @param {number} length - გასაღების სიგრძე (სტანდარტული 16 ან 20)
 * @returns {string} - Base32 გასაღები (მაგ: JBSWY3DPEHPK3PXP)
 */
export function generateTotpSecret(length = 16) {
  let secret = '';
  const randomBytes = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < length; i++) randomBytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < length; i++) {
    secret += BASE32_ALPHABET[randomBytes[i] % BASE32_ALPHABET.length];
  }
  return secret;
}

/**
 * Base32 სტრინგის დეკოდირება Uint8Array ბაიტების მასივში.
 */
function base32Decode(str) {
  let bits = 0;
  let value = 0;
  const output = [];

  const clean = (str || '').replace(/[\s-]/g, '').toUpperCase();
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (c === '=') break;
    const val = BASE32_ALPHABET.indexOf(c);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

/**
 * ითვლის 6-ნიშნა TOTP კოდს კონკრეტულ დროის ნაბიჯზე Web Crypto API-თ.
 */
async function computeTotp(secret, timeStep) {
  const keyBytes = base32Decode(secret);
  if (keyBytes.length === 0) return null;

  const cryptoObj = typeof window !== 'undefined' ? (window.crypto || window.msCrypto) : globalThis.crypto;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API მიუწვდომელია ამ გარემოში');
  }

  const key = await cryptoObj.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setBigUint64(0, BigInt(timeStep));

  const signature = await cryptoObj.subtle.sign('HMAC', key, buf);
  const hmac = new Uint8Array(signature);

  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

/**
 * ამოწმებს მომხმარებლის მიერ შეყვანილ 6-ნიშნა TOTP კოდს.
 * ითვალისწინებს საათის მცირედ ცდომილებას (±1 ნაბიჯი, ე.ი. ±30 წამი).
 *
 * @param {string} secret - Base32 გასაღები
 * @param {string} userCode - მომხმარებლის 6-ნიშნა კოდი
 * @param {number} window - ნაბიჯების ცდომილება (ნაგულისხმევი 1)
 * @returns {Promise<boolean>}
 */
export async function verifyTotpCode(secret, userCode, window = 1) {
  if (!secret || !userCode) return false;
  const cleanCode = String(userCode).replace(/\D/g, '').trim();
  if (cleanCode.length !== 6) return false;

  const currentStep = Math.floor(Date.now() / 30000);

  for (let offset = -window; offset <= window; offset++) {
    try {
      const generated = await computeTotp(secret, currentStep + offset);
      if (generated && generated === cleanCode) {
        return true;
      }
    } catch (e) {
      console.warn('TOTP verification step error:', e);
    }
  }

  return false;
}

/**
 * აბრუნებს Google Authenticator-ის სტანდარტულ otpauth:// ბმულს.
 */
export function getTotpAuthUri(secret, accountName = 'Admin', issuer = 'MATARE') {
  const encAccount = encodeURIComponent(accountName);
  const encIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encIssuer}:${encAccount}?secret=${encodeURIComponent(secret)}&issuer=${encIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * აგენერირებს QR კოდის სურათის ბმულს.
 */
export function getTotpQrUrl(otpAuthUri) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpAuthUri)}&margin=8`;
}

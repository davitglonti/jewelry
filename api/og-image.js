import { sanitizeUrl } from './_lib/security.js';

const ALLOWED_IMAGE_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

export default async function handler(req, res) {
  const { sku } = req.query;
  const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || 'www.matare.store').replace(/[^a-zA-Z0-9.:-]/g, '');
  const proto = req.headers['x-forwarded-proto'] === 'http' ? 'http' : 'https';
  const baseUrl = `${proto}://${rawHost}`;

  if (!sku) {
    return res.redirect(302, `${baseUrl}/brand-logo.jpg`);
  }

  const targetSku = sku.toString().trim().toLowerCase().replace(/\/+$/, '');

  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/jewelry-4fdb3/databases/(default)/documents/products`;
    const r = await fetch(firestoreUrl);
    if (r.ok) {
      const data = await r.json();
      const doc = data.documents?.find((d) => {
        const s = d.fields?.sku?.stringValue;
        const id = d.name?.split('/').pop();
        return (s && s.toLowerCase() === targetSku) || (id && id.toLowerCase() === targetSku);
      });

      if (doc) {
        const firstImg = doc.fields?.images?.arrayValue?.values?.[0]?.stringValue;
        if (firstImg) {
          if (firstImg.startsWith('data:image')) {
            const matches = firstImg.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,([A-Za-z0-9+/=]+)$/);
            if (matches && ALLOWED_IMAGE_MIME.has(matches[1].toLowerCase())) {
              const contentType = matches[1].toLowerCase();
              const buffer = Buffer.from(matches[2], 'base64');
              res.setHeader('Content-Type', contentType);
              res.setHeader('X-Content-Type-Options', 'nosniff');
              res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
              return res.send(buffer);
            }
          } else {
            const safeUrl = sanitizeUrl(firstImg);
            if (safeUrl) {
              return res.redirect(302, safeUrl);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('og-image error:', err);
  }

  return res.redirect(302, `${baseUrl}/brand-logo.jpg`);
}

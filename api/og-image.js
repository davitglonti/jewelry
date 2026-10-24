export default async function handler(req, res) {
  const { sku } = req.query;
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.matare.store';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${host}`;

  if (!sku) {
    return res.redirect(302, `${baseUrl}/brand-logo.jpg`);
  }

  const targetSku = sku.toString().trim().toLowerCase().replace(/\/+$/, '');

  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/jewelry-4fdb3/databases/(default)/documents/products`;
    const r = await fetch(firestoreUrl);
    if (r.ok) {
      const data = await r.json();
      const doc = data.documents?.find(d => {
        const s = d.fields?.sku?.stringValue;
        const id = d.name?.split('/').pop();
        return (s && s.toLowerCase() === targetSku) || (id && id.toLowerCase() === targetSku);
      });

      if (doc) {
        const firstImg = doc.fields?.images?.arrayValue?.values?.[0]?.stringValue;
        if (firstImg) {
          if (firstImg.startsWith('data:image')) {
            const matches = firstImg.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (matches) {
              const contentType = matches[1];
              const buffer = Buffer.from(matches[2], 'base64');
              res.setHeader('Content-Type', contentType);
              res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
              return res.send(buffer);
            }
          } else if (firstImg.startsWith('http')) {
            return res.redirect(302, firstImg);
          }
        }
      }
    }
  } catch (err) {
    console.error('og-image error:', err);
  }

  return res.redirect(302, `${baseUrl}/brand-logo.jpg`);
}

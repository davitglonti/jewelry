import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { sku } = req.query;
  const targetSku = (sku || '').toString().trim().replace(/\/+$/, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.matare.store';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${host}`;

  let productName = 'მატარე — საიუველირო ნაკეთობა';
  let productPrice = '';
  let productDesc = 'ექსკლუზიური ხელნაკეთი საიუველირო ნაკეთობა, უმაღლესი სინჯის ოქრო და სერტიფიცირებული ბრილიანტები.';
  let imageUrl = `${baseUrl}/brand-logo.jpg`;

  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/jewelry-4fdb3/databases/(default)/documents/products`;
    const r = await fetch(firestoreUrl);
    if (r.ok) {
      const data = await r.json();
      const doc = data.documents?.find(d => {
        const s = d.fields?.sku?.stringValue;
        const id = d.name?.split('/').pop();
        return (
          (s && s.toLowerCase() === targetSku.toLowerCase()) ||
          (id && id.toLowerCase() === targetSku.toLowerCase())
        );
      });

      if (doc) {
        const f = doc.fields;
        productName = f.name?.stringValue || productName;
        productPrice = f.price?.stringValue || '';
        productDesc = f.description?.stringValue || `${productName} — ${productPrice}. ექსკლუზიური საიუველირო ნაკეთობა.`;
        const firstImg = f.images?.arrayValue?.values?.[0]?.stringValue;
        if (firstImg) {
          if (firstImg.startsWith('http')) {
            imageUrl = firstImg;
          } else if (firstImg.startsWith('data:image')) {
            imageUrl = `${baseUrl}/api/og-image?sku=${encodeURIComponent(targetSku)}`;
          }
        }
      }
    }
  } catch (e) {
    console.error('Error fetching product in SSR handler:', e);
  }

  const productUrl = `${baseUrl}/product/${encodeURIComponent(targetSku)}`;
  const titleText = productPrice ? `${productName} (${productPrice}) — მატარე` : `${productName} — მატარე`;

  // Read base HTML template
  let html = '';
  const possiblePaths = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html')
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        html = fs.readFileSync(p, 'utf8');
        break;
      }
    } catch {}
  }

  if (!html) {
    try {
      const r = await fetch(`${baseUrl}/index.html`);
      if (r.ok) {
        html = await r.text();
      }
    } catch {}
  }

  // Fallback HTML: NEVER redirect to "/"! Always render valid OpenGraph HTML for crawlers and client router for users
  if (!html) {
    html = `<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titleText}</title>
  <meta name="description" content="${productDesc}" />
  <link rel="canonical" href="${productUrl}" />
  <link rel="icon" type="image/svg+xml" href="/logo.svg" />
  <link rel="image_src" href="${imageUrl}" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${titleText}" />
  <meta property="og:description" content="${productDesc}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:url" content="${productUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${titleText}" />
  <meta name="twitter:description" content="${productDesc}" />
  <meta name="twitter:image" content="${imageUrl}" />
</head>
<body style="background:#0a0a0a;color:#f5f0e6;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>მატარე — ${titleText}...</p>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  // Inject or update dynamic OpenGraph and Twitter cards safely
  const updateOrInsert = (pattern, replacement) => {
    if (pattern.test(html)) {
      html = html.replace(pattern, replacement);
    } else {
      html = html.replace('</head>', `    ${replacement}\n  </head>`);
    }
  };

  html = html.replace(/<title>.*?<\/title>/i, `<title>${titleText}</title>`);
  updateOrInsert(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${productDesc}" />`);
  updateOrInsert(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${titleText}" />`);
  updateOrInsert(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${productDesc}" />`);
  updateOrInsert(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i, `<meta property="og:image" content="${imageUrl}" />`);
  updateOrInsert(/<meta\s+property="og:image:secure_url"\s+content=".*?"\s*\/?>/i, `<meta property="og:image:secure_url" content="${imageUrl}" />`);
  updateOrInsert(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${productUrl}" />`);
  updateOrInsert(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${titleText}" />`);
  updateOrInsert(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${productDesc}" />`);
  updateOrInsert(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${imageUrl}" />`);
  updateOrInsert(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${productUrl}" />`);
  updateOrInsert(/<link\s+rel="image_src"\s+href=".*?"\s*\/?>/i, `<link rel="image_src" href="${imageUrl}" />`);

  // Remove homepage hero image preload so crawlers never pick it up
  html = html.replace(/<link\s+rel="preload"\s+as="image"[\s\S]*?\/>/i, '');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
  return res.status(200).send(html);
}

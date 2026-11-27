const ALLOWED_ORIGINS = new Set([
  'https://www.matare.store',
  'https://matare.store',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
]);

export function setCorsHeaders(req, res, methods = 'POST, OPTIONS', headers = 'Content-Type, Authorization') {
  const requestOrigin = (req?.headers?.origin || '').trim();
  if (ALLOWED_ORIGINS.has(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.matare.store');
  }
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', headers);
}

export function parseBody(req) {
  if (!req || req.body == null) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return typeof req.body === 'object' ? req.body : {};
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeUrl(url, fallback = '') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  return fallback;
}

export function resolveSafeOrigin(clientOrigin) {
  const trimmed = String(clientOrigin || '').trim().replace(/\/+$/, '');
  if (
    trimmed.startsWith('http://localhost:') ||
    trimmed.startsWith('http://127.0.0.1:')
  ) {
    return trimmed;
  }
  if (trimmed === 'https://matare.store' || trimmed === 'https://www.matare.store') {
    return trimmed;
  }
  return 'https://www.matare.store';
}

export function getClientIp(req) {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req?.headers?.['x-real-ip'] || req?.socket?.remoteAddress || 'unknown';
}

const rateBuckets = new Map();

export function checkRateLimit(key, maxRequests = 15, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateBuckets.get(key);
  if (!entry || now - entry.windowStart >= windowMs) {
    rateBuckets.set(key, { count: 1, windowStart: now });
    // Prune stale buckets occasionally to bound memory
    if (rateBuckets.size > 2000) {
      for (const [k, v] of rateBuckets.entries()) {
        if (now - v.windowStart >= windowMs) rateBuckets.delete(k);
      }
    }
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.windowStart + windowMs - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count };
}

import { MAX_IMAGE_WIDTH, IMAGE_QUALITY } from '../constants';

export const handleFileUpload = (fileOrEvent, callback) => {
  const file = fileOrEvent?.target?.files ? fileOrEvent.target.files[0] : fileOrEvent;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = img.width > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH / img.width : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
      callback(compressed);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

export const sanitizeImageUrl = (url, fallback = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80") => {
  if (!url || typeof url !== 'string') return fallback;
  if (url.includes('images.unsplash.com/photo--') || url.includes('images.unsplash.com/-1515')) {
    return fallback;
  }
  return url;
};

export const getOptimizedImageUrl = (url, width = 450, quality = 68) => {
  const cleanUrl = sanitizeImageUrl(url);
  if (cleanUrl.includes('images.unsplash.com')) {
    try {
      const u = new URL(cleanUrl);
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', String(quality));
      return u.toString();
    } catch {
      return cleanUrl;
    }
  }
  return cleanUrl;
};

export const getUnsplashSrcSet = (url) => {
  const cleanUrl = sanitizeImageUrl(url);
  if (!cleanUrl.includes('images.unsplash.com')) return undefined;
  try {
    const u = new URL(cleanUrl);
    const base = `${u.origin}${u.pathname}`;
    return `${base}?auto=format&fit=crop&w=360&q=70 360w, ${base}?auto=format&fit=crop&w=540&q=70 540w, ${base}?auto=format&fit=crop&w=720&q=75 720w, ${base}?auto=format&fit=crop&w=1200&q=75 1200w`;
  } catch {
    return undefined;
  }
};

export const getProductCardSrcSet = (url) => {
  const cleanUrl = sanitizeImageUrl(url);
  if (!cleanUrl.includes('images.unsplash.com')) return undefined;
  try {
    const u = new URL(cleanUrl);
    const base = `${u.origin}${u.pathname}`;
    return `${base}?auto=format&fit=crop&w=320&q=65 320w, ${base}?auto=format&fit=crop&w=480&q=68 480w, ${base}?auto=format&fit=crop&w=640&q=70 640w, ${base}?auto=format&fit=crop&w=900&q=72 900w`;
  } catch {
    return undefined;
  }
};

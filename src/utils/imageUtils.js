import { MAX_IMAGE_WIDTH, IMAGE_QUALITY } from '../constants';

export const handleFileUpload = (file, callback) => {
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

export const getOptimizedImageUrl = (url, width = 600, quality = 75) => {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', String(quality));
      return u.toString();
    } catch {
      return url;
    }
  }
  return url;
};

export const getUnsplashSrcSet = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('images.unsplash.com')) return undefined;
  try {
    const u = new URL(url);
    const base = `${u.origin}${u.pathname}`;
    return `${base}?auto=format&fit=crop&w=480&q=75 480w, ${base}?auto=format&fit=crop&w=800&q=75 800w, ${base}?auto=format&fit=crop&w=1400&q=80 1400w`;
  } catch {
    return undefined;
  }
};

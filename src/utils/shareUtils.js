export const getWhatsAppLink = (product, siteSettings, lang, selectedSize = "", promoCode = "") => {
  const cleanPhone = (siteSettings?.whatsapp || "995555000000").replace(/[^0-9]/g, "");
  const code = product.sku || product.id;
  const itemUrl = `${window.location.origin}/product/${encodeURIComponent(code)}`;
  const priceText = product.oldPrice ? `${product.price} (ძველი ფასი: ${product.oldPrice})` : product.price;
  const priceTextEn = product.oldPrice ? `${product.price} (Was: ${product.oldPrice})` : product.price;

  const promoSuffixKa = promoCode ? `\n🏷️ VIP პრომო კოდი: ${promoCode} (-10% ფასდაკლება)` : "";
  const promoSuffixEn = promoCode ? `\n🏷️ VIP Promo Code: ${promoCode} (-10% Discount)` : "";

  const message = lang === "ka"
    ? `გამარჯობა! მაინტერესებს სამკაული: ${product.name} (კოდი: ${product.sku})${selectedSize ? `, ზომა: ${selectedSize}` : ""}, ფასი: ${priceText}${promoSuffixKa}\nბმული: ${itemUrl}`
    : `Hello! I am interested in: ${product.nameEn || product.name} (SKU: ${product.sku})${selectedSize ? `, Size: ${selectedSize}` : ""}, Price: ${priceTextEn}${promoSuffixEn}\nLink: ${itemUrl}`;
    
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const shareProductLink = async (product, lang, onCopySuccess) => {
  const code = product.sku || product.id;
  const shareUrl = `${window.location.origin}/product/${encodeURIComponent(code)}`;
  const title = lang === "ka" ? product.name : (product.nameEn || product.name);
  const text = `${title} (${product.sku}) - ${product.price}`;
  const imageUrl = product.images?.[0];

  // განვაახლოთ OpenGraph და Twitter მეტა-თეგები კონკრეტული ნივთის ფოტოთი (სოციალურ ქსელებში გაზიარებისთვის)
  if (imageUrl) {
    const setMeta = (selector, attr, val, content) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute(selector.startsWith('link') ? 'href' : 'content', content);
    };

    setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    setMeta('meta[property="og:image:secure_url"]', 'property', 'og:image:secure_url', imageUrl);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    setMeta('link[rel="image_src"]', 'rel', 'image_src', imageUrl);
    setMeta('meta[property="og:url"]', 'property', 'og:url', shareUrl);
    setMeta('meta[property="og:title"]', 'property', 'og:title', `${title} — მატარე`);
  }

  // სტანდარტული Web Share API (სუფთა რეჟიმი Title-ით და URL-ით)
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: shareUrl
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // მომხმარებელმა თვითონ დახურა ფანჯარა
    }
  }

  // Fallback: ბმულის დაკოპირება ბუფერში
  try {
    await navigator.clipboard.writeText(shareUrl);
  } catch (e) {}
  if (onCopySuccess) onCopySuccess();
};

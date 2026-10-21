export const getWhatsAppLink = (product, siteSettings, lang, selectedSize = "") => {
  const cleanPhone = (siteSettings.whatsapp || "995555000000").replace(/[^0-9]/g, "");
  const itemUrl = `${window.location.origin}/?item=${encodeURIComponent(product.sku || product.id)}`;
  const priceText = product.oldPrice ? `${product.price} (ძველი ფასი: ${product.oldPrice})` : product.price;
  const priceTextEn = product.oldPrice ? `${product.price} (Was: ${product.oldPrice})` : product.price;

  const message = lang === "ka"
    ? `გამარჯობა! მაინტერესებს სამკაული: ${product.name} (კოდი: ${product.sku})${selectedSize ? `, ზომა: ${selectedSize}` : ""}, ფასი: ${priceText}\nბმული: ${itemUrl}`
    : `Hello! I am interested in: ${product.nameEn || product.name} (SKU: ${product.sku})${selectedSize ? `, Size: ${selectedSize}` : ""}, Price: ${priceTextEn}\nLink: ${itemUrl}`;
    
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const shareProductLink = async (product, lang, onCopySuccess) => {
  const code = product.sku || product.id;
  const shareUrl = `${window.location.origin}/?item=${encodeURIComponent(code)}`;
  const title = lang === "ka" ? product.name : (product.nameEn || product.name);

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: `${title} (${product.sku}) - ${product.price}`,
        url: shareUrl
      });
      return;
    } catch (err) {}
  }

  navigator.clipboard.writeText(shareUrl);
  if (onCopySuccess) onCopySuccess();
};
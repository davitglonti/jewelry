export const pick = (obj, field, lang) =>
  lang === "ka" ? obj?.[field] : (obj?.[field + 'En'] || obj?.[field]);

export const formatPrice = (price) => {
  if (price === null || price === undefined) return "";
  const str = price.toString().trim();
  if (!str) return "";

  const cleaned = str.replace(/,/g, '').replace(/[^\d.]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return str.includes("₾") ? str : (str + " ₾");

  const parts = cleaned.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formattedNum = parts.length > 1 && parts[1] !== "00" && parts[1] !== "" ? (integerPart + "." + parts[1]) : integerPart;
  return formattedNum + " ₾";
};

export const calculateDiscountPercent = (price, oldPrice) => {
  if (!oldPrice) return null;
  const p1 = parseFloat(price?.toString().replace(/,/g, '').replace(/[^\d.]/g, ''));
  const p2 = parseFloat(oldPrice?.toString().replace(/,/g, '').replace(/[^\d.]/g, ''));
  if (isNaN(p1) || isNaN(p2) || p1 >= p2 || p2 <= 0) return null;
  const pct = Math.round(((p2 - p1) / p2) * 100);
  return pct > 0 ? pct : null;
};

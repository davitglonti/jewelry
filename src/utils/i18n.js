export const pick = (obj, field, lang) =>
  lang === "ka" ? obj?.[field] : (obj?.[field + 'En'] || obj?.[field]);

export const formatPrice = (price) => {
  if (price === null || price === undefined) return "";
  const str = price.toString().trim();
  if (!str) return "";
  if (str.includes("₾")) return str;
  return str + " ₾";
};

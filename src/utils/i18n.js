export const pick = (obj, field, lang) =>
  lang === "ka" ? obj?.[field] : (obj?.[`${field}En`] || obj?.[field]);


/*

სლაიდი #3
წაშლა
ბეიჯი (GE):
davboing
Badge (EN):

გასასწორებელია სილამაზით ეს ველები ადმინის გვერდზე
*/
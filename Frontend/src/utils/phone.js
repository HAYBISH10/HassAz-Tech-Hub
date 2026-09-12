export function toWhatsAppLink(rawNumber) {
  if (!rawNumber) return "";
  let digits = String(rawNumber).replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `254${digits.slice(1)}`;
  if (digits.length === 9) digits = `254${digits}`;
  return `https://wa.me/${digits}`;
}

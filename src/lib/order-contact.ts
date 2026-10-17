export function normalizeOrderPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("08") ? `62${digits.slice(1)}` : digits;
}

export function orderWhatsAppUrl(phone: string): string {
  const number = normalizeOrderPhone(phone);
  if (!number) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent("Halo Kak, kami dari Selene Apparel ingin mengonfirmasi pesanan Anda.")}`;
}
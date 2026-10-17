import { describe, expect, it } from "vitest";
import { normalizeOrderPhone, orderWhatsAppUrl } from "./order-contact";

describe("Order WhatsApp contact", () => {
  it("converts initial 08 to 628", () => expect(normalizeOrderPhone("081234567890")).toBe("6281234567890"));
  it("preserves initial 62", () => expect(normalizeOrderPhone("6281234567890")).toBe("6281234567890"));
  it("strips spaces, hyphens and dots", () => expect(normalizeOrderPhone("08 123-456.7890")).toBe("6281234567890"));
  it("uses the requested confirmation message", () => expect(orderWhatsAppUrl("081234567890")).toBe("https://wa.me/6281234567890?text=Halo%20Kak%2C%20kami%20dari%20Selene%20Apparel%20ingin%20mengonfirmasi%20pesanan%20Anda."));
});
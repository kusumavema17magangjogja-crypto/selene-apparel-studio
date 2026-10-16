import { supabase } from "@/integrations/supabase/client";

export const waLink = (phone: string, text = "Halo, saya ingin konsultasi pesanan konveksi.") =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

export const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

export function socialUrl(
  raw: string | undefined,
  platform: "instagram" | "tiktok" | "facebook" | "youtube"
): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  const h = v.replace(/^@/, "").replace(/\/+$/, "");
  const base = {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/@",
    tiktok: "https://tiktok.com/@",
  }[platform];
  return base + h;
}

export async function fetchSite() {
  const [settings, slides, garments, techniques, categories, products, texts] = await Promise.all([
    supabase.from("store_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("hero_slides").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("garment_types").select("*").order("sort_order"),
    supabase.from("techniques").select("*").order("sort_order"),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*").eq("is_featured", true).order("sort_order"),
    supabase.from("site_texts").select("*"),
  ]);
  const t: Record<string, string> = {};
  (texts.data ?? []).forEach((r) => (t[r.key] = r.value));
  return {
    settings: settings.data,
    slides: slides.data ?? [],
    garments: garments.data ?? [],
    techniques: techniques.data ?? [],
    categories: categories.data ?? [],
    products: products.data ?? [],
    texts: t,
  };
}

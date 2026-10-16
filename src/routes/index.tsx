import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, MapPin, Clock, Phone, Shirt, Sparkles, PenTool, Truck, Scissors, Palette, Menu, X, Instagram, Facebook, Youtube } from "lucide-react";
import { fetchSite, rupiah, waLink, socialUrl } from "@/lib/site";

const siteQuery = queryOptions({ queryKey: ["site"], queryFn: fetchSite });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Selene Apparel — Konveksi & Seragam Custom Yogyakarta" },
      { name: "description", content: "Partner produksi kaos, polo, kemeja PDH, jaket, sablon DTF, plastisol, bordir komputer, dan sublimasi di Yogyakarta." },
      { property: "og:title", content: "Selene Apparel — Konveksi & Seragam Custom Yogyakarta" },
      { property: "og:description", content: "Konsultasi desain dan produksi apparel custom untuk instansi, komunitas, dan brand." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  component: Index,
});

const NAV = [
  ["Beranda", "#beranda"],
  ["Katalog", "#katalog"],
  ["Jenis Pakaian", "#jenis"],
  ["Teknik Sablon/Bordir", "#teknik"],
  ["Alur Pemesanan", "#alur"],
  ["Kontak", "#kontak"],
] as const;

function Index() {
  const { data } = useSuspenseQuery(siteQuery);
  const s = data.settings;
  const phone = s?.whatsapp ?? "";
  const name = s?.store_name ?? "Selene Apparel";
  const T = data.texts as any;
  const [open, setOpen] = useState(false);
  const catName = (id: string | null) => data.categories.find((c) => c.id === id)?.name ?? "";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <a href="#beranda" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-serif text-lg font-bold text-primary-foreground">{name[0]}</span>
            <span className="font-serif text-xl font-semibold">{name}</span>
          </a>
          <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
            {NAV.map(([l, h]) => (
              <a key={h} href={h} className="text-muted-foreground transition hover:text-primary">{l}</a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/admin" className="text-sm text-muted-foreground hover:text-primary">Portal Staf</Link>
            <a href={waLink(phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-strong">
              <MessageCircle className="h-4 w-4" /> Konsultasi WhatsApp
            </a>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="border-t bg-card px-4 py-3 lg:hidden">
            {NAV.map(([l, h]) => (
              <a key={h} href={h} onClick={() => setOpen(false)} className="block py-2 text-sm">{l}</a>
            ))}
            <Link to="/admin" className="block py-2 text-sm text-muted-foreground">Portal Staf</Link>
            <a href={waLink(phone)} target="_blank" rel="noreferrer" className="mt-2 block rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground">Konsultasi WhatsApp</a>
          </div>
        )}
      </header>

      <HeroSlider slides={data.slides} phone={phone} badge={T.hero_badge} />

      <section id="katalog" className="mx-auto max-w-7xl px-4 py-20">
        <SectionHead eyebrow="Katalog" title={T.catalog_title ?? "Katalog Pilihan"} sub={T.catalog_subtitle} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.products.map((p) => (
            <article key={p.id} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {p.image_url && <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
              </div>
              <div className="p-5">
                <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">{catName(p.category_id)}</span>
                <h3 className="mt-3 text-xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-4 text-sm font-medium">Min. order <span className="text-primary">{p.min_order} pcs</span></p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="jenis" className="bg-card py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHead eyebrow="Basis Pakaian" title="Jenis Pakaian" sub="Pilih bahan dasar yang sesuai kebutuhan tim Anda." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.garments.map((g) => (
              <div key={g.id} className="overflow-hidden rounded-2xl border bg-background transition hover:border-primary/50">
                <div className="aspect-square overflow-hidden bg-muted">
                  {g.image_url ? <img src={g.image_url} alt={g.name} loading="lazy" className="h-full w-full object-cover" /> : <Shirt className="m-auto mt-16 h-16 w-16 text-primary" />}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{g.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
                  <p className="mt-3 text-sm">Mulai <span className="font-semibold text-primary">{rupiah(g.price)}</span>/pcs</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="teknik" className="mx-auto max-w-7xl px-4 py-20">
        <SectionHead eyebrow="Teknik Cetak" title="Sablon & Bordir" sub="Teknik aplikasi desain yang kami kuasai." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.techniques.map((t, i) => {
            const Icon = [Palette, Sparkles, PenTool, Scissors][i % 4]!;
            return (
              <div key={t.id} className="rounded-2xl border bg-card p-6 transition hover:border-primary/50 hover:shadow-md">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary"><Icon className="h-6 w-6" /></div>
                <h3 className="mt-4 text-lg font-semibold">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                <p className="mt-3 text-sm">+ <span className="font-semibold text-primary">{rupiah(t.price)}</span>/titik</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-ink p-10 text-ink-foreground md:p-14">
          <div className="grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Konsultasi Desain & Penawaran Kustom</p>
              <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{T.consult_title}</h2>
              <p className="mt-4 max-w-xl opacity-80">{T.consult_body}</p>
            </div>
            <div className="md:text-right">
              <a href={waLink(phone, "Halo, saya ingin kirim mockup desain dan minta penawaran.")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground transition hover:bg-primary-strong">
                <MessageCircle className="h-5 w-5" /> Kirim Mockup via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="alur" className="mx-auto max-w-7xl px-4 py-20">
        <SectionHead eyebrow="Proses" title="Alur Pemesanan" sub="Empat langkah sederhana dari ide hingga barang sampai." />
        <div className="grid gap-6 md:grid-cols-4">
          {[
            [MessageCircle, "Konsultasi", "Diskusikan kebutuhan, bahan, dan jumlah via WhatsApp."],
            [Palette, "Sampel & Desain", "Kami siapkan mockup dan sampel untuk disetujui."],
            [Scissors, "Produksi", "Potong, cetak, jahit, dan quality control."],
            [Truck, "Pengiriman", "Dikemas rapi dan dikirim ke seluruh Indonesia."],
          ].map(([Icon, t, d], i) => {
            const I = Icon as typeof Truck;
            return (
              <div key={i} className="relative rounded-2xl border bg-card p-6">
                <span className="absolute right-5 top-4 font-serif text-5xl font-bold text-primary/15">{i + 1}</span>
                <I className="h-7 w-7 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{t as string}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer id="kontak" className="border-t bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-semibold">{name}</h3>
            <p className="mt-1 text-sm text-primary">{s?.tagline}</p>
            <p className="mt-4 text-sm text-muted-foreground">{T.footer_about}</p>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-primary" />{s?.address}</li>
            <li className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-primary" />{s?.hours}</li>
            <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-primary" />+{phone}</li>
          </ul>
          <div className="md:text-right">
            <a href={waLink(phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary-strong">
              <MessageCircle className="h-4 w-4" /> Chat WhatsApp
            </a>
          </div>
        </div>
        <p className="border-t py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} {name}</p>
      </footer>

      <a href={waLink(phone)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-110 hover:bg-primary-strong">
        <MessageCircle className="h-7 w-7" />
      </a>
    </div>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string | undefined }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold md:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

type Slide = { id: string; title: string; description: string; image_url: string; cta_label: string; cta_link: string };

function HeroSlider({ slides, phone, badge }: { slides: Slide[]; phone: string; badge?: string | undefined }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);
  if (!n) return <section id="beranda" className="h-[60vh] bg-muted" />;
  return (
    <section id="beranda" className="relative h-[78vh] min-h-[480px] overflow-hidden bg-ink">
      {slides.map((s, idx) => (
        <div key={s.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <img src={s.image_url} alt={s.title} className="h-full w-full object-cover" />
          <div className="hero-overlay absolute inset-0" />
          <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-6 text-ink-foreground">
            {badge && <span className="mb-4 w-fit rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">{badge}</span>}
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">{s.title}</h1>
            <p className="mt-4 max-w-xl text-lg opacity-90">{s.description}</p>
            <a href={s.cta_link || waLink(phone)} target="_blank" rel="noreferrer" className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-strong">
              <MessageCircle className="h-5 w-5" /> {s.cta_label}
            </a>
          </div>
        </div>
      ))}
      {n > 1 && (
        <>
          <button aria-label="Sebelumnya" onClick={() => setI((i - 1 + n) % n)} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-card/20 text-ink-foreground backdrop-blur transition hover:bg-primary"><ChevronLeft /></button>
          <button aria-label="Berikutnya" onClick={() => setI((i + 1) % n)} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-card/20 text-ink-foreground backdrop-blur transition hover:bg-primary"><ChevronRight /></button>
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((s, idx) => (
              <button key={s.id} aria-label={`Slide ${idx + 1}`} onClick={() => setI(idx)} className={`h-2.5 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-2.5 bg-ink-foreground/60"}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

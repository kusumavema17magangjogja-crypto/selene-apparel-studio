import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Store, Images, Shirt, PenTool, Package, Tag, ShoppingBag, LayoutGrid, UserCheck, LogOut, ExternalLink, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CrudSection } from "@/components/admin/CrudSection";
import { StorePanel, TextsPanel, OrdersPanel, AccountPanel } from "@/components/admin/Panels";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Portal Staf — Selene Apparel" },
      { name: "description", content: "Panel admin pengelolaan konten Selene Apparel." },
      { property: "og:title", content: "Portal Staf — Selene Apparel" },
      { property: "og:description", content: "Panel admin pengelolaan konten Selene Apparel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    // The stored session must be validated server-side: a token revoked by an
    // email or password change still sits in localStorage, and using it makes
    // every save fail with "Auth session missing!".
    supabase.auth.getUser().then(({ data, error }) => {
      if (!alive) return;
      const status = (error as { status?: number } | null)?.status;
      const revoked = !!error && (status === 401 || status === 403 || /session|token/i.test(error.message));
      if (revoked || !data.user) {
        supabase.auth.signOut();
        setSession(null);
        return;
      }
      supabase.auth.getSession().then(({ data: d }) => setSession(d.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [session?.user.id]);

  if (session === undefined || (session && isAdmin === null)) return <div className="grid min-h-screen place-items-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!session) return <Login />;
  if (!isAdmin) return (
    <div className="grid min-h-screen place-items-center p-4 text-center">
      <div><h1 className="text-2xl font-semibold">Akses ditolak</h1><p className="mt-2 text-muted-foreground">Akun ini bukan admin.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Keluar</button></div>
    </div>
  );
  return <Dashboard email={session.user.email ?? ""} />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pw });
    setBusy(false);
    if (error) toast.error("Login gagal: email atau password salah");
  }
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border bg-card p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><Lock className="h-5 w-5" /></div>
          <h1 className="mt-4 text-2xl font-semibold">Portal Staf</h1>
          <p className="text-sm text-muted-foreground">Masuk untuk mengelola konten Selene Apparel</p>
        </div>
        <div><label className="mb-1 block text-sm font-medium">Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></div>
        <div><label className="mb-1 block text-sm font-medium">Password</label><input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></div>
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary-strong disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Masuk</button>
        <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-primary">← Kembali ke situs</Link>
      </form>
    </div>
  );
}

const MENU = [
  ["store", "Manajemen Toko", Store],
  ["slides", "Kelola Slider", Images],
  ["garments", "Jenis Pakaian", Shirt],
  ["techniques", "Teknik Aplikasi", PenTool],
  ["products", "Manajemen Produk", Package],
  ["categories", "Kelola Kategori", Tag],
  ["orders", "Manajemen Pesanan", ShoppingBag],
  ["texts", "Teks Utama", LayoutGrid],
  ["account", "Pengaturan Akun", UserCheck],
] as const;

function Dashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<(typeof MENU)[number][0]>("store");
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-serif text-lg font-bold text-primary-foreground">K</span>
          <div className="leading-tight"><p className="font-serif font-semibold">Karsa Admin</p><p className="text-xs text-muted-foreground">Content workspace</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" target="_blank" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-primary sm:inline-flex"><ExternalLink className="h-4 w-4" /> Lihat situs</Link>
          <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:border-primary hover:text-primary"><LogOut className="h-4 w-4" /> Keluar</button>
        </div>
      </header>
      <div className="flex flex-col md:flex-row">
        <aside className="border-b bg-sidebar md:sticky md:top-[61px] md:h-[calc(100vh-61px)] md:w-64 md:min-w-[250px] md:border-b-0 md:border-r">
          <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col">
            {MENU.map(([k, label, Icon]) => (
              <button key={k} onClick={() => setTab(k)} className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${tab === k ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <Icon className="h-4 w-4 shrink-0" /> <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-8">
          {tab === "store" && <StorePanel />}
          {tab === "slides" && <CrudSection key="s" table="hero_slides" title="Kelola Slider" defaults={{ title: "", description: "", image_url: "", cta_label: "Konsultasi Sekarang", cta_link: "", is_active: true }} fields={[
            { key: "image_url", label: "Gambar", type: "image", list: true },
            { key: "title", label: "Judul", type: "text", list: true },
            { key: "description", label: "Deskripsi", type: "textarea" },
            { key: "cta_label", label: "Teks Tombol CTA", type: "text" },
            { key: "cta_link", label: "Link CTA (kosongkan = WhatsApp)", type: "text" },
            { key: "sort_order", label: "Urutan", type: "number", list: true },
            { key: "is_active", label: "Tampilkan", type: "checkbox", list: true },
          ]} />}
          {tab === "garments" && <CrudSection key="g" table="garment_types" title="Jenis Pakaian" defaults={{ name: "", description: "", price: 0, image_url: "" }} fields={[
            { key: "image_url", label: "Gambar", type: "image", list: true },
            { key: "name", label: "Nama", type: "text", list: true },
            { key: "description", label: "Deskripsi", type: "textarea" },
            { key: "price", label: "Harga Mulai (Rp)", type: "price", list: true },
            { key: "sort_order", label: "Urutan", type: "number" },
          ]} />}
          {tab === "techniques" && <CrudSection key="t" table="techniques" title="Teknik Aplikasi" defaults={{ name: "", description: "", price: 0, image_url: "" }} fields={[
            { key: "name", label: "Nama", type: "text", list: true },
            { key: "description", label: "Deskripsi", type: "textarea", list: true },
            { key: "price", label: "Harga (Rp)", type: "price", list: true },
            { key: "sort_order", label: "Urutan", type: "number" },
          ]} />}
          {tab === "products" && <CrudSection key="p" table="products" title="Manajemen Produk" defaults={{ name: "", description: "", image_url: "", min_order: 24, is_featured: true, category_id: null }} fields={[
            { key: "image_url", label: "Gambar", type: "image", list: true },
            { key: "name", label: "Nama Produk", type: "text", list: true },
            { key: "category_id", label: "Kategori", type: "category", list: true },
            { key: "description", label: "Deskripsi", type: "textarea" },
            { key: "min_order", label: "Minimal Order (pcs)", type: "number", list: true },
            { key: "sort_order", label: "Urutan", type: "number" },
            { key: "is_featured", label: "Tampilkan di Katalog", type: "checkbox", list: true },
          ]} />}
          {tab === "categories" && <CrudSection key="c" table="categories" title="Kelola Kategori" defaults={{ name: "" }} fields={[
            { key: "name", label: "Nama Kategori", type: "text", list: true },
            { key: "sort_order", label: "Urutan", type: "number", list: true },
          ]} />}
          {tab === "orders" && <OrdersPanel />}
          {tab === "texts" && <TextsPanel />}
          {tab === "account" && <AccountPanel email={email} />}
        </main>
      </div>
    </div>
  );
}

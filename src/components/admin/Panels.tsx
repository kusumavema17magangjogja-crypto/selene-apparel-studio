import { useEffect, useState } from "react";
import { Loader2, Download, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { orderWhatsAppUrl } from "@/lib/order-contact";

const inputCls = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-muted disabled:text-muted-foreground";
const btnCls = "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong disabled:opacity-60";

export function StorePanel() {
  const [s, setS] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { supabase.from("store_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => setS(data ?? { id: 1 })); }, []);
  if (!s) return <Loader2 className="animate-spin text-primary" />;
  const fields: [string, string][] = [
    ["store_name", "Nama Toko"],
    ["tagline", "Tagline"],
    ["whatsapp", "Nomor WhatsApp (format 62...)"],
    ["address", "Alamat"],
    ["hours", "Jam Operasional"],
    ["email", "Email"],
    ["instagram", "Instagram (@username atau URL)"],
    ["tiktok", "TikTok (@username atau URL)"],
    ["facebook", "Facebook (nama halaman atau URL)"],
    ["youtube", "YouTube (@channel atau URL)"],
  ];
  async function save() {
    setSaving(true);
    const { error } = await supabase.from("store_settings").upsert({ ...(s as any), id: 1, updated_at: new Date().toISOString() });
    setSaving(false);
    error ? toast.error(error.message) : toast.success("Profil toko disimpan");
  }
  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-2xl font-semibold">Manajemen Toko</h2>
      <div className="space-y-4 rounded-2xl border bg-card p-6">
        {fields.map(([k, l]) => (
          <div key={k}>
            <label className="mb-1 block text-sm font-medium">{l}</label>
            <input value={s[k] ?? ""} onChange={(e) => setS({ ...s, [k]: e.target.value })} className={inputCls} />
          </div>
        ))}
        <button onClick={save} disabled={saving} className={btnCls}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Simpan Perubahan</button>
      </div>
    </div>
  );
}

export function TextsPanel() {
  const [rows, setRows] = useState<{ key: string; label: string; value: string; sort_order: number }[]>([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { supabase.from("site_texts").select("*").order("sort_order").then(({ data }) => setRows(data ?? [])); }, []);
  async function save() {
    setSaving(true);
    const { error } = await supabase.from("site_texts").upsert(rows);
    setSaving(false);
    error ? toast.error(error.message) : toast.success("Teks utama disimpan");
  }
  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-2xl font-semibold">Teks Utama</h2>
      <div className="space-y-4 rounded-2xl border bg-card p-6">
        {rows.map((r, i) => (
          <div key={r.key}>
            <label className="mb-1 block text-sm font-medium">{r.label}</label>
            <textarea rows={r.value.length > 80 ? 3 : 1} value={r.value} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} className={inputCls} />
          </div>
        ))}
        <button onClick={save} disabled={saving} className={btnCls}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Simpan Teks</button>
      </div>
    </div>
  );
}

const STATUS = [["pending", "Pending"], ["produksi", "Sedang Diproduksi"], ["selesai", "Selesai"]] as const;
type Order = { id: string; customer_name: string; phone: string; product: string; quantity: number; notes: string; status: string; created_at: string };

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<string>("pending");
  const [form, setForm] = useState<Partial<Order> | null>(null);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [customProduct, setCustomProduct] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  async function loadProducts() {
    setProductsLoading(true);
    const { data, error } = await supabase.from("products").select("id,name").order("sort_order").order("name");
    if (error) toast.error("Daftar produk gagal dimuat. Silakan buka kembali formulir.");
    else setProducts(data ?? []);
    setProductsLoading(false);
    return data ?? [];
  }
  async function openForm(order?: Order) {
    const options = await loadProducts();
    setCustomProduct(!!order?.product && !options.some((p) => p.name === order.product));
    setForm(order ? { ...order } : { quantity: 24, product: "" });
  }
  async function load() { const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }); setOrders(data ?? []); }
  useEffect(() => { load(); loadProducts(); }, []);
  const list = orders.filter((o) => o.status === tab);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    error ? toast.error(error.message) : (toast.success("Status diperbarui"), load());
  }
  async function del(id: string) {
    if (!confirm("Hapus pesanan ini?")) return;
    await supabase.from("orders").delete().eq("id", id); load();
  }
  async function add() {
    if (!form?.customer_name?.trim()) return void toast.error("Nama pemesan wajib diisi");
    if (!form.product?.trim()) return void toast.error("Pilih produk atau isi nama produk kustom");
    setSavingOrder(true);
    try {
      const payload = { customer_name: form.customer_name.trim(), phone: form.phone ?? "", product: form.product.trim(), quantity: Number(form.quantity) || 1, notes: form.notes ?? "", status: form.status ?? "pending" };
      const { error } = form.id
        ? await supabase.from("orders").update(payload).eq("id", form.id)
        : await supabase.from("orders").insert(payload);
      if (error) return void toast.error(error.message);
      toast.success(form.id ? "Pesanan diperbarui" : "Pesanan ditambahkan"); setForm(null); load();
    } catch { toast.error("Pesanan gagal disimpan. Silakan coba lagi."); }
    finally { setSavingOrder(false); }
  }
  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = ["Tanggal", "Nama", "Telepon", "Produk", "Jumlah", "Catatan", "Status"];
    const lines = list.map((o) => [new Date(o.created_at).toLocaleDateString("id-ID"), o.customer_name, o.phone, o.product, o.quantity, o.notes, STATUS.find((s) => s[0] === o.status)?.[1]].map(esc).join(","));
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `pesanan-${tab}.csv`; a.click();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Manajemen Pesanan</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openForm()}><Plus /> Tambah</Button>
          <Button onClick={exportCsv}><Download /> Ekspor CSV</Button>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === k ? "bg-primary text-primary-foreground" : "bg-card border hover:border-primary hover:text-primary"}`}>
            {l} <span className="ml-1 opacity-70">({orders.filter((o) => o.status === k).length})</span>
          </button>
        ))}
      </div>
      {form && (
        <div className="mb-4 grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-5">
          <input placeholder="Nama pemesan" maxLength={100} className={inputCls} value={form.customer_name ?? ""} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
          <input placeholder="WhatsApp" maxLength={20} className={inputCls} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="min-w-0 space-y-2">
            <select aria-label="Produk" disabled={productsLoading || savingOrder} className={inputCls} value={customProduct ? "__custom__" : products.find((p) => p.name === form.product)?.id ?? ""} onChange={(e) => {
              const custom = e.target.value === "__custom__";
              setCustomProduct(custom);
              setForm({ ...form, product: custom ? "" : products.find((p) => p.id === e.target.value)?.name ?? "" });
            }}>
              <option value="" disabled>{productsLoading ? "Memuat produk…" : "Pilih produk"}</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              <option value="__custom__">Lainnya / Kustom</option>
            </select>
            {customProduct && <input aria-label="Nama produk kustom" placeholder="Nama produk kustom" maxLength={100} className={inputCls} value={form.product ?? ""} onChange={(e) => setForm({ ...form, product: e.target.value })} />}
          </div>
          <input type="number" placeholder="Jumlah" className={inputCls} value={form.quantity ?? ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          <div className="flex gap-2"><Button onClick={add} disabled={savingOrder}>{savingOrder && <Loader2 className="animate-spin" />}Simpan</Button><Button variant="outline" disabled={savingOrder} onClick={() => setForm(null)}>Batal</Button></div>
          <input placeholder="Catatan" maxLength={500} className={`${inputCls} md:col-span-5`} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Pemesan</th><th className="px-4 py-3">Produk</th><th className="px-4 py-3">Jumlah</th><th className="px-4 py-3">Status</th><th /></tr>
          </thead>
          <tbody>
            {list.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Tidak ada pesanan</td></tr> : list.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="whitespace-nowrap px-4 py-3">{new Date(o.created_at).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-3"><div className="font-medium">{o.customer_name}</div>{orderWhatsAppUrl(o.phone) ? <a href={orderWhatsAppUrl(o.phone)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${o.customer_name}: ${o.phone}`} className="inline-flex items-center gap-1.5 text-xs text-success underline-offset-4 hover:underline focus-visible:underline">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor"><path d="M20.5 3.5A11.9 11.9 0 0 0 12 0 12 12 0 0 0 1.6 18L0 24l6.2-1.6A12 12 0 0 0 24 12c0-3.2-1.2-6.2-3.5-8.5ZM12 22a10 10 0 0 1-5.1-1.4l-.4-.2-3.7 1 1-3.6-.3-.4A10 10 0 1 1 12 22Zm5.5-7.5c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.2 8.2 0 0 1-4-3.5c-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.6l-1-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.8.4-.3.3-1 1-1 2.4s1 2.7 1.2 2.9c.1.2 2 3.1 4.9 4.4 1.8.8 2.5.9 3.4.8.5-.1 1.8-.8 2-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.3Z" /></svg>{o.phone}
                </a> : <span className="text-xs text-muted-foreground">{o.phone || "—"}</span>}</td>
                <td className="px-4 py-3">{o.product}<div className="text-xs text-muted-foreground">{o.notes}</div></td>
                <td className="px-4 py-3">{o.quantity} pcs</td>
                <td className="px-4 py-3">
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="rounded-full border border-primary/40 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    {STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" aria-label={`Edit pesanan ${o.customer_name}`} title="Edit pesanan" onClick={() => openForm(o)}><Pencil /></Button><Button variant="ghost" size="icon" aria-label="Hapus" onClick={() => del(o.id)} className="hover:bg-destructive/10 hover:text-destructive"><Trash2 /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { AccountPanel } from "./AccountPanel";

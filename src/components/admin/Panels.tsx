import { useEffect, useState } from "react";
import { Loader2, Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  async function load() { const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }); setOrders(data ?? []); }
  useEffect(() => { load(); }, []);
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
    const { error } = await supabase.from("orders").insert({ customer_name: form.customer_name.trim(), phone: form.phone ?? "", product: form.product ?? "", quantity: Number(form.quantity) || 1, notes: form.notes ?? "", status: "pending" });
    if (error) return void toast.error(error.message);
    toast.success("Pesanan ditambahkan"); setForm(null); load();
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
          <button onClick={() => setForm({ quantity: 24 })} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"><Plus className="h-4 w-4" /> Tambah</button>
          <button onClick={exportCsv} className={btnCls}><Download className="h-4 w-4" /> Ekspor CSV</button>
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
          <input placeholder="Produk" maxLength={100} className={inputCls} value={form.product ?? ""} onChange={(e) => setForm({ ...form, product: e.target.value })} />
          <input type="number" placeholder="Jumlah" className={inputCls} value={form.quantity ?? ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          <div className="flex gap-2"><button onClick={add} className={btnCls}>Simpan</button><button onClick={() => setForm(null)} className="rounded-lg border px-3 text-sm">Batal</button></div>
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
                <td className="px-4 py-3"><div className="font-medium">{o.customer_name}</div><div className="text-xs text-muted-foreground">{o.phone}</div></td>
                <td className="px-4 py-3">{o.product}<div className="text-xs text-muted-foreground">{o.notes}</div></td>
                <td className="px-4 py-3">{o.quantity} pcs</td>
                <td className="px-4 py-3">
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="rounded-full border border-primary/40 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    {STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right"><button aria-label="Hapus" onClick={() => del(o.id)} className="rounded p-2 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { AccountPanel } from "./AccountPanel";

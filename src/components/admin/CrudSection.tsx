import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageDropzone } from "./ImageDropzone";
import { rupiah } from "@/lib/site";

export type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "price" | "image" | "checkbox" | "category";
  list?: boolean;
};

type Row = any;
type Table = "hero_slides" | "garment_types" | "techniques" | "products" | "categories";

export function CrudSection({ table, title, fields, defaults }: { table: Table; title: string; fields: Field[]; defaults: Row }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [cats, setCats] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from(table).select("*").order("sort_order");
    setRows(data ?? []);
    if (fields.some((f) => f.type === "category")) {
      const c = await supabase.from("categories").select("*").order("sort_order");
      setCats(c.data ?? []);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, [table]);

  async function save() {
    if (!edit) return;
    setSaving(true);
    const { id, created_at, ...payload } = edit;
    const res = id
      ? await supabase.from(table).update(payload as never).eq("id", id)
      : await supabase.from(table).insert(payload as never);
    setSaving(false);
    if (res.error) return void toast.error(res.error.message);
    toast.success("Tersimpan");
    setEdit(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Hapus data ini?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return void toast.error(error.message);
    toast.success("Dihapus");
    load();
  }

  const show = (f: Field, r: Row) => {
    const v = r[f.key];
    if (f.type === "image") return v ? <img src={v} alt="" className="h-12 w-20 rounded object-cover" /> : "—";
    if (f.type === "price") return rupiah(v ?? 0);
    if (f.type === "checkbox") return v ? "Ya" : "Tidak";
    if (f.type === "category") return cats.find((c) => c.id === v)?.name ?? "—";
    return <span className="line-clamp-2">{String(v ?? "")}</span>;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <button onClick={() => setEdit({ ...defaults, sort_order: rows.length + 1 })} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong">
          <Plus className="h-4 w-4" /> Tambah
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              {fields.filter((f) => f.list).map((f) => <th key={f.key} className="px-4 py-3">{f.label}</th>)}
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="p-8 text-center"><Loader2 className="mx-auto animate-spin text-primary" /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Belum ada data</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-t">
                {fields.filter((f) => f.list).map((f) => <td key={f.key} className="px-4 py-3">{show(f, r)}</td>)}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button aria-label="Ubah" onClick={() => setEdit(r)} className="rounded p-2 hover:bg-accent hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button aria-label="Hapus" onClick={() => remove(r.id)} className="rounded p-2 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-serif">{edit?.id ? "Ubah" : "Tambah"} {title}</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.key}>
                  {f.type !== "checkbox" && <label className="mb-1 block text-sm font-medium">{f.label}</label>}
                  {f.type === "image" ? (
                    <ImageDropzone value={edit[f.key] ?? ""} onChange={(v) => setEdit({ ...edit, [f.key]: v })} />
                  ) : f.type === "textarea" ? (
                    <textarea rows={3} value={edit[f.key] ?? ""} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  ) : f.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={!!edit[f.key]} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.checked })} className="accent-primary" /> {f.label}</label>
                  ) : f.type === "category" ? (
                    <select value={edit[f.key] ?? ""} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value || null })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                      <option value="">— Pilih kategori —</option>
                      {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  ) : (
                    <input type={f.type === "text" ? "text" : "number"} value={edit[f.key] ?? ""} onChange={(e) => setEdit({ ...edit, [f.key]: f.type === "text" ? e.target.value : Number(e.target.value) })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEdit(null)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Batal</button>
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-strong disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Simpan
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

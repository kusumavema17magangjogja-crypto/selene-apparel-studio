import { useRef, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const MAX = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageDropzone({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  async function upload(file: File) {
    if (!TYPES.includes(file.type)) return toast.error("Format harus JPG, PNG, atau WEBP");
    if (file.size > MAX) return toast.error("Ukuran maksimal 5MB");
    setBusy(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file, { contentType: file.type });
    if (error) { setBusy(false); return toast.error("Gagal mengunggah: " + error.message); }
    const { data, error: e2 } = await supabase.storage.from("site-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setBusy(false);
    if (e2 || !data) return toast.error("Gagal membuat tautan gambar");
    setPicked(file.name);
    onChange(data.signedUrl);
    toast.success("Gambar berhasil diunggah");
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${drag ? "border-primary bg-primary-soft" : "border-primary/50 bg-primary-soft/40"}`}
      >
        {busy ? <Loader2 className="h-9 w-9 animate-spin text-primary" /> : <UploadCloud className="h-9 w-9 text-primary" />}
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="mt-3 cursor-pointer rounded-lg bg-primary-strong px-4 py-2 font-medium text-primary-foreground shadow-sm transition hover:bg-primary disabled:opacity-60">
          {busy ? "Mengunggah..." : "Pilih File Gambar"}
        </button>
        <p className="mt-2 text-xs text-muted-foreground">atau seret dan lepas gambar ke sini (Maks 5MB. Format: JPG, PNG, WEBP)</p>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      </div>
      {picked && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm font-medium text-success">
          <span className="truncate">✓ Terpilih: {picked}</span>
          <button type="button" aria-label="Batal" onClick={() => { setPicked(null); onChange(""); }} className="rounded p-0.5 hover:bg-success/10"><X className="h-4 w-4" /></button>
        </div>
      )}
      <div>
        <label className="text-xs font-medium text-muted-foreground">atau masukkan URL Foto</label>
        <input value={value} onChange={(e) => { setPicked(null); onChange(e.target.value); }} placeholder="https://..." className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </div>
      {value && <img src={value} alt="Pratinjau" className="h-32 w-full rounded-lg object-cover" />}
    </div>
  );
}

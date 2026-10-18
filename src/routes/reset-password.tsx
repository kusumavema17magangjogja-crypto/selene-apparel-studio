import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { describeAuthError } from "@/components/admin/AccountPanel";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password — Selene Apparel" },
      { name: "description", content: "Atur ulang password akun staf Selene Apparel." },
      { property: "og:title", content: "Reset Password — Selene Apparel" },
      { property: "og:description", content: "Atur ulang password akun staf Selene Apparel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

const inputCls = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: d }) => {
      if (d.session) setReady(true);
      else setTimeout(() => setReady((r) => r ?? false), 2500);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) return void toast.error("Password minimal 6 karakter");
    if (pw !== confirm) return void toast.error("Konfirmasi password tidak cocok");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return void toast.error(describeAuthError(error.message));
    toast.success("Password berhasil diubah! Mengalihkan ke dashboard...");
    setTimeout(() => navigate({ to: "/admin" }), 1500);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border bg-card p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><KeyRound className="h-5 w-5" /></div>
          <h1 className="mt-4 text-2xl font-semibold">Reset Password</h1>
          <p className="text-sm text-muted-foreground">Buat password baru untuk akun Anda</p>
        </div>
        {ready === null && <div className="flex justify-center"><Loader2 className="animate-spin text-primary" /></div>}
        {ready === false && <p className="text-center text-sm text-destructive">Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru lewat "Lupa password?" di halaman login.</p>}
        {ready && <>
          <div>
            <div className="mb-1 flex items-center justify-between"><label htmlFor="np" className="text-sm font-medium">Password Baru</label>
              <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Sembunyikan password" : "Tampilkan password"} className="text-muted-foreground hover:text-primary">{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            <input id="np" type={visible ? "text" : "password"} autoComplete="new-password" minLength={6} required value={pw} onChange={(e) => setPw(e.target.value)} className={inputCls} />
          </div>
          <div><label htmlFor="cp" className="mb-1 block text-sm font-medium">Konfirmasi Password Baru</label>
            <input id="cp" type={visible ? "text" : "password"} autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
            {confirm && pw !== confirm && <p className="mt-1 text-xs text-destructive">Password tidak cocok</p>}
          </div>
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary-strong disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Simpan Password Baru</button>
        </>}
        <a href="/admin" className="block text-center text-sm text-muted-foreground hover:text-primary">← Kembali ke login</a>
      </form>
    </div>
  );
}

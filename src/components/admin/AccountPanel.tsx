import { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const inputCls = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-muted disabled:text-muted-foreground";

export function AccountPanel({ email }: { email: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [busyEmail, setBusyEmail] = useState(false);
  const [busyPassword, setBusyPassword] = useState(false);

  async function updateEmail(event: React.FormEvent) {
    event.preventDefault();
    const nextEmail = newEmail.trim();
    if (!/^\S+@\S+\.\S+$/.test(nextEmail)) return void toast.error("Format email tidak valid");
    if (nextEmail.toLowerCase() === email.toLowerCase()) return void toast.error("Email baru harus berbeda dari email aktif");
    setBusyEmail(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ email: nextEmail });
      if (error) return void toast.error(error.message);
      if (data.user?.email?.toLowerCase() === nextEmail.toLowerCase()) {
        setPendingEmail("");
        toast.success("Email berhasil diperbarui");
      } else {
        setPendingEmail(nextEmail);
        toast.success("Permintaan ganti email dikirim. Periksa email lama dan baru untuk konfirmasi.");
      }
      setNewEmail("");
    } catch {
      toast.error("Email belum berhasil diubah. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusyEmail(false);
    }
  }

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault();
    if (!currentPassword) return void toast.error("Password saat ini wajib diisi");
    if (password.length < 6) return void toast.error("Password minimal 6 karakter");
    if (password !== confirmation) return void toast.error("Konfirmasi password tidak cocok");
    setBusyPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password, current_password: currentPassword });
      if (error) return void toast.error(error.message);
      toast.success("Password berhasil diperbarui");
      setCurrentPassword("");
      setPassword("");
      setConfirmation("");
    } catch {
      toast.error("Password belum berhasil diubah. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusyPassword(false);
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Pengaturan Akun</h2>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <form onSubmit={updateEmail} className="space-y-4 rounded-lg border bg-card p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Mail className="h-5 w-5 text-primary" />Ganti Email</h3>
          <div><label htmlFor="active-email" className="mb-1 block text-sm font-medium">Email aktif</label><input id="active-email" readOnly value={email} className={`${inputCls} bg-muted text-muted-foreground`} /></div>
          <div><label htmlFor="new-email" className="mb-1 block text-sm font-medium">Email Baru</label><input id="new-email" type="email" autoComplete="email" required maxLength={255} disabled={busyEmail} value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className={inputCls} /></div>
          {pendingEmail && pendingEmail !== email && <p role="status" className="break-words text-sm text-muted-foreground">Menunggu konfirmasi: {pendingEmail}. Periksa kotak masuk email lama dan baru.</p>}
          <Button type="submit" disabled={busyEmail}>{busyEmail && <Loader2 className="animate-spin" />}Perbarui Email</Button>
        </form>
        <form onSubmit={updatePassword} className="space-y-4 rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><LockKeyhole className="h-5 w-5 text-primary" />Ganti Password</h3>
            <Button type="button" size="icon" variant="ghost" aria-label={visible ? "Sembunyikan password" : "Tampilkan password"} title={visible ? "Sembunyikan password" : "Tampilkan password"} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff /> : <Eye />}</Button>
          </div>
          <div><label htmlFor="current-password" className="mb-1 block text-sm font-medium">Password Saat Ini</label><input id="current-password" type={visible ? "text" : "password"} autoComplete="current-password" required disabled={busyPassword} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputCls} /></div>
          <div><label htmlFor="new-password" className="mb-1 block text-sm font-medium">Password Baru</label><input id="new-password" type={visible ? "text" : "password"} autoComplete="new-password" minLength={6} required disabled={busyPassword} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} /></div>
          <div><label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">Konfirmasi Password Baru</label><input id="confirm-password" type={visible ? "text" : "password"} autoComplete="new-password" required disabled={busyPassword} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} aria-invalid={!!confirmation && password !== confirmation} className={inputCls} />
            {confirmation && password !== confirmation && <p className="mt-1 text-xs text-destructive">Password tidak cocok</p>}
          </div>
          <Button type="submit" disabled={busyPassword}>{busyPassword && <Loader2 className="animate-spin" />}Simpan Password Baru</Button>
        </form>
      </div>
    </div>
  );
}
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Toaster, toast } from "sonner";
import * as XLSX from "xlsx";
import { Header } from "@/components/Header";
import { useRealtimeClock } from "@/hooks/useRealtimeClock";
import { useTamu } from "@/hooks/useTamu";
import { formatJam, formatTanggalID, toISODate } from "@/utils/dateUtils";
import { ArrowLeft, Loader2, RotateCcw, Save, UserCheck, Search, Download, Inbox, Trash2 } from "lucide-react";

export const Route = createFileRoute("/tamu")({
  component: BukuTamu,
  head: () => ({
    meta: [
      { title: "Buku Tamu — SIPADU" },
      { name: "description", content: "Catat kunjungan tamu instansi/lapas/rutan." },
    ],
  }),
});

interface FormState {
  namaTamu: string;
  asalInstansi: string;
  alamat: string;
  keperluan: string;
}
const emptyForm = (): FormState => ({ namaTamu: "", asalInstansi: "", alamat: "", keperluan: "" });

function BukuTamu() {
  const { data, create, remove } = useTamu();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();
  const now = useRealtimeClock();
  const firstRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const required: Array<[keyof FormState, string]> = [
      ["namaTamu", "Nama Tamu"],
      ["asalInstansi", "Asal Instansi/Lapas/Rutan"],
      ["alamat", "Alamat Rumah"],
      ["keperluan", "Keperluan"],
    ];
    for (const [k, label] of required) {
      if (!form[k].trim()) {
        toast.error(`${label} wajib diisi`);
        formRef.current?.querySelector<HTMLElement>(`[name="${k}"]`)?.focus();
        return;
      }
    }
    setSubmitting(true);
    try {
      await create({
        tanggal: toISODate(new Date()),
        jam: formatJam(new Date()).slice(0, 5),
        namaTamu: form.namaTamu.trim(),
        asalInstansi: form.asalInstansi.trim(),
        alamat: form.alamat.trim(),
        keperluan: form.keperluan.trim(),
      });
      toast.success("Informasi sudah disimpan");
      setForm(emptyForm());
      navigate({ to: "/" });
    } catch (e) {
      toast.error("Gagal menyimpan data tamu");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = (e: FormEvent) => { e.preventDefault(); submit(); };

  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Escape") { e.preventDefault(); setForm(emptyForm()); firstRef.current?.focus(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); submit(); return; }
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" && e.shiftKey) return;
      e.preventDefault();
      const focusables = Array.from(formRef.current!.querySelectorAll<HTMLElement>(
        'input:not([disabled]), textarea:not([disabled]), button[type="submit"]',
      )).filter((el) => !el.hasAttribute("data-skip-enter"));
      const idx = focusables.indexOf(target);
      if (idx >= 0 && idx < focusables.length - 1) focusables[idx + 1].focus();
      else submit();
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((t) =>
      [t.namaTamu, t.asalInstansi, t.alamat, t.keperluan].join(" ").toLowerCase().includes(s),
    );
  }, [data, q]);

  const todayTotal = data.filter((t) => t.tanggal === toISODate(new Date())).length;

  const exportExcel = () => {
    if (data.length === 0) return toast.error("Tidak ada data untuk diexport");
    const rows = filtered.map((t, i) => ({
      No: i + 1,
      Tanggal: formatTanggalID(t.tanggal),
      Jam: t.jam,
      "Nama Tamu": t.namaTamu,
      "Asal Instansi/Lapas/Rutan": t.asalInstansi,
      "Alamat Rumah": t.alamat,
      Keperluan: t.keperluan,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buku Tamu");
    XLSX.writeFile(wb, `buku-tamu-${toISODate(new Date())}.xlsx`);
    toast.success("Buku tamu berhasil diexport");
  };

  const handleDelete = async (id: string) => {
    try { await remove(id); toast.success("Data tamu dihapus"); }
    catch (e) { toast.error("Gagal menghapus"); console.error(e); }
    finally { setConfirmId(null); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors closeButton />
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-5 space-y-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>

        <section className="bg-card text-card-foreground rounded-xl border border-border shadow-card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2"><UserCheck className="h-5 w-5" /> Form Buku Tamu</h2>
              <p className="text-xs text-muted-foreground">
                Hari ini: <span className="font-medium">{formatTanggalID(now)}</span> · pukul <span className="font-mono">{formatJam(now)}</span> · {todayTotal} tamu tercatat
              </p>
            </div>
          </div>
          <form ref={formRef} onSubmit={onSubmit} onKeyDown={onKeyDown} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground/80">Tanggal (otomatis)</span>
              <input className="input bg-muted cursor-not-allowed" value={formatTanggalID(now)} readOnly tabIndex={-1} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground/80">Nama Tamu<span className="text-destructive ml-0.5">*</span></span>
              <input ref={firstRef} name="namaTamu" className="input" value={form.namaTamu}
                onChange={(e) => set("namaTamu", e.target.value)} placeholder="Nama lengkap tamu" autoComplete="off" />
            </label>
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-xs font-medium text-foreground/80">Asal Instansi / Lapas / Rutan<span className="text-destructive ml-0.5">*</span></span>
              <input name="asalInstansi" className="input" value={form.asalInstansi}
                onChange={(e) => set("asalInstansi", e.target.value)} placeholder="cth: Lapas Klas IIA Bandung" autoComplete="off" />
            </label>
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-xs font-medium text-foreground/80">Alamat Rumah<span className="text-destructive ml-0.5">*</span></span>
              <textarea name="alamat" rows={2} className="input resize-none" value={form.alamat}
                onChange={(e) => set("alamat", e.target.value)} placeholder="Alamat lengkap" />
            </label>
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-xs font-medium text-foreground/80">Keperluan<span className="text-destructive ml-0.5">*</span></span>
              <textarea name="keperluan" rows={2} className="input resize-none" value={form.keperluan}
                onChange={(e) => set("keperluan", e.target.value)} placeholder="Maksud dan tujuan kunjungan" />
            </label>

            <div className="md:col-span-2 flex flex-wrap gap-2 pt-2 border-t border-border">
              <button type="submit" disabled={submitting}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 h-10 text-sm font-medium hover:opacity-90 disabled:opacity-60">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Data <span className="hidden sm:inline opacity-70 ml-1 text-xs">(Ctrl+S)</span>
              </button>
              <button type="button" data-skip-enter onClick={() => { setForm(emptyForm()); firstRef.current?.focus(); }}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 h-10 text-sm font-medium hover:bg-accent">
                <RotateCcw className="h-4 w-4" /> Reset <span className="hidden sm:inline opacity-70 ml-1 text-xs">(Esc)</span>
              </button>
            </div>
          </form>

          <style>{`
            .input{width:100%;height:2.5rem;padding:0 .75rem;border-radius:.5rem;border:1px solid var(--color-input);background:var(--color-card);color:var(--color-card-foreground);font-size:.9rem;outline:none;transition:border-color .15s,box-shadow .15s}
            textarea.input{height:auto;padding:.5rem .75rem}
            .input:focus{border-color:var(--color-ring);box-shadow:0 0 0 3px color-mix(in oklab,var(--color-ring) 20%,transparent)}
          `}</style>
        </section>

        <section className="bg-card text-card-foreground rounded-xl border border-border shadow-card">
          <div className="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Daftar Tamu</h2>
              <p className="text-xs text-muted-foreground">Total {data.length} entri{q && ` · ${filtered.length} hasil`}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari tamu, instansi..."
                  className="h-10 pl-9 pr-3 rounded-md border border-input bg-card text-sm w-64 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring" />
              </div>
              <button onClick={exportExcel}
                className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-card text-sm hover:bg-accent">
                <Download className="h-4 w-4" /> Export Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2.5 text-left w-12">No</th>
                  <th className="px-3 py-2.5 text-left w-32">Tanggal</th>
                  <th className="px-3 py-2.5 text-left w-16">Jam</th>
                  <th className="px-3 py-2.5 text-left">Nama Tamu</th>
                  <th className="px-3 py-2.5 text-left">Asal Instansi</th>
                  <th className="px-3 py-2.5 text-left">Keperluan</th>
                  <th className="px-3 py-2.5 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-16">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Inbox className="h-10 w-10 opacity-50" />
                      <p className="text-sm">{q ? "Tidak ada hasil pencarian." : "Belum ada data tamu."}</p>
                    </div>
                  </td></tr>
                ) : filtered.map((t, i) => (
                  <tr key={t.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-3 py-2.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-2.5">{formatTanggalID(t.tanggal)}</td>
                    <td className="px-3 py-2.5 font-mono">{t.jam}</td>
                    <td className="px-3 py-2.5 font-medium">{t.namaTamu}</td>
                    <td className="px-3 py-2.5">{t.asalInstansi}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{t.keperluan}</td>
                    <td className="px-3 py-2.5 text-center">
                      <button onClick={() => setConfirmId(t.id)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {confirmId && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmId(null)}>
              <div className="bg-card text-card-foreground rounded-xl border border-border max-w-sm w-full p-5" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-base font-semibold">Hapus data tamu?</h3>
                <p className="text-sm text-muted-foreground mt-1">Data tidak dapat dikembalikan.</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setConfirmId(null)} className="h-9 px-3 rounded-md border border-border text-sm hover:bg-accent">Batal</button>
                  <button onClick={() => handleDelete(confirmId)}
                    className="h-9 px-3 rounded-md bg-destructive text-destructive-foreground text-sm hover:opacity-90">Hapus</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        SIPADU · Sistem Informasi Pelayanan dan Buku Tamu Terpadu
      </footer>
    </div>
  );
}

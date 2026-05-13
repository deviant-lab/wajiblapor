import { createFileRoute } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Header } from "@/components/Header";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRealtimeClock } from "@/hooks/useRealtimeClock";
import {
  KUNJUNGAN_STORAGE_KEY,
  generateKunjunganId,
  type Kunjungan,
} from "@/services/kunjunganService";
import { STORAGE_KEY, type Laporan } from "@/services/laporanService";
import { formatJam, formatTanggalID, toISODate } from "@/utils/dateUtils";
import { CalendarDays, Check, Download, Inbox, Search, Trash2, UserCheck } from "lucide-react";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "Riwayat Harian — SIWAJAR" },
      { name: "description", content: "Riwayat kunjungan wajib lapor harian klien." },
    ],
  }),
});

function HistoryPage() {
  const [laporan] = useLocalStorage<Laporan[]>(STORAGE_KEY, []);
  const [kunjungan, setKunjungan] = useLocalStorage<Kunjungan[]>(KUNJUNGAN_STORAGE_KEY, []);
  const now = useRealtimeClock();

  const today = toISODate(new Date());
  const [tanggal, setTanggal] = useState(today);
  const [klienId, setKlienId] = useState("");
  const [petugas, setPetugas] = useState("");
  const [catatan, setCatatan] = useState("");
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const klienRef = useRef<HTMLSelectElement>(null);

  useEffect(() => { klienRef.current?.focus(); }, []);

  const klienById = useMemo(() => {
    const map = new Map<string, Laporan>();
    laporan.forEach((l) => map.set(l.id, l));
    return map;
  }, [laporan]);

  const submit = () => {
    if (!klienId) return toast.error("Pilih klien terlebih dahulu");
    if (!petugas.trim()) return toast.error("Nama petugas wajib diisi");
    const klien = klienById.get(klienId);
    if (!klien) return toast.error("Data klien tidak ditemukan");

    const sudahLapor = kunjungan.some((k) => k.laporanId === klienId && k.tanggal === tanggal);
    if (sudahLapor) return toast.error("Klien ini sudah tercatat melapor pada tanggal tersebut");

    const entry: Kunjungan = {
      id: generateKunjunganId(),
      laporanId: klien.id,
      namaKlien: klien.namaKlien,
      statusProgram: klien.statusProgram,
      tanggal,
      jam: formatJam(new Date()).slice(0, 5),
      petugas: petugas.trim(),
      catatan: catatan.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setKunjungan((prev) => [entry, ...prev]);
    toast.success(`${klien.namaKlien} berhasil dicatat melapor`);
    setKlienId("");
    setCatatan("");
    klienRef.current?.focus();
  };

  const handleDelete = (id: string) => {
    setKunjungan((prev) => prev.filter((x) => x.id !== id));
    setConfirmId(null);
    toast.success("Riwayat dihapus");
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = [...kunjungan].sort((a, b) => (a.tanggal === b.tanggal ? b.jam.localeCompare(a.jam) : b.tanggal.localeCompare(a.tanggal)));
    if (s) {
      list = list.filter((k) =>
        [k.namaKlien, k.petugas, k.catatan ?? "", k.statusProgram].join(" ").toLowerCase().includes(s),
      );
    }
    return list;
  }, [kunjungan, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, Kunjungan[]>();
    filtered.forEach((k) => {
      const arr = map.get(k.tanggal) ?? [];
      arr.push(k);
      map.set(k.tanggal, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const todayCount = kunjungan.filter((k) => k.tanggal === today).length;

  const exportExcel = () => {
    if (kunjungan.length === 0) return toast.error("Tidak ada data untuk diexport");
    const rows = filtered.map((k, i) => ({
      No: i + 1,
      Tanggal: formatTanggalID(k.tanggal),
      Jam: k.jam,
      "Nama Klien": k.namaKlien,
      Status: k.statusProgram,
      Petugas: k.petugas,
      Catatan: k.catatan ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Riwayat");
    XLSX.writeFile(wb, `riwayat-wajib-lapor-${today}.xlsx`);
    toast.success("Riwayat berhasil diexport");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors closeButton />
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-5 space-y-5">
        {/* Quick check-in */}
        <section className="bg-card text-card-foreground rounded-xl border border-border shadow-card">
          <div className="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <UserCheck className="h-5 w-5" /> Catat Kunjungan Wajib Lapor
              </h2>
              <p className="text-xs text-muted-foreground">
                Hari ini: <span className="font-medium">{formatTanggalID(now)}</span> · {todayCount} klien sudah melapor
              </p>
            </div>
          </div>

          <form
            className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3"
            onSubmit={(e) => { e.preventDefault(); submit(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                e.preventDefault();
                const focusables = Array.from(
                  (e.currentTarget as HTMLFormElement).querySelectorAll<HTMLElement>("input, select, textarea, button[type='submit']"),
                );
                const idx = focusables.indexOf(e.target as HTMLElement);
                if (idx >= 0 && idx < focusables.length - 1) focusables[idx + 1].focus();
                else submit();
              }
            }}
          >
            <Field label="Tanggal Lapor">
              <input type="date" className="input" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </Field>
            <Field label="Klien" className="md:col-span-2">
              <select ref={klienRef} className="input" value={klienId} onChange={(e) => setKlienId(e.target.value)}>
                <option value="">— Pilih klien —</option>
                {laporan.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.namaKlien} ({l.statusProgram}) · {l.pasal}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Petugas">
              <input className="input" value={petugas} onChange={(e) => setPetugas(e.target.value)} placeholder="Nama petugas" />
            </Field>
            <Field label="Catatan (opsional)" className="md:col-span-3">
              <input className="input" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Keterangan tambahan" />
            </Field>
            <div className="flex items-end">
              <button type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 h-10 text-sm font-medium hover:opacity-90">
                <Check className="h-4 w-4" /> Catat
              </button>
            </div>
          </form>

          {laporan.length === 0 && (
            <div className="px-5 pb-5 -mt-2">
              <div className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                Belum ada data klien. Tambahkan terlebih dahulu di halaman Input Lapor.
              </div>
            </div>
          )}

          <style>{`
            .input{width:100%;height:2.5rem;padding:0 .75rem;border-radius:.5rem;border:1px solid var(--color-input);background:var(--color-card);color:var(--color-card-foreground);font-size:.9rem;outline:none;transition:border-color .15s,box-shadow .15s}
            .input:focus{border-color:var(--color-ring);box-shadow:0 0 0 3px color-mix(in oklab,var(--color-ring) 20%,transparent)}
          `}</style>
        </section>

        {/* History list */}
        <section className="bg-card text-card-foreground rounded-xl border border-border shadow-card">
          <div className="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5" /> Riwayat Wajib Lapor Harian
              </h2>
              <p className="text-xs text-muted-foreground">Total {kunjungan.length} kunjungan tercatat</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari klien atau petugas..."
                  className="h-10 pl-9 pr-3 rounded-md border border-input bg-card text-sm w-64 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring" />
              </div>
              <button onClick={exportExcel}
                className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-card text-sm hover:bg-accent">
                <Download className="h-4 w-4" /> Export Excel
              </button>
            </div>
          </div>

          {grouped.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
              <Inbox className="h-10 w-10 opacity-50" />
              <p className="text-sm">{q ? "Tidak ada hasil pencarian." : "Belum ada riwayat kunjungan."}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {grouped.map(([tgl, list]) => (
                <div key={tgl} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">{formatTanggalID(tgl)}</h3>
                    <span className="text-xs text-muted-foreground">{list.length} klien</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left w-20">Jam</th>
                          <th className="px-3 py-2 text-left">Nama Klien</th>
                          <th className="px-3 py-2 text-left w-20">Status</th>
                          <th className="px-3 py-2 text-left">Petugas</th>
                          <th className="px-3 py-2 text-left">Catatan</th>
                          <th className="px-3 py-2 text-center w-16">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((k) => (
                          <tr key={k.id} className="border-t border-border hover:bg-muted/40">
                            <td className="px-3 py-2 font-mono">{k.jam}</td>
                            <td className="px-3 py-2 font-medium">{k.namaKlien}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                                k.statusProgram === "PB"
                                  ? "bg-primary/10 text-primary border-primary/30"
                                  : "bg-warning/20 text-warning-foreground border-warning/40"
                              }`}>{k.statusProgram}</span>
                            </td>
                            <td className="px-3 py-2">{k.petugas}</td>
                            <td className="px-3 py-2 text-muted-foreground">{k.catatan ?? "-"}</td>
                            <td className="px-3 py-2 text-center">
                              <button onClick={() => setConfirmId(k.id)}
                                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {confirmId && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmId(null)}>
              <div className="bg-card text-card-foreground rounded-xl border border-border max-w-sm w-full p-5" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-base font-semibold">Hapus riwayat?</h3>
                <p className="text-sm text-muted-foreground mt-1">Data tidak dapat dikembalikan.</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setConfirmId(null)} className="h-9 px-3 rounded-md border border-border text-sm hover:bg-accent">Batal</button>
                  <button onClick={() => handleDelete(confirmId)} className="h-9 px-3 rounded-md bg-destructive text-destructive-foreground text-sm hover:opacity-90">Hapus</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        SIWAJAR · Sistem Wajib Lapor Digital
      </footer>
    </div>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      {children}
    </label>
  );
}

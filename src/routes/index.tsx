import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { useLaporan } from "@/hooks/useLaporan";
import { useTamu } from "@/hooks/useTamu";
import { getKategori } from "@/services/laporanService";
import { toISODate } from "@/utils/dateUtils";
import { UserPlus, Baby, UserCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Beranda,
  head: () => ({
    meta: [
      { title: "SIPADU — Sistem Informasi Pelayanan dan Buku Tamu Terpadu" },
      { name: "description", content: "SIPADU: aplikasi pelayanan administrasi terpadu — wajib lapor anak, dewasa, dan buku tamu." },
    ],
  }),
});

function Beranda() {
  const { data: laporan } = useLaporan();
  const { data: tamu } = useTamu();
  const today = toISODate(new Date());

  const totalDewasa = laporan.filter((l) => getKategori(l) === "dewasa").length;
  const totalAnak = laporan.filter((l) => getKategori(l) === "anak").length;
  const tamuHariIni = tamu.filter((t) => t.tanggal === today).length;

  const menus = [
    {
      to: "/tamu" as const,
      title: "Buku Tamu",
      desc: "Catat kunjungan tamu, instansi/lapas/rutan, dan keperluan.",
      icon: <UserCheck className="h-7 w-7" />,
      hint: `${tamuHariIni} tamu hari ini`,
      tone: "from-emerald-500/15 to-emerald-500/0 text-emerald-700 dark:text-emerald-300",
      iconBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    },
    {
      to: "/lapor/anak" as const,
      title: "Wajib Lapor Anak",
      desc: "Input data wajib lapor untuk klien kategori anak.",
      icon: <Baby className="h-7 w-7" />,
      hint: `${totalAnak} klien terdaftar`,
      tone: "from-amber-500/15 to-amber-500/0 text-amber-700 dark:text-amber-300",
      iconBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    },
    {
      to: "/lapor/dewasa" as const,
      title: "Wajib Lapor Dewasa",
      desc: "Input data wajib lapor untuk klien kategori dewasa.",
      icon: <UserPlus className="h-7 w-7" />,
      hint: `${totalDewasa} klien terdaftar`,
      tone: "from-primary/15 to-primary/0 text-primary",
      iconBg: "bg-primary/15 text-primary",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors closeButton />
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Pilih Layanan</h2>
          <p className="text-sm text-muted-foreground">
            Silakan pilih menu layanan terlebih dahulu sebelum melakukan input data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {menus.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group relative overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-card hover:shadow-elevated transition-shadow p-5 flex flex-col gap-4"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${m.tone} opacity-60 pointer-events-none`} />
              <div className="relative flex items-start justify-between">
                <div className={`h-14 w-14 rounded-xl inline-flex items-center justify-center ${m.iconBg}`}>
                  {m.icon}
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="relative">
                <h3 className="text-lg font-semibold">{m.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                <p className="text-xs font-medium mt-3 text-foreground/70">{m.hint}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Tips:</span> setelah menyimpan data, sistem akan otomatis kembali ke halaman ini.
            Anda dapat melihat riwayat di menu <span className="font-medium">Riwayat Harian</span> dan statistik pada <span className="font-medium">Dashboard</span>.
          </p>
        </div>
      </main>
      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        SIPADU · Sistem Informasi Pelayanan dan Buku Tamu Terpadu · v2.0
      </footer>
    </div>
  );
}

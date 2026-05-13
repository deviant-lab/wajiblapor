import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Header } from "@/components/Header";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEY, type Laporan } from "@/services/laporanService";
import { KUNJUNGAN_STORAGE_KEY, type Kunjungan } from "@/services/kunjunganService";
import { formatTanggalID, toISODate } from "@/utils/dateUtils";
import { Users, UserCheck, AlertTriangle, CalendarClock } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard Statistik — SIWAJAR" },
      { name: "description", content: "Statistik dan grafik wajib lapor digital." },
    ],
  }),
});

const COLORS = ["hsl(var(--chart-1, 220 90% 56%))", "hsl(var(--chart-2, 30 90% 55%))", "hsl(var(--chart-3, 160 70% 45%))", "hsl(var(--chart-4, 340 80% 60%))"];
const BAR_PRIMARY = "oklch(0.55 0.18 250)";
const BAR_ACCENT = "oklch(0.7 0.15 50)";

function DashboardPage() {
  const [laporan] = useLocalStorage<Laporan[]>(STORAGE_KEY, []);
  const [kunjungan] = useLocalStorage<Kunjungan[]>(KUNJUNGAN_STORAGE_KEY, []);

  const today = toISODate(new Date());

  const stats = useMemo(() => {
    const total = laporan.length;
    const pb = laporan.filter((l) => l.statusProgram === "PB").length;
    const cb = laporan.filter((l) => l.statusProgram === "CB").length;
    const lakiLaki = laporan.filter((l) => l.jenisKelamin === "Laki-laki").length;
    const perempuan = laporan.filter((l) => l.jenisKelamin === "Perempuan").length;

    const todayVisits = kunjungan.filter((k) => k.tanggal === today).length;
    const totalVisits = kunjungan.length;

    // Overdue: tanggalKembali < today (sudah lewat)
    const overdue = laporan.filter((l) => l.tanggalKembali && l.tanggalKembali < today).length;
    // Due in 7 days
    const in7days = laporan.filter((l) => {
      if (!l.tanggalKembali) return false;
      return l.tanggalKembali >= today && l.tanggalKembali <= toISODate(new Date(Date.now() + 7 * 86400000));
    }).length;

    return { total, pb, cb, lakiLaki, perempuan, todayVisits, totalVisits, overdue, in7days };
  }, [laporan, kunjungan, today]);

  // Visits in last 14 days
  const visitsTrend = useMemo(() => {
    const days: { tanggal: string; label: string; total: number; pb: number; cb: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      const items = kunjungan.filter((k) => k.tanggal === iso);
      days.push({
        tanggal: iso,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        total: items.length,
        pb: items.filter((k) => k.statusProgram === "PB").length,
        cb: items.filter((k) => k.statusProgram === "CB").length,
      });
    }
    return days;
  }, [kunjungan]);

  // Registrations per month (last 6 months)
  const monthlyReg = useMemo(() => {
    const arr: { label: string; key: string; total: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      const total = laporan.filter((l) => (l.tanggalLapor ?? "").startsWith(key)).length;
      arr.push({ label, key, total });
    }
    return arr;
  }, [laporan]);

  const statusData = [
    { name: "PB", value: stats.pb },
    { name: "CB", value: stats.cb },
  ];
  const genderData = [
    { name: "Laki-laki", value: stats.lakiLaki },
    { name: "Perempuan", value: stats.perempuan },
  ];

  // Top petugas
  const topPetugas = useMemo(() => {
    const map = new Map<string, number>();
    kunjungan.forEach((k) => map.set(k.petugas, (map.get(k.petugas) ?? 0) + 1));
    return Array.from(map.entries())
      .map(([nama, total]) => ({ nama, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [kunjungan]);

  // Upcoming due
  const upcoming = useMemo(() => {
    return [...laporan]
      .filter((l) => l.tanggalKembali && l.tanggalKembali >= today)
      .sort((a, b) => a.tanggalKembali.localeCompare(b.tanggalKembali))
      .slice(0, 5);
  }, [laporan, today]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-5 space-y-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Dashboard Statistik</h2>
          <p className="text-sm text-muted-foreground">Ringkasan data wajib lapor secara real-time.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users className="h-5 w-5" />} label="Total Klien" value={stats.total} hint={`${stats.pb} PB · ${stats.cb} CB`} />
          <StatCard icon={<UserCheck className="h-5 w-5" />} label="Lapor Hari Ini" value={stats.todayVisits} hint={`${stats.totalVisits} total kunjungan`} accent="primary" />
          <StatCard icon={<CalendarClock className="h-5 w-5" />} label="Akan Jatuh Tempo (7 hari)" value={stats.in7days} hint="Tanggal kembali mendatang" accent="warning" />
          <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Terlambat" value={stats.overdue} hint="Lewat tanggal kembali" accent="destructive" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Tren Kunjungan 14 Hari Terakhir" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={visitsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0 / 0.4)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pb" name="PB" stroke={BAR_PRIMARY} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="cb" name="CB" stroke={BAR_ACCENT} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Distribusi Status Program">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((_, i) => <Cell key={i} fill={i === 0 ? BAR_PRIMARY : BAR_ACCENT} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Pendaftaran 6 Bulan Terakhir" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyReg}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0 0 / 0.4)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" name="Klien Baru" fill={BAR_PRIMARY} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Distribusi Jenis Kelamin">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} label>
                  {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Top 5 Petugas (jumlah pencatatan)">
            {topPetugas.length === 0 ? (
              <EmptyHint text="Belum ada data petugas." />
            ) : (
              <ul className="divide-y divide-border">
                {topPetugas.map((p, i) => (
                  <li key={p.nama} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="flex items-center gap-3">
                      <span className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
                      <span className="font-medium">{p.nama}</span>
                    </span>
                    <span className="text-muted-foreground tabular-nums">{p.total} kunjungan</span>
                  </li>
                ))}
              </ul>
            )}
          </ChartCard>

          <ChartCard title="Jadwal Lapor Berikutnya">
            {upcoming.length === 0 ? (
              <EmptyHint text="Belum ada jadwal mendatang." />
            ) : (
              <ul className="divide-y divide-border">
                {upcoming.map((l) => (
                  <li key={l.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                        l.statusProgram === "PB"
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-warning/20 text-warning-foreground border-warning/40"
                      }`}>{l.statusProgram}</span>
                      <span className="font-medium">{l.namaKlien}</span>
                    </span>
                    <span className="text-muted-foreground">{formatTanggalID(l.tanggalKembali)}</span>
                  </li>
                ))}
              </ul>
            )}
          </ChartCard>
        </div>
      </main>
      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        SIWAJAR · Sistem Wajib Lapor Digital
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value, hint, accent = "default" }: { icon: React.ReactNode; label: string; value: number; hint?: string; accent?: "default" | "primary" | "warning" | "destructive" }) {
  const accentCls =
    accent === "primary" ? "bg-primary/10 text-primary"
    : accent === "warning" ? "bg-warning/20 text-warning-foreground"
    : accent === "destructive" ? "bg-destructive/10 text-destructive"
    : "bg-muted text-foreground";
  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <span className={`h-9 w-9 inline-flex items-center justify-center rounded-md ${accentCls}`}>{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card text-card-foreground rounded-xl border border-border shadow-card ${className}`}>
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground py-8 text-center">{text}</p>;
}

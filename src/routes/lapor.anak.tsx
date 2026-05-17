import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { ReportForm } from "@/components/ReportForm";
import { ReportTable } from "@/components/ReportTable";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Laporan } from "@/services/laporanService";
import { STORAGE_KEY, getKategori } from "@/services/laporanService";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/lapor/anak")({
  component: LaporAnak,
  head: () => ({
    meta: [
      { title: "Wajib Lapor Anak — SIPADU" },
      { name: "description", content: "Form input wajib lapor untuk klien anak." },
    ],
  }),
});

function LaporAnak() {
  const [data, setData] = useLocalStorage<Laporan[]>(STORAGE_KEY, []);
  const [editing, setEditing] = useState<Laporan | null>(null);
  const navigate = useNavigate();

  const filtered = data.filter((l) => getKategori(l) === "anak");

  const handleSubmit = (l: Laporan) => setData((prev) => [l, ...prev]);
  const handleUpdate = (l: Laporan) => setData((prev) => prev.map((x) => (x.id === l.id ? l : x)));
  const handleDelete = (id: string) => setData((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors closeButton />
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-5 space-y-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>
        <ReportForm
          kategori="anak"
          editing={editing}
          onSubmit={handleSubmit}
          onUpdate={handleUpdate}
          onCancelEdit={() => setEditing(null)}
          onAfterSave={() => navigate({ to: "/" })}
        />
        <ReportTable data={filtered} onEdit={setEditing} onDelete={handleDelete} title="Data Wajib Lapor Anak" />
      </main>
      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        SIPADU · Sistem Informasi Pelayanan dan Buku Tamu Terpadu
      </footer>
    </div>
  );
}

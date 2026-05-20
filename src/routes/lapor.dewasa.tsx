import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Header } from "@/components/Header";
import { ReportForm } from "@/components/ReportForm";
import { ReportTable } from "@/components/ReportTable";
import { useLaporan } from "@/hooks/useLaporan";
import type { Laporan, LaporanInput } from "@/services/laporanService";
import { getKategori } from "@/services/laporanService";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/lapor/dewasa")({
  component: LaporDewasa,
  head: () => ({
    meta: [
      { title: "Wajib Lapor Dewasa — SIPADU" },
      { name: "description", content: "Form input wajib lapor untuk klien dewasa." },
    ],
  }),
});

function LaporDewasa() {
  const { data, create, update, remove } = useLaporan();
  const [editing, setEditing] = useState<Laporan | null>(null);
  const navigate = useNavigate();

  const filtered = data.filter((l) => getKategori(l) === "dewasa");

  const handleCreate = async (input: LaporanInput) => {
    try { await create(input); } catch (e) { toast.error("Gagal menyimpan data"); console.error(e); throw e; }
  };
  const handleUpdate = async (id: string, input: LaporanInput) => {
    try { await update(id, input); } catch (e) { toast.error("Gagal memperbarui data"); console.error(e); throw e; }
  };
  const handleDelete = async (id: string) => {
    try { await remove(id); } catch (e) { toast.error("Gagal menghapus data"); console.error(e); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors closeButton />
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-5 space-y-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>
        <ReportForm
          kategori="dewasa"
          editing={editing}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onCancelEdit={() => setEditing(null)}
          onAfterSave={() => navigate({ to: "/" })}
        />
        <ReportTable data={filtered} onEdit={setEditing} onDelete={handleDelete} title="Data Wajib Lapor Dewasa" />
      </main>
      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        SIPADU · Sistem Informasi Pelayanan dan Buku Tamu Terpadu
      </footer>
    </div>
  );
}

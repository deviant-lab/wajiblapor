import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { ReportForm } from "@/components/ReportForm";
import { ReportTable } from "@/components/ReportTable";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Laporan } from "@/services/laporanService";
import { STORAGE_KEY } from "@/services/laporanService";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SIWAJAR — Sistem Wajib Lapor Digital" },
      { name: "description", content: "SIWAJAR: aplikasi pelayanan administrasi wajib lapor digital — input cepat berbasis keyboard." },
    ],
  }),
});

function Index() {
  const [data, setData] = useLocalStorage<Laporan[]>(STORAGE_KEY, []);
  const [editing, setEditing] = useState<Laporan | null>(null);

  const handleSubmit = (l: Laporan) => setData((prev) => [l, ...prev]);
  const handleUpdate = (l: Laporan) => setData((prev) => prev.map((x) => (x.id === l.id ? l : x)));
  const handleDelete = (id: string) => setData((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors closeButton />
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-5 space-y-5">
        <ReportForm
          editing={editing}
          onSubmit={handleSubmit}
          onUpdate={handleUpdate}
          onCancelEdit={() => setEditing(null)}
        />
        <ReportTable data={data} onEdit={setEditing} onDelete={handleDelete} />
      </main>
      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        SIWAJAR · Sistem Wajib Lapor Digital · v1.0
      </footer>
    </div>
  );
}

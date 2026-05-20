/**
 * Service layer Kunjungan — terhubung ke Supabase.
 */
import { supabase } from "@/integrations/supabase/client";

export interface Kunjungan {
  id: string;
  laporanId: string;
  namaKlien: string;
  statusProgram: "PB" | "CB";
  tanggal: string;
  jam: string;
  petugas: string;
  catatan?: string;
  createdAt: string;
}

type Row = {
  id: string;
  laporan_id: string;
  tanggal: string;
  jam: string;
  petugas: string;
  catatan: string | null;
  created_at: string;
  laporan?: { nama_klien: string; status_program: "PB" | "CB" } | null;
};

function fromRow(r: Row): Kunjungan {
  return {
    id: r.id,
    laporanId: r.laporan_id,
    namaKlien: r.laporan?.nama_klien ?? "",
    statusProgram: r.laporan?.status_program ?? "PB",
    tanggal: r.tanggal,
    jam: typeof r.jam === "string" ? r.jam.slice(0, 5) : r.jam,
    petugas: r.petugas,
    catatan: r.catatan ?? undefined,
    createdAt: r.created_at,
  };
}

export async function listKunjungan(): Promise<Kunjungan[]> {
  const { data, error } = await supabase
    .from("kunjungan")
    .select("*, laporan:laporan_id (nama_klien, status_program)")
    .order("tanggal", { ascending: false })
    .order("jam", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

export async function createKunjungan(input: {
  laporanId: string;
  tanggal: string;
  jam: string;
  petugas: string;
  catatan?: string;
}): Promise<Kunjungan> {
  const { data, error } = await supabase
    .from("kunjungan")
    .insert({
      laporan_id: input.laporanId,
      tanggal: input.tanggal,
      jam: input.jam,
      petugas: input.petugas,
      catatan: input.catatan ?? null,
    })
    .select("*, laporan:laporan_id (nama_klien, status_program)")
    .single();
  if (error) throw error;
  return fromRow(data as Row);
}

export async function deleteKunjungan(id: string): Promise<void> {
  const { error } = await supabase.from("kunjungan").delete().eq("id", id);
  if (error) throw error;
}

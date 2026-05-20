/**
 * Service layer Wajib Lapor — terhubung ke Supabase (Lovable Cloud).
 * Skema DB: /database/schema.sql
 */
import { supabase } from "@/integrations/supabase/client";

export type JenisKelamin = "Laki-laki" | "Perempuan";
export type StatusProgram = "PB" | "CB";
export type KategoriLapor = "anak" | "dewasa";

export interface Geotag {
  latitude: number;
  longitude: number;
  accuracy?: number;
  capturedAt: string;
}

export interface Laporan {
  id: string;
  kategori: KategoriLapor;
  namaKlien: string;
  tanggalLahir: string;
  jenisKelamin: JenisKelamin;
  alamat: string;
  statusProgram: StatusProgram;
  pasal: string;
  asalInstansi: string;
  tanggalLapor: string;
  tanggalKembali: string;
  pembimbing: string;
  geotag?: Geotag | null;
  createdAt: string;
}

export type LaporanInput = Omit<Laporan, "id" | "createdAt">;

export function getKategori(l: Laporan): KategoriLapor {
  return (l.kategori as KategoriLapor) ?? "dewasa";
}

// ---------- mapping ----------
type Row = {
  id: string;
  kategori: KategoriLapor;
  nama_klien: string;
  tanggal_lahir: string;
  jenis_kelamin: JenisKelamin;
  alamat: string;
  status_program: StatusProgram;
  pasal: string;
  asal_instansi: string;
  tanggal_lapor: string;
  tanggal_kembali: string;
  pembimbing: string;
  latitude: number | null;
  longitude: number | null;
  geo_accuracy: number | null;
  geo_captured_at: string | null;
  created_at: string;
};

function fromRow(r: Row): Laporan {
  return {
    id: r.id,
    kategori: r.kategori,
    namaKlien: r.nama_klien,
    tanggalLahir: r.tanggal_lahir,
    jenisKelamin: r.jenis_kelamin,
    alamat: r.alamat,
    statusProgram: r.status_program,
    pasal: r.pasal,
    asalInstansi: r.asal_instansi,
    tanggalLapor: r.tanggal_lapor,
    tanggalKembali: r.tanggal_kembali,
    pembimbing: r.pembimbing,
    geotag:
      r.latitude != null && r.longitude != null
        ? {
            latitude: r.latitude,
            longitude: r.longitude,
            accuracy: r.geo_accuracy ?? undefined,
            capturedAt: r.geo_captured_at ?? new Date().toISOString(),
          }
        : null,
    createdAt: r.created_at,
  };
}

function toRow(l: LaporanInput) {
  return {
    kategori: l.kategori,
    nama_klien: l.namaKlien,
    tanggal_lahir: l.tanggalLahir,
    jenis_kelamin: l.jenisKelamin,
    alamat: l.alamat,
    status_program: l.statusProgram,
    pasal: l.pasal,
    asal_instansi: l.asalInstansi,
    tanggal_lapor: l.tanggalLapor,
    tanggal_kembali: l.tanggalKembali,
    pembimbing: l.pembimbing,
    latitude: l.geotag?.latitude ?? null,
    longitude: l.geotag?.longitude ?? null,
    geo_accuracy: l.geotag?.accuracy ?? null,
    geo_captured_at: l.geotag?.capturedAt ?? null,
  };
}

// ---------- CRUD ----------
export async function listLaporan(): Promise<Laporan[]> {
  const { data, error } = await supabase
    .from("laporan")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

export async function createLaporan(input: LaporanInput): Promise<Laporan> {
  const { data, error } = await supabase
    .from("laporan")
    .insert(toRow(input))
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as Row);
}

export async function updateLaporan(id: string, input: LaporanInput): Promise<Laporan> {
  const { data, error } = await supabase
    .from("laporan")
    .update(toRow(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as Row);
}

export async function deleteLaporan(id: string): Promise<void> {
  const { error } = await supabase.from("laporan").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Service layer untuk data Wajib Lapor.
 * Saat ini menggunakan localStorage. Mudah diganti ke API/database nantinya
 * — tinggal ganti implementasi fungsi-fungsi di bawah.
 *
 * Skema database tersedia di /database/schema.sql
 */
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
  tanggalLahir: string; // yyyy-mm-dd
  jenisKelamin: JenisKelamin;
  alamat: string;
  statusProgram: StatusProgram;
  pasal: string;
  asalInstansi: string;
  tanggalLapor: string; // yyyy-mm-dd
  tanggalKembali: string; // yyyy-mm-dd
  pembimbing: string;
  geotag?: Geotag | null;
  createdAt: string;
}

export const STORAGE_KEY = "wajib-lapor-data-v1";

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Fallback ke 'dewasa' untuk data lama yang belum punya kategori. */
export function getKategori(l: Laporan): KategoriLapor {
  return (l.kategori as KategoriLapor) ?? "dewasa";
}

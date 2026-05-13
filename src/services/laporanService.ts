/**
 * Service layer untuk data Wajib Lapor.
 * Saat ini menggunakan localStorage. Mudah diganti ke API/database nantinya
 * — tinggal ganti implementasi fungsi-fungsi di bawah.
 */
export type JenisKelamin = "Laki-laki" | "Perempuan";
export type StatusProgram = "PB" | "CB";

export interface Laporan {
  id: string;
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
  createdAt: string;
}

export const STORAGE_KEY = "wajib-lapor-data-v1";

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

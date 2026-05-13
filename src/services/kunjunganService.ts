/**
 * Service layer untuk data Kunjungan (riwayat wajib lapor harian).
 * Setiap entri = satu kali klien melapor di hari tertentu.
 */
export interface Kunjungan {
  id: string;
  laporanId: string;
  namaKlien: string;
  statusProgram: "PB" | "CB";
  tanggal: string; // yyyy-mm-dd
  jam: string; // HH:mm
  petugas: string;
  catatan?: string;
  createdAt: string;
}

export const KUNJUNGAN_STORAGE_KEY = "wajib-lapor-kunjungan-v1";

export function generateKunjunganId() {
  return `k-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

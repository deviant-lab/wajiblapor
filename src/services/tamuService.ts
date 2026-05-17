/**
 * Service layer untuk data Buku Tamu.
 * Skema database tersedia di /database/schema.sql
 */
export interface Tamu {
  id: string;
  tanggal: string; // yyyy-mm-dd (otomatis hari ini)
  jam: string; // HH:mm
  namaTamu: string;
  asalInstansi: string;
  alamat: string;
  keperluan: string;
  createdAt: string;
}

export const TAMU_STORAGE_KEY = "buku-tamu-data-v1";

export function generateTamuId() {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Service layer Buku Tamu — terhubung ke Supabase.
 */
import { supabase } from "@/integrations/supabase/client";

export interface Tamu {
  id: string;
  tanggal: string;
  jam: string;
  namaTamu: string;
  asalInstansi: string;
  alamat: string;
  keperluan: string;
  createdAt: string;
}

type Row = {
  id: string;
  tanggal: string;
  jam: string;
  nama_tamu: string;
  asal_instansi: string;
  alamat: string;
  keperluan: string;
  created_at: string;
};

function fromRow(r: Row): Tamu {
  return {
    id: r.id,
    tanggal: r.tanggal,
    jam: typeof r.jam === "string" ? r.jam.slice(0, 5) : r.jam,
    namaTamu: r.nama_tamu,
    asalInstansi: r.asal_instansi,
    alamat: r.alamat,
    keperluan: r.keperluan,
    createdAt: r.created_at,
  };
}

export async function listTamu(): Promise<Tamu[]> {
  const { data, error } = await supabase
    .from("tamu")
    .select("*")
    .order("tanggal", { ascending: false })
    .order("jam", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

export async function createTamu(input: {
  tanggal: string;
  jam: string;
  namaTamu: string;
  asalInstansi: string;
  alamat: string;
  keperluan: string;
}): Promise<Tamu> {
  const { data, error } = await supabase
    .from("tamu")
    .insert({
      tanggal: input.tanggal,
      jam: input.jam,
      nama_tamu: input.namaTamu,
      asal_instansi: input.asalInstansi,
      alamat: input.alamat,
      keperluan: input.keperluan,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data as Row);
}

export async function deleteTamu(id: string): Promise<void> {
  const { error } = await supabase.from("tamu").delete().eq("id", id);
  if (error) throw error;
}

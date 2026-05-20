import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createLaporan,
  deleteLaporan,
  listLaporan,
  updateLaporan,
  type Laporan,
  type LaporanInput,
} from "@/services/laporanService";

export function useLaporan() {
  const [data, setData] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const rows = await listLaporan();
      setData(rows);
    } catch (e) {
      toast.error("Gagal memuat data wajib lapor");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (input: LaporanInput) => {
    const created = await createLaporan(input);
    setData((p) => [created, ...p]);
    return created;
  }, []);

  const update = useCallback(async (id: string, input: LaporanInput) => {
    const updated = await updateLaporan(id, input);
    setData((p) => p.map((x) => (x.id === id ? updated : x)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteLaporan(id);
    setData((p) => p.filter((x) => x.id !== id));
  }, []);

  return { data, loading, refresh, create, update, remove };
}

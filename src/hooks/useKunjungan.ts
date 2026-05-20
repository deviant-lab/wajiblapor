import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createKunjungan,
  deleteKunjungan,
  listKunjungan,
  type Kunjungan,
} from "@/services/kunjunganService";

export function useKunjungan() {
  const [data, setData] = useState<Kunjungan[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setData(await listKunjungan());
    } catch (e) {
      toast.error("Gagal memuat riwayat kunjungan");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: Parameters<typeof createKunjungan>[0]) => {
      const created = await createKunjungan(input);
      setData((p) => [created, ...p]);
      return created;
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await deleteKunjungan(id);
    setData((p) => p.filter((x) => x.id !== id));
  }, []);

  return { data, loading, refresh, create, remove };
}

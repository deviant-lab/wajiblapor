import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createTamu, deleteTamu, listTamu, type Tamu } from "@/services/tamuService";

export function useTamu() {
  const [data, setData] = useState<Tamu[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setData(await listTamu());
    } catch (e) {
      toast.error("Gagal memuat data tamu");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (input: Parameters<typeof createTamu>[0]) => {
    const created = await createTamu(input);
    setData((p) => [created, ...p]);
    return created;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteTamu(id);
    setData((p) => p.filter((x) => x.id !== id));
  }, []);

  return { data, loading, refresh, create, remove };
}

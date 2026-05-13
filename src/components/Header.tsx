import { useEffect, useState } from "react";
import { useRealtimeClock } from "@/hooks/useRealtimeClock";
import { formatJam, formatTanggalLengkapID } from "@/utils/dateUtils";
import { Moon, Sun, ShieldCheck } from "lucide-react";

export function Header() {
  const now = useRealtimeClock();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wl-theme");
    const initial = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(initial);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("wl-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <header className="bg-header text-header-foreground border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-md bg-header-foreground/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight truncate">
              Sistem Wajib Lapor Digital
            </h1>
            <p className="text-xs text-header-foreground/70 truncate">
              Pelayanan Administrasi Klien Pemasyarakatan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right leading-tight">
            <div className="font-mono text-xl sm:text-2xl tabular-nums">{formatJam(now)}</div>
            <div className="text-xs text-header-foreground/70">{formatTanggalLengkapID(now)}</div>
          </div>
          <button
            type="button"
            onClick={() => setDark((v) => !v)}
            aria-label="Toggle dark mode"
            className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-header-foreground/15 hover:bg-header-foreground/10 transition-colors"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="sm:hidden border-t border-header-foreground/10 px-4 py-2 flex items-center justify-between text-sm">
        <span className="text-header-foreground/70">{formatTanggalLengkapID(now)}</span>
        <span className="font-mono tabular-nums">{formatJam(now)}</span>
      </div>
    </header>
  );
}

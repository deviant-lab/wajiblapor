import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { addOneMonthClamped, toISODate } from "@/utils/dateUtils";
import type { Laporan, JenisKelamin, StatusProgram } from "@/services/laporanService";
import { generateId } from "@/services/laporanService";
import { Loader2, Save, RotateCcw, Keyboard } from "lucide-react";

type FormState = Omit<Laporan, "id" | "createdAt">;

function emptyForm(): FormState {
  const today = toISODate(new Date());
  return {
    namaKlien: "",
    tanggalLahir: "",
    jenisKelamin: "Laki-laki",
    alamat: "",
    statusProgram: "PB",
    pasal: "",
    asalInstansi: "",
    tanggalLapor: today,
    tanggalKembali: addOneMonthClamped(today),
    pembimbing: "",
  };
}

interface Props {
  onSubmit: (data: Laporan) => void;
  editing: Laporan | null;
  onCancelEdit: () => void;
  onUpdate: (data: Laporan) => void;
}

export function ReportForm({ onSubmit, editing, onCancelEdit, onUpdate }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  useEffect(() => {
    if (editing) {
      const { id: _i, createdAt: _c, ...rest } = editing;
      setForm(rest);
      firstFieldRef.current?.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (editing) return;
    const today = toISODate(new Date());
    setForm((f) =>
      f.tanggalLapor === today ? f : { ...f, tanggalLapor: today, tanggalKembali: addOneMonthClamped(today) },
    );
  }, [editing]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm(emptyForm());
    onCancelEdit();
    setTimeout(() => firstFieldRef.current?.focus(), 0);
  };

  const submit = async () => {
    const required: Array<[keyof FormState, string]> = [
      ["namaKlien", "Nama Klien"],
      ["tanggalLahir", "Tanggal Lahir"],
      ["alamat", "Alamat"],
      ["pasal", "Pasal / Perkara"],
      ["asalInstansi", "Asal Instansi"],
      ["pembimbing", "Nama Pembimbing Kemasyarakatan"],
    ];
    for (const [k, label] of required) {
      if (!String(form[k]).trim()) {
        toast.error(`${label} wajib diisi`);
        const el = formRef.current?.querySelector<HTMLElement>(`[name="${k}"]`);
        el?.focus();
        return;
      }
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 200));
    if (editing) {
      onUpdate({ ...editing, ...form });
      toast.success("Data berhasil diperbarui");
    } else {
      const data: Laporan = { id: generateId(), createdAt: new Date().toISOString(), ...form };
      onSubmit(data);
      toast.success("Data wajib lapor berhasil disimpan");
    }
    setSubmitting(false);
    setForm(emptyForm());
    onCancelEdit();
    setTimeout(() => firstFieldRef.current?.focus(), 0);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      reset();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      submit();
      return;
    }
    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" && e.shiftKey) return;
      e.preventDefault();
      const focusables = Array.from(
        formRef.current!.querySelectorAll<HTMLElement>(
          'input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly]), button[type="submit"]',
        ),
      ).filter((el) => !el.hasAttribute("data-skip-enter"));
      const idx = focusables.indexOf(target);
      if (idx >= 0 && idx < focusables.length - 1) {
        focusables[idx + 1].focus();
        const next = focusables[idx + 1] as HTMLInputElement;
        if (next.select) try { next.select(); } catch {}
      } else {
        submit();
      }
    }
  };

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        submit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [form, editing]);

  const tanggalKembaliComputed = useMemo(
    () => (form.tanggalLapor ? addOneMonthClamped(form.tanggalLapor) : ""),
    [form.tanggalLapor],
  );
  useEffect(() => {
    if (form.tanggalKembali !== tanggalKembaliComputed) set("tanggalKembali", tanggalKembaliComputed);
  }, [tanggalKembaliComputed]);

  return (
    <section className="bg-card text-card-foreground rounded-xl border border-border shadow-card">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold">{editing ? "Edit Data Wajib Lapor" : "Form Input Wajib Lapor"}</h2>
          <p className="text-xs text-muted-foreground">
            Tekan <kbd className="kbd">Enter</kbd> untuk pindah field, <kbd className="kbd">Ctrl</kbd>+<kbd className="kbd">S</kbd> untuk simpan, <kbd className="kbd">Esc</kbd> untuk reset.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <Keyboard className="h-4 w-4" /> Optimized untuk input keyboard
        </div>
      </div>

      <form ref={formRef} onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nama Klien" required>
          <input ref={firstFieldRef} name="namaKlien" className="input" value={form.namaKlien}
            onChange={(e) => set("namaKlien", e.target.value)} placeholder="Nama lengkap klien" autoComplete="off" />
        </Field>

        <Field label="Tanggal Lahir" required>
          <input type="date" name="tanggalLahir" className="input" value={form.tanggalLahir}
            onChange={(e) => set("tanggalLahir", e.target.value)} />
        </Field>

        <Field label="Jenis Kelamin" required>
          <select name="jenisKelamin" className="input" value={form.jenisKelamin}
            onChange={(e) => set("jenisKelamin", e.target.value as JenisKelamin)}>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </Field>

        <Field label="Status Program" required>
          <select name="statusProgram" className="input" value={form.statusProgram}
            onChange={(e) => set("statusProgram", e.target.value as StatusProgram)}>
            <option value="PB">PB - Pembebasan Bersyarat</option>
            <option value="CB">CB - Cuti Bersyarat</option>
          </select>
        </Field>

        <Field label="Alamat" required className="md:col-span-2">
          <textarea name="alamat" rows={2} className="input resize-none" value={form.alamat}
            onChange={(e) => set("alamat", e.target.value)} placeholder="Alamat lengkap sesuai identitas" />
        </Field>

        <Field label="Pasal / Perkara" required>
          <input name="pasal" className="input" value={form.pasal}
            onChange={(e) => set("pasal", e.target.value)} placeholder="cth: Pasal 363 KUHP" autoComplete="off" />
        </Field>

        <Field label="Asal Instansi" required>
          <input name="asalInstansi" className="input" value={form.asalInstansi}
            onChange={(e) => set("asalInstansi", e.target.value)} placeholder="cth: Lapas Klas IIA Bandung" autoComplete="off" />
        </Field>

        <Field label="Tanggal Lapor (otomatis)">
          <input type="date" name="tanggalLapor" className="input bg-muted cursor-not-allowed" value={form.tanggalLapor} readOnly tabIndex={-1} />
        </Field>

        <Field label="Tanggal Kembali (+1 bulan, otomatis)">
          <input type="date" name="tanggalKembali" className="input bg-muted cursor-not-allowed" value={form.tanggalKembali} readOnly tabIndex={-1} />
        </Field>

        <Field label="Nama Pembimbing Kemasyarakatan" required className="md:col-span-2">
          <input name="pembimbing" className="input" value={form.pembimbing}
            onChange={(e) => set("pembimbing", e.target.value)} placeholder="Nama PK" autoComplete="off" />
        </Field>

        <div className="md:col-span-2 flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 h-10 text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editing ? "Perbarui Data" : "Simpan Data"}
            <span className="hidden sm:inline opacity-70 ml-1 text-xs">(Ctrl+S)</span>
          </button>
          <button type="button" onClick={reset} data-skip-enter
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 h-10 text-sm font-medium hover:bg-accent transition-colors">
            <RotateCcw className="h-4 w-4" /> Reset <span className="hidden sm:inline opacity-70 ml-1 text-xs">(Esc)</span>
          </button>
          {editing && (
            <span className="text-xs text-warning-foreground bg-warning/30 border border-warning/40 px-2 py-1 rounded">
              Mode edit aktif
            </span>
          )}
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          height: 2.5rem;
          padding: 0 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid var(--color-input);
          background-color: var(--color-card);
          color: var(--color-card-foreground);
          font-size: 0.9rem;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        textarea.input { height: auto; padding: 0.5rem 0.75rem; }
        .input:focus { border-color: var(--color-ring); box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-ring) 20%, transparent); }
        .kbd {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 1.4rem; padding: 0 0.3rem; height: 1.25rem;
          border-radius: 0.25rem; border: 1px solid var(--color-border);
          background: var(--color-muted); color: var(--color-foreground);
          font-family: ui-monospace, monospace; font-size: 0.7rem;
        }
      `}</style>
    </section>
  );
}

function Field({ label, required, className = "", children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-foreground/80">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

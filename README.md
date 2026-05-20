# SIPADU — Sistem Informasi Pelayanan dan Buku Tamu Terpadu

Aplikasi pelayanan administrasi: Buku Tamu, Wajib Lapor Anak, dan Wajib Lapor Dewasa
dengan fokus pada **kecepatan input data via keyboard**, dashboard statistik, riwayat
kunjungan harian, dan geotagging untuk wajib lapor.

## Tech Stack

- **Framework**: TanStack Start (React 19 + Vite 7)
- **Styling**: TailwindCSS v4
- **Backend / DB**: Supabase (PostgreSQL, RLS, Auth, Storage)
- **Charts**: Recharts
- **Export**: SheetJS (xlsx)
- **Deploy**: Vercel (preset `vercel` di TanStack Start)

## Struktur Folder

```
src/
├── components/        # UI components (Header, ReportForm, ReportTable, …)
├── hooks/             # useLaporan, useKunjungan, useTamu, useGeolocation, …
├── integrations/
│   └── supabase/      # client.ts (browser), client.server.ts (admin), types.ts
├── routes/            # File-based routing (index, tamu, lapor.anak, lapor.dewasa,
│                      #   history, dashboard, __root)
├── services/          # CRUD ke Supabase (laporanService, kunjunganService, tamuService)
├── utils/             # dateUtils
├── lib/               # error-capture, error-page, utils
├── styles.css         # Tailwind v4 + design tokens (oklch)
├── router.tsx         # Bootstrap router
└── start.ts           # Middleware Start
database/
└── schema.sql         # Skema referensi (sumber kebenaran = migration Supabase)
```

## Setup Lokal

```bash
npm install
npm run dev          # http://localhost:5173
```

Variabel env (otomatis terisi oleh Lovable Cloud):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
```

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Di Vercel → **Add New Project** → import repo.
3. **Framework Preset**: *Other* (sudah ada `vercel.json`).
   - Build command: `npm run build`
   - Output: terdeteksi otomatis dari `.vercel/output` (preset Nitro).
4. Tambahkan **Environment Variables** di Vercel Project Settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - (opsional, hanya jika menggunakan server function admin) `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy.

Skrip build sudah memakai preset Vercel:

```json
"build": "NITRO_PRESET=vercel vite build"
```

## Skema Database

Skema dikelola via migrations Supabase. Tabel utama:

- `laporan` — wajib lapor (anak & dewasa) + geotag
- `kunjungan` — riwayat kunjungan harian (FK ke `laporan`)
- `tamu` — buku tamu

Lihat `database/schema.sql` sebagai dokumentasi referensi.

## Shortcut Keyboard

- `Enter` — pindah ke field berikutnya
- `Ctrl+S` — simpan
- `Esc` — reset form

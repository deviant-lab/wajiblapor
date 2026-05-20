
-- Enums
do $$ begin
  create type public.jenis_kelamin as enum ('Laki-laki', 'Perempuan');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.status_program as enum ('PB', 'CB');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.kategori_lapor as enum ('anak', 'dewasa');
exception when duplicate_object then null; end $$;

-- Laporan
create table if not exists public.laporan (
  id uuid primary key default gen_random_uuid(),
  kategori public.kategori_lapor not null,
  nama_klien text not null,
  tanggal_lahir date not null,
  jenis_kelamin public.jenis_kelamin not null,
  alamat text not null,
  status_program public.status_program not null,
  pasal text not null,
  asal_instansi text not null,
  tanggal_lapor date not null default current_date,
  tanggal_kembali date not null,
  pembimbing text not null,
  latitude double precision,
  longitude double precision,
  geo_accuracy double precision,
  geo_captured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_laporan_kategori on public.laporan(kategori);
create index if not exists idx_laporan_tanggal_lapor on public.laporan(tanggal_lapor desc);
create index if not exists idx_laporan_tanggal_kembali on public.laporan(tanggal_kembali);

-- Kunjungan
create table if not exists public.kunjungan (
  id uuid primary key default gen_random_uuid(),
  laporan_id uuid not null references public.laporan(id) on delete cascade,
  tanggal date not null default current_date,
  jam time not null default current_time,
  petugas text not null,
  catatan text,
  created_at timestamptz not null default now(),
  unique (laporan_id, tanggal)
);

create index if not exists idx_kunjungan_tanggal on public.kunjungan(tanggal desc);
create index if not exists idx_kunjungan_laporan on public.kunjungan(laporan_id);

-- Tamu
create table if not exists public.tamu (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null default current_date,
  jam time not null default current_time,
  nama_tamu text not null,
  asal_instansi text not null,
  alamat text not null,
  keperluan text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_tamu_tanggal on public.tamu(tanggal desc);

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_laporan_updated_at on public.laporan;
create trigger trg_laporan_updated_at
  before update on public.laporan
  for each row execute function public.set_updated_at();

-- RLS
alter table public.laporan enable row level security;
alter table public.kunjungan enable row level security;
alter table public.tamu enable row level security;

-- Akses publik (aplikasi kantor tanpa login per-user)
drop policy if exists "Public read laporan" on public.laporan;
create policy "Public read laporan" on public.laporan for select using (true);
drop policy if exists "Public insert laporan" on public.laporan;
create policy "Public insert laporan" on public.laporan for insert with check (true);
drop policy if exists "Public update laporan" on public.laporan;
create policy "Public update laporan" on public.laporan for update using (true) with check (true);
drop policy if exists "Public delete laporan" on public.laporan;
create policy "Public delete laporan" on public.laporan for delete using (true);

drop policy if exists "Public read kunjungan" on public.kunjungan;
create policy "Public read kunjungan" on public.kunjungan for select using (true);
drop policy if exists "Public insert kunjungan" on public.kunjungan;
create policy "Public insert kunjungan" on public.kunjungan for insert with check (true);
drop policy if exists "Public update kunjungan" on public.kunjungan;
create policy "Public update kunjungan" on public.kunjungan for update using (true) with check (true);
drop policy if exists "Public delete kunjungan" on public.kunjungan;
create policy "Public delete kunjungan" on public.kunjungan for delete using (true);

drop policy if exists "Public read tamu" on public.tamu;
create policy "Public read tamu" on public.tamu for select using (true);
drop policy if exists "Public insert tamu" on public.tamu;
create policy "Public insert tamu" on public.tamu for insert with check (true);
drop policy if exists "Public update tamu" on public.tamu;
create policy "Public update tamu" on public.tamu for update using (true) with check (true);
drop policy if exists "Public delete tamu" on public.tamu;
create policy "Public delete tamu" on public.tamu for delete using (true);

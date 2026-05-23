-- ============================================================
-- KOPIRAJ OVO U SUPABASE → SQL Editor → New Query → Run
-- ============================================================

-- 1. ADMINI
create table if not exists admins (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  role text not null default 'admin', -- 'superadmin' ili 'admin'
  created_at timestamptz default now()
);

-- 2. LOGIN KODOVI (privremeni, brišu se nakon upotrebe)
create table if not exists login_codes (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- 3. PROIZVODI
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  brand text not null,
  description text default '',
  price numeric not null,
  old_price numeric default null,
  badge text default null,         -- 'novo' | 'bestseller' | 'rasprodaja' | 'premium'
  category text not null,          -- 'patike' | 'cipele' | 'cizme' | 'gleznjace' | 'papuce'
  gender text not null,            -- 'muske' | 'zenske'
  subcategory text default null,
  sizes integer[] default '{}',
  images text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. RLS (Row Level Security) — dozvoli sve operacije za anon ključ
alter table admins enable row level security;
alter table login_codes enable row level security;
alter table products enable row level security;

-- Dozvoli čitanje i pisanje za sve (API ključ kontroliše pristup)
create policy "allow_all_admins"      on admins      for all using (true) with check (true);
create policy "allow_all_login_codes" on login_codes for all using (true) with check (true);
create policy "allow_all_products"    on products    for all using (true) with check (true);

-- ✅ GOTOVO! Klikni Run i tabele su kreirane.

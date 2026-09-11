-- ========================================================
-- KorrectPay Database Schema & Hardened Security Setup
-- Idempotent & Migration-Safe (for new or existing databases)
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text default 'customer' not null check (role in ('admin', 'customer')),
  title text,
  first_name text,
  last_name text,
  phone_number text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists role text default 'customer' not null check (role in ('admin', 'customer'));
alter table public.profiles add column if not exists title text;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists status text default 'active' check (status in ('active', 'suspended', 'blocked'));
alter table public.profiles add column if not exists is_pin_set boolean default false;
alter table public.profiles add column if not exists transaction_pin_hash text;
alter table public.profiles add column if not exists pin_updated_at timestamp with time zone;
alter table public.profiles add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Unique case-insensitive index for @usernames
create unique index if not exists idx_profiles_username on public.profiles (lower(username)) where username is not null;

-- 2. Wallets Table
create table if not exists public.wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  balance numeric(12, 2) default 0.00 not null,
  currency text default 'NGN' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure wallet columns exist
alter table public.wallets add column if not exists balance numeric(12, 2) default 0.00 not null;
alter table public.wallets add column if not exists currency text default 'NGN' not null;
alter table public.wallets add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null;
alter table public.wallets add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Add unique constraint on (user_id, currency) if not exists
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'wallets_user_currency_unique'
  ) then
    alter table public.wallets add constraint wallets_user_currency_unique unique (user_id, currency);
  end if;
end $$;

-- 3. Transactions Table
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  wallet_id uuid references public.wallets(id) on delete cascade not null,
  amount numeric(12, 2) not null,
  type text not null check (type in ('credit', 'debit')),
  category text not null,
  description text,
  reference text unique, 
  status text default 'completed' check (status in ('pending', 'completed', 'failed')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions add column if not exists reference text;
alter table public.transactions add column if not exists status text default 'completed';
alter table public.transactions add column if not exists metadata jsonb default '{}'::jsonb;

-- Indexes for lightning fast queries and audit log lookups
create index if not exists idx_transactions_wallet_id on public.transactions(wallet_id);
create index if not exists idx_transactions_reference on public.transactions(reference);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);
create index if not exists idx_wallets_user_id on public.wallets(user_id);
create index if not exists idx_virtual_accounts_user_id on public.virtual_accounts(user_id);

-- 4. Korapay Virtual Bank Accounts (Dedicated NGN Accounts)
create table if not exists public.virtual_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  bank_name text not null,
  bank_code text not null,
  account_number text not null,
  account_name text not null,
  account_reference text unique not null,
  unique_id text,
  status text default 'active' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure virtual accounts columns exist
alter table public.virtual_accounts add column if not exists bank_name text;
alter table public.virtual_accounts add column if not exists bank_code text;
alter table public.virtual_accounts add column if not exists account_number text;
alter table public.virtual_accounts add column if not exists account_name text;
alter table public.virtual_accounts add column if not exists account_reference text;
alter table public.virtual_accounts add column if not exists unique_id text;
alter table public.virtual_accounts add column if not exists status text default 'active';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'virtual_accounts_user_unique'
  ) then
    alter table public.virtual_accounts add constraint virtual_accounts_user_unique unique (user_id);
  end if;
end $$;

-- 5. Helper function to check if current authenticated user is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and coalesce(role, 'customer') = 'admin'
  );
$$;

-- 6. Automatic User Initialization Trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _role text;
  _title text;
  _first_name text;
  _last_name text;
  _phone_number text;
begin
  _role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  _title := new.raw_user_meta_data->>'title';
  _first_name := new.raw_user_meta_data->>'first_name';
  _last_name := new.raw_user_meta_data->>'last_name';
  _phone_number := new.raw_user_meta_data->>'phone';

  if _phone_number is null then
    _phone_number := new.raw_user_meta_data->>'phone_number';
  end if;

  -- Create or update profile
  insert into public.profiles (id, role, title, first_name, last_name, phone_number, avatar_url)
  values (
    new.id,
    _role,
    coalesce(_title, 'Mr'),
    coalesce(_first_name, split_part(new.email, '@', 1)),
    coalesce(_last_name, ''),
    _phone_number,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id
  )
  on conflict (id) do update set
    role = coalesce(excluded.role, public.profiles.role),
    title = coalesce(excluded.title, public.profiles.title),
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone_number = excluded.phone_number;

  -- Create default NGN wallet with 0 balance (Safe against duplicate runs)
  insert into public.wallets (user_id, balance, currency)
  values (new.id, 0.00, 'NGN')
  on conflict (user_id, currency) do nothing;

  return new;
end;
$$;

-- Attach trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Hardened Row Level Security (RLS) Rules
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.virtual_accounts enable row level security;

-- Profiles RLS: Users can view/update their own profile, Admins can view and update all profiles
drop policy if exists "Users can view own profile or admin view all" on public.profiles;
create policy "Users can view own profile or admin view all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile or admin update all" on public.profiles;
create policy "Users can update own profile or admin update all"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- Wallets RLS:
-- Users can view own wallet, Admins can view all wallets
-- (Strictly NO direct client-side update/insert to protect wallet balances)
drop policy if exists "Users can view own wallet or admin view all" on public.wallets;
create policy "Users can view own wallet or admin view all"
  on public.wallets for select
  using (auth.uid() = user_id or public.is_admin());

-- Transactions RLS:
-- Users can view own transactions, Admins can view all platform transactions
drop policy if exists "Users can view own transactions or admin view all" on public.transactions;
create policy "Users can view own transactions or admin view all"
  on public.transactions for select
  using (
    wallet_id in (select id from public.wallets where user_id = auth.uid())
    or public.is_admin()
  );

-- Virtual Accounts RLS:
-- Users can view their assigned virtual bank account, Admins can view all virtual accounts
drop policy if exists "Users can view own virtual account or admin view all" on public.virtual_accounts;
create policy "Users can view own virtual account or admin view all"
  on public.virtual_accounts for select
  using (auth.uid() = user_id or public.is_admin());

-- 8. Atomic Debit & Refund RPC Functions (Hardened Security Definer with Search Path)
create or replace function public.debit_wallet_for_bill(
  p_wallet_id uuid,
  p_amount numeric(12, 2),
  p_category text,
  p_description text,
  p_reference text,
  p_metadata jsonb default '{}'::jsonb
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric(12, 2);
  v_user_id uuid;
  v_tx_id uuid;
begin
  -- Verify ownership: wallet must belong to the calling authenticated user (or service role)
  select balance, user_id into v_balance, v_user_id
  from public.wallets
  where id = p_wallet_id
  for update;

  if not found then
    return json_build_object('success', false, 'error', 'Wallet not found');
  end if;

  if auth.uid() is not null and auth.uid() <> v_user_id and auth.role() <> 'service_role' then
    return json_build_object('success', false, 'error', 'Unauthorized wallet operation');
  end if;

  if p_amount <= 0 then
    return json_build_object('success', false, 'error', 'Transaction amount must be greater than zero');
  end if;

  if v_balance < p_amount then
    return json_build_object('success', false, 'error', 'Insufficient funds');
  end if;

  -- Deduct balance
  update public.wallets
  set balance = balance - p_amount, updated_at = now()
  where id = p_wallet_id;

  -- Insert debit transaction
  insert into public.transactions (wallet_id, amount, type, category, description, reference, status, metadata)
  values (p_wallet_id, p_amount, 'debit', p_category, p_description, p_reference, 'completed', coalesce(p_metadata, '{}'::jsonb))
  returning id into v_tx_id;

  return json_build_object(
    'success', true,
    'new_balance', v_balance - p_amount,
    'transaction_id', v_tx_id,
    'reference', p_reference
  );
end;
$$;

create or replace function public.refund_wallet_for_bill(
  p_wallet_id uuid,
  p_amount numeric(12, 2),
  p_category text,
  p_description text,
  p_reference text,
  p_metadata jsonb default '{}'::jsonb
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric(12, 2);
  v_user_id uuid;
  v_tx_id uuid;
begin
  if p_amount <= 0 then
    return json_build_object('success', false, 'error', 'Refund amount must be greater than zero');
  end if;

  -- Lock wallet row to prevent concurrent lost updates
  select user_id into v_user_id
  from public.wallets
  where id = p_wallet_id
  for update;

  if not found then
    return json_build_object('success', false, 'error', 'Wallet not found');
  end if;

  if auth.uid() is not null and auth.uid() <> v_user_id and auth.role() <> 'service_role' then
    return json_build_object('success', false, 'error', 'Unauthorized refund operation');
  end if;

  -- Prevent double refunding: check if reference has already been refunded
  if exists (
    select 1 from public.transactions
    where reference = p_reference
  ) then
    return json_build_object('success', false, 'error', 'Transaction reference already processed');
  end if;

  -- Credit balance back
  update public.wallets
  set balance = balance + p_amount, updated_at = now()
  where id = p_wallet_id
  returning balance into v_balance;

  -- Insert refund transaction
  insert into public.transactions (wallet_id, amount, type, category, description, reference, status, metadata)
  values (p_wallet_id, p_amount, 'credit', p_category, p_description, p_reference, 'completed', coalesce(p_metadata, '{}'::jsonb))
  returning id into v_tx_id;

  return json_build_object(
    'success', true,
    'new_balance', v_balance,
    'transaction_id', v_tx_id,
    'reference', p_reference
  );
end;
$$;

-- Atomic Deposit Crediting Function for Verified Gateway Webhooks (Fail-safe, Idempotent, with Row-Locking)
create or replace function public.credit_wallet_deposit(
  p_wallet_id uuid,
  p_amount numeric(12, 2),
  p_description text,
  p_reference text,
  p_metadata jsonb default '{}'::jsonb
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric(12, 2);
  v_tx_id uuid;
begin
  if p_amount <= 0 then
    return json_build_object('success', false, 'error', 'Deposit amount must be greater than zero');
  end if;

  -- 1. Enforce strict idempotency: reject duplicate references
  if exists (
    select 1 from public.transactions
    where reference = p_reference
  ) then
    return json_build_object('success', true, 'message', 'Transaction already processed (idempotent duplicate)');
  end if;

  -- 2. Lock wallet row FOR UPDATE to eliminate lost-update race conditions
  select balance into v_balance
  from public.wallets
  where id = p_wallet_id
  for update;

  if not found then
    return json_build_object('success', false, 'error', 'Wallet not found');
  end if;

  -- 3. Atomic balance increment
  update public.wallets
  set balance = balance + p_amount, updated_at = now()
  where id = p_wallet_id
  returning balance into v_balance;

  -- 4. Record credit transaction
  insert into public.transactions (wallet_id, amount, type, category, description, reference, status, metadata)
  values (p_wallet_id, p_amount, 'credit', 'deposit', p_description, p_reference, 'completed', coalesce(p_metadata, '{}'::jsonb))
  returning id into v_tx_id;

  return json_build_object(
    'success', true,
    'new_balance', v_balance,
    'transaction_id', v_tx_id,
    'reference', p_reference
  );
end;
$$;

-- ========================================================
-- Realtime Synchronization Configuration
-- Enables instant WebSocket broadcasts on balance & tx updates
-- ========================================================
alter table public.wallets replica identity full;
alter table public.transactions replica identity full;
alter table public.profiles replica identity full;

alter publication supabase_realtime add table public.wallets;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.profiles;

-- ========================================================
-- 9. Login History & Session Audit Tracking
-- ========================================================
create table if not exists public.login_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  ip_address text,
  user_agent text,
  browser text,
  os text,
  device_type text,
  status text default 'success' check (status in ('success', 'failed')),
  failure_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_login_history_user_id on public.login_history(user_id);
create index if not exists idx_login_history_created_at on public.login_history(created_at desc);

-- RLS for login_history
alter table public.login_history enable row level security;

create policy "Users can view own login history"
  on public.login_history for select
  using (auth.uid() = user_id);

create policy "Admins can view all login history"
  on public.login_history for select
  using (public.is_admin());

create policy "Service role has full access to login_history"
  on public.login_history for all
  using (auth.role() = 'service_role');



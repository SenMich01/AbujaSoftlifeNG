create extension if not exists "pgcrypto";

create table if not exists public.players (
  id uuid primary key references auth.users(id) on delete cascade,

  display_name text not null,
  age integer not null default 18,
  gender text not null default 'Prefer not to say',

  money numeric not null default 100000,
  bank_balance numeric not null default 0,

  health integer not null default 100,
  happiness integer not null default 70,
  energy integer not null default 100,
  reputation integer not null default 0,

  district text not null default 'gwarinpa',

  job text not null default 'Job Seeker',
  job_salary numeric not null default 0,

  housing text not null default 'Shared Apartment',
  housing_cost numeric not null default 30000,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint players_age_check
    check (age >= 13 and age <= 100),

  constraint players_health_check
    check (health >= 0 and health <= 100),

  constraint players_happiness_check
    check (happiness >= 0 and happiness <= 100),

  constraint players_energy_check
    check (energy >= 0 and energy <= 100),

  constraint players_reputation_check
    check (reputation >= 0 and reputation <= 100),

  constraint players_money_check
    check (money >= 0),

  constraint players_bank_balance_check
    check (bank_balance >= 0)
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),

  player_id uuid not null
    references public.players(id)
    on delete cascade,

  action text not null,

  amount numeric not null default 0,

  details text,

  created_at timestamptz not null default now()
);

/* ---------------------------------------
   ROW LEVEL SECURITY
--------------------------------------- */

alter table public.players enable row level security;

alter table public.activity_log enable row level security;

/* ---------------------------------------
   PLAYERS POLICIES
--------------------------------------- */

drop policy if exists "Players can view own profile"
on public.players;

create policy "Players can view own profile"
on public.players
for select
to authenticated
using (auth.uid() = id);


drop policy if exists "Players can insert own profile"
on public.players;

create policy "Players can insert own profile"
on public.players
for insert
to authenticated
with check (auth.uid() = id);


drop policy if exists "Players can update own profile"
on public.players;

create policy "Players can update own profile"
on public.players
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

/* ---------------------------------------
   ACTIVITY POLICIES
--------------------------------------- */

drop policy if exists "Players can view own activity"
on public.activity_log;

create policy "Players can view own activity"
on public.activity_log
for select
to authenticated
using (auth.uid() = player_id);


drop policy if exists "Players can create own activity"
on public.activity_log;

create policy "Players can create own activity"
on public.activity_log
for insert
to authenticated
with check (auth.uid() = player_id);

/* ---------------------------------------
   UPDATED_AT
--------------------------------------- */

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists players_updated_at
on public.players;

create trigger players_updated_at
before update on public.players
for each row
execute function public.update_updated_at();

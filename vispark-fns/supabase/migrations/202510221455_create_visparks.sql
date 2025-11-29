-- Enable required extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Create visparks table
create table if not exists public.visparks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id text not null,
  summaries jsonb not null,
  created_at timestamptz not null default now()
);

-- Indexes to speed up common queries
create index if not exists visparks_user_id_created_at_idx on public.visparks (user_id, created_at desc);
create index if not exists visparks_user_id_video_id_idx on public.visparks (user_id, video_id);

-- Enable Row Level Security (RLS)
alter table public.visparks enable row level security;

-- RLS policies
create policy "Users can insert their own visparks"
  on public.visparks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own visparks"
  on public.visparks
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Enable required extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Create channels table
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null unique, -- YouTube channel ID
  channel_title text not null,
  channel_thumbnail_url text,
  video_count bigint,
  last_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Indexes to speed up common queries
create index if not exists channels_channel_id_idx on public.channels (channel_id);
create index if not exists channels_last_updated_idx on public.channels (last_updated_at desc);

-- Enable Row Level Security (RLS)
alter table public.channels enable row level security;

-- RLS policies (public read access since channel data is not user-specific)
create policy "Anyone can view channels"
  on public.channels
  for select
  to authenticated, anon
  using (true);

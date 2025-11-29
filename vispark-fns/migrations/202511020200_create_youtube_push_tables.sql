-- Enable required extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Create youtube_push_subscriptions table
create table if not exists public.youtube_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  channel_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id text not null,
  hub_secret text not null,
  lease_seconds integer not null default 864000,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

-- Indexes for youtube_push_subscriptions
create index if not exists youtube_push_subscriptions_channel_id_idx on public.youtube_push_subscriptions (channel_id);
create index if not exists youtube_push_subscriptions_user_id_idx on public.youtube_push_subscriptions (user_id);
create index if not exists youtube_push_subscriptions_expires_at_idx on public.youtube_push_subscriptions (expires_at);

-- Enable RLS for youtube_push_subscriptions
alter table public.youtube_push_subscriptions enable row level security;

-- RLS policies for youtube_push_subscriptions
create policy "Users can view their own push subscriptions"
  on public.youtube_push_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own push subscriptions"
  on public.youtube_push_subscriptions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own push subscriptions"
  on public.youtube_push_subscriptions
  for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own push subscriptions"
  on public.youtube_push_subscriptions
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create video_notifications table
create table if not exists public.video_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id text not null,
  channel_id text not null,
  video_title text not null,
  video_url text not null,
  published_at timestamptz not null,
  summary_generated boolean not null default false,
  notification_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for video_notifications
create index if not exists video_notifications_user_id_idx on public.video_notifications (user_id);
create index if not exists video_notifications_video_id_idx on public.video_notifications (video_id);
create index if not exists video_notifications_channel_id_idx on public.video_notifications (channel_id);

-- Enable RLS for video_notifications
alter table public.video_notifications enable row level security;

-- RLS policies for video_notifications
create policy "Users can view their own video notifications"
  on public.video_notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own video notifications"
  on public.video_notifications
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own video notifications"
  on public.video_notifications
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers to automatically update updated_at
create trigger handle_youtube_push_subscriptions_updated_at
  before update on public.youtube_push_subscriptions
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_video_notifications_updated_at
  before update on public.video_notifications
  for each row
  execute procedure public.handle_updated_at();

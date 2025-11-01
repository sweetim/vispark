-- Add user_id column to channels table for subscription tracking
alter table public.channels add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Remove columns that will be fetched from YouTube API instead
alter table public.channels drop column if exists channel_title;
alter table public.channels drop column if exists channel_thumbnail_url;
alter table public.channels drop column if exists video_count;
alter table public.channels drop column if exists last_updated_at;

-- Add index for user_id to speed up subscription queries
create index if not exists channels_user_id_idx on public.channels (user_id);

-- Update RLS policies for channels table
drop policy if exists "Anyone can view channels" on public.channels;

create policy "Users can view their own subscribed channels"
  on public.channels
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own channel subscriptions"
  on public.channels
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own channel subscriptions"
  on public.channels
  for delete
  to authenticated
  using (auth.uid() = user_id);

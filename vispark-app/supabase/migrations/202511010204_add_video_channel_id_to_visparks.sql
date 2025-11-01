-- Add video_channel_id column to visparks table
alter table public.visparks add column if not exists video_channel_id text;

-- Create index for video_channel_id to speed up queries
create index if not exists visparks_user_id_video_channel_id_idx on public.visparks (user_id, video_channel_id);

-- Update RLS policies to include the new column
create policy "Users can insert their own visparks with channel"
  on public.visparks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own visparks with channel"
  on public.visparks
  for select
  to authenticated
  using (auth.uid() = user_id);

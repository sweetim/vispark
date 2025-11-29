-- Create youtube_push_callback_logs table to track callback invocations
create table if not exists public.youtube_push_callback_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel_id text not null,
  video_id text not null,
  video_title text not null,
  processed_at timestamptz not null default now(),
  processing_status text not null default 'pending' check (processing_status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

-- Indexes for youtube_push_callback_logs
create index if not exists youtube_push_callback_logs_user_id_idx on public.youtube_push_callback_logs (user_id);
create index if not exists youtube_push_callback_logs_channel_id_idx on public.youtube_push_callback_logs (channel_id);
create index if not exists youtube_push_callback_logs_video_id_idx on public.youtube_push_callback_logs (video_id);
create index if not exists youtube_push_callback_logs_status_idx on public.youtube_push_callback_logs (processing_status);
create index if not exists youtube_push_callback_logs_created_at_idx on public.youtube_push_callback_logs (created_at);

-- Enable RLS for youtube_push_callback_logs
alter table public.youtube_push_callback_logs enable row level security;

-- RLS policies for youtube_push_callback_logs
create policy "Users can view their own callback logs"
  on public.youtube_push_callback_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own callback logs"
  on public.youtube_push_callback_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Function to update updated_at timestamp
create trigger handle_youtube_push_callback_logs_updated_at
  before update on public.youtube_push_callback_logs
  for each row
  execute procedure public.handle_updated_at();

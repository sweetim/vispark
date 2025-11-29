-- Add a column to track if a video is new from YouTube callback
alter table public.visparks
add column if not exists is_new_from_callback boolean not null default false;

-- Add an index for faster queries on this column
create index if not exists visparks_is_new_from_callback_idx on public.visparks (is_new_from_callback);

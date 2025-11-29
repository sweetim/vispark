-- Add callback_url field to youtube_push_subscriptions table
alter table public.youtube_push_subscriptions
add column if not exists callback_url text not null default '';

-- Create index for callback_url
create index if not exists youtube_push_subscriptions_callback_url_idx
on public.youtube_push_subscriptions (callback_url);

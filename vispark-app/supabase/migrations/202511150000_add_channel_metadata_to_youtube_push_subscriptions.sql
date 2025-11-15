-- Add channel metadata columns to youtube_push_subscriptions table
alter table public.youtube_push_subscriptions
add column if not exists channel_title text,
add column if not exists channel_thumbnail_url text;

-- Add indexes for the new columns to improve query performance
create index if not exists youtube_push_subscriptions_channel_title_idx on public.youtube_push_subscriptions (channel_title);
create index if not exists youtube_push_subscriptions_channel_thumbnail_url_idx on public.youtube_push_subscriptions (channel_thumbnail_url);

-- Add comment to describe the new columns
comment on column public.youtube_push_subscriptions.channel_title is 'The title of the YouTube channel';
comment on column public.youtube_push_subscriptions.channel_thumbnail_url is 'The URL of the YouTube channel thumbnail image';

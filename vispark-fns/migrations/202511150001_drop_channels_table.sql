-- Drop the channels table as it's no longer needed
-- Channel metadata is now stored in youtube_push_subscriptions table
drop table if exists public.channels cascade;

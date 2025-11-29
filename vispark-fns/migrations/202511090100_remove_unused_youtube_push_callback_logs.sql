-- Remove unused youtube_push_callback_logs table
-- This table was created but never used in any functions

-- Drop the trigger first if it exists
drop trigger if exists handle_youtube_push_callback_logs_updated_at on public.youtube_push_callback_logs;

-- Drop the table
drop table if exists public.youtube_push_callback_logs;

-- Note: This table was created to track callback invocations but was never implemented
-- The youtube-push-callback function processes notifications directly without logging

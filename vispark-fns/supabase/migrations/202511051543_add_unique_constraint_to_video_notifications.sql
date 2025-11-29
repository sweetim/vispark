-- Add unique constraint to video_notifications table for user_id and video_id combination
-- This is required for the ON CONFLICT clause in the upsert operation

-- First, drop any existing duplicate records if they exist
delete from public.video_notifications
where ctid not in (
  select min(ctid)
  from public.video_notifications
  group by user_id, video_id
);

-- Add the unique constraint
alter table public.video_notifications
add constraint video_notifications_user_id_video_id_key
unique (user_id, video_id);

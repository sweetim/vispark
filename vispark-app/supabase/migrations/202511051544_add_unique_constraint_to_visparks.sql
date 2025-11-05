-- Add unique constraint to visparks table for user_id and video_id combination
-- This prevents duplicate vispark entries for the same user and video

-- First, drop any existing duplicate records if they exist
delete from public.visparks
where ctid not in (
  select min(ctid)
  from public.visparks
  group by user_id, video_id
);

-- Add the unique constraint
alter table public.visparks
add constraint visparks_user_id_video_id_key
unique (user_id, video_id);

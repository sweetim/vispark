-- Remove video_duration column from visparks table
alter table public.visparks
drop column if exists video_duration;

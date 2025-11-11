-- Add video metadata columns to visparks table
alter table public.visparks
add column if not exists video_title text,
add column if not exists video_description text,
add column if not exists video_channel_title text,
add column if not exists video_thumbnails jsonb,
add column if not exists video_published_at timestamptz,
add column if not exists video_duration text,
add column if not exists video_default_language text;

-- Create index for video metadata queries
create index if not exists visparks_video_id_idx on public.visparks (video_id);

-- Add comment to describe the new columns
comment on column public.visparks.video_title is 'Title of the YouTube video';
comment on column public.visparks.video_description is 'Description of the YouTube video';
comment on column public.visparks.video_channel_title is 'Title of the YouTube channel';
comment on column public.visparks.video_thumbnails is 'JSON object containing video thumbnails';
comment on column public.visparks.video_published_at is 'Publication date of the video';
comment on column public.visparks.video_duration is 'Duration of the video in ISO 8601 format';
comment on column public.visparks.video_default_language is 'Default language of the video';

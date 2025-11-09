-- Create a function to handle video processing when a new video notification is inserted
create or replace function public.process_video_notification()
returns trigger
language plpgsql
security definer
as $$
declare
  supabase_url text;
  service_role_key text;
begin
  -- Get Supabase configuration from settings
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.supabase_service_role_key', true);

  -- Make an asynchronous HTTP request to the video-processing function
  -- Using pg_background extension to run the request in the background
  perform pg_background.launch(
    format(
      $sql$
        select net.http_post(
          url := '%s/functions/v1/video-processing',
          headers := jsonb_build_object(
            'Authorization', 'Bearer %s',
            'Content-Type', 'application/json'
          ),
          body := jsonb_build_object(
            'video_id', '%s',
            'user_id', '%s',
            'channel_id', '%s'
          )
        );
      $sql$,
      supabase_url,
      service_role_key,
      new.video_id,
      new.user_id,
      new.channel_id
    )
  );

  -- Return the new row
  return new;
exception when others then
  -- Log the error but don't fail the insert
  raise warning 'Failed to trigger video processing for video_id %: %', new.video_id, sqlerrm;
  return new;
end;
$$;

-- Enable required extensions
create extension if not exists "pg_background";
create extension if not exists "pg_net";

-- Create a trigger that fires when a new row is inserted into video_notifications
create trigger trigger_process_video_notification
  after insert on public.video_notifications
  for each row
  when (new.summary_generated = false)
  execute function public.process_video_notification();

-- Set default configuration settings (these can be overridden)
-- These settings should be configured in your Supabase dashboard
-- under Settings > Database > Custom Variables
do $$
begin
  if not exists (select 1 from pg_settings where name = 'app.settings.supabase_url') then
    raise notice 'Please set app.settings.supabase_url in your Supabase dashboard settings';
  end if;

  if not exists (select 1 from pg_settings where name = 'app.settings.supabase_service_role_key') then
    raise notice 'Please set app.settings.supabase_service_role_key in your Supabase dashboard settings';
  end if;
end $$;

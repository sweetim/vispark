-- Create cron job for YouTube subscription renewal

-- First, create a function that will be called by the cron job
create or replace function public.youtube_subscription_renewal_job()
returns void as $$
declare
  renewal_url text;
  service_role_key text;
  response_text text;
  http_status integer;
begin
  -- Get the function URL and service role key
  renewal_url := current_setting('app.supabase_url', true) || '/functions/v1/youtube-push-renew';
  service_role_key := current_setting('app.new_supabase_service_role_key', true);

  -- Make HTTP request to the renewal function
  -- Note: This requires the pg_net extension to be enabled
  select
    content::text as response_text,
    status::integer as http_status
  into
    response_text,
    http_status
  from http_post(
    renewal_url,
    '{}',
    array[
      ('Content-Type', 'application/json'),
      ('Authorization', 'Bearer ' || service_role_key)
    ]
  );

  -- Log the result
  if http_status = 200 then
    raise log 'YouTube subscription renewal job completed successfully: %', response_text;
  else
    raise warning 'YouTube subscription renewal job failed with status %: %', http_status, response_text;
  end if;

exception
  when others then
    raise exception 'YouTube subscription renewal job encountered an error: %', SQLERRM;
end;
$$ language plpgsql;

-- Enable pg_net extension if not already enabled
create extension if not exists "pg_net";

-- Create the cron job to run daily at 2 AM UTC
-- Note: This requires the pg_cron extension to be enabled
select cron.schedule(
  'youtube-subscription-renewal',
  '0 2 * * *', -- Daily at 2 AM UTC
  'select public.youtube_subscription_renewal_job();'
);

-- Grant necessary permissions
grant usage on schema cron to postgres;
grant execute on function public.youtube_subscription_renewal_job() to postgres;

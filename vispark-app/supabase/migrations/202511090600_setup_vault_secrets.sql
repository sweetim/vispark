-- Store secrets in Supabase Vault for the video processing trigger
-- These secrets will be used by the process_video_notification function

-- Store the service role key (placeholder for local development)
SELECT vault.create_secret('PLACEHOLDER_SERVICE_ROLE_KEY', 'supabase_service_role_key');

-- Update the trigger function to use vault secrets
CREATE OR REPLACE FUNCTION public.process_video_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
  request_id TEXT;
BEGIN
  -- Retrieve secrets from Vault
  SELECT decrypted_secret INTO supabase_url FROM vault.decrypted_secrets WHERE name = 'supabase_url';
  SELECT decrypted_secret INTO service_role_key FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key';

  -- Make an asynchronous HTTP request to the video-processing function using pg_net
  SELECT net.http_post(
    url := supabase_url || '/functions/v1/video-processing',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_role_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'video_id', NEW.video_id,
      'user_id', NEW.user_id,
      'channel_id', NEW.channel_id
    )
  ) INTO request_id;

  -- Log the request ID for debugging
  RAISE NOTICE 'Video processing request sent for video_id % with request_id %', NEW.video_id, request_id;

  -- Return the new row
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the insert
  RAISE WARNING 'Failed to trigger video processing for video_id %: %', NEW.video_id, SQLERRM;
  RETURN NEW;
END;
$$;

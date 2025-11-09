-- Check if the trigger exists
SELECT
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name,
    tgenabled as is_enabled
FROM pg_trigger
WHERE tgname = 'trigger_process_video_notification';

-- Check if the function exists
SELECT
    proname as function_name,
    prosrc as function_source
FROM pg_proc
WHERE proname = 'process_video_notification';

-- Check if pg_net extension is enabled
SELECT
    extname as extension_name,
    extversion as version
FROM pg_extension
WHERE extname = 'pg_net';

-- Check if custom settings exist
SELECT
    name,
    setting
FROM pg_settings
WHERE name LIKE 'app.settings.%';

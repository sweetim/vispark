-- Fix integer concatenation error in update_subscription_status function
-- Replace || with + for arithmetic operations

-- Drop the trigger first
drop trigger if exists update_youtube_push_subscription_status on public.youtube_push_subscriptions;

-- Drop the existing function
drop function if exists public.update_subscription_status();

-- Recreate the function with correct arithmetic operations
create or replace function public.update_subscription_status()
returns trigger as $$
begin
  -- Update status based on expiration date
  if new.expires_at <= now() then
    new.status := 'expired';
  elsif new.expires_at <= now() + (new.expires_at_buffer_days + 1) * interval '1 day' then
    new.status := 'expiring';
  else
    new.status := 'active';
  end if;

  return new;
end;
$$ language plpgsql;

-- Recreate the trigger
create trigger update_youtube_push_subscription_status
  before insert or update on public.youtube_push_subscriptions
  for each row
  execute procedure public.update_subscription_status();

-- Drop the existing function
drop function if exists public.get_subscriptions_needing_renewal();

-- Recreate the function with correct arithmetic operations
create or replace function public.get_subscriptions_needing_renewal()
returns table (
  id uuid,
  channel_id text,
  user_id uuid,
  subscription_id text,
  hub_secret text,
  lease_seconds integer,
  expires_at timestamptz,
  status text,
  retry_count integer,
  last_retry_at timestamptz,
  renewal_error text,
  auto_renewal_enabled boolean
) as $$
begin
  return query
  select
    s.id,
    s.channel_id,
    s.user_id,
    s.subscription_id,
    s.hub_secret,
    s.lease_seconds,
    s.expires_at,
    s.status,
    s.retry_count,
    s.last_retry_at,
    s.renewal_error,
    s.auto_renewal_enabled
  from public.youtube_push_subscriptions s
  where
    s.auto_renewal_enabled = true
    and (
      -- Subscriptions expiring within buffer period
      (s.expires_at <= now() + (s.expires_at_buffer_days + 1) * interval '1 day' and s.status != 'failed')
      or
      -- Failed subscriptions that haven't exceeded retry limit for the day
      (s.status = 'failed' and s.retry_count < 3 and
       (s.last_retry_at is null or s.last_retry_at < current_date))
    )
  order by s.expires_at asc;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function public.get_subscriptions_needing_renewal() to authenticated;
grant execute on function public.update_subscription_status() to authenticated;

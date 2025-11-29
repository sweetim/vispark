-- Add subscription status and renewal tracking fields to youtube_push_subscriptions table

-- Add new columns for tracking subscription status and renewal attempts
alter table public.youtube_push_subscriptions
add column if not exists status text not null default 'active' check (status in ('active', 'expiring', 'expired', 'failed', 'renewing')),
add column if not exists retry_count integer not null default 0 check (retry_count >= 0),
add column if not exists last_retry_at timestamptz,
add column if not exists renewal_error text,
add column if not exists auto_renewal_enabled boolean not null default true,
add column if not exists expires_at_buffer_days integer not null default 1;

-- Create index for efficient querying of expiring subscriptions
create index if not exists youtube_push_subscriptions_status_expires_at_idx
on public.youtube_push_subscriptions (status, expires_at);

-- Create index for retry tracking
create index if not exists youtube_push_subscriptions_retry_count_idx
on public.youtube_push_subscriptions (retry_count);

-- Update RLS policies to include new fields in select policy
drop policy if exists "Users can view their own push subscriptions" on public.youtube_push_subscriptions;
create policy "Users can view their own push subscriptions"
  on public.youtube_push_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Create function to update subscription status based on expiration
create or replace function public.update_subscription_status()
returns trigger as $$
begin
  -- Update status based on expiration date
  if new.expires_at <= now() then
    new.status := 'expired';
  elsif new.expires_at <= now() + (new.expires_at_buffer_days || 1) * interval '1 day' then
    new.status := 'expiring';
  else
    new.status := 'active';
  end if;

  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update subscription status
create trigger update_youtube_push_subscription_status
  before insert or update on public.youtube_push_subscriptions
  for each row
  execute procedure public.update_subscription_status();

-- Create function to get subscriptions that need renewal
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
      (s.expires_at <= now() + (s.expires_at_buffer_days || 1) * interval '1 day' and s.status != 'failed')
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

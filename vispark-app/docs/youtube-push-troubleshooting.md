# YouTube Push Notifications Troubleshooting Guide

## Issue Description

When clicking the subscribe button in the channel page, users may encounter the following error:

```
Failed to toggle subscription: Error: Edge Function returned a non-2xx status code
    at subscribeToYouTubePush (youtubePush.ts:12:11)
    at async handleSubscriptionToggle (ChannelPage.tsx:118:9)
```

## Root Cause

This error occurs when the YouTube push notification subscription service is not properly configured. The `youtube-push-subscribe` Edge Function requires several environment variables to be set in your Supabase project.

## Solution

### 1. Configure Environment Variables

Add the following environment variables to your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to Settings > Edge Functions
3. Add the following environment variables:

```bash
# YouTube Push Notifications Configuration
YOUTUBE_PUSH_CALLBACK_URL=https://your-project.supabase.co/functions/v1/youtube-push-callback
YOUTUBE_PUSH_HUB_URL=https://pubsubhubbub.appspot.com/subscribe
YOUTUBE_PUSH_LEASE_SECONDS=864000
```

**Important:** Replace `your-project` with your actual Supabase project ID.

### 2. Deploy Edge Functions

Make sure all required Edge Functions are deployed:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individual functions
supabase functions deploy youtube-push-subscribe
supabase functions deploy youtube-push-callback
```

### 3. Verify Database Tables

Ensure the required database tables exist by running the migration:

```bash
supabase db push
```

Or specifically run the YouTube push tables migration:

```bash
supabase migration up 202511020200_create_youtube_push_tables.sql
```

## Code Changes Made

### 1. Improved Error Handling

We've enhanced the error handling in the subscription flow to:

- Continue with channel subscription even if push notification subscription fails
- Provide user-friendly toast notifications instead of browser alerts
- Log detailed error information for debugging

### 2. Added Toast Notification System

A new toast notification system has been implemented to provide better user feedback:

- `src/components/Toast.tsx` - Toast component with different types (success, error, warning, info)
- `src/contexts/ToastContext.tsx` - Context for managing toasts globally
- Updated `src/main.tsx` to include the ToastProvider
- Updated `src/routes/app/channel/ChannelPage.tsx` to use toast notifications

### 3. Enhanced Error Messages

The error messages in `src/services/youtubePush.ts` have been improved to provide more context about what went wrong.

## Testing the Fix

1. After configuring the environment variables and deploying the functions, test the subscription functionality:
   - Navigate to a channel page
   - Click the subscribe button
   - You should see a success toast notification if everything is configured correctly
   - If push notifications fail, you'll see a warning toast but the channel subscription will still succeed

2. Check the browser console for detailed error messages if issues persist

3. Verify the Edge Function logs:
   ```bash
   supabase functions logs youtube-push-subscribe
   ```

## Troubleshooting Steps

If the issue persists after following the above steps:

1. **Check Environment Variables**
   - Verify all required environment variables are set correctly
   - Ensure the callback URL points to your actual Supabase project

2. **Check Function Deployment**
   - Verify the Edge Functions are deployed without errors
   - Check function logs for any runtime errors

3. **Check Database Permissions**
   - Ensure the YouTube push tables exist
   - Verify Row Level Security policies are correctly configured

4. **Check Network Connectivity**
   - Verify the callback URL is accessible from the internet
   - Test the PubSubHubbub hub URL is reachable

## Future Improvements

Consider implementing:

1. Automatic subscription renewal before expiration
2. Retry mechanism for failed push subscriptions
3. Admin dashboard for monitoring subscription status
4. User preferences for notification types

## Support

If you continue to experience issues:

1. Check the browser console for detailed error messages
2. Review the Supabase Edge Function logs
3. Verify all environment variables are correctly set
4. Ensure the database migrations have been applied

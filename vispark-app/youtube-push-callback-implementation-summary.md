# YouTube Push Callback Implementation Summary

## Overview
This implementation modifies the YouTube push notification system to use user-specific callback URLs and adds comprehensive logging for each callback invocation.

## Changes Made

### 1. Database Schema Changes

#### New Table: `youtube_push_callback_logs`
- **Purpose**: Track all callback invocations with user-specific details
- **Fields**:
  - `id`: UUID primary key
  - `user_id`: UUID referencing the user
  - `channel_id`: Text for YouTube channel ID
  - `video_id`: Text for YouTube video ID
  - `video_title`: Text for video title
  - `processed_at`: Timestamp when processing started
  - `processing_status`: Enum ('pending', 'processing', 'completed', 'failed')
  - `error_message`: Optional text for error details
  - `created_at`: Timestamp for log creation

#### Updated Table: `youtube_push_subscriptions`
- **Added Field**: `callback_url` to store the user-specific callback URL
- **Purpose**: Track the exact callback URL used for each subscription

### 2. Function Updates

#### YouTube Push Subscribe (`youtube-push-subscribe`)
- **Changed**: Now generates user-specific callback URLs
- **New URL Format**: `{BASE_URL}/{user_id}`
- **Environment Variable**: Changed from `YOUTUBE_PUSH_CALLBACK_URL` to `YOUTUBE_PUSH_CALLBACK_BASE_URL`

#### YouTube Push Callback (`youtube-push-callback`)
- **Changed**: Extracts user ID from URL path
- **Added**: Comprehensive logging for each callback invocation
- **Process**:
  1. Extract user ID from URL
  2. Validate user subscription for the channel
  3. Log callback as 'pending'
  4. Update to 'processing' status
  5. Process notification (transcript/summary generation)
  6. Update to 'completed' or 'failed' status

#### YouTube Push Renew (`youtube-push-renew`)
- **Changed**: Uses user-specific callback URLs for renewals
- **Updated**: Stores new callback URL in database

#### YouTube Push Manual Renew (`youtube-push-manual-renew`)
- **Changed**: Uses user-specific callback URLs for manual renewals
- **Updated**: Stores new callback URL in database

#### YouTube Push Unsubscribe (`youtube-push-unsubscribe`)
- **Changed**: Uses user-specific callback URLs for unsubscription
- **Process**: Unsubscribes the specific user's callback URL

### 3. Database Types Updated
- **File**: `supabase/functions/types/database.ts`
- **Added**: Type definitions for new `youtube_push_callback_logs` table
- **Updated**: Type definitions for `youtube_push_subscriptions` table

## Deployment Instructions

### 1. Environment Variables
Update your Supabase environment variables:
- **Change**: `YOUTUBE_PUSH_CALLBACK_URL` → `YOUTUBE_PUSH_CALLBACK_BASE_URL`
- **New Value**: Base URL without user ID (e.g., `https://your-project.supabase.co/functions/v1/youtube-push-callback`)

### 2. Database Migrations
Run the following migrations in order:
1. `202511070200_create_youtube_push_callback_logs.sql`
2. `202511070201_add_callback_url_to_subscriptions.sql`

### 3. Function Deployment
Deploy all updated functions:
- `youtube-push-subscribe`
- `youtube-push-callback`
- `youtube-push-renew`
- `youtube-push-manual-renew`
- `youtube-push-unsubscribe`

## Security Considerations

### 1. User Validation
- Callback function validates user ID from URL
- Verifies user has subscription for the channel
- Prevents cross-user data access

### 2. URL Structure
- User-specific URLs prevent unauthorized callbacks
- Each user receives callbacks only for their subscriptions

## Testing

### 1. New Subscription
1. User subscribes to a channel
2. Verify callback URL includes user ID
3. Check database for correct `callback_url` storage

### 2. Callback Invocation
1. YouTube sends notification to user-specific URL
2. Verify log entry creation in `youtube_push_callback_logs`
3. Check status progression: pending → processing → completed/failed

### 3. Renewal Process
1. Test automatic renewal
2. Verify new callback URL generation
3. Confirm database updates

## Migration Strategy

### For Existing Subscriptions
- Existing subscriptions will continue working with old callback URL
- New subscriptions will use user-specific URLs
- Consider migrating existing subscriptions if needed

### Backward Compatibility
- Old callback URL structure still supported
- Gradual migration possible
- No breaking changes to existing functionality

## Monitoring

### 1. Callback Logs
Query `youtube_push_callback_logs` table:
```sql
SELECT * FROM youtube_push_callback_logs
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
```

### 2. Failed Callbacks
Monitor failed processing:
```sql
SELECT * FROM youtube_push_callback_logs
WHERE processing_status = 'failed'
AND created_at > NOW() - INTERVAL '24 hours';
```

## Troubleshooting

### Common Issues
1. **Missing User ID**: Check URL structure in subscription
2. **Failed Callbacks**: Verify user permissions and subscription status
3. **Database Errors**: Check migration completion and table structure

### Debug Queries
```sql
-- Check subscription URLs
SELECT user_id, channel_id, callback_url
FROM youtube_push_subscriptions;

-- Check callback logs
SELECT user_id, video_id, processing_status, error_message
FROM youtube_push_callback_logs
WHERE created_at > NOW() - INTERVAL '1 day';

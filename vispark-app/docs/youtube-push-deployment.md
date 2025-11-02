# YouTube Push Notifications Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the YouTube push notifications system for the Vispark application.

## Prerequisites

- Supabase project with Edge Functions enabled
- YouTube Data API key
- Appropriate permissions to create database migrations

## Deployment Steps

### 1. Database Migration

Run the database migration to create the required tables:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the migration file
supabase migration up 202511020200_create_youtube_push_tables.sql
```

### 2. Environment Variables

Add the following environment variables to your Supabase project:

```bash
# In Supabase Dashboard > Settings > Edge Functions
YOUTUBE_PUSH_CALLBACK_URL=https://your-project.supabase.co/functions/v1/youtube-push-callback
YOUTUBE_PUSH_HUB_URL=https://pubsubhubbub.appspot.com/subscribe
YOUTUBE_PUSH_LEASE_SECONDS=864000
```

### 3. Deploy Edge Functions

Deploy the new Edge Functions:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individual functions
supabase functions deploy youtube-push-subscribe
supabase functions deploy youtube-push-callback
```

### 4. Update Existing Function

The channel function has been updated to automatically subscribe to push notifications. Deploy it:

```bash
supabase functions deploy channel
```

### 5. Frontend Integration

The frontend service file `src/services/youtubePush.ts` is ready to use. Here's how to integrate it:

```typescript
import { subscribeToYouTubePush, getVideoNotifications } from '../services/youtubePush'

// Subscribe to push notifications for a channel
try {
  await subscribeToYouTubePush('UCxxxxxxxxxxxxxxxxxxxxxx')
  console.log('Successfully subscribed to push notifications')
} catch (error) {
  console.error('Failed to subscribe:', error)
}

// Get video notifications
const notifications = await getVideoNotifications()
console.log('Video notifications:', notifications)
```

## Testing

### 1. Run Test Script

Update the test script with your Supabase credentials:

```bash
# Edit scripts/test-youtube-push.js
# Update SUPABASE_URL and SUPABASE_ANON_KEY

# Run tests
deno run --allow-net scripts/test-youtube-push.js
```

### 2. Manual Testing

1. Subscribe to a channel in your app
2. Check that push subscription is created in the database
3. Upload a test video to the subscribed channel
4. Verify that notification is received and processed
5. Check that transcript and summary are generated

## Monitoring

### 1. Check Function Logs

```bash
# View function logs
supabase functions logs youtube-push-subscribe
supabase functions logs youtube-push-callback
supabase functions logs channel
```

### 2. Database Monitoring

Monitor the following tables:

- `youtube_push_subscriptions`: Track subscription status and expirations
- `video_notifications`: Track notification processing
- `visparks`: Check that summaries are created

### 3. Key Metrics

Track these metrics:

- Subscription success rate
- Notification processing time
- Transcript generation success rate
- Summary generation success rate
- Error rates and types

## Troubleshooting

### Common Issues

1. **Subscription Fails**
   - Check YouTube API key is valid
   - Verify callback URL is accessible
   - Check environment variables

2. **Callback Not Working**
   - Verify callback URL is correct
   - Check function logs for errors
   - Test with hub.challenge parameter

3. **Notifications Not Processed**
   - Check HMAC signature verification
   - Verify XML parsing
   - Check database permissions

4. **Transcript/Summary Generation Fails**
   - Check transcript function is deployed
   - Verify summary function is deployed
   - Check API keys are valid

### Debug Mode

Enable debug logging by setting:

```bash
# In function environment
DEBUG=true
```

## Security Considerations

1. **HMAC Verification**
   - All incoming notifications are verified
   - Secrets are securely generated and stored
   - Invalid signatures are rejected

2. **Database Security**
   - Row Level Security is enabled
   - Users can only access their own data
   - Service role key is used for background processing

3. **API Security**
   - All functions require authentication
   - CORS headers are properly configured
   - Input validation is implemented

## Maintenance

### 1. Subscription Renewal

Subscriptions expire after the lease period (default 10 days). Implement renewal logic:

```sql
-- Find expiring subscriptions
SELECT * FROM youtube_push_subscriptions
WHERE expires_at < NOW() + INTERVAL '1 day';
```

### 2. Cleanup

Regularly clean up old data:

```sql
-- Delete old notifications (older than 30 days)
DELETE FROM video_notifications
WHERE created_at < NOW() - INTERVAL '30 days';
```

### 3. Monitoring Alerts

Set up alerts for:

- High error rates (>5%)
- Subscription failures
- Function timeouts
- Database connection issues

## Performance Optimization

### 1. Database Indexes

Ensure indexes are created on frequently queried columns:

```sql
-- Check index usage
EXPLAIN ANALYZE
SELECT * FROM video_notifications
WHERE user_id = 'user-id'
ORDER BY created_at DESC;
```

### 2. Function Optimization

- Use connection pooling
- Implement caching where appropriate
- Optimize XML parsing
- Batch database operations

### 3. Scaling

- Monitor function execution times
- Implement rate limiting if needed
- Consider function concurrency limits
- Plan for high-volume channels

## Next Steps

1. Implement real-time notifications via WebSocket
2. Add user notification preferences
3. Create admin dashboard for monitoring
4. Implement subscription analytics
5. Add support for multiple notification types

## Support

For issues:

1. Check function logs first
2. Review database queries
3. Test with the provided test script
4. Verify environment variables
5. Check YouTube API documentation for changes

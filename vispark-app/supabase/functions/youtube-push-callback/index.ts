import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import type { Database } from "../types/database.ts"

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

// Verify HMAC signature from YouTube
const verifyHmacSignature = async (
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )

  const signatureBytes = new Uint8Array(
    signature.split('').map(c => c.charCodeAt(0))
  )

  const isValid = await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    new TextEncoder().encode(payload),
  )

  return isValid
}

// Parse YouTube notification XML
const parseYouTubeNotification = (xmlString: string): {
  videoId: string
  channelId: string
  title: string
  publishedAt: string
} | null => {
  try {
    // Simple XML parsing without external dependencies
    const videoIdMatch = xmlString.match(/<yt:videoId[^>]*>([^<]+)<\/yt:videoId>/)
    const channelIdMatch = xmlString.match(/<yt:channelId[^>]*>([^<]+)<\/yt:channelId>/)
    const titleMatch = xmlString.match(/<title[^>]*>([^<]+)<\/title>/)
    const publishedMatch = xmlString.match(/<published[^>]*>([^<]+)<\/published>/)

    if (!videoIdMatch || !channelIdMatch || !titleMatch || !publishedMatch) {
      return null
    }

    return {
      videoId: videoIdMatch[1],
      channelId: channelIdMatch[1],
      title: titleMatch[1],
      publishedAt: publishedMatch[1],
    }
  } catch (error) {
    console.error("Error parsing YouTube notification:", error)
    return null
  }
}

// Trigger transcript generation
const triggerTranscriptGeneration = async (
  videoId: string,
  supabaseUrl: string,
  supabaseServiceKey: string,
): Promise<any[]> => {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/transcript`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ videoId }),
      }
    )

    if (!response.ok) {
      console.error(`Failed to generate transcript for video ${videoId}:`, response.statusText)
      return []
    }

    const result = await response.json()
    return result.transcript || []
  } catch (error) {
    console.error(`Error triggering transcript generation for video ${videoId}:`, error)
    return []
  }
}

// Trigger summary generation
const triggerSummaryGeneration = async (
  videoId: string,
  transcriptSegments: any[],
  supabaseUrl: string,
  supabaseServiceKey: string,
): Promise<string[]> => {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/summary`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ transcripts: transcriptSegments }),
      }
    )

    if (!response.ok) {
      console.error(`Failed to generate summary for video ${videoId}:`, response.statusText)
      return []
    }

    const result = await response.json()
    return result.bullets || []
  } catch (error) {
    console.error(`Error triggering summary generation for video ${videoId}:`, error)
    return []
  }
}

// Store vispark with summary
const storeVispark = async (
  userId: string,
  videoId: string,
  channelId: string,
  summaries: string[],
  supabase: any,
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("visparks")
      .insert({
        user_id: userId,
        video_id: videoId,
        video_channel_id: channelId,
        summaries,
      })

    if (error) {
      console.error("Failed to store vispark:", error)
    }
  } catch (error) {
    console.error("Error storing vispark:", error)
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle verification request (GET)
  if (req.method === "GET") {
    const url = new URL(req.url)
    const challenge = url.searchParams.get("hub.challenge")

    if (challenge) {
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      })
    }

    return new Response("Bad Request", { status: 400 })
  }

  // Handle notification (POST)
  if (req.method === "POST") {
    try {
      const signature = req.headers.get("X-Hub-Signature")
      if (!signature) {
        console.error("Missing X-Hub-Signature header")
        return new Response("Unauthorized", { status: 401 })
      }

      const body = await req.text()

      // Get subscription details to verify signature
      const supabaseUrl = Deno.env.get("SUPABASE_URL")
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Missing Supabase configuration")
        return new Response("Internal Server Error", { status: 500 })
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Parse notification to get channel ID
      const notification = parseYouTubeNotification(body)
      if (!notification) {
        console.error("Failed to parse YouTube notification")
        return new Response("Bad Request", { status: 400 })
      }

      // Get subscription for this channel
      const { data: subscriptions, error: subscriptionError } = await supabase
        .from("youtube_push_subscriptions")
        .select("hub_secret, user_id")
        .eq("channel_id", notification.channelId)

      if (subscriptionError || !subscriptions || subscriptions.length === 0) {
        console.error("No subscription found for channel:", notification.channelId)
        return new Response("Not Found", { status: 404 })
      }

      // Verify signature for each subscription (there might be multiple users subscribed to same channel)
      let isValidSignature = false
      for (const subscription of subscriptions) {
        const isValid = await verifyHmacSignature(
          body,
          signature.replace('sha256=', ''),
          subscription.hub_secret,
        )
        if (isValid) {
          isValidSignature = true
          break
        }
      }

      if (!isValidSignature) {
        console.error("Invalid HMAC signature")
        return new Response("Unauthorized", { status: 401 })
      }

      // Process notification for each subscribed user
      for (const subscription of subscriptions) {
        // Create video notification record
        const { error: notificationError } = await supabase
          .from("video_notifications")
          .upsert({
            user_id: subscription.user_id,
            video_id: notification.videoId,
            channel_id: notification.channelId,
            video_title: notification.title,
            video_url: `https://www.youtube.com/watch?v=${notification.videoId}`,
            published_at: notification.publishedAt,
          }, {
            onConflict: 'user_id,video_id',
          })

        if (notificationError) {
          console.error("Failed to create video notification:", notificationError)
          continue
        }

        // Trigger transcript generation
        const transcriptSegments = await triggerTranscriptGeneration(
          notification.videoId,
          supabaseUrl,
          supabaseServiceKey,
        )

        // Trigger summary generation if transcript was successful
        if (transcriptSegments.length > 0) {
          const summaries = await triggerSummaryGeneration(
            notification.videoId,
            transcriptSegments,
            supabaseUrl,
            supabaseServiceKey,
          )

          // Store the vispark with summary
          if (summaries.length > 0) {
            await storeVispark(
              subscription.user_id,
              notification.videoId,
              notification.channelId,
              summaries,
              supabase,
            )
          }
        }

        // Mark notification as processed
        await supabase
          .from("video_notifications")
          .update({
            summary_generated: true,
            notification_sent: true,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", subscription.user_id)
          .eq("video_id", notification.videoId)
      }

      return new Response("OK", { status: 200 })
    } catch (error) {
      console.error("Error processing YouTube push notification:", error)
      return new Response("Internal Server Error", { status: 500 })
    }
  }

  // Handle other methods
  return new Response("Method Not Allowed", { status: 405 })
})

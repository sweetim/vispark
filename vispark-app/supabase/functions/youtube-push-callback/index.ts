import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { parseFeed } from "https://esm.sh/feedsmith@2.4.0"

export type YouTubeFeed = {
  authors: YouTubeAuthor[]
  id: string
  links: FeedLink[]
  title: string
  updated: string
  entries: YouTubeEntry[]
}

export type YouTubeAuthor = {
  name: string
  uri: string
}

export type YouTubeEntry = {
  authors: YouTubeAuthor[]
  id: string
  links: FeedLink[]
  published: string
  title: string
  updated: string
}

export type FeedLink = {
  href: string
  rel: string
}

export const parseYoutubeFeeds = (input: string): YouTubeFeed => {
  const { feed } = parseFeed(input)
  return feed as YouTubeFeed
}

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hub-signature",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

// Verify HMAC signature from YouTube
const verifyHmacSignature = async (
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> => {
  try {
    // Convert hex signature to bytes
    const hexSignature = signature.startsWith('sha256=')
      ? signature.substring(7)
      : signature

    // Validate hex signature format
    if (!/^[a-fA-F0-9]+$/.test(hexSignature)) {
      console.error("Invalid hex signature format")
      return false
    }

    const signatureBytes = new Uint8Array(
      hexSignature.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    )

    // Import the secret key
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    // Verify the signature
    const isValid = await crypto.subtle.verify(
      { name: 'HMAC', hash: 'SHA-256' },
      key,
      signatureBytes,
      new TextEncoder().encode(payload),
    )

    return isValid
  } catch (error) {
    console.error("Error verifying HMAC signature:", error)
    return false
  }
}

// Parse YouTube notification XML
const parseYouTubeNotification = (xmlString: string): {
  videoId: string
  channelId: string
  title: string
  publishedAt: string
} | null => {
  try {
    const feed = parseYoutubeFeeds(xmlString)

    // Get the first entry (most recent video)
    if (!feed.entries || feed.entries.length === 0) {
      console.error("No entries found in YouTube feed")
      return null
    }

    const entry = feed.entries[0]

    // Extract video ID from entry ID or link
    let videoId = ""
    if (entry.id) {
      // YouTube video IDs are often in the ID or can be extracted from URLs
      const videoIdMatch = entry.id.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|video:)([a-zA-Z0-9_-]+)/)
      if (videoIdMatch) {
        videoId = videoIdMatch[1]
      }
    }

    // If not found in ID, try to extract from links
    if (!videoId && entry.links) {
      const videoLink = entry.links.find(link =>
        link.href && link.href.includes("youtube.com/watch")
      )
      if (videoLink) {
        const videoIdMatch = videoLink.href.match(/[?&]v=([a-zA-Z0-9_-]+)/)
        if (videoIdMatch) {
          videoId = videoIdMatch[1]
        }
      }
    }

    // Extract channel ID from feed ID or author URI
    let channelId = ""
    if (feed.id) {
      const channelIdMatch = feed.id.match(/channel_id=([a-zA-Z0-9_-]+)/)
      if (channelIdMatch) {
        channelId = channelIdMatch[1]
      }
    }

    // If not found in feed ID, try to extract from author URI
    if (!channelId && feed.authors && feed.authors.length > 0) {
      const author = feed.authors[0]
      if (author.uri) {
        const channelIdMatch = author.uri.match(/channel\/([a-zA-Z0-9_-]+)/)
        if (channelIdMatch) {
          channelId = channelIdMatch[1]
        }
      }
    }

    if (!videoId || !channelId || !entry.title || !entry.published) {
      console.error("Missing required fields in YouTube feed entry", {
        videoId,
        channelId,
        title: entry.title,
        published: entry.published
      })
      return null
    }

    return {
      videoId,
      channelId,
      title: entry.title,
      publishedAt: entry.published,
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
  console.log(JSON.stringify(req, null, 2))

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  // Handle verification request (GET)
  if (req.method === "GET") {
    const url = new URL(req.url)
    const challenge = url.searchParams.get("hub.challenge")
    const mode = url.searchParams.get("hub.mode")
    const topic = url.searchParams.get("hub.topic")

    // All validations passed, respond with the challenge
    console.log(`PubSubHubbub verification successful for ${mode} to ${topic}`)
    return new Response(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        ...corsHeaders
      },
    })
  }

  // Handle notification (POST)
  if (req.method === "POST") {
    try {
      const signature = req.headers.get("X-Hub-Signature")
      if (!signature) {
        console.error("Missing X-Hub-Signature header")
        return new Response("Unauthorized", {
          status: 401,
          headers: corsHeaders
        })
      }

      const body = await req.text()

      // Get subscription details to verify signature
      const supabaseUrl = Deno.env.get("SUPABASE_URL")
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

      if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Missing Supabase configuration")
        return new Response("Internal Server Error", {
          status: 500,
          headers: corsHeaders
        })
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Parse notification to get channel ID
      const notification = parseYouTubeNotification(body)
      if (!notification) {
        console.error("Failed to parse YouTube notification")
        return new Response("Bad Request", {
          status: 400,
          headers: corsHeaders
        })
      }
      console.log(notification)
      // Get subscription for this channel
      const { data: subscriptions, error: subscriptionError } = await supabase
        .from("youtube_push_subscriptions")
        .select("hub_secret, user_id")
        .eq("channel_id", notification.channelId)

      if (subscriptionError || !subscriptions || subscriptions.length === 0) {
        console.error("No subscription found for channel:", notification.channelId)
        return new Response("Not Found", {
          status: 404,
          headers: corsHeaders
        })
      }

      // Verify signature for each subscription (there might be multiple users subscribed to same channel)
      let isValidSignature = false
      for (const subscription of subscriptions) {
        const isValid = await verifyHmacSignature(
          body,
          signature,
          subscription.hub_secret,
        )
        if (isValid) {
          isValidSignature = true
          break
        }
      }

      if (!isValidSignature) {
        console.error("Invalid HMAC signature")
        return new Response("Unauthorized", {
          status: 401,
          headers: corsHeaders
        })
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

      return new Response("OK", {
        status: 200,
        headers: corsHeaders
      })
    } catch (error) {
      console.error("Error processing YouTube push notification:", error)
      return new Response("Internal Server Error", {
        status: 500,
        headers: corsHeaders
      })
    }
  }

  // Handle other methods
  return new Response("Method Not Allowed", {
    status: 405,
    headers: corsHeaders
  })
})

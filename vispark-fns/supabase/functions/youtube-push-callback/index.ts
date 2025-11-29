import { createClient } from "supabase"
import { parseFeed } from "feedsmith"

type YouTubeFeed = {
  links: FeedLink[]
  title: string
  updated: string
  entries: YouTubeEntry[]
}

type YouTubeAuthor = {
  name: string
  uri: string
}

type YouTubeEntry = {
  authors: YouTubeAuthor[]
  id: string
  links: FeedLink[]
  published: string
  title: string
  updated: string
  yt: {
    videoId: string
    channelId: string
  }
}

type FeedLink = {
  href: string
  rel: string
  hreflang?: string
}

export type YoutubeNotification = {
  channelId: string
  videoId: string
  title: string
  publishedAt: string
}

export const parseYoutubeFeeds = (input: string): YoutubeNotification[] => {
  const parsedFeed = parseFeed(input)

  const feed = parsedFeed.feed as YouTubeFeed

  if (!feed.entries || feed.entries.length === 0) {
    throw new Error("No entries found in YouTube feed")
  }

  return feed.entries.map(entry => {
    const { videoId, channelId } = entry.yt

    return {
      channelId,
      videoId,
      title: entry.title,
      publishedAt: entry.published
    }
  })
}

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
}

Deno.serve(async (req: Request): Promise<Response> => {
  console.log(JSON.stringify(req, null, 2))

  // Extract user ID from URL path
  const url = new URL(req.url)
  const pathSegments = url.pathname.split('/')
  const userId = pathSegments[pathSegments.length - 1]

  // Validate user ID
  if (!userId || userId.length === 0) {
    console.error("Missing user ID in callback URL")
    return new Response("Bad Request: Missing user ID", {
      status: 400,
      headers: corsHeaders
    })
  }

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  // Handle verification request (GET)
  if (req.method === "GET") {
    const challenge = url.searchParams.get("hub.challenge")
    const mode = url.searchParams.get("hub.mode")
    const topic = url.searchParams.get("hub.topic")

    // All validations passed, respond with the challenge
    console.log(`PubSubHubbub verification successful for ${mode} to ${topic} for user ${userId}`)
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
      const body = await req.text()
      console.log(body)
      // Get subscription details
      const supabaseUrl = Deno.env.get("SUPABASE_URL")
      const supabaseServiceRoleKey = Deno.env.get("NEW_SUPABASE_SERVICE_ROLE_KEY")

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error("Missing Supabase configuration")
        return new Response("Internal Server Error", {
          status: 500,
          headers: corsHeaders
        })
      }

      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

      // Parse notification to get channel IDs
      const notifications = parseYoutubeFeeds(body)
      if (!notifications || notifications.length === 0) {
        console.error("Failed to parse YouTube notification")
        return new Response("Bad Request", {
          status: 400,
          headers: corsHeaders
        })
      }
      console.log(notifications)

      // Process each notification
      for (const notification of notifications) {
        // Create video notification record
        const { error: insertError } = await supabase
          .from("video_notifications")
          .upsert({
            user_id: userId,
            video_id: notification.videoId,
            channel_id: notification.channelId,
            video_title: notification.title,
            video_url: `https://www.youtube.com/watch?v=${notification.videoId}`,
            published_at: notification.publishedAt,
          })

        if (insertError) {
          console.error("Failed to create video notification:", insertError)
        }
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

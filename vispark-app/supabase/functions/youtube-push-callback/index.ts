import { createClient } from "supabase"
import { parseFeed } from "feedsmith"

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
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

      // Verify that this user has a subscription for this channel
      const { data: subscription, error: subscriptionError } = await supabase
        .from("youtube_push_subscriptions")
        .select("*")
        .eq("channel_id", notification.channelId)
        .eq("user_id", userId)
        .single()

      if (subscriptionError || !subscription) {
        console.error(`No subscription found for user ${userId} and channel ${notification.channelId}`)
        return new Response("Not Found", {
          status: 404,
          headers: corsHeaders
        })
      }

      // Create video notification record
      const { error: notificationError } = await supabase
        .from("video_notifications")
        .upsert({
          user_id: userId,
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
        return new Response("Internal Server Error", {
          status: 500,
          headers: corsHeaders
        })
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

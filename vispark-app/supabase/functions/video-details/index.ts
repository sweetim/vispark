import { createClient } from "supabase"
import type { Database } from "../types/database.ts"

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

const jsonHeaders: Record<string, string> = {
  "Content-Type": "application/json",
}

const buildHeaders = (): HeadersInit => ({
  ...corsHeaders,
  ...jsonHeaders,
})

type VideoDetailsRequestPayload = {
  videoId: string
  videoIds?: string[]
  action: "getDetails" | "getBatchDetails"
}

type VideoDetails = {
  videoId: string
  title: string
  description?: string
  channelId?: string
  channelTitle?: string
  channelThumbnailUrl?: string
  publishedAt?: string
  duration?: string
  viewCount?: number
  likeCount?: number
  commentCount?: number
  thumbnails?: {
    default?: { url: string; width?: number; height?: number }
    medium?: { url: string; width?: number; height?: number }
    high?: { url: string; width?: number; height?: number }
    standard?: { url: string; width?: number; height?: number }
    maxres?: { url: string; width?: number; height?: number }
  }
  tags?: string[]
  categoryId?: string
  defaultLanguage?: string
  defaultAudioLanguage?: string
  hasSummary?: boolean
}

type VideoDetailsSuccessResponse = {
  video?: VideoDetails
  videos?: VideoDetails[]
}

type VideoDetailsErrorResponse = {
  error: string
  message: string
}

type ResponseBody = VideoDetailsSuccessResponse | VideoDetailsErrorResponse

const respondWith = (body: ResponseBody, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(),
  })

// Fetch video details from YouTube API
const fetchVideoDetailsFromYouTube = async (
  videoId: string,
  apiKey: string,
): Promise<VideoDetails> => {
  console.log(`Fetching video ${videoId} from YouTube API`)

  // First, get video details including contentDetails and statistics
  const videoUrl = new URL("https://www.googleapis.com/youtube/v3/videos")
  videoUrl.searchParams.set("part", "snippet,contentDetails,statistics,status")
  videoUrl.searchParams.set("id", videoId)
  videoUrl.searchParams.set("key", apiKey)

  console.log(`YouTube API video URL: ${videoUrl.toString()}`)

  const videoResponse = await fetch(videoUrl.toString())
  console.log(`YouTube API video response status: ${videoResponse.status}`)

  if (!videoResponse.ok) {
    const errorText = await videoResponse.text()
    console.error(`YouTube API video error response: ${errorText}`)
    throw new Error(
      `YouTube API error: ${videoResponse.status} ${videoResponse.statusText}`,
    )
  }

  const videoJson = await videoResponse.json()
  console.log(`YouTube API video response:`, videoJson)

  const videoItem = videoJson?.items?.[0]
  if (!videoItem?.snippet) {
    console.error(`Video not found for ID: ${videoId}`)
    throw new Error("Video not found for the provided video ID.")
  }

  // Extract channel ID to get channel details
  const channelId = videoItem.snippet.channelId

  // Get channel details to fetch channel thumbnail
  const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels")
  channelUrl.searchParams.set("part", "snippet")
  channelUrl.searchParams.set("id", channelId)
  channelUrl.searchParams.set("key", apiKey)

  const channelResponse = await fetch(channelUrl.toString())
  if (!channelResponse.ok) {
    console.error(`Failed to fetch channel details: ${channelResponse.status}`)
    throw new Error(`Failed to fetch channel details: ${channelResponse.status}`)
  }

  const channelJson = await channelResponse.json()
  const channelItem = channelJson?.items?.[0]

  // Process video details
  const snippet = videoItem.snippet as {
    title: string
    description: string
    channelId: string
    channelTitle: string
    publishedAt: string
    thumbnails: {
      default: { url: string; width: number; height: number }
      medium: { url: string; width: number; height: number }
      high: { url: string; width: number; height: number }
      standard?: { url: string; width: number; height: number }
      maxres?: { url: string; width: number; height: number }
    }
    tags?: string[]
    categoryId: string
    defaultLanguage?: string
    defaultAudioLanguage?: string
  }

  const contentDetails = videoItem.contentDetails as {
    duration: string
  }

  const statistics = videoItem.statistics as {
    viewCount: string
    likeCount: string
    commentCount: string
  }

  const channelSnippet = channelItem?.snippet as {
    thumbnails: {
      default: { url: string }
      medium: { url: string }
      high: { url: string }
    }
  } | undefined

  // Convert duration from ISO 8601 to readable format
  const duration = contentDetails.duration

  const videoData: VideoDetails = {
    videoId,
    title: snippet.title,
    description: snippet.description,
    channelId: snippet.channelId,
    channelTitle: snippet.channelTitle,
    channelThumbnailUrl: channelSnippet?.thumbnails?.medium?.url ??
                        channelSnippet?.thumbnails?.default?.url ?? "",
    publishedAt: snippet.publishedAt,
    duration,
    viewCount: parseInt(statistics.viewCount || "0", 10),
    likeCount: parseInt(statistics.likeCount || "0", 10),
    commentCount: parseInt(statistics.commentCount || "0", 10),
    thumbnails: snippet.thumbnails,
    tags: snippet.tags,
    categoryId: snippet.categoryId,
    defaultLanguage: snippet.defaultLanguage,
    defaultAudioLanguage: snippet.defaultAudioLanguage,
  }

  console.log(`Processed video data:`, videoData)
  return videoData
}

// Fetch multiple video details from YouTube API in batch
const fetchBatchVideoDetailsFromYouTube = async (
  videoIds: string[],
  apiKey: string,
): Promise<VideoDetails[]> => {
  console.log(`Fetching ${videoIds.length} videos from YouTube API`)

  // YouTube API allows up to 50 video IDs per request
  const batchSize = 50
  const batches: string[][] = []

  for (let i = 0; i < videoIds.length; i += batchSize) {
    batches.push(videoIds.slice(i, i + batchSize))
  }

  const allVideos: VideoDetails[] = []

  for (const batch of batches) {
    // Get video details
    const videoUrl = new URL("https://www.googleapis.com/youtube/v3/videos")
    videoUrl.searchParams.set("part", "snippet,contentDetails,statistics,status")
    videoUrl.searchParams.set("id", batch.join(","))
    videoUrl.searchParams.set("key", apiKey)

    console.log(`YouTube API batch video URL: ${videoUrl.toString()}`)

    const videoResponse = await fetch(videoUrl.toString())
    console.log(`YouTube API batch video response status: ${videoResponse.status}`)

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text()
      console.error(`YouTube API batch video error response: ${errorText}`)
      throw new Error(
        `YouTube API error: ${videoResponse.status} ${videoResponse.statusText}`,
      )
    }

    const videoJson = await videoResponse.json()
    console.log(`YouTube API batch video response:`, videoJson)

    const videoItems = videoJson?.items ?? []

    // Extract unique channel IDs from this batch
    const channelIds = [...new Set(
      videoItems
        .map((item: any) => item.snippet?.channelId)
        .filter(Boolean)
    )]

    // Get channel details for all channels in this batch
    let channelDetailsMap: Record<string, any> = {}
    if (channelIds.length > 0) {
      const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels")
      channelUrl.searchParams.set("part", "snippet")
      channelUrl.searchParams.set("id", channelIds.join(","))
      channelUrl.searchParams.set("key", apiKey)

      const channelResponse = await fetch(channelUrl.toString())
      if (channelResponse.ok) {
        const channelJson = await channelResponse.json()
        const channelItems = channelJson?.items ?? []

        channelDetailsMap = channelItems.reduce((acc: any, channel: any) => {
          if (channel.id && channel.snippet) {
            acc[channel.id] = channel.snippet
          }
          return acc
        }, {})
      }
    }

    // Process each video
    for (const videoItem of videoItems) {
      if (!videoItem?.snippet || !videoItem?.id) continue

      const snippet = videoItem.snippet as any
      const contentDetails = videoItem.contentDetails as any
      const statistics = videoItem.statistics as any
      const channelId = snippet.channelId

      const channelSnippet = channelDetailsMap[channelId]

      const videoData: VideoDetails = {
        videoId: videoItem.id,
        title: snippet.title,
        description: snippet.description,
        channelId: snippet.channelId,
        channelTitle: snippet.channelTitle,
        channelThumbnailUrl: channelSnippet?.thumbnails?.medium?.url ??
                            channelSnippet?.thumbnails?.default?.url ?? "",
        publishedAt: snippet.publishedAt,
        duration: contentDetails.duration,
        viewCount: parseInt(statistics.viewCount || "0", 10),
        likeCount: parseInt(statistics.likeCount || "0", 10),
        commentCount: parseInt(statistics.commentCount || "0", 10),
        thumbnails: snippet.thumbnails,
        tags: snippet.tags,
        categoryId: snippet.categoryId,
        defaultLanguage: snippet.defaultLanguage,
        defaultAudioLanguage: snippet.defaultAudioLanguage,
      }

      allVideos.push(videoData)
    }
  }

  console.log(`Processed ${allVideos.length} video details`)
  return allVideos
}

// Check if videos have summaries in the database
const checkVideoSummaries = async (
  supabase: ReturnType<typeof createClient<Database>>,
  videoIds: string[],
): Promise<Record<string, boolean>> => {
  const { data: visparksData } = await supabase
    .from("visparks")
    .select("video_id")
    .in("video_id", videoIds)

  const videosWithSummaries = new Set(
    visparksData?.map((v: { video_id: string }) => v.video_id) ?? [],
  )

  const summaryMap: Record<string, boolean> = {}
  videoIds.forEach(id => {
    summaryMap[id] = videosWithSummaries.has(id)
  })

  return summaryMap
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return respondWith(
      {
        error: "Method Not Allowed",
        message: "Only POST is supported.",
      },
      405,
    )
  }

  // Parse and validate payload
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return respondWith(
      {
        error: "Invalid JSON",
        message: "Request body must be valid JSON.",
      },
      400,
    )
  }

  const { videoId, videoIds, action } = (payload ?? {}) as Partial<VideoDetailsRequestPayload>

  // Validate based on action type
  if (action === "getBatchDetails") {
    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return respondWith(
        {
          error: "Missing fields",
          message: "The request body must include a non-empty videoIds array for getBatchDetails action.",
        },
        400,
      )
    }
  } else {
    if (typeof videoId !== "string" || videoId.trim().length === 0) {
      return respondWith(
        {
          error: "Missing fields",
          message: "The request body must include a non-empty videoId.",
        },
        400,
      )
    }
  }

  if (!action || !["getDetails", "getBatchDetails"].includes(action)) {
    return respondWith(
      {
        error: "Invalid action",
        message: "Action must be one of: getDetails, getBatchDetails.",
      },
      400,
    )
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
  const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY")

  if (!supabaseUrl || !supabaseAnonKey) {
    return respondWith(
      {
        error: "Server misconfiguration",
        message:
          "SUPABASE_URL or SUPABASE_ANON_KEY is not set. Configure them in your environment before calling this function.",
      },
      500,
    )
  }

  if (!youtubeApiKey) {
    return respondWith(
      {
        error: "Server misconfiguration",
        message:
          "YOUTUBE_API_KEY is not set. Configure it in your environment before calling this function.",
      },
      500,
    )
  }

  // Forward the caller's JWT so RLS applies
  const authHeader = req.headers.get("Authorization") ?? ""
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    if (action === "getBatchDetails") {
      console.log(`Processing request for action: ${action}, videoIds: ${videoIds?.join(", ")}`)
    } else {
      console.log(`Processing request for action: ${action}, videoId: ${videoId}`)
    }

    switch (action) {
      case "getDetails": {
        // First check if video metadata exists in the database
        const { data: existingVispark } = await supabase
          .from("visparks")
          .select("video_title, video_description, video_channel_title, video_thumbnails, video_published_at, video_duration, video_default_language")
          .eq("video_id", videoId!)
          .single()

        let videoData: VideoDetails

        if (existingVispark) {
          // Use stored metadata from database
          videoData = {
            videoId: videoId!,
            title: existingVispark.video_title || "",
            description: existingVispark.video_description || "",
            channelId: "", // We don't store this in visparks table
            channelTitle: existingVispark.video_channel_title || "",
            channelThumbnailUrl: "", // We don't store this in visparks table
            publishedAt: existingVispark.video_published_at || "",
            duration: existingVispark.video_duration || "",
            viewCount: 0, // We don't store these in visparks table
            likeCount: 0,
            commentCount: 0,
            thumbnails: existingVispark.video_thumbnails || {
              default: { url: "", width: 0, height: 0 },
              medium: { url: "", width: 0, height: 0 },
              high: { url: "", width: 0, height: 0 },
            },
            defaultLanguage: existingVispark.video_default_language,
            defaultAudioLanguage: undefined,
            categoryId: "",
            hasSummary: false, // Will be set below
          }
        } else {
          // Fetch from YouTube API
          videoData = await fetchVideoDetailsFromYouTube(
            videoId!,
            youtubeApiKey,
          )

          // Store the fetched metadata in the database for future use
          await supabase
            .from("visparks")
            .upsert({
              video_id: videoId!,
              video_title: videoData.title,
              video_description: videoData.description,
              video_channel_title: videoData.channelTitle,
              video_thumbnails: videoData.thumbnails,
              video_published_at: videoData.publishedAt,
              video_duration: videoData.duration,
              video_default_language: videoData.defaultLanguage,
            }, {
              onConflict: 'video_id'
            })
        }

        // Check if video has summary
        const summaryMap = await checkVideoSummaries(supabase, [videoId!])
        videoData.hasSummary = summaryMap[videoId!]

        console.log(`Successfully fetched video data:`, videoData)
        return respondWith({ video: videoData }, 200)
      }

      case "getBatchDetails": {
        // First check which videos have metadata in the database
        const { data: existingVisparks } = await supabase
          .from("visparks")
          .select("video_id, video_title, video_description, video_channel_title, video_thumbnails, video_published_at, video_duration, video_default_language")
          .in("video_id", videoIds!)

        const existingVisparksMap = new Map()
        if (existingVisparks) {
          existingVisparks.forEach(vispark => {
            existingVisparksMap.set(vispark.video_id, vispark)
          })
        }

        const videosData: VideoDetails[] = []
        const videosToFetch: string[] = []

        // Separate videos that have stored metadata from those that need to be fetched
        videoIds!.forEach(videoId => {
          const existingVispark = existingVisparksMap.get(videoId)
          if (existingVispark) {
            // Use stored metadata
            videosData.push({
              videoId: videoId,
              title: existingVispark.video_title || "",
              description: existingVispark.video_description || "",
              channelTitle: existingVispark.video_channel_title || "",
              publishedAt: existingVispark.video_published_at || "",
              duration: existingVispark.video_duration || "",
              thumbnails: existingVispark.video_thumbnails || {
                default: { url: "", width: 0, height: 0 },
                medium: { url: "", width: 0, height: 0 },
                high: { url: "", width: 0, height: 0 },
              },
              defaultLanguage: existingVispark.video_default_language,
              hasSummary: false, // Will be set below
            })
          } else {
            // Need to fetch from YouTube API
            videosToFetch.push(videoId)
          }
        })

        // Fetch videos that don't have stored metadata
        if (videosToFetch.length > 0) {
          const fetchedVideos = await fetchBatchVideoDetailsFromYouTube(
            videosToFetch,
            youtubeApiKey,
          )
          videosData.push(...fetchedVideos)

          // Store the fetched metadata in the database for future use
          const metadataToStore = fetchedVideos.map(video => ({
            video_id: video.videoId,
            video_title: video.title,
            video_description: video.description,
            video_channel_title: video.channelTitle,
            video_thumbnails: video.thumbnails,
            video_published_at: video.publishedAt,
            video_duration: video.duration,
            video_default_language: video.defaultLanguage,
          }))

          if (metadataToStore.length > 0) {
            await supabase
              .from("visparks")
              .upsert(metadataToStore, {
                onConflict: 'video_id'
              })
          }
        }

        // Check which videos have summaries
        const summaryMap = await checkVideoSummaries(supabase, videoIds!)

        // Add summary status to each video
        videosData.forEach(video => {
          video.hasSummary = summaryMap[video.videoId]
        })

        console.log(`Successfully fetched batch video data:`, videosData)
        return respondWith({ videos: videosData }, 200)
      }

      default:
        return respondWith(
          {
            error: "Invalid action",
            message: "Action not implemented.",
          },
          400,
        )
    }
  } catch (error) {
    console.error("Video details function error:", error)
    return respondWith(
      {
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred.",
      },
      500,
    )
  }
})

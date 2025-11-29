import {
  corsHeaders,
  respondWith,
  respondWithError,
  getYoutubeApiKey,
  createSupabaseClient,
  handleOptionsRequest
} from "../shared/utils.ts"

// Channel video type
type ChannelVideo = {
  videoId: string
  title: string
  thumbnails: {
    default: { url: string }
    medium: { url: string }
    high: { url: string }
  }
  publishedAt: string
  hasSummary: boolean
}

// Response type
type ChannelVideosResponse = {
  videos: ChannelVideo[]
  nextPageToken?: string
}

// Get videos from channel that have summaries
const getChannelVideosWithSummaries = async (
  supabase: ReturnType<typeof createSupabaseClient>,
  channelId: string,
  apiKey: string,
): Promise<ChannelVideo[]> => {
  // First get all videos from the channel
  const videosUrl = new URL("https://www.googleapis.com/youtube/v3/search")
  videosUrl.searchParams.set("part", "snippet")
  videosUrl.searchParams.set("channelId", channelId)
  videosUrl.searchParams.set("type", "video")
  videosUrl.searchParams.set("order", "date")
  videosUrl.searchParams.set("maxResults", "50")
  videosUrl.searchParams.set("key", apiKey)

  const videosResponse = await fetch(videosUrl.toString())
  if (!videosResponse.ok) {
    throw new Error(
      `YouTube API error: ${videosResponse.status} ${videosResponse.statusText}`,
    )
  }

  const videosJson = await videosResponse.json()
  const videoItems = videosJson?.items ?? []

  if (videoItems.length === 0) {
    return []
  }

  // Get video IDs
  const videoIds = videoItems
    .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
    .filter(Boolean)

  // Check which videos have summaries in the visparks table
  const { data: visparksData } = await supabase
    .from("visparks")
    .select("video_id")
    .in("video_id", videoIds)

  const videosWithSummaries = new Set(
    visparksData?.map((v: { video_id: string }) => v.video_id) ?? [],
  )

  // Map to ChannelVideo format
  return videoItems
    .filter(
      (item: { id?: { videoId?: string } }) =>
        item.id?.videoId && videosWithSummaries.has(item.id.videoId),
    )
    .map(
      (item: {
        id: { videoId: string }
        snippet: {
          title: string
          thumbnails: ChannelVideo["thumbnails"]
          publishedAt: string
        }
      }) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt,
        hasSummary: true,
      }),
    )
}

// Get all videos from a channel (both with and without summaries)
const getAllChannelVideos = async (
  supabase: ReturnType<typeof createSupabaseClient>,
  channelId: string,
  apiKey: string,
  pageToken?: string,
  maxResults: number = 10,
): Promise<{ videos: ChannelVideo[], nextPageToken?: string }> => {
  // First get all videos from the channel
  const videosUrl = new URL("https://www.googleapis.com/youtube/v3/search")
  videosUrl.searchParams.set("part", "snippet")
  videosUrl.searchParams.set("channelId", channelId)
  videosUrl.searchParams.set("type", "video")
  videosUrl.searchParams.set("order", "date")
  videosUrl.searchParams.set("maxResults", maxResults.toString())
  videosUrl.searchParams.set("key", apiKey)
  console.log("Fetching videos from URL:", videosUrl.toString())
  if (pageToken) {
    videosUrl.searchParams.set("pageToken", pageToken)
  }

  const videosResponse = await fetch(videosUrl.toString())
  if (!videosResponse.ok) {
    throw new Error(
      `YouTube API error: ${videosResponse.status} ${videosResponse.statusText}`,
    )
  }

  const videosJson = await videosResponse.json()
  console.log("YouTube API response:", JSON.stringify(videosJson, null, 2))
  const videoItems = videosJson?.items ?? []
  const nextPageToken = videosJson?.nextPageToken
  console.log(`Found ${videoItems.length} videos from YouTube API`)
  console.log(`Next page token: ${nextPageToken}`)

  if (videoItems.length === 0) {
    return { videos: [], nextPageToken }
  }

  // Get video IDs
  const videoIds = videoItems
    .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
    .filter(Boolean)

  // Check which videos have summaries in the visparks table
  const { data: visparksData } = await supabase
    .from("visparks")
    .select("video_id")
    .in("video_id", videoIds)

  const videosWithSummaries = new Set(
    visparksData?.map((v: { video_id: string }) => v.video_id) ?? [],
  )

  // Map to ChannelVideo format, including both videos with and without summaries
  const videos = videoItems
    .filter(
      (item: { id?: { videoId?: string } }) =>
        item.id?.videoId,
    )
    .map(
      (item: {
        id: { videoId: string }
        snippet: {
          title: string
          thumbnails: ChannelVideo["thumbnails"]
          publishedAt: string
        }
      }) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt,
        hasSummary: videosWithSummaries.has(item.id.videoId),
      }),
    )

  return { videos, nextPageToken }
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const optionsResponse = handleOptionsRequest(req)
  if (optionsResponse) {
    return optionsResponse
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return respondWithError(
      "Method Not Allowed",
      "Only GET method is supported.",
      405
    )
  }

  try {
    // Extract channel ID from URL path
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const channelId = pathParts[pathParts.length - 1]

    if (!channelId || channelId.trim().length === 0) {
      return respondWithError(
        "Missing Channel ID",
        "Channel ID is required in the URL path.",
        400
      )
    }

    // Parse query parameters
    const summariesOnly = url.searchParams.get("summaries") === "true"
    const pageToken = url.searchParams.get("pageToken")
    const maxResultsParam = url.searchParams.get("maxResults")
    const maxResults = maxResultsParam ? parseInt(maxResultsParam, 10) : 10

    // Validate maxResults
    if (isNaN(maxResults) || maxResults < 1 || maxResults > 50) {
      return respondWithError(
        "Invalid maxResults",
        "maxResults must be a number between 1 and 50.",
        400
      )
    }

    // Get dependencies
    const youtubeApiKey = getYoutubeApiKey()
    const supabase = createSupabaseClient(req)

    let result: { videos: ChannelVideo[], nextPageToken?: string }

    if (summariesOnly) {
      // Get only videos with summaries
      const videos = await getChannelVideosWithSummaries(
        supabase,
        channelId,
        youtubeApiKey,
      )
      result = { videos }
    } else {
      // Get all videos with pagination
      result = await getAllChannelVideos(
        supabase,
        channelId,
        youtubeApiKey,
        pageToken || undefined,
        maxResults,
      )
    }

    const response: ChannelVideosResponse = {
      videos: result.videos,
      nextPageToken: result.nextPageToken,
    }

    return respondWith(response, 200)

  } catch (error) {
    console.error("Channel videos function error:", error)
    return respondWithError(
      "Internal Server Error",
      error instanceof Error ? error.message : "An unknown error occurred.",
      500
    )
  }
})

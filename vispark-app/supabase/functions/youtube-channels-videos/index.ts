import {
  respondWith,
  respondWithError,
  getYoutubeApiKey,
  handleOptionsRequest
} from "../shared/utils.ts"

// Channel type
type Channel = {
  channelId: string
  title: string
  description: string
  thumbnails: {
    default: { url: string; width: number; height: number }
    medium: { url: string; width: number; height: number }
    high: { url: string; width: number; height: number }
  }
  subscriberCount: number
  videoCount: number
  viewCount: number
  publishedAt: string
}

// Video type (simplified for this function)
type Video = {
  videoId: string
  title: string
  description: string
  thumbnails: {
    default: { url: string; width: number; height: number }
    medium: { url: string; width: number; height: number }
    high: { url: string; width: number; height: number }
  }
  publishedAt: string
  defaultLanguage?: string
}

// Response type
type YoutubeChannelsResponse = {
  channel: Channel
  videos: Video[]
  nextPageToken?: string
}

// Function to get channel's upload playlist ID
const getChannelUploadPlaylistId = async (
  channelId: string,
  apiKey: string,
): Promise<string> => {
  console.log(`Getting upload playlist ID for channel: ${channelId}`)

  const url = new URL("https://www.googleapis.com/youtube/v3/channels")
  url.searchParams.set("part", "contentDetails")
  url.searchParams.set("id", channelId)
  url.searchParams.set("key", apiKey)

  console.log(`YouTube API URL: ${url.toString()}`)

  const response = await fetch(url.toString())
  console.log(`YouTube API response status: ${response.status}`)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`YouTube API error response: ${errorText}`)
    throw new Error(
      `YouTube API error: ${response.status} ${response.statusText}`,
    )
  }

  const json = await response.json()
  console.log(`YouTube API response:`, json)

  const item = json?.items?.[0]
  if (!item?.contentDetails?.relatedPlaylists?.uploads) {
    console.error(`Channel not found or no upload playlist for ID: ${channelId}`)
    throw new Error("Channel not found or no upload playlist available for the provided channel ID.")
  }

  const uploadPlaylistId = item.contentDetails.relatedPlaylists.uploads
  console.log(`Found upload playlist ID: ${uploadPlaylistId}`)

  return uploadPlaylistId
}

// Function to get videos from playlist
const getChannelVideosFromPlaylist = async (
  playlistId: string,
  apiKey: string,
  pageToken?: string,
  maxResults: number = 10,
): Promise<{ videos: { videoId: string; videoPublishedAt: string }[], nextPageToken?: string }> => {
  console.log(`Getting videos from playlist: ${playlistId}`)

  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems")
  url.searchParams.set("part", "contentDetails")
  url.searchParams.set("playlistId", playlistId)
  url.searchParams.set("maxResults", maxResults.toString())
  url.searchParams.set("key", apiKey)

  if (pageToken) {
    url.searchParams.set("pageToken", pageToken)
  }

  console.log(`YouTube API URL: ${url.toString()}`)

  const response = await fetch(url.toString())
  console.log(`YouTube API response status: ${response.status}`)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`YouTube API error response: ${errorText}`)
    throw new Error(
      `YouTube API error: ${response.status} ${response.statusText}`,
    )
  }

  const json = await response.json()
  console.log(`YouTube API response:`, json)

  const items = json?.items ?? []
  const nextPageToken = json?.nextPageToken

  if (items.length === 0) {
    console.log("No videos found in playlist")
    return { videos: [], nextPageToken }
  }

  // Extract video IDs and publishedAt dates
  const videos = items
    .map((item: any) => {
      if (!item?.contentDetails?.videoId) return null

      return {
        videoId: item.contentDetails.videoId,
        videoPublishedAt: item.contentDetails.videoPublishedAt,
      }
    })
    .filter(Boolean)

  console.log(`Found ${videos.length} videos from playlist`)
  console.log(`Next page token: ${nextPageToken}`)

  return { videos, nextPageToken }
}

// Function to get channel details
const getChannelDetails = async (
  channelId: string,
  apiKey: string,
): Promise<Channel> => {
  console.log(`Getting details for channel: ${channelId}`)

  const url = new URL("https://www.googleapis.com/youtube/v3/channels")
  url.searchParams.set("part", "snippet,statistics")
  url.searchParams.set("id", channelId)
  url.searchParams.set("key", apiKey)

  console.log(`YouTube API URL: ${url.toString()}`)

  const response = await fetch(url.toString())
  console.log(`YouTube API response status: ${response.status}`)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`YouTube API error response: ${errorText}`)
    throw new Error(
      `YouTube API error: ${response.status} ${response.statusText}`,
    )
  }

  const json = await response.json()
  console.log(`YouTube API response:`, json)

  const item = json?.items?.[0]
  if (!item?.snippet || !item?.statistics) {
    console.error(`Channel not found for ID: ${channelId}`)
    throw new Error("Channel not found for the provided channel ID.")
  }

  const snippet = item.snippet as any
  const statistics = item.statistics as any

  const channelData: Channel = {
    channelId,
    title: snippet.title,
    description: snippet.description || "",
    thumbnails: snippet.thumbnails,
    subscriberCount: parseInt(statistics.subscriberCount || "0", 10),
    videoCount: parseInt(statistics.videoCount || "0", 10),
    viewCount: parseInt(statistics.viewCount || "0", 10),
    publishedAt: snippet.publishedAt,
  }

  console.log(`Processed channel data:`, channelData)
  return channelData
}

// Function to get video details in batch
const getVideoDetailsBatch = async (
  videoIds: string[],
  apiKey: string,
): Promise<Video[]> => {
  console.log(`Getting details for videos: ${videoIds.join(", ")}`)

  if (videoIds.length === 0) {
    return []
  }

  // YouTube API allows up to 50 video IDs per request
  const batchSize = 50
  const batches: string[][] = []

  for (let i = 0; i < videoIds.length; i += batchSize) {
    batches.push(videoIds.slice(i, i + batchSize))
  }

  const allVideos: Video[] = []

  for (const batch of batches) {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos")
    url.searchParams.set("part", "snippet")
    url.searchParams.set("id", batch.join(","))
    url.searchParams.set("key", apiKey)

    console.log(`YouTube API batch URL: ${url.toString()}`)

    const response = await fetch(url.toString())
    console.log(`YouTube API batch response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`YouTube API batch error response: ${errorText}`)
      throw new Error(
        `YouTube API error: ${response.status} ${response.statusText}`,
      )
    }

    const json = await response.json()
    console.log(`YouTube API batch response:`, json)

    const items = json?.items ?? []

    // Process each video
    for (const item of items) {
      if (!item?.snippet || !item?.id) continue

      const snippet = item.snippet as any

      const videoData: Video = {
        videoId: item.id,
        title: snippet.title,
        description: snippet.description || "",
        thumbnails: snippet.thumbnails,
        publishedAt: snippet.publishedAt,
        defaultLanguage: snippet.defaultLanguage,
      }

      allVideos.push(videoData)
    }
  }

  console.log(`Processed ${allVideos.length} video details`)
  return allVideos
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

    // 1. Get channel details
    const channelDetails = await getChannelDetails(channelId, youtubeApiKey)

    // 2. Get channel's upload playlist ID
    const uploadPlaylistId = await getChannelUploadPlaylistId(channelId, youtubeApiKey)

    // 3. Get videos from playlist
    const playlistResult = await getChannelVideosFromPlaylist(
      uploadPlaylistId,
      youtubeApiKey,
      pageToken || undefined,
      maxResults
    )

    // 4. Get video details for all videos
    const videoIds = playlistResult.videos.map(video => video.videoId)
    const videoDetails = await getVideoDetailsBatch(videoIds, youtubeApiKey)

    // Merge video details with publishedAt from playlist
    const videosWithDetails: Video[] = videoDetails.map(video => {
      const playlistVideo = playlistResult.videos.find(pv => pv.videoId === video.videoId)
      return {
        ...video,
        publishedAt: playlistVideo?.videoPublishedAt || video.publishedAt,
      }
    })

    // 5. Return the response
    const response: YoutubeChannelsResponse = {
      channel: channelDetails,
      videos: videosWithDetails,
      nextPageToken: playlistResult.nextPageToken,
    }

    return respondWith(response, 200)

  } catch (error) {
    console.error("YouTube channels function error:", error)
    return respondWithError(
      "Internal Server Error",
      error instanceof Error ? error.message : "An unknown error occurred.",
      500
    )
  }
})

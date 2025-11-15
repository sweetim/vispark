import { respondWith, getYoutubeApiKey, handleOptionsRequest } from "../shared/utils.ts"

type YouTubeChannelDetailsRequest = {
  channelId: string
}

type Thumbnail = {
  url: string
  width: number
  height: number
}

type Thumbnails = {
  default: Thumbnail
  medium: Thumbnail
  high: Thumbnail
}

type RawSnippet = {
  title: string
  description: string
  customUrl: string
  publishedAt: string
  thumbnails: Thumbnails
  localized: {
    title: string
    description: string
  }
  country: string
}

type RawStatistics = {
  viewCount: string
  subscriberCount: string
  hiddenSubscriberCount: boolean
  videoCount: string
}

type RawYouTubeChannelDetails = {
  kind: string
  etag: string
  id: string
  snippet: RawSnippet
  statistics: RawStatistics
}

type ChannelDetailsResponse = {
  channelId: string
  channelName: string
  videoCount: number
  thumbnails: string
  description: string
  subscriberCount: number
  customUrl: string
}

type ErrorResponse = {
  error: string
  message: string
}

type ResponseBody = ChannelDetailsResponse | ErrorResponse

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const optionsResponse = handleOptionsRequest(req)
  if (optionsResponse) {
    return optionsResponse
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

  const { channelId } = (payload ?? {}) as Partial<YouTubeChannelDetailsRequest>

  if (typeof channelId !== "string" || channelId.trim().length === 0) {
    return respondWith(
      {
        error: "Missing fields",
        message: "The request body must include a non-empty channelId string.",
      },
      400,
    )
  }

  try {
    const youtubeApiKey = getYoutubeApiKey()
    console.log(`Fetching YouTube channel details for channel ID: ${channelId}`)

    const url = new URL("https://www.googleapis.com/youtube/v3/channels")
    url.searchParams.set("part", "snippet,statistics")
    url.searchParams.set("id", channelId)
    url.searchParams.set("key", youtubeApiKey)

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

    if (!json.items || json.items.length === 0) {
      return respondWith(
        {
          error: "Channel Not Found",
          message: `No channel found with ID: ${channelId}`,
        },
        404,
      )
    }

    const channelData: RawYouTubeChannelDetails = json.items[0]

    const channelDetails: ChannelDetailsResponse = {
      channelId: channelData.id,
      channelName: channelData.snippet.title,
      videoCount: parseInt(channelData.statistics.videoCount, 10),
      thumbnails: channelData.snippet.thumbnails.default.url,
      description: channelData.snippet.description,
      subscriberCount: parseInt(channelData.statistics.subscriberCount, 10),
      customUrl: channelData.snippet.customUrl || "",
    }

    console.log(`Successfully fetched details for channel: ${channelDetails.channelName}`)

    return respondWith(channelDetails, 200)
  } catch (error) {
    console.error("YouTube channel details function error:", error)
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

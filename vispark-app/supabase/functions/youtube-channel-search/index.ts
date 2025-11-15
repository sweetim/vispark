
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

type YouTubeSearchRequestPayload = {
  query: string
}

type Thumbnail = {
  url: string
}

type Thumbnails = {
  default: Thumbnail
  medium: Thumbnail
  high: Thumbnail
}

type RawSnippet = {
  publishedAt: string
  channelId: string
  title: string
  description: string
  thumbnails: Thumbnails
  channelTitle: string
  liveBroadcastContent: string
  publishTime: string
}

type Snippet = {
  publishedAt: string
  channelId: string
  title: string
  description: string
  thumbnails: string
  channelTitle: string
  liveBroadcastContent: string
  publishTime: string
}

type Id = {
  kind: string
  channelId: string
}

type RawYouTubeSearchResult = {
  kind: string
  etag: string
  id: Id
  snippet: RawSnippet
}

type YouTubeSearchResult = {
  kind: string
  etag: string
  id: Id
  snippet: Snippet
}

type SuccessResponse = {
  items: Snippet[]
  nextPageToken?: string
  regionCode?: string
  totalResults?: number
}

type ErrorResponse = {
  error: string
  message: string
}

type ResponseBody = SuccessResponse | ErrorResponse

const respondWith = (body: ResponseBody, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(),
  })

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

  const { query } = (payload ?? {}) as Partial<YouTubeSearchRequestPayload>

  // Set default values for the parameters
  const type = "channel"
  const maxResults = 25
  const order = "videoCount"

  if (typeof query !== "string" || query.trim().length === 0) {
    return respondWith(
      {
        error: "Missing fields",
        message: "The request body must include a non-empty query string.",
      },
      400,
    )
  }

  if (!["channel", "video"].includes(type)) {
    return respondWith(
      {
        error: "Invalid type",
        message: "Type must be one of: channel, video.",
      },
      400,
    )
  }

  const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY")

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

  try {
    console.log(`Searching YouTube for ${type}s with query: ${query}`)

    const url = new URL("https://www.googleapis.com/youtube/v3/search")
    url.searchParams.set("part", "snippet")
    url.searchParams.set("q", query)
    url.searchParams.set("type", type)
    url.searchParams.set("maxResults", maxResults.toString())
    url.searchParams.set("order", order)
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

    const items = (json?.items ?? []).map((item: RawYouTubeSearchResult) => ({
      ...item.snippet,
      thumbnails: item.snippet.thumbnails.default.url
    }))
    console.log(`Found ${items.length} ${type}s`)

    return respondWith({
      items,
      nextPageToken: json?.nextPageToken,
      regionCode: json?.regionCode,
      totalResults: json?.pageInfo?.totalResults,
    } as SuccessResponse, 200)
  } catch (error) {
    console.error("YouTube search function error:", error)
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

import { supabase } from "@/config/supabaseClient.ts"
import { decodeHtmlEntities } from "@/utils"

export type TranscriptSegment = {
  text: string
  offset?: number
  duration?: number
}

export type TranscriptResult = {
  videoId: string
  transcript: TranscriptSegment[]
  lang?: string
}

export type SummaryResult = {
  bullets: string[]
}

export type FetchTranscriptParams = {
  videoId: string
  local?: boolean
  lang?: string
}

export const fetchTranscript = async (
  params: FetchTranscriptParams,
): Promise<TranscriptResult> => {
  const { data, error } = await supabase.functions.invoke<TranscriptResult>(
    "transcript",
    {
      body: params,
    },
  )

  if (error) {
    throw new Error(
      error.message ?? "Failed to fetch transcript. Please try again.",
    )
  }

  if (!data) {
    throw new Error("Unexpected response format from transcript service.")
  }

  return data
}

export const fetchSummaryStream = async (
  transcripts: TranscriptSegment[],
): Promise<ReadableStream<Uint8Array>> => {
  // Get the current session to include auth token
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the function URL directly
  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summary`

  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ transcripts }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Failed to fetch summary stream: ${response.status} ${response.statusText}. ${errorText}`,
    )
  }

  if (!response.body) {
    throw new Error("Response body is missing from summary service.")
  }

  return response.body
}

export const formatTranscript = (segments: TranscriptSegment[]): string =>
  segments
    .map(({ text }) => decodeHtmlEntities(text.trim()))
    .filter((segment) => segment.length > 0)
    .join(" ")

// Normalized video metadata type that works for both YouTube API and Supabase DB
export type VideoMetadata = {
  videoId: string
  title: string
  channelId: string
  channelTitle: string
  thumbnails: string
  channelThumbnailUrl: string
  publishedAt: string
  description: string
  categoryId: string
  defaultLanguage: string
  hasSummary: boolean
}

/**
 * Fetch video metadata (title, channel name, thumbnails) from the Supabase video-details function.
 * This function handles YouTube API calls on the server side.
 */
export const fetchYouTubeVideoDetails = async (
  videoId: string,
): Promise<VideoMetadata> => {
  const { data, error } = await supabase.functions.invoke<{
    video?: VideoMetadata
  }>("video-details", {
    body: { videoId, action: "getDetails" },
  })

  if (error) {
    throw new Error(
      error.message ?? "Failed to fetch video details. Please try again.",
    )
  }

  if (!data?.video) {
    throw new Error("Video was not found for the provided video identifier.")
  }

  return data.video
}

/**
 * Fetch multiple video metadata in batch from the Supabase video-details function.
 * This is more efficient than calling fetchYouTubeVideoDetails for each video individually.
 */
export const fetchBatchYouTubeVideoDetails = async (
  videoIds: string[],
): Promise<VideoMetadata[]> => {
  if (videoIds.length === 0) {
    return []
  }

  const { data, error } = await supabase.functions.invoke<{
    videos?: VideoMetadata[]
  }>("video-details", {
    body: { videoIds, action: "getBatchDetails" },
  })

  if (error) {
    throw new Error(
      error.message ?? "Failed to fetch batch video details. Please try again.",
    )
  }

  if (!data?.videos) {
    throw new Error("No video details were returned.")
  }

  return data.videos
}

export type SaveVisparkResult = {
  id: string
  videoId: string
  videoChannelId?: string
  summaries: string[]
  createdTime: string
}

/**
 * Persist a user's vispark entry (videoId + videoChannelId + summaries).
 * Uses the authenticated session via supabase.functions.invoke.
 */
export const saveVispark = async (
  videoId: string,
  videoChannelId: string,
  summaries: string,
  videoMetadata: VideoMetadata,
): Promise<SaveVisparkResult> => {
  // Ensure Authorization header is forwarded to the Edge Function
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const accessToken = session?.access_token
  if (!accessToken) {
    throw new Error("You must be signed in to save a vispark.")
  }

  const { data, error } = await supabase.functions.invoke<SaveVisparkResult>(
    "vispark",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      body: {
        videoId,
        videoChannelId,
        summaries,
        videoMetadata: {
          title: videoMetadata.title,
          description: videoMetadata.description,
          channelTitle: videoMetadata.channelTitle,
          thumbnails: videoMetadata.thumbnails,
          publishedAt: videoMetadata.publishedAt,
          defaultLanguage: videoMetadata.defaultLanguage,
        },
      },
    },
  )

  if (error) {
    throw new Error(
      error.message ?? "Failed to save vispark. Please try again.",
    )
  }

  if (!data) {
    throw new Error("Unexpected response format from vispark service.")
  }

  return data
}

export type VisparkRow = {
  id: string
  video_id: string
  video_channel_id: string
  summaries: string
  created_at: string
  is_new_from_callback: boolean
  video_title: string
  video_description: string
  video_channel_title: string
  video_thumbnails: string
  video_published_at: string
  video_default_language: string
}

/**
 * List the authenticated user's visparks (latest first).
 * Requires RLS policy allowing select of rows where user_id = auth.uid().
 */
export const listVisparks = async (limit = 10): Promise<VisparkRow[]> => {
  const { data, error } = await supabase
    .from("visparks")
    .select(
      "id, video_id, video_channel_id, summaries, created_at, is_new_from_callback, video_title, video_description, video_channel_title, video_thumbnails, video_published_at, video_default_language",
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(
      error.message ?? "Failed to list visparks. Please try again.",
    )
  }

  return (data ?? []) as VisparkRow[]
}

/**
 * Update the is_new_from_callback flag for a vispark
 */
export const updateVisparkCallbackFlag = async (
  visparkId: string,
  isNewFromCallback: boolean,
): Promise<void> => {
  const { error } = await supabase
    .from("visparks")
    .update({ is_new_from_callback: isNewFromCallback })
    .eq("id", visparkId)

  if (error) {
    throw new Error(
      error.message
        ?? "Failed to update vispark callback flag. Please try again.",
    )
  }
}

/**
 * List the authenticated user's visparks filtered by video channel ID.
 * Requires RLS policy allowing select of rows where user_id = auth.uid().
 */
export const listVisparksByChannelId = async (
  videoChannelId: string,
  limit = 50,
  offset = 0,
): Promise<VisparkRow[]> => {
  const { data, error } = await supabase
    .from("visparks")
    .select(
      "id, video_id, video_channel_id, summaries, created_at, is_new_from_callback, video_title, video_description, video_channel_title, video_thumbnails, video_published_at, video_default_language",
    )
    .eq("video_channel_id", videoChannelId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(
      error.message
        ?? "Failed to list visparks by channel ID. Please try again.",
    )
  }

  return (data ?? []) as VisparkRow[]
}

/**
 * Fetch a vispark by video ID for the authenticated user.
 * Requires RLS policy allowing select of rows where user_id = auth.uid().
 */
export const fetchVisparkByVideoId = async (
  videoId: string,
): Promise<VisparkRow | null> => {
  const { data, error } = await supabase
    .from("visparks")
    .select(
      "id, video_id, video_channel_id, summaries, created_at, is_new_from_callback, video_title, video_description, video_channel_title, video_thumbnails, video_published_at, video_default_language",
    )
    .eq("video_id", videoId)
    .single()

  if (error) {
    throw new Error(
      error.message ?? "Failed to fetch vispark by video ID. Please try again.",
    )
  }

  return data as VisparkRow | null
}

import { supabase } from "@/config/supabaseClient.ts"

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

export const fetchTranscript = async (
  videoId: string,
): Promise<TranscriptResult> => {
  const { data, error } =
    await supabase.functions.invoke<TranscriptResult>("transcript", {
      body: { videoId },
    })

  if (error) {
    throw new Error(error.message ?? "Failed to fetch transcript. Please try again.")
  }

  if (!data) {
    throw new Error("Unexpected response format from transcript service.")
  }

  return data
}

export const fetchSummary = async (
  transcripts: TranscriptSegment[],
): Promise<SummaryResult> => {
  const { data: summaryData, error } =
    await supabase.functions.invoke<SummaryResult>("summary", {
      body: { transcripts },
    })

  if (error) {
    throw new Error(error.message ?? "Failed to fetch summary. Please try again.")
  }

  if (!summaryData) {
    throw new Error("Unexpected response format from summary service.")
  }

  return summaryData
}

export const formatTranscript = (segments: TranscriptSegment[]): string =>
  segments
    .map(({ text }) => text.trim())
    .filter((segment) => segment.length > 0)
    .join("\n")

// YouTube Video Metadata (no abbreviations in identifiers)
type YouTubeThumbnail = {
  url: string
}

type YouTubeThumbnails = {
  default: YouTubeThumbnail
  medium: YouTubeThumbnail
  high: YouTubeThumbnail
}

export type VideoMetadata = {
  videoId: string
  title: string
  channelTitle: string
  thumbnails: YouTubeThumbnails
}

export const getBestThumbnailUrl = (thumbnails?: YouTubeThumbnails): string =>
  thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? ""

/**
 * Fetch video metadata (title, channel name, thumbnails) from the YouTube Data Service.
 * Requires VITE_YOUTUBE_API_KEY in your environment.
 */
export const fetchYouTubeVideoDetails = async (videoId: string): Promise<VideoMetadata> => {
  const youTubeApplicationProgrammingInterfaceKey = import.meta.env.VITE_YOUTUBE_API_KEY
  if (!youTubeApplicationProgrammingInterfaceKey) {
    throw new Error(
      "VITE_YOUTUBE_API_KEY is not set. Add it to your .env file to enable video metadata retrieval.",
    )
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/videos")
  url.searchParams.set("part", "snippet")
  url.searchParams.set("id", videoId)
  url.searchParams.set("key", youTubeApplicationProgrammingInterfaceKey as string)

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`YouTube service error: ${response.status} ${response.statusText}`)
  }

  const json = await response.json()
  const item = json?.items?.[0]
  if (!item?.snippet) {
    throw new Error("Video was not found for the provided video identifier.")
  }

  const { title, channelTitle, thumbnails } = item.snippet as {
    title: string
    channelTitle: string
    thumbnails: YouTubeThumbnails
  }

  return {
    videoId,
    title,
    channelTitle,
    thumbnails,
  }
}

import useSWR from "swr"
import { supabase } from "@/config/supabaseClient"
import { useChannelVisparksWithMetadata } from "@/hooks/useVisparks"

export type YouTubeChannelVideo = {
  videoId: string
  title: string
  description: string
  thumbnails: string
  publishedAt: string
  defaultLanguage?: string
}

export type YouTubeChannelVideosResponse = {
  videos: YouTubeChannelVideo[]
  nextPageToken?: string
}

// SWR configuration for YouTube channel videos
const videosConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 300000, // 5 minutes
  errorRetryCount: 3,
  errorRetryInterval: 5000,
}

// Hook for fetching YouTube channel videos
export const useYouTubeChannelVideos = (
  channelId: string,
  pageToken?: string,
  maxResults: number = 20,
) => {
  const { data, error, isLoading, mutate } =
    useSWR<YouTubeChannelVideosResponse>(
      channelId
        ? `youtube-channel-videos/${channelId}?pageToken=${pageToken || ""}&maxResults=${maxResults}`
        : null,
      async () => {
        if (!channelId) return { videos: [] }

        // Build the URL with query parameters
        const queryParams = new URLSearchParams()
        if (pageToken) queryParams.set("pageToken", pageToken)
        if (maxResults) queryParams.set("maxResults", maxResults.toString())

        const queryString = queryParams.toString()
        const url = `youtube-channel-videos/${channelId}${queryString ? `?${queryString}` : ""}`

        const { data, error } =
          await supabase.functions.invoke<YouTubeChannelVideosResponse>(url, {
            method: "GET",
          })
        console.log(data)
        if (error) {
          throw new Error(
            error.message
              ?? "Failed to fetch channel videos. Please try again.",
          )
        }

        if (!data?.videos) {
          throw new Error(
            "Unexpected response format from channel videos service.",
          )
        }

        return data
      },
      videosConfig,
    )

  return {
    videos: data?.videos || [],
    nextPageToken: data?.nextPageToken,
    isLoading,
    error,
    mutate,
  }
}

// Hook for getting videos with vispark summaries from the channel
export const useVisparkVideos = (channelId: string) => {
  // Get all visparks for this channel (videos with summaries)
  const {
    visparks,
    isLoading: loadingVisparks,
    error: visparksError,
  } = useChannelVisparksWithMetadata(channelId)

  // Get all channel videos
  const {
    videos,
    isLoading: loadingVideos,
    error: videosError,
  } = useYouTubeChannelVideos(channelId, undefined, 50)

  // Create a Set of video IDs that have vispark summaries for efficient lookup
  const visparkVideoIds = new Set(visparks.map((vispark) => vispark.videoId))

  // Filter channel videos to only include those that have vispark summaries
  const videosWithSummaries = videos.filter((video) =>
    visparkVideoIds.has(video.videoId),
  )

  const isLoading = loadingVisparks || loadingVideos
  const error = visparksError || videosError

  return {
    videos: videosWithSummaries,
    isLoading,
    error,
    mutate: null, // We'll implement mutate if needed
  }
}

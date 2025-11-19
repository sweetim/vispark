import useSWR from "swr"
import { supabase } from "@/config/supabaseClient"
import { useVisparksByChannel } from "@/hooks/useVisparks"

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

// Hook for infinite fetching of YouTube channel videos
import useSWRInfinite from "swr/infinite"

export const useInfiniteYouTubeChannelVideos = (
  channelId: string,
  maxResults: number = 20,
) => {
  const getKey = (pageIndex: number, previousPageData: YouTubeChannelVideosResponse) => {
    if (!channelId) return null
    if (pageIndex === 0) return [`youtube-channel-videos-infinite`, channelId, null, maxResults]
    if (!previousPageData?.nextPageToken) return null // reached the end
    return [`youtube-channel-videos-infinite`, channelId, previousPageData.nextPageToken, maxResults]
  }

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite<YouTubeChannelVideosResponse>(
    getKey,
    async ([_, cId, pageToken, max]) => {
        // Build the URL with query parameters
        const queryParams = new URLSearchParams()
        if (pageToken) queryParams.set("pageToken", pageToken as string)
        if (max) queryParams.set("maxResults", (max as number).toString())

        const queryString = queryParams.toString()
        const url = `youtube-channel-videos/${cId}${queryString ? `?${queryString}` : ""}`

        const { data, error } =
          await supabase.functions.invoke<YouTubeChannelVideosResponse>(url, {
            method: "GET",
          })

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
    {
      ...videosConfig,
      revalidateFirstPage: false,
    }
  )

  const videos = data ? ([] as YouTubeChannelVideo[]).concat(...data.map(page => page.videos)) : []
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined")
  const isEmpty = data?.[0]?.videos.length === 0
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.nextPageToken)

  return {
    videos,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    error,
    size,
    setSize,
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
  } = useVisparksByChannel(channelId)

  // Get all channel videos
  const {
    videos,
    isLoading: loadingVideos,
    error: videosError,
  } = useYouTubeChannelVideos(channelId, undefined, 50)

  // Create a Set of video IDs that have vispark summaries for efficient lookup
  const visparkVideoIds = new Set(visparks.map((vispark) => vispark.video_id))

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

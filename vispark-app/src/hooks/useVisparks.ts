import useSWR from "swr"
import {
  fetchYouTubeVideoDetails,
  listVisparks,
  listVisparksByChannelId,
  type VideoMetadata,
  type VisparkRow,
} from "@/services/vispark"

// Base SWR configuration for visparks
const visparkConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 60000, // 1 minute
  errorRetryCount: 3,
  errorRetryInterval: 5000,
}

// Hook for fetching all visparks
export const useVisparks = (limit = 200) => {
  const { data, error, isLoading, mutate } = useSWR<VisparkRow[]>(
    `visparks?limit=${limit}`,
    () => listVisparks(limit),
    visparkConfig,
  )

  return {
    visparks: data || [],
    isLoading,
    error,
    mutate,
  }
}

// Hook for fetching visparks by channel ID
export const useVisparksByChannel = (channelId: string) => {
  const { data, error, isLoading, mutate } = useSWR<VisparkRow[]>(
    channelId ? `visparks?channelId=${channelId}` : null,
    channelId ? () => listVisparksByChannelId(channelId) : null,
    visparkConfig,
  )

  return {
    visparks: data || [],
    isLoading,
    error,
    mutate,
  }
}

// Hook for fetching video metadata with caching
const metadataConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 300000, // 5 minutes for metadata
  errorRetryCount: 2,
  errorRetryInterval: 3000,
}

export const useVideoMetadata = (videoId: string) => {
  const { data, error, isLoading, mutate } = useSWR<VideoMetadata>(
    videoId ? `video-metadata?videoId=${videoId}` : null,
    videoId ? () => fetchYouTubeVideoDetails(videoId) : null,
    metadataConfig,
  )

  return {
    metadata: data,
    isLoading,
    error,
    mutate,
  }
}

// Hook for fetching multiple video metadata in batch
export const useBatchVideoMetadata = (videoIds: string[]) => {
  const { data, error, isLoading, mutate } = useSWR<Map<string, VideoMetadata>>(
    videoIds.length > 0 ? ["video-metadata-batch", videoIds.sort()] : null,
    async () => {
      if (videoIds.length === 0) return new Map()

      // Create a map to store results
      const metadataMap = new Map<string, VideoMetadata>()

      // Fetch metadata for each video with error handling
      const metadataPromises = videoIds.map(async (videoId) => {
        try {
          const metadata = await fetchYouTubeVideoDetails(videoId)
          return { videoId, metadata, error: null }
        } catch (error) {
          console.warn(`Failed to fetch metadata for ${videoId}:`, error)
          return { videoId, metadata: null, error }
        }
      })

      const results = await Promise.allSettled(metadataPromises)

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.metadata) {
          metadataMap.set(result.value.videoId, result.value.metadata)
        }
      })

      return metadataMap
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    },
  )

  return {
    metadataMap: data || new Map(),
    isLoading,
    error,
    mutate,
  }
}

// Hook for visparks with enriched metadata
export const useVisparksWithMetadata = (limit = 200) => {
  const {
    visparks,
    isLoading: loadingVisparks,
    error: visparksError,
    mutate,
  } = useVisparks(limit)
  const videoIds = visparks.map((v) => v.video_id)
  const {
    metadataMap,
    isLoading: loadingMetadata,
    error: metadataError,
  } = useBatchVideoMetadata(videoIds)

  // Combine visparks with metadata
  const visparksWithMetadata = visparks.map((vispark) => ({
    id: vispark.id,
    videoId: vispark.video_id,
    videoChannelId: vispark.video_channel_id,
    summaries: vispark.summaries,
    createdTime: vispark.created_at,
    metadata: metadataMap.get(vispark.video_id) || {
      videoId: vispark.video_id,
      title: `Video ${vispark.video_id}`,
      channelId: vispark.video_channel_id || "",
      channelTitle: "Unknown Channel",
      thumbnails: {
        default: { url: "" },
        medium: { url: "" },
        high: { url: "" },
      },
    },
  }))

  return {
    visparks: visparksWithMetadata,
    isLoading: loadingVisparks || loadingMetadata,
    error: visparksError || metadataError,
    mutate,
  }
}

// Hook for channel visparks with enriched metadata
export const useChannelVisparksWithMetadata = (channelId: string) => {
  const {
    visparks,
    isLoading: loadingVisparks,
    error: visparksError,
    mutate,
  } = useVisparksByChannel(channelId)
  const videoIds = visparks.map((v) => v.video_id)
  const {
    metadataMap,
    isLoading: loadingMetadata,
    error: metadataError,
  } = useBatchVideoMetadata(videoIds)

  // Combine visparks with metadata
  const visparksWithMetadata = visparks.map((vispark) => ({
    id: vispark.id,
    videoId: vispark.video_id,
    videoChannelId: vispark.video_channel_id,
    summaries: vispark.summaries,
    createdTime: vispark.created_at,
    metadata: metadataMap.get(vispark.video_id) || {
      videoId: vispark.video_id,
      title: `Video ${vispark.video_id}`,
      channelId: vispark.video_channel_id || "",
      channelTitle: "Unknown Channel",
      thumbnails: {
        default: { url: "" },
        medium: { url: "" },
        high: { url: "" },
      },
    },
  }))

  return {
    visparks: visparksWithMetadata,
    isLoading: loadingVisparks || loadingMetadata,
    error: visparksError || metadataError,
    mutate,
  }
}

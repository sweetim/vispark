import useSWR from "swr"
import {
  fetchBatchYouTubeVideoDetails,
  fetchVisparkByVideoId,
  fetchYouTubeVideoDetails,
  listVisparks,
  listVisparksByChannelId,
  type VideoMetadata,
  type VisparkRow,
} from "@/services/vispark"

// Base SWR configuration for visparks
const visparkConfig = {
  revalidateOnFocus: true,
  dedupingInterval: 0, // No deduping to ensure fresh data
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

      try {
        // Use the new batch function to fetch all video details at once
        const videosMetadata = await fetchBatchYouTubeVideoDetails(videoIds)

        // Convert array to map for easier lookup
        const metadataMap = new Map<string, VideoMetadata>()
        videosMetadata.forEach((metadata) => {
          metadataMap.set(metadata.videoId, metadata)
        })

        return metadataMap
      } catch (error) {
        console.error("Failed to fetch batch video metadata:", error)

        // Fallback to individual requests if batch fails
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
      }
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

// Hook for fetching a vispark by video ID
export const useVisparkByVideoId = (videoId: string) => {
  const { data, error, isLoading, mutate } = useSWR<VisparkRow | null>(
    videoId ? `vispark?videoId=${videoId}` : null,
    videoId ? () => fetchVisparkByVideoId(videoId) : null,
    visparkConfig,
  )

  return {
    vispark: data,
    isLoading,
    error,
    mutate,
  }
}

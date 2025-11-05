import useSWR, { useSWRConfig } from "swr"
import {
  getBatchVideoDetails,
  getVideoDetails,
  type VideoDetails,
} from "../services/videoDetails"

// Hook for fetching a single video's details
export const useVideoDetails = (videoId: string | null) => {
  const { data, error, isLoading, mutate } = useSWR<VideoDetails>(
    videoId ? ["video-details", videoId] : null,
    () =>
      videoId
        ? getVideoDetails(videoId)
        : Promise.reject(new Error("No video ID provided")),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute cache
    },
  )

  return {
    videoDetails: data,
    isLoading,
    error,
    mutate,
  }
}

// Hook for fetching multiple videos' details
export const useBatchVideoDetails = (videoIds: string[] | null) => {
  const { data, error, isLoading, mutate } = useSWR<VideoDetails[]>(
    videoIds && videoIds.length > 0
      ? ["batch-video-details", videoIds.sort().join(",")]
      : null,
    () =>
      videoIds
        ? getBatchVideoDetails(videoIds)
        : Promise.reject(new Error("No video IDs provided")),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute cache
    },
  )

  return {
    videoDetailsList: data,
    isLoading,
    error,
    mutate,
  }
}

// Hook for fetching video details with conditional loading
export const useVideoDetailsConditional = (
  videoId: string | null,
  enabled: boolean = true,
) => {
  const { data, error, isLoading, mutate } = useSWR<VideoDetails>(
    enabled && videoId ? ["video-details", videoId] : null,
    () =>
      videoId
        ? getVideoDetails(videoId)
        : Promise.reject(new Error("No video ID provided")),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute cache
    },
  )

  return {
    videoDetails: data,
    isLoading,
    error,
    mutate,
  }
}

// Hook for prefetching video details
export const usePrefetchVideoDetails = () => {
  const { mutate: globalMutate } = useSWRConfig()

  const prefetch = (videoId: string) => {
    globalMutate(["video-details", videoId], () => getVideoDetails(videoId), {
      revalidate: false,
    })
  }

  return { prefetch }
}

// Hook for prefetching batch video details
export const usePrefetchBatchVideoDetails = () => {
  const { mutate: globalMutate } = useSWRConfig()

  const prefetch = (videoIds: string[]) => {
    const key = ["batch-video-details", videoIds.sort().join(",")]
    globalMutate(key, () => getBatchVideoDetails(videoIds), {
      revalidate: false,
    })
  }

  return { prefetch }
}

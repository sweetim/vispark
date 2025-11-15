import { useCallback } from "react"
import useSWR from "swr"
import {
  type ChannelMetadata,
  type ChannelVideo,
  getAllChannelVideos,
  getBatchChannelDetails,
  getSubscribedChannels,
  getYouTubeChannelDetails,
  isChannelSubscribed,
  subscribeToChannel,
  unsubscribeFromChannel,
} from "@/services/channel"

// Base SWR configuration for channels
const fetchConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 300000, // 5 minutes
  errorRetryCount: 3,
  errorRetryInterval: 5000,
}

// Hook for fetching subscribed channels
export const useSubscribedChannels = () => {
  const { data, error, isLoading, mutate } = useSWR<ChannelMetadata[]>(
    "subscribed-channels",
    getSubscribedChannels,
    fetchConfig,
  )
  console.log(data)
  return {
    channels: data || [],
    isLoading,
    error,
    mutate,
  }
}

// Hook for checking channel subscription status
export const useChannelSubscription = (channelId: string) => {
  const { data, error, isLoading, mutate } = useSWR<boolean>(
    channelId ? `channel-subscription?channelId=${channelId}` : null,
    channelId ? () => isChannelSubscribed(channelId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute for subscription status
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    },
  )

  return {
    isSubscribed: data || false,
    isLoading,
    error,
    mutate,
  }
}

// Hook for channel videos with pagination
export const useChannelVideos = (
  channelId: string,
  initialPageToken?: string,
) => {
  const { data, error, isLoading, mutate } = useSWR<{
    videos: ChannelVideo[]
    nextPageToken?: string
  }>(
    channelId
      ? `channel-videos?channelId=${channelId}&pageToken=${initialPageToken || ""}`
      : null,
    channelId
      ? () => getAllChannelVideos(channelId, initialPageToken, 50)
      : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // 2 minutes for videos
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    },
  )

  return {
    videos: data?.videos || [],
    nextPageToken: data?.nextPageToken,
    isLoading,
    error,
    mutate,
  }
}

// Hook for channel subscription management
export const useChannelSubscriptionManager = (
  channelId: string,
  channelTitle?: string,
  channelThumbnailUrl?: string,
) => {
  const { isSubscribed, mutate: mutateSubscription } =
    useChannelSubscription(channelId)
  const { mutate: mutateChannels } = useSubscribedChannels()

  const toggleSubscription = useCallback(async () => {
    if (!channelId) return

    try {
      if (isSubscribed) {
        await unsubscribeFromChannel(channelId)
      } else {
        if (!channelTitle || !channelThumbnailUrl) {
          throw new Error(
            "Channel title and thumbnail are required for subscription",
          )
        }
        await subscribeToChannel(channelId, channelTitle, channelThumbnailUrl)
      }

      // Update local state immediately (optimistic update)
      mutateSubscription(!isSubscribed, false)

      // Refresh subscribed channels list
      mutateChannels()

      return { success: true, isSubscribed: !isSubscribed }
    } catch (error) {
      // Revert optimistic update on error
      mutateSubscription(isSubscribed, false)
      throw error
    }
  }, [
    channelId,
    channelTitle,
    channelThumbnailUrl,
    isSubscribed,
    mutateSubscription,
    mutateChannels,
  ])

  return {
    isSubscribed,
    toggleSubscription,
  }
}

// Hook for batch fetching channel details
export const useBatchChannelDetails = (channelIds: string[]) => {
  const { data, error, isLoading, mutate } = useSWR<ChannelMetadata[]>(
    channelIds.length > 0
      ? `batch-channel-details?ids=${channelIds.sort().join(",")}`
      : null,
    () => getBatchChannelDetails(channelIds),
    fetchConfig,
  )

  return {
    channels: data || [],
    isLoading,
    error,
    mutate,
  }
}

// Hook for searching channels (no caching for search results)
export const useChannelSearch = (query: string, enabled = false) => {
  const { data, error, isLoading, mutate } = useSWR<ChannelMetadata[]>(
    enabled && query
      ? `channel-search?query=${encodeURIComponent(query)}`
      : null,
    async () => {
      if (!query) return []

      // Import searchChannels only when needed to avoid circular dependencies
      const { searchChannels } = await import("@/services/channel")
      const searchResults = await searchChannels(query)

      return searchResults.map((item) => ({
        channelId: item.channelId,
        channelTitle: item.channelTitle,
        channelThumbnailUrl: item.thumbnails,
      }))
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes for search results
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    },
  )

  return {
    searchResults: data || [],
    isLoading,
    error,
    mutate,
  }
}

// Hook for fetching YouTube channel details directly from YouTube API
export const useYouTubeChannelDetails = (channelId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    channelId ? `youtube-channel-details?channelId=${channelId}` : null,
    channelId ? () => getYouTubeChannelDetails(channelId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes for YouTube channel details
      errorRetryCount: 2,
      errorRetryInterval: 5000,
    },
  )

  return {
    youtubeChannelDetails: data,
    isLoading,
    error,
    mutate,
  }
}

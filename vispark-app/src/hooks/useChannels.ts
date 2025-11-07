import { useCallback } from "react"
import useSWR from "swr"
import {
  type ChannelMetadata,
  type ChannelVideo,
  getAllChannelVideos,
  getBatchChannelDetails,
  getChannelDetails,
  getSubscribedChannels,
  isChannelSubscribed,
  subscribeToChannel,
  unsubscribeFromChannel,
} from "@/services/channel"

// Base SWR configuration for channels
const channelConfig = {
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
    channelConfig,
  )

  console.log("useSubscribedChannels: State:", {
    dataLength: data?.length || 0,
    isLoading,
    error: error?.message,
  })

  return {
    channels: data || [],
    isLoading,
    error,
    mutate,
  }
}

// Hook for fetching channel details
export const useChannelDetails = (channelId: string) => {
  const { data, error, isLoading, mutate } = useSWR<ChannelMetadata>(
    channelId ? `channel-details?channelId=${channelId}` : null,
    channelId ? () => getChannelDetails(channelId) : null,
    channelConfig,
  )

  return {
    channelDetails: data,
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
export const useChannelSubscriptionManager = (channelId: string) => {
  const { isSubscribed, mutate: mutateSubscription } =
    useChannelSubscription(channelId)
  const { mutate: mutateChannels } = useSubscribedChannels()

  const toggleSubscription = useCallback(async () => {
    if (!channelId) return

    try {
      if (isSubscribed) {
        await unsubscribeFromChannel(channelId)
      } else {
        await subscribeToChannel(channelId)
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
  }, [channelId, isSubscribed, mutateSubscription, mutateChannels])

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
    channelConfig,
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

      // Extract channel IDs from search results
      const channelIds = searchResults.map((result) => result.id.channelId)

      // Fetch detailed channel information in batch
      let detailedChannels: ChannelMetadata[] = []
      if (channelIds.length > 0) {
        try {
          detailedChannels = await getBatchChannelDetails(channelIds)
        } catch (error) {
          console.error(
            "Failed to fetch batch channel details for search results:",
            error,
          )
          // Fallback to basic information from search results
          detailedChannels = searchResults.map((result) => ({
            channelId: result.id.channelId,
            channelTitle: result.snippet.channelTitle,
            channelThumbnailUrl: result.snippet.thumbnails.default.url,
            videoCount: 0, // Not available in search results
            isSubscribed: false, // Will be checked separately
          }))
        }
      }

      return detailedChannels
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

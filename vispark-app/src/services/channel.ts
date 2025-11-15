import { supabase } from "@/config/supabaseClient.ts"

// Helper function to make authenticated requests to our new RESTful endpoints
const makeAuthenticatedRequest = async <T>(
  functionName: string,
  options: RequestInit = {},
): Promise<T> => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
    {
      ...options,
      headers,
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `Request failed with status ${response.status}`,
    )
  }

  return response.json()
}

export type ChannelMetadata = {
  channelId: string
  channelTitle: string
  channelThumbnailUrl: string
  videoCount: number
  isSubscribed?: boolean
}

export type ChannelVideo = {
  videoId: string
  title: string
  thumbnails: {
    default: { url: string }
    high: { url: string }
  }
  publishedAt: string
  hasSummary: boolean
}

export type YouTubeSearchResult = {
  etag: string
  id: {
    kind: string
    channelId: string
  }
  kind: string
  snippet: {
    channelId: string
    channelTitle: string
    description: string
    liveBroadcastContent: string
    publishTime: string
    publishedAt: string
    thumbnails: {
      default: { url: string }
      medium: { url: string }
      high: { url: string }
    }
    title: string
  }
}

/**
 * Search for channels by name using Supabase function
 */
export const searchChannels = async (
  query: string,
): Promise<YouTubeSearchResult[]> => {
  const { data, error } = await supabase.functions.invoke<{
    items: YouTubeSearchResult[]
  }>("youtube-channel-search", {
    body: { query, type: "channel", order: "videoCount" },
  })

  if (error) {
    throw new Error(
      error.message ?? "Failed to search channels. Please try again.",
    )
  }

  if (!data?.items) {
    throw new Error("Unexpected response format from search service.")
  }

  return data.items
}

/**
 * Get channel details from our database or fetch from YouTube API
 */
export const getChannelDetails = async (
  channelId: string,
): Promise<ChannelMetadata> => {
  const data = await makeAuthenticatedRequest<{
    channels: ChannelMetadata[]
  }>(`channel-details?id=${encodeURIComponent(channelId)}`, {
    method: "GET",
  })

  if (!data?.channels || data.channels.length === 0) {
    throw new Error("Channel not found.")
  }

  return data.channels[0]
}

/**
 * Get multiple channel details in a single batch request
 */
export const getBatchChannelDetails = async (
  channelIds: string[],
): Promise<ChannelMetadata[]> => {
  if (channelIds.length === 0) {
    return []
  }

  const data = await makeAuthenticatedRequest<{
    channels: ChannelMetadata[]
  }>(`channel-details?ids=${encodeURIComponent(channelIds.join(","))}`, {
    method: "GET",
  })

  if (!data?.channels) {
    throw new Error("Unexpected response format from channel service.")
  }

  return data.channels
}

/**
 * Get videos from a channel that have summaries
 */
export const getChannelVideosWithSummaries = async (
  channelId: string,
): Promise<ChannelVideo[]> => {
  const data = await makeAuthenticatedRequest<{
    videos: ChannelVideo[]
  }>(`channel-videos/${encodeURIComponent(channelId)}?summaries=true`, {
    method: "GET",
  })

  if (!data?.videos) {
    throw new Error("Unexpected response format from channel service.")
  }

  return data.videos
}

/**
 * Get all videos from a channel (both with and without summaries)
 */
export const getAllChannelVideos = async (
  channelId: string,
  pageToken?: string,
  maxResults: number = 10,
): Promise<{ videos: ChannelVideo[]; nextPageToken?: string }> => {
  const queryParams = new URLSearchParams()
  if (pageToken) queryParams.set("pageToken", pageToken)
  if (maxResults !== 10) queryParams.set("maxResults", maxResults.toString())

  const queryString = queryParams.toString()
  const url = `channel-videos/${encodeURIComponent(channelId)}${queryString ? `?${queryString}` : ""}`

  const data = await makeAuthenticatedRequest<{
    videos: ChannelVideo[]
    nextPageToken?: string
  }>(url, {
    method: "GET",
  })

  if (!data?.videos) {
    throw new Error("Unexpected response format from channel service.")
  }

  return {
    videos: data.videos,
    nextPageToken: data.nextPageToken,
  }
}

/**
 * Subscribe to a channel
 */
export const subscribeToChannel = async (channelId: string): Promise<void> => {
  await makeAuthenticatedRequest<{ message: string }>("user-subscriptions", {
    method: "POST",
    body: JSON.stringify({ channelId }),
  })
}

/**
 * Unsubscribe from a channel
 */
export const unsubscribeFromChannel = async (
  channelId: string,
): Promise<void> => {
  await makeAuthenticatedRequest<{ message: string }>(
    `user-subscriptions/${encodeURIComponent(channelId)}`,
    {
      method: "DELETE",
    },
  )
}

/**
 * Check if multiple channels are subscribed by the current user
 */
export const areChannelsSubscribed = async (
  channelIds: string[],
): Promise<Record<string, boolean>> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {}
  }

  const { data, error } = await supabase
    .from("channels")
    .select("channel_id")
    .eq("user_id", user.id)
    .in("channel_id", channelIds)

  if (error) {
    throw new Error(
      error.message ?? "Failed to check subscription status. Please try again.",
    )
  }

  // Create a record with channel IDs as keys and subscription status as values
  const subscriptionStatus: Record<string, boolean> = {}
  channelIds.forEach((id) => {
    subscriptionStatus[id] = false // Default to not subscribed
  })

  // Mark subscribed channels as true
  data?.forEach((subscription) => {
    if (subscription.channel_id) {
      subscriptionStatus[subscription.channel_id] = true
    }
  })

  return subscriptionStatus
}

/**
 * Get all subscribed channels for the current user
 */
export const getSubscribedChannels = async (): Promise<ChannelMetadata[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("No authenticated user found")
    return []
  }

  // Get the channel IDs from the database
  const { data, error } = await supabase
    .from("channels")
    .select("channel_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Database error fetching subscribed channels:", error)
    throw new Error(
      error.message ?? "Failed to fetch subscribed channels. Please try again.",
    )
  }

  if (!data || data.length === 0) {
    console.log("No subscribed channels found for user")
    return []
  }

  // Extract channel IDs
  const channelIds = data.map((channel) => channel.channel_id)

  if (channelIds.length === 0) {
    console.log("No channel IDs to process")
    return []
  }

  try {
    // Fetch all channel details in a single batch request
    const batchChannels = await getBatchChannelDetails(channelIds)

    // Mark all channels as subscribed
    const channels = batchChannels.map((channel) => ({
      ...channel,
      isSubscribed: true,
    }))

    return channels
  } catch (error) {
    console.error(
      "Failed to fetch batch channel details, falling back to individual requests:",
      error,
    )

    // Fallback to individual requests if batch fails
    const channelPromises = data.map(async (channel) => {
      try {
        console.log(`Fetching details for channel ${channel.channel_id}`)
        const channelDetails = await getChannelDetails(channel.channel_id)
        console.log(
          `Successfully fetched details for ${channel.channel_id}:`,
          channelDetails,
        )
        return {
          ...channelDetails,
          isSubscribed: true,
        }
      } catch (error) {
        console.error(
          `Failed to fetch details for channel ${channel.channel_id}:`,
          error,
        )
        // Return a basic channel object even if API call fails
        return {
          channelId: channel.channel_id,
          channelTitle: "Unknown Channel",
          channelThumbnailUrl: "",
          videoCount: 0,
          isSubscribed: true,
        }
      }
    })

    const channels = await Promise.all(channelPromises)

    return channels
  }
}

/**
 * Check if a channel is subscribed by the current user
 */
export const isChannelSubscribed = async (
  channelId: string,
): Promise<boolean> => {
  const data = await makeAuthenticatedRequest<{
    isSubscribed: boolean
  }>(`user-subscriptions/${encodeURIComponent(channelId)}`, {
    method: "GET",
  })

  return data?.isSubscribed ?? false
}

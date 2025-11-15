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
  isSubscribed?: boolean
}

export type ChannelVideo = {
  videoId: string
  title: string
  thumbnails: string
  publishedAt: string
  hasSummary: boolean
}

export type YouTubeSearchResult = {
  channelId: string
  channelTitle: string
  description: string
  liveBroadcastContent: string
  publishTime: string
  publishedAt: string
  thumbnails: string
  title: string
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
    body: { query },
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
export const subscribeToChannel = async (
  channelId: string,
  channelTitle: string,
  channelThumbnailUrl: string,
): Promise<void> => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    console.error("No session found when trying to subscribe to channel")
    throw new Error("You must be logged in to subscribe to channels.")
  }

  console.log("Session found, user ID:", session.user.id)
  console.log("Access token present:", session.access_token ? "Yes" : "No")

  const { data, error } = await supabase.functions.invoke(
    "youtube-push-subscribe",
    {
      body: { channelId, channelTitle, channelThumbnailUrl },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  )

  if (error) {
    console.error("YouTube push subscription error:", error)
    throw new Error(
      `Failed to subscribe to push notifications: ${error.message}`,
    )
  }

  console.log("YouTube push subscription successful:", data)
}

/**
 * Unsubscribe from a channel
 */
export const unsubscribeFromChannel = async (
  channelId: string,
): Promise<void> => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("You must be logged in to unsubscribe from channels.")
  }

  const { error } = await supabase
    .from("youtube_push_subscriptions")
    .delete()
    .eq("channel_id", channelId)
    .eq("user_id", session.user.id)

  if (error) {
    console.error("YouTube push unsubscription error:", error)
    throw new Error(
      `Failed to unsubscribe from push notifications: ${error.message}`,
    )
  }
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
    .from("youtube_push_subscriptions")
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

  // Get the channel subscriptions from the database
  const { data, error } = await supabase
    .from("youtube_push_subscriptions")
    .select("channel_id, channel_title, channel_thumbnail_url, created_at")
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

  // Convert to ChannelMetadata format
  const channels: ChannelMetadata[] = data.map((subscription) => ({
    channelId: subscription.channel_id,
    channelTitle: subscription.channel_title || "Unknown Channel",
    channelThumbnailUrl: subscription.channel_thumbnail_url || "",
    isSubscribed: true,
  }))

  return channels
}

/**
 * Check if a channel is subscribed by the current user
 */
export const isChannelSubscribed = async (
  channelId: string,
): Promise<boolean> => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return false
  }

  const { data, error } = await supabase
    .from("youtube_push_subscriptions")
    .select("id")
    .eq("channel_id", channelId)
    .eq("user_id", session.user.id)
    .single()

  if (error) {
    console.error("Error checking push subscription status:", error)
    return false
  }

  return !!data
}

/**
 * Fetch YouTube channel details directly from YouTube API
 */
export const getYouTubeChannelDetails = async (
  channelId: string,
): Promise<{
  channelId: string
  channelName: string
  videoCount: number
  thumbnails: string
  description: string
  subscriberCount: number
  customUrl: string
}> => {
  const { data, error } = await supabase.functions.invoke<{
    channelId: string
    channelName: string
    videoCount: number
    thumbnails: string
    description: string
    subscriberCount: number
    customUrl: string
  }>("youtube-channel-details", {
    body: { channelId },
  })

  if (error) {
    throw new Error(
      error.message
        ?? "Failed to fetch YouTube channel details. Please try again.",
    )
  }

  if (!data) {
    throw new Error("Failed to fetch YouTube channel details.")
  }

  return data
}

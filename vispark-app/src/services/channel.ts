import { supabase } from "@/config/supabaseClient.ts"

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
 * Search for channels by name using YouTube API
 */
export const searchChannels = async (
  query: string,
): Promise<YouTubeSearchResult[]> => {
  const youTubeApplicationProgrammingInterfaceKey = import.meta.env
    .VITE_YOUTUBE_API_KEY
  if (!youTubeApplicationProgrammingInterfaceKey) {
    throw new Error(
      "VITE_YOUTUBE_API_KEY is not set. Add it to your .env file to enable channel search.",
    )
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search")
  url.searchParams.set("part", "snippet")
  url.searchParams.set("q", query)
  url.searchParams.set("type", "channel")
  url.searchParams.set("key", youTubeApplicationProgrammingInterfaceKey)

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(
      `YouTube service error: ${response.status} ${response.statusText}`,
    )
  }

  const json = await response.json()
  return json.items ?? []
}

/**
 * Get channel details from our database or fetch from YouTube API
 */
export const getChannelDetails = async (
  channelId: string,
): Promise<ChannelMetadata> => {
  const { data, error } = await supabase.functions.invoke<{
    channel: ChannelMetadata
  }>("channel", {
    body: { channelId, action: "getDetails" },
  })

  if (error) {
    throw new Error(
      error.message ?? "Failed to fetch channel details. Please try again.",
    )
  }

  if (!data?.channel) {
    throw new Error("Unexpected response format from channel service.")
  }

  return data.channel
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

  const { data, error } = await supabase.functions.invoke<{
    channels: ChannelMetadata[]
  }>("channel", {
    body: { channelIds, action: "getBatchDetails" },
  })

  if (error) {
    throw new Error(
      error.message
        ?? "Failed to fetch batch channel details. Please try again.",
    )
  }

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
  const { data, error } = await supabase.functions.invoke<{
    videos: ChannelVideo[]
  }>("channel", {
    body: { channelId, action: "getVideosWithSummaries" },
  })

  if (error) {
    throw new Error(
      error.message ?? "Failed to fetch channel videos. Please try again.",
    )
  }

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
  const { data, error } = await supabase.functions.invoke<{
    videos: ChannelVideo[]
    nextPageToken?: string
  }>("channel", {
    body: { channelId, action: "getAllVideos", pageToken, maxResults },
  })

  if (error) {
    throw new Error(
      error.message ?? "Failed to fetch channel videos. Please try again.",
    )
  }

  if (!data?.videos) {
    throw new Error("Unexpected response format from channel service.")
  }

  return {
    videos: data.videos,
    nextPageToken: data.nextPageToken,
  }
}

/**
 * Update channel information in database
 */
export const updateChannelInfo = async (
  channelId: string,
): Promise<ChannelMetadata> => {
  const { data, error } = await supabase.functions.invoke<{
    channel: ChannelMetadata
  }>("channel", {
    body: { channelId, action: "updateInfo" },
  })

  if (error) {
    throw new Error(
      error.message ?? "Failed to update channel info. Please try again.",
    )
  }

  if (!data?.channel) {
    throw new Error("Unexpected response format from channel service.")
  }

  return data.channel
}

/**
 * Subscribe to a channel
 */
export const subscribeToChannel = async (channelId: string): Promise<void> => {
  const { error } = await supabase.functions.invoke<{
    message: string
  }>("channel", {
    body: { channelId, action: "subscribe" },
  })

  if (error) {
    throw new Error(
      error.message ?? "Failed to subscribe to channel. Please try again.",
    )
  }
}

/**
 * Unsubscribe from a channel
 */
export const unsubscribeFromChannel = async (
  channelId: string,
): Promise<void> => {
  const { error } = await supabase.functions.invoke<{
    message: string
  }>("channel", {
    body: { channelId, action: "unsubscribe" },
  })

  if (error) {
    throw new Error(
      error.message ?? "Failed to unsubscribe from channel. Please try again.",
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
    return []
  }

  // Get the channel IDs from the database
  const { data, error } = await supabase
    .from("channels")
    .select("channel_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      error.message ?? "Failed to fetch subscribed channels. Please try again.",
    )
  }

  if (!data || data.length === 0) {
    return []
  }

  console.log(
    "Found subscribed channel IDs:",
    data.map((c) => c.channel_id),
  )

  // Extract channel IDs
  const channelIds = data.map((channel) => channel.channel_id)

  if (channelIds.length === 0) {
    return []
  }

  console.log("Fetching batch details for subscribed channel IDs:", channelIds)

  try {
    // Fetch all channel details in a single batch request
    const batchChannels = await getBatchChannelDetails(channelIds)
    console.log("Successfully fetched batch channel details:", batchChannels)

    // Mark all channels as subscribed
    const channels = batchChannels.map((channel) => ({
      ...channel,
      isSubscribed: true,
    }))

    console.log("Final channels array:", channels)
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
    console.log("Final channels array (fallback):", channels)
    return channels
  }
}

/**
 * Check if a channel is subscribed by the current user
 */
export const isChannelSubscribed = async (
  channelId: string,
): Promise<boolean> => {
  const subscriptionStatus = await areChannelsSubscribed([channelId])
  return subscriptionStatus[channelId] ?? false
}

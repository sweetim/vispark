import { supabase } from "../config/supabaseClient"

export type VideoDetails = {
  videoId: string
  title: string
  description: string
  channelId: string
  channelTitle: string
  channelThumbnailUrl: string
  publishedAt: string
  duration: string
  viewCount: number
  likeCount: number
  commentCount: number
  thumbnails: {
    default: { url: string; width: number; height: number }
    medium: { url: string; width: number; height: number }
    high: { url: string; width: number; height: number }
    standard?: { url: string; width: number; height: number }
    maxres?: { url: string; width: number; height: number }
  }
  tags?: string[]
  categoryId: string
  defaultLanguage?: string
  defaultAudioLanguage?: string
  hasSummary?: boolean
}

export const getVideoDetails = async (
  videoId: string,
): Promise<VideoDetails> => {
  try {
    // Get the current session to ensure we have the JWT token
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.error("No session found when trying to get video details")
      throw new Error("You must be logged in to get video details.")
    }

    console.log("Session found, user ID:", session.user.id)
    console.log("Access token present:", session.access_token ? "Yes" : "No")

    const { data, error } = await supabase.functions.invoke("video-details", {
      body: { videoId, action: "getDetails" },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (error) {
      console.error("Video details error:", error)
      throw new Error(`Failed to get video details: ${error.message}`)
    }

    if (!data?.video) {
      throw new Error("No video data returned from the API")
    }

    console.log("Video details fetched successfully:", data.video)
    return data.video as VideoDetails
  } catch (err) {
    console.error("Video details fetch failed:", err)
    if (err instanceof Error) {
      throw err
    }
    throw new Error("An unexpected error occurred while fetching video details")
  }
}

export const getBatchVideoDetails = async (
  videoIds: string[],
): Promise<VideoDetails[]> => {
  try {
    // Get the current session to ensure we have the JWT token
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.error("No session found when trying to get batch video details")
      throw new Error("You must be logged in to get video details.")
    }

    console.log("Session found, user ID:", session.user.id)
    console.log("Access token present:", session.access_token ? "Yes" : "No")

    const { data, error } = await supabase.functions.invoke("video-details", {
      body: { videoIds, action: "getBatchDetails" },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (error) {
      console.error("Batch video details error:", error)
      throw new Error(`Failed to get batch video details: ${error.message}`)
    }

    if (!data?.videos || !Array.isArray(data.videos)) {
      throw new Error("No video data returned from the API")
    }

    console.log(
      `Batch video details fetched successfully: ${data.videos.length} videos`,
    )
    return data.videos as VideoDetails[]
  } catch (err) {
    console.error("Batch video details fetch failed:", err)
    if (err instanceof Error) {
      throw err
    }
    throw new Error(
      "An unexpected error occurred while fetching batch video details",
    )
  }
}

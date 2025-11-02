import { supabase } from "../config/supabaseClient"

export const subscribeToYouTubePush = async (channelId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "youtube-push-subscribe",
      {
        body: { channelId },
      },
    )

    if (error) {
      console.error("YouTube push subscription error:", error)
      throw new Error(
        `Failed to subscribe to push notifications: ${error.message}`,
      )
    }

    return data
  } catch (err) {
    console.error("YouTube push subscription failed:", err)
    if (err instanceof Error) {
      throw err
    }
    throw new Error(
      "An unexpected error occurred while subscribing to push notifications",
    )
  }
}

export const getVideoNotifications = async () => {
  const { data, error } = await supabase
    .from("video_notifications")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from("video_notifications")
    .update({ notification_sent: false })
    .eq("id", notificationId)

  if (error) {
    throw new Error(error.message)
  }
}

export const getPushSubscriptions = async () => {
  const { data, error } = await supabase
    .from("youtube_push_subscriptions")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const unsubscribeFromPushNotifications = async (channelId: string) => {
  try {
    const { error } = await supabase
      .from("youtube_push_subscriptions")
      .delete()
      .eq("channel_id", channelId)

    if (error) {
      console.error("YouTube push unsubscription error:", error)
      throw new Error(
        `Failed to unsubscribe from push notifications: ${error.message}`,
      )
    }
  } catch (err) {
    console.error("YouTube push unsubscription failed:", err)
    if (err instanceof Error) {
      throw err
    }
    throw new Error(
      "An unexpected error occurred while unsubscribing from push notifications",
    )
  }
}

export const isSubscribedToPushNotifications = async (
  channelId: string,
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("youtube_push_subscriptions")
    .select("id")
    .eq("channel_id", channelId)
    .single()

  if (error) {
    console.error("Error checking push subscription status:", error)
    return false
  }

  return !!data
}

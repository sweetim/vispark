import { supabase } from "../config/supabaseClient"

export const subscribeToYouTubePush = async (channelId: string) => {
  try {
    // Get the current session to ensure we have the JWT token
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.error(
        "No session found when trying to subscribe to push notifications",
      )
      throw new Error(
        "You must be logged in to subscribe to push notifications.",
      )
    }

    console.log("Session found, user ID:", session.user.id)
    console.log("Access token present:", session.access_token ? "Yes" : "No")

    const { data, error } = await supabase.functions.invoke(
      "youtube-push-subscribe",
      {
        body: { channelId },
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
  try {
    // Get the current session to ensure we have the JWT token
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("You must be logged in to view video notifications.")
    }

    const { data, error } = await supabase
      .from("video_notifications")
      .select("*")
      .eq("user_id", session.user.id) // Ensure we only get the current user's notifications
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (err) {
    console.error("Error getting video notifications:", err)
    if (err instanceof Error) {
      throw err
    }
    throw new Error(
      "An unexpected error occurred while fetching video notifications",
    )
  }
}

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    // Get the current session to ensure we have the JWT token
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("You must be logged in to mark notifications as read.")
    }

    const { error } = await supabase
      .from("video_notifications")
      .update({ notification_sent: false })
      .eq("id", notificationId)
      .eq("user_id", session.user.id) // Ensure users can only mark their own notifications as read

    if (error) {
      throw new Error(error.message)
    }
  } catch (err) {
    console.error("Error marking notification as read:", err)
    if (err instanceof Error) {
      throw err
    }
    throw new Error(
      "An unexpected error occurred while marking notification as read",
    )
  }
}

export const getPushSubscriptions = async () => {
  try {
    // Get the current session to ensure we have the JWT token
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("You must be logged in to view push subscriptions.")
    }

    const { data, error } = await supabase
      .from("youtube_push_subscriptions")
      .select("*")
      .eq("user_id", session.user.id) // Ensure we only get the current user's subscriptions
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (err) {
    console.error("Error getting push subscriptions:", err)
    if (err instanceof Error) {
      throw err
    }
    throw new Error(
      "An unexpected error occurred while fetching push subscriptions",
    )
  }
}

export const unsubscribeFromPushNotifications = async (channelId: string) => {
  try {
    // Get the current session to ensure we have the JWT token
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error(
        "You must be logged in to unsubscribe from push notifications.",
      )
    }

    const { error } = await supabase
      .from("youtube_push_subscriptions")
      .delete()
      .eq("channel_id", channelId)
      .eq("user_id", session.user.id) // Ensure user can only delete their own subscriptions

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
  try {
    // Get the current session to ensure we have the JWT token
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
      .eq("user_id", session.user.id) // Ensure we only check the current user's subscription
      .single()

    if (error) {
      console.error("Error checking push subscription status:", error)
      return false
    }

    return !!data
  } catch (err) {
    console.error("Error checking push subscription status:", err)
    return false
  }
}

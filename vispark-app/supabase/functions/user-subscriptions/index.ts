import {
  corsHeaders,
  respondWith,
  respondWithError,
  createSupabaseClient,
  handleOptionsRequest
} from "../shared/utils.ts"

// Subscribe to YouTube push notifications
const subscribeToPushNotifications = async (
  channelId: string,
  supabaseUrl: string,
  authToken: string,
): Promise<void> => {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/youtube-push-subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({ channelId }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`Failed to subscribe to push notifications for channel ${channelId}:`, errorData)
      throw new Error(`Push subscription failed: ${errorData.message || 'Unknown error'}`)
    }

    console.log(`Successfully subscribed to push notifications for channel ${channelId}`)
  } catch (error) {
    console.error(`Error subscribing to push notifications for channel ${channelId}:`, error)
    throw error
  }
}

// Unsubscribe from YouTube push notifications
const unsubscribeFromPushNotifications = async (
  channelId: string,
  supabaseUrl: string,
  authToken: string,
): Promise<void> => {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/youtube-push-unsubscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({ channelId }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`Failed to unsubscribe from push notifications for channel ${channelId}:`, errorData)
      throw new Error(`Push unsubscription failed: ${errorData.message || 'Unknown error'}`)
    }

    console.log(`Successfully unsubscribed from push notifications for channel ${channelId}`)
  } catch (error) {
    console.error(`Error unsubscribing from push notifications for channel ${channelId}:`, error)
    throw error
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const optionsResponse = handleOptionsRequest(req)
  if (optionsResponse) {
    return optionsResponse
  }

  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')

  // Extract channel ID from URL path for GET and DELETE requests
  // For POST requests, channel ID will be in the request body
  const channelIdFromPath = pathParts[pathParts.length - 1]
  const isSpecificChannelRequest = channelIdFromPath && channelIdFromPath !== 'user-subscriptions'

  try {
    const supabase = createSupabaseClient(req)
    const authHeader = req.headers.get("Authorization") ?? ""
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      if (req.method === "GET" && isSpecificChannelRequest) {
        // For checking subscription status, return false instead of error
        return respondWith({ isSubscribed: false }, 200)
      }
      return respondWithError(
        "Unauthorized",
        "You must be logged in to manage subscriptions.",
        401
      )
    }

    switch (req.method) {
      case "POST": {
        // Subscribe to a channel
        let payload: any
        try {
          payload = await req.json()
        } catch {
          return respondWithError(
            "Invalid JSON",
            "Request body must be valid JSON.",
            400
          )
        }

        const { channelId } = payload ?? {}

        if (!channelId || typeof channelId !== "string" || channelId.trim().length === 0) {
          return respondWithError(
            "Missing Channel ID",
            "The request body must include a non-empty channelId.",
            400
          )
        }

        // Add subscription
        const { error } = await supabase.from("channels").upsert({
          channel_id: channelId,
          user_id: user.id,
        })

        if (error) {
          return respondWithError(
            "Subscription failed",
            error.message,
            400
          )
        }

        // Automatically subscribe to push notifications
        try {
          await subscribeToPushNotifications(channelId, supabaseUrl, authHeader)
        } catch (pushError) {
          console.error("Failed to subscribe to push notifications:", pushError)
          // Don't fail the main subscription if push subscription fails
        }

        return respondWith({ message: "Subscribed successfully" }, 200)
      }

      case "DELETE": {
        // Unsubscribe from a channel
        if (!isSpecificChannelRequest || !channelIdFromPath) {
          return respondWithError(
            "Missing Channel ID",
            "Channel ID is required in the URL path for DELETE requests.",
            400
          )
        }

        // Remove subscription
        const { error } = await supabase
          .from("channels")
          .delete()
          .eq("channel_id", channelIdFromPath)
          .eq("user_id", user.id)

        if (error) {
          return respondWithError(
            "Unsubscribe failed",
            error.message,
            400
          )
        }

        // Also unsubscribe from push notifications
        try {
          await unsubscribeFromPushNotifications(channelIdFromPath, supabaseUrl, authHeader)
        } catch (pushError) {
          console.error("Failed to unsubscribe from push notifications:", pushError)
          // Don't fail the main unsubscription if push unsubscription fails
        }

        return respondWith({ message: "Unsubscribed successfully" }, 200)
      }

      case "GET": {
        if (!isSpecificChannelRequest || !channelIdFromPath) {
          return respondWithError(
            "Missing Channel ID",
            "Channel ID is required in the URL path for GET requests.",
            400
          )
        }

        // Check if subscription exists
        const { data, error } = await supabase
          .from("channels")
          .select("id")
          .eq("channel_id", channelIdFromPath)
          .eq("user_id", user.id)
          .single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "not found" error
          return respondWithError(
            "Check subscription failed",
            error.message,
            400
          )
        }

        return respondWith({ isSubscribed: !!data }, 200)
      }

      default:
        return respondWithError(
          "Method Not Allowed",
          "Only GET, POST, and DELETE methods are supported.",
          405
        )
    }
  } catch (error) {
    console.error("User subscriptions function error:", error)
    return respondWithError(
      "Internal Server Error",
      error instanceof Error ? error.message : "An unknown error occurred.",
      500
    )
  }
})

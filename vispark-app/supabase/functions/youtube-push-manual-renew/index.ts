import { createClient } from "supabase"

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

const jsonHeaders: Record<string, string> = {
  "Content-Type": "application/json",
}

const buildHeaders = (): HeadersInit => ({
  ...corsHeaders,
  ...jsonHeaders,
})

type ManualRenewRequestPayload = {
  subscriptionId?: string
  channelId?: string
}

type ManualRenewSuccessResponse = {
  success: true
  message: string
  subscriptionId: string
  newExpiresAt: string
}

type ManualRenewErrorResponse = {
  success: false
  error: string
  message: string
}

type ResponseBody = ManualRenewSuccessResponse | ManualRenewErrorResponse

const respondWith = (body: ResponseBody, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(),
  })

// Generate a secure random secret for HMAC verification
const generateHubSecret = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Subscribe to YouTube push notifications via PubSubHubbub
const subscribeToYouTubePush = async (
  channelId: string,
  callbackUrl: string,
  hubUrl: string,
  leaseSeconds: number,
): Promise<{ subscriptionId: string; expiresAt: string; hubSecret: string }> => {
  const topicUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  const hubSecret = generateHubSecret()

  const formData = new FormData()
  formData.append('hub.mode', 'subscribe')
  formData.append('hub.callback', callbackUrl)
  formData.append('hub.topic', topicUrl)
  formData.append('hub.secret', hubSecret)
  formData.append('hub.lease_seconds', leaseSeconds.toString())

  const response = await fetch(hubUrl, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`YouTube push subscription failed: ${response.status} ${errorText}`)
  }

  const expiresAt = new Date(Date.now() + (leaseSeconds * 1000)).toISOString()

  return {
    subscriptionId: `${channelId}-${Date.now()}`,
    expiresAt,
    hubSecret,
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return respondWith(
      {
        success: false,
        error: "Method Not Allowed",
        message: "Only POST is supported.",
      },
      405,
    )
  }

  // Parse and validate payload
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return respondWith(
      {
        success: false,
        error: "Invalid JSON",
        message: "Request body must be valid JSON.",
      },
      400,
    )
  }

  const { subscriptionId, channelId } = (payload ?? {}) as Partial<ManualRenewRequestPayload>

  if (!subscriptionId && !channelId) {
    return respondWith(
      {
        success: false,
        error: "Missing fields",
        message: "The request body must include either subscriptionId or channelId.",
      },
      400,
    )
  }

  // Get environment variables
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
  const callbackUrl = Deno.env.get("YOUTUBE_PUSH_CALLBACK_URL")
  const hubUrl = Deno.env.get("YOUTUBE_PUSH_HUB_URL")
  const leaseSeconds = parseInt(Deno.env.get("YOUTUBE_PUSH_LEASE_SECONDS") || "864000")

  if (!supabaseUrl || !supabaseAnonKey) {
    return respondWith(
      {
        success: false,
        error: "Server misconfiguration",
        message: "SUPABASE_URL or SUPABASE_ANON_KEY is not set.",
      },
      500,
    )
  }

  if (!callbackUrl || !hubUrl) {
    return respondWith(
      {
        success: false,
        error: "Server misconfiguration",
        message: "YOUTUBE_PUSH_CALLBACK_URL or YOUTUBE_PUSH_HUB_URL is not set.",
      },
      500,
    )
  }

  // Forward the caller's JWT so RLS applies
  const authHeader = req.headers.get("Authorization") ?? ""
  console.log("Auth header present:", authHeader.length > 0 ? "Yes" : "No")

  // Extract the JWT token from the Authorization header
  const jwtToken = authHeader.replace(/^Bearer\s+/, "")
  console.log("JWT token extracted:", jwtToken.length > 0 ? "Yes" : "No")

  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          Authorization: authHeader
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
    }
  )

  try {
    // Get the current user using the JWT token
    let user
    let error

    if (jwtToken) {
      // If we have a JWT token, use it to get the user
      const { data: userData, error: userError } = await supabase.auth.getUser(jwtToken)
      user = userData.user
      error = userError
    } else {
      // Fallback to the default method
      const { data: userData, error: userError } = await supabase.auth.getUser()
      user = userData.user
      error = userError
    }

    if (error) {
      console.error("Error getting user:", error)
      return respondWith(
        {
          success: false,
          error: "Authentication error",
          message: `Failed to authenticate: ${error.message}`,
        },
        401,
      )
    }

    if (!user) {
      console.log("No user found in auth check")
      return respondWith(
        {
          success: false,
          error: "Unauthorized",
          message: "You must be logged in to renew subscriptions.",
        },
        401,
      )
    }

    console.log("User authenticated successfully:", user.id)

    // Get the subscription to renew
    let subscription
    if (subscriptionId) {
      const { data: subData, error: subError } = await supabase
        .from("youtube_push_subscriptions")
        .select("*")
        .eq("id", subscriptionId)
        .eq("user_id", user.id)
        .single()

      if (subError || !subData) {
        return respondWith(
          {
            success: false,
            error: "Not found",
            message: "Subscription not found or you don't have permission to renew it.",
          },
          404,
        )
      }
      subscription = subData
    } else if (channelId) {
      const { data: subData, error: subError } = await supabase
        .from("youtube_push_subscriptions")
        .select("*")
        .eq("channel_id", channelId)
        .eq("user_id", user.id)
        .single()

      if (subError || !subData) {
        return respondWith(
          {
            success: false,
            error: "Not found",
            message: "Subscription not found or you don't have permission to renew it.",
          },
          404,
        )
      }
      subscription = subData
    }

    console.log(`Manual renewal requested for subscription ${subscription.id}, channel ${subscription.channel_id}`)

    // Mark as renewing
    const { error: updateError } = await supabase
      .from("youtube_push_subscriptions")
      .update({
        status: 'renewing',
        last_retry_at: new Date().toISOString(),
      })
      .eq("id", subscription.id)

    if (updateError) {
      console.error("Failed to update subscription status:", updateError)
      return respondWith(
        {
          success: false,
          error: "Database error",
          message: updateError.message,
        },
        500,
      )
    }

    // Attempt to renew the subscription
    const { subscriptionId: newSubscriptionId, expiresAt, hubSecret } = await subscribeToYouTubePush(
      subscription.channel_id,
      callbackUrl,
      hubUrl,
      leaseSeconds,
    )

    // Update subscription with new details
    const { error: finalUpdateError } = await supabase
      .from("youtube_push_subscriptions")
      .update({
        subscription_id: newSubscriptionId,
        hub_secret: hubSecret,
        lease_seconds: leaseSeconds,
        expires_at: expiresAt,
        status: 'active',
        retry_count: 0,
        renewal_error: null,
        last_retry_at: new Date().toISOString(),
      })
      .eq("id", subscription.id)

    if (finalUpdateError) {
      console.error("Failed to update subscription with new details:", finalUpdateError)
      return respondWith(
        {
          success: false,
          error: "Database error",
          message: finalUpdateError.message,
        },
        500,
      )
    }

    console.log(`Successfully renewed subscription ${subscription.id}`)

    return respondWith(
      {
        success: true,
        message: "Subscription renewed successfully",
        subscriptionId: subscription.id,
        newExpiresAt: expiresAt,
      },
      200,
    )
  } catch (error) {
    console.error("Manual YouTube subscription renewal error:", error)

    // Update subscription with error information
    if (subscriptionId || channelId) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      await supabase
        .from("youtube_push_subscriptions")
        .update({
          status: 'failed',
          retry_count: 3, // Mark as failed since this is a manual attempt
          renewal_error: errorMessage,
          last_retry_at: new Date().toISOString(),
        })
        .eq(subscriptionId ? "id" : "channel_id", subscriptionId || channelId)
    }

    return respondWith(
      {
        success: false,
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "An unknown error occurred.",
      },
      500,
    )
  }
})

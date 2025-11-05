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

type PushSubscribeRequestPayload = {
  channelId: string
}

type PushSubscribeSuccessResponse = {
  success: true
  subscriptionId: string
  leaseSeconds: number
  expiresAt: string
}

type PushSubscribeErrorResponse = {
  success: false
  error: string
  message: string
}

type ResponseBody = PushSubscribeSuccessResponse | PushSubscribeErrorResponse

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
  console.log(formData)
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

  const { channelId } = (payload ?? {}) as Partial<PushSubscribeRequestPayload>

  if (typeof channelId !== "string" || channelId.trim().length === 0) {
    return respondWith(
      {
        success: false,
        error: "Missing fields",
        message: "The request body must include a non-empty channelId.",
      },
      400,
    )
  }

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
          message: "You must be logged in to subscribe to push notifications.",
        },
        401,
      )
    }

    console.log("User authenticated successfully:", user.id)

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from("youtube_push_subscriptions")
      .select("id")
      .eq("channel_id", channelId)
      .eq("user_id", user.id)
      .single()

    if (existingSubscription) {
      return respondWith(
        {
          success: false,
          error: "Already subscribed",
          message: "You are already subscribed to push notifications for this channel.",
        },
        400,
      )
    }

    // Subscribe to YouTube push notifications
    const { subscriptionId, expiresAt, hubSecret } = await subscribeToYouTubePush(
      channelId,
      callbackUrl,
      hubUrl,
      leaseSeconds,
    )

    // Store subscription in database with the same hubSecret used for YouTube subscription
    const { error: insertError } = await supabase
      .from("youtube_push_subscriptions")
      .insert({
        channel_id: channelId,
        user_id: user.id,
        subscription_id: subscriptionId,
        hub_secret: hubSecret,
        lease_seconds: leaseSeconds,
        expires_at: expiresAt,
      })

    if (insertError) {
      return respondWith(
        {
          success: false,
          error: "Database error",
          message: insertError.message,
        },
        500,
      )
    }

    return respondWith(
      {
        success: true,
        subscriptionId,
        leaseSeconds,
        expiresAt,
      },
      200,
    )
  } catch (error) {
    console.error("YouTube push subscribe error:", error)
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

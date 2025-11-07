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

type RenewalSuccessResponse = {
  success: true
  message: string
  renewedCount: number
  failedCount: number
}

type RenewalErrorResponse = {
  success: false
  error: string
  message: string
}

type ResponseBody = RenewalSuccessResponse | RenewalErrorResponse

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

// Update subscription in database
const updateSubscription = async (
  supabase: any,
  subscriptionId: string,
  updates: Record<string, any>
): Promise<boolean> => {
  const { error } = await supabase
    .from("youtube_push_subscriptions")
    .update(updates)
    .eq("id", subscriptionId)

  if (error) {
    console.error(`Failed to update subscription ${subscriptionId}:`, error)
    return false
  }
  return true
}

// Process a single subscription renewal
const processSubscriptionRenewal = async (
  subscription: any,
  supabase: any,
  callbackUrl: string,
  hubUrl: string,
  leaseSeconds: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Processing renewal for subscription ${subscription.id}, channel ${subscription.channel_id}`)

    // Mark as renewing
    await updateSubscription(supabase, subscription.id, {
      status: 'renewing',
      last_retry_at: new Date().toISOString(),
    })

    // Attempt to renew the subscription
    const { subscriptionId: newSubscriptionId, expiresAt, hubSecret } = await subscribeToYouTubePush(
      subscription.channel_id,
      callbackUrl,
      hubUrl,
      leaseSeconds,
    )

    // Update subscription with new details
    const success = await updateSubscription(supabase, subscription.id, {
      subscription_id: newSubscriptionId,
      hub_secret: hubSecret,
      lease_seconds: leaseSeconds,
      expires_at: expiresAt,
      status: 'active',
      retry_count: 0,
      renewal_error: null,
      last_retry_at: new Date().toISOString(),
    })

    if (success) {
      console.log(`Successfully renewed subscription ${subscription.id}`)
      return { success: true }
    } else {
      throw new Error("Failed to update subscription in database")
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`Failed to renew subscription ${subscription.id}:`, errorMessage)

    // Update subscription with error information
    const newRetryCount = subscription.retry_count + 1
    const isFinalFailure = newRetryCount >= 3

    await updateSubscription(supabase, subscription.id, {
      status: isFinalFailure ? 'failed' : 'expiring',
      retry_count: newRetryCount,
      renewal_error: errorMessage,
      last_retry_at: new Date().toISOString(),
    })

    return {
      success: false,
      error: errorMessage
    }
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

  // Get environment variables
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceRoleKey = Deno.env.get("NEW_SUPABASE_SERVICE_ROLE_KEY")
  const callbackUrl = Deno.env.get("YOUTUBE_PUSH_CALLBACK_URL")
  const hubUrl = Deno.env.get("YOUTUBE_PUSH_HUB_URL")
  const leaseSeconds = parseInt(Deno.env.get("YOUTUBE_PUSH_LEASE_SECONDS") || "864000")

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return respondWith(
      {
        success: false,
        error: "Server misconfiguration",
        message: "SUPABASE_URL or NEW_SUPABASE_SERVICE_ROLE_KEY is not set.",
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

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  try {
    console.log("Starting YouTube subscription renewal process")

    // Get subscriptions that need renewal
    const { data: subscriptions, error: fetchError } = await supabase
      .rpc('get_subscriptions_needing_renewal')

    if (fetchError) {
      console.error("Error fetching subscriptions for renewal:", fetchError)
      return respondWith(
        {
          success: false,
          error: "Database error",
          message: fetchError.message,
        },
        500,
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No subscriptions need renewal")
      return respondWith(
        {
          success: true,
          message: "No subscriptions need renewal",
          renewedCount: 0,
          failedCount: 0,
        },
        200,
      )
    }

    console.log(`Found ${subscriptions.length} subscriptions to process`)

    let renewedCount = 0
    let failedCount = 0

    // Process each subscription
    for (const subscription of subscriptions) {
      const result = await processSubscriptionRenewal(
        subscription,
        supabase,
        callbackUrl,
        hubUrl,
        leaseSeconds
      )

      if (result.success) {
        renewedCount++
      } else {
        failedCount++
      }
    }

    console.log(`Renewal process completed: ${renewedCount} renewed, ${failedCount} failed`)

    return respondWith(
      {
        success: true,
        message: `Renewal process completed: ${renewedCount} renewed, ${failedCount} failed`,
        renewedCount,
        failedCount,
      },
      200,
    )
  } catch (error) {
    console.error("YouTube subscription renewal error:", error)
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

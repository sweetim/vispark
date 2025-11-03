import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import type { Database } from "../types/database.ts"

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

type PushUnsubscribeRequestPayload = {
  channelId: string
}

type PushUnsubscribeSuccessResponse = {
  success: true
  message: string
}

type PushUnsubscribeErrorResponse = {
  success: false
  error: string
  message: string
}

type ResponseBody = PushUnsubscribeSuccessResponse | PushUnsubscribeErrorResponse

const respondWith = (body: ResponseBody, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(),
  })

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

  const { channelId } = (payload ?? {}) as Partial<PushUnsubscribeRequestPayload>

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
          message: "You must be logged in to unsubscribe from push notifications.",
        },
        401,
      )
    }

    console.log("User authenticated successfully:", user.id)

    // Delete subscription from database
    const { error: deleteError } = await supabase
      .from("youtube_push_subscriptions")
      .delete()
      .eq("channel_id", channelId)
      .eq("user_id", user.id)

    if (deleteError) {
      return respondWith(
        {
          success: false,
          error: "Database error",
          message: deleteError.message,
        },
        500,
      )
    }

    return respondWith(
      {
        success: true,
        message: "Successfully unsubscribed from push notifications",
      },
      200,
    )
  } catch (error) {
    console.error("YouTube push unsubscribe error:", error)
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

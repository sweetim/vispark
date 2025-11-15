import { createClient } from "supabase"
import type { Database } from "../types/database.ts"

// CORS headers for all functions
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

// JSON headers for all functions
export const jsonHeaders: Record<string, string> = {
  "Content-Type": "application/json",
}

// Build headers with CORS and JSON
export const buildHeaders = (): HeadersInit => ({
  ...corsHeaders,
  ...jsonHeaders,
})

// Standard response function
export const respondWith = (
  body: Record<string, unknown>,
  status: number
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(),
  })

// Standard error response
export const respondWithError = (
  error: string,
  message: string,
  status: number = 400
): Response =>
  respondWith(
    {
      error,
      message,
    },
    status
  )

// Create Supabase client with forwarded auth
export const createSupabaseClient = (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY is not set")
  }

  // Forward the caller's JWT so RLS applies
  const authHeader = req.headers.get("Authorization") ?? ""

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// Get YouTube API key from environment
export const getYoutubeApiKey = (): string => {
  const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY")

  if (!youtubeApiKey) {
    throw new Error("YOUTUBE_API_KEY is not set")
  }

  return youtubeApiKey
}

// Handle OPTIONS requests for CORS
export const handleOptionsRequest = (req: Request): Response | null => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }
  return null
}

// Validate required environment variables
export const validateEnvironment = (): void => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
  const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY")

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "SUPABASE_URL or SUPABASE_ANON_KEY is not set. Configure them in your environment before calling this function."
    )
  }

  if (!youtubeApiKey) {
    throw new Error(
      "YOUTUBE_API_KEY is not set. Configure it in your environment before calling this function."
    )
  }
}

// @ts-expect-error: deno runtime import
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const jsonHeaders: Record<string, string> = {
  "Content-Type": "application/json",
}

const buildHeaders = (): HeadersInit => ({
  ...corsHeaders,
  ...jsonHeaders,
})

type VisparkRequestPayload = {
  videoId: string
  summaries: string[]
  // createdTime can be provided by client but will be ignored in favor of server time
  createdTime?: string
}

type VisparkInsert = {
  user_id: string
  video_id: string
  summaries: unknown
  created_at: string
}

type VisparkSuccessResponse = {
  id: string
  videoId: string
  summaries: string[]
  createdTime: string
}

type VisparkErrorResponse = {
  error: string
  message: string
}

type ResponseBody = VisparkSuccessResponse | VisparkErrorResponse

const respondWith = (body: ResponseBody, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(),
  })

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return respondWith(
      {
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
        error: "Invalid JSON",
        message: "Request body must be valid JSON.",
      },
      400,
    )
  }

  const { videoId, summaries } = (payload ?? {}) as Partial<VisparkRequestPayload>

  if (typeof videoId !== "string" || videoId.trim().length === 0) {
    return respondWith(
      {
        error: "Missing fields",
        message: "The request body must include a non-empty videoId.",
      },
      400,
    )
  }

  if (!Array.isArray(summaries) || summaries.some((s) => typeof s !== "string")) {
    return respondWith(
      {
        error: "Invalid fields",
        message: "The request body must include summaries as an array of strings.",
      },
      400,
    )
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")

  if (!supabaseUrl || !supabaseAnonKey) {
    return respondWith(
      {
        error: "Server misconfiguration",
        message:
          "SUPABASE_URL or SUPABASE_ANON_KEY is not set. Configure them in your environment before calling this function.",
      },
      500,
    )
  }

  // Forward the caller's JWT so RLS applies and we can read user identity
  const authHeader = req.headers.get("Authorization") ?? ""
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return respondWith(
      {
        error: "Unauthorized",
        message: "You must be signed in to save a vispark.",
      },
      401,
    )
  }

  const nowIso = new Date().toISOString()

  const record: VisparkInsert = {
    user_id: user.id,
    video_id: videoId.trim(),
    summaries,
    created_at: nowIso,
  }

  // Insert row into visparks table; expects columns:
  //   id uuid default uuid_generate_v4() or gen_random_uuid()
  //   user_id uuid (RLS-enabled)
  //   video_id text
  //   summaries jsonb
  //   created_at timestamptz default now()
  const { data: inserted, error: insertError } = await supabase
    .from("visparks")
    .insert(record)
    .select("id, video_id, summaries, created_at")
    .single()

  if (insertError || !inserted) {
    console.error("Failed to insert vispark:", insertError)
    return respondWith(
      {
        error: "Persist failed",
        message:
          insertError?.message ??
          "Unable to save vispark. Ensure the 'visparks' table exists and RLS policies allow inserts for the authenticated user.",
      },
      502,
    )
  }

  return respondWith(
    {
      id: String((inserted as any).id),
      videoId: String((inserted as any).video_id),
      summaries: (inserted as any).summaries as string[],
      createdTime: String((inserted as any).created_at),
    },
    200,
  )
})

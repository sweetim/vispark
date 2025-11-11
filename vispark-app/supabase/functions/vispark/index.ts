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

type VisparkRequestPayload = {
  videoId: string
  videoChannelId?: string
  summaries: string[]
  // createdTime can be provided by client but will be ignored in favor of server time
  createdTime?: string
  // Video metadata to store
  videoMetadata?: {
    title?: string
    description?: string
    channelTitle?: string
    thumbnails?: any
    publishedAt?: string
    duration?: string
    defaultLanguage?: string
  }
}

type VisparkInsert = {
  user_id: string
  video_id: string
  video_channel_id?: string
  summaries: string[]
  created_at: string
  video_title?: string
  video_description?: string
  video_channel_title?: string
  video_thumbnails?: any
  video_published_at?: string
  video_duration?: string
  video_default_language?: string
}

type InsertedVispark = {
  id: string
  video_id: string
  video_channel_id?: string
  summaries: string[]
  created_at: string
}

type VisparkSuccessResponse = {
  id: string
  videoId: string
  videoChannelId?: string
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

Deno.serve(async (req: Request): Promise<Response> => {
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

  const { videoId, videoChannelId, summaries, videoMetadata } = (payload
    ?? {}) as Partial<VisparkRequestPayload>

  if (typeof videoId !== "string" || videoId.trim().length === 0) {
    return respondWith(
      {
        error: "Missing fields",
        message: "The request body must include a non-empty videoId.",
      },
      400,
    )
  }

  if (
    !Array.isArray(summaries)
    || summaries.some((s) => typeof s !== "string")
  ) {
    return respondWith(
      {
        error: "Invalid fields",
        message:
          "The request body must include summaries as an array of strings.",
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
    video_channel_id: videoChannelId?.trim(),
    summaries,
    created_at: nowIso,
    video_title: videoMetadata?.title,
    video_description: videoMetadata?.description,
    video_channel_title: videoMetadata?.channelTitle,
    video_thumbnails: videoMetadata?.thumbnails,
    video_published_at: videoMetadata?.publishedAt,
    video_duration: videoMetadata?.duration,
    video_default_language: videoMetadata?.defaultLanguage,
  }

  // Insert row into visparks table; expects columns:
  //   id uuid default uuid_generate_v4() or gen_random_uuid()
  //   user_id uuid (RLS-enabled)
  //   video_id text
  //   video_channel_id text (optional)
  //   summaries jsonb
  //   created_at timestamptz default now()
  const { data: inserted, error: insertError } = await supabase
    .from("visparks")
    .insert(record)
    .select("id, video_id, video_channel_id, summaries, created_at, video_title, video_description, video_channel_title, video_thumbnails, video_published_at, video_duration, video_default_language")
    .single()

  if (insertError || !inserted) {
    console.error("Failed to insert vispark:", insertError)
    return respondWith(
      {
        error: "Persist failed",
        message:
          insertError?.message
          ?? "Unable to save vispark. Ensure the 'visparks' table exists and RLS policies allow inserts for the authenticated user.",
      },
      502,
    )
  }

  return respondWith(
    {
      id: String((inserted as InsertedVispark).id),
      videoId: String((inserted as InsertedVispark).video_id),
      videoChannelId: (inserted as InsertedVispark).video_channel_id,
      summaries: (inserted as InsertedVispark).summaries,
      createdTime: String((inserted as InsertedVispark).created_at),
    },
    200,
  )
})

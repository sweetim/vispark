// @ts-expect-error: deno runtime import
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

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

type SummaryRequestPayload = {
  youtubeId?: string
  userId?: string
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method Not Allowed",
        message: "Only POST is supported.",
      }),
      {
        status: 405,
        headers: buildHeaders(),
      },
    )
  }

  let payload: SummaryRequestPayload
  try {
    payload = await req.json()
  } catch {
    return new Response(
      JSON.stringify({
        error: "Invalid JSON",
        message: "Request body must be valid JSON.",
      }),
      {
        status: 400,
        headers: buildHeaders(),
      },
    )
  }

  const youtubeId = payload?.youtubeId?.trim()
  const userId = payload?.userId?.trim()

  if (!youtubeId || !userId) {
    return new Response(
      JSON.stringify({
        error: "Missing fields",
        message: "Both youtubeId and userId are required.",
      }),
      {
        status: 400,
        headers: buildHeaders(),
      },
    )
  }

  // TODO: implement summary-generation logic for the provided YouTube video.
  const response = {
    data: {
      youtubeId,
      userId,
      summaryStatus: "pending",
    },
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: buildHeaders(),
  })
})

s

import { Supadata } from "npm:@supadata/js"
import { match, P } from "npm:ts-pattern@5.8.0"
import { fetchTranscript } from "npm:youtube-transcript-plus@1.1.1"

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

type TranscriptRequestPayload = {
  videoId: string
  lang?: string
  local?: boolean
}

type TranscriptSegment = {
  text: string
  duration: number
  offset: number
  lang?: string
}

type TranscriptSuccessResponse = {
  videoId: string
  transcript: TranscriptSegment[]
  lang?: string
}

type TranscriptErrorResponse = {
  error: string
  message: string
}

type TranscriptResponseBody =
  | TranscriptSuccessResponse
  | TranscriptErrorResponse

const respondWith = (body: TranscriptResponseBody, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(),
  })

type JsonParseOutcome = { type: "success"; value: unknown } | { type: "error" }

const handlePost = async (req: Request): Promise<Response> => {
  const jsonOutcome: JsonParseOutcome = await (async () => {
    try {
      const value = await req.json()
      return { type: "success", value }
    } catch {
      return { type: "error" }
    }
  })()

  return match(jsonOutcome)
    .with({ type: "error" }, async () =>
      respondWith(
        {
          error: "Invalid JSON",
          message: "Request body must be valid JSON.",
        },
        400,
      ),
    )
    .with({ type: "success" }, ({ value }) =>
      match(value)
        .with(
          {
            videoId: P.string,
            lang: P.optional(P.string),
            local: P.optional(P.boolean),
          },
          async ({ videoId, lang, local }: TranscriptRequestPayload) => {
            const trimmedVideoId = videoId.trim()

            if (trimmedVideoId.length === 0) {
              return respondWith(
                {
                  error: "Missing fields",
                  message: "The request body must include a non-empty videoId.",
                },
                400,
              )
            }

            const normalizedLang =
              typeof lang === "string" && lang.trim().length > 0
                ? lang.trim()
                : undefined

            try {
              // Use youtube-transcript-plus when local is true
              if (local) {
                const transcriptResponse = await fetchTranscript(
                  trimmedVideoId,
                  {
                    lang: normalizedLang,
                  },
                )

                // Convert youtube-transcript-plus response to match our expected format
                // youtube-transcript-plus returns Array<{text, duration, offset, lang}>
                const transcript = Array.isArray(transcriptResponse)
                  ? transcriptResponse.map(
                      (segment: {
                        text: string
                        duration: number
                        offset: number
                        lang?: string
                      }) => ({
                        text: segment.text,
                        duration: segment.duration,
                        offset: segment.offset,
                        lang: segment.lang || normalizedLang,
                      }),
                    )
                  : []

                const successResponse: TranscriptSuccessResponse = {
                  videoId: trimmedVideoId,
                  transcript,
                  ...(normalizedLang ? { lang: normalizedLang } : {}),
                }

                return respondWith(successResponse, 200)
              } else {
                // Use Supadata for non-local requests
                const supadata = new Supadata({
                  apiKey: Deno.env.get("SUPADATA_API_KEY") || "",
                })

                const transcriptResponse = await supadata.youtube.transcript({
                  videoId: trimmedVideoId,
                  lang: normalizedLang,
                })

                // Convert Supadata response to match our expected format
                // Supadata returns { lang: string, content: Array<{text, offset, duration, lang}> }
                const transcript = (
                  Array.isArray(transcriptResponse.content)
                    ? transcriptResponse.content
                    : []
                ).map(
                  (segment: {
                    text: string
                    duration: number
                    offset: number
                    lang?: string
                  }) => ({
                    text: segment.text,
                    duration: segment.duration,
                    offset: segment.offset,
                    lang: segment.lang || normalizedLang,
                  }),
                )

                const successResponse: TranscriptSuccessResponse = {
                  videoId: trimmedVideoId,
                  transcript,
                  ...(normalizedLang ? { lang: normalizedLang } : {}),
                }

                return respondWith(successResponse, 200)
              }
            } catch (error) {
              console.error("Failed to fetch transcript:", error)

              const message =
                error instanceof Error
                  ? error.message
                  : "Unable to retrieve transcript for the provided video."

              return respondWith(
                {
                  error: "Transcript fetch failed",
                  message,
                },
                502,
              )
            }
          },
        )
        .otherwise(() =>
          respondWith(
            {
              error: "Invalid payload",
              message:
                "Request body must include videoId as a string and optional lang as a string and optional local as a boolean.",
            },
            400,
          ),
        ),
    )
    .exhaustive()
}

Deno.serve(
  (req: Request): Promise<Response> =>
    match(req.method)
      .with("OPTIONS", async () => new Response(null, { headers: corsHeaders }))
      .with("POST", async () => handlePost(req))
      .otherwise(async () =>
        respondWith(
          {
            error: "Method Not Allowed",
            message: "Only POST is supported.",
          },
          405,
        ),
      ),
)
)
)

import { Supadata } from "supadata"
import { match, P } from "ts-pattern"
import { fetchTranscript } from "youtube-transcript-plus"

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
                let transcriptResponse
                let useSupadata = false

                // First try fetching from the local URL
                try {
                  const localUrl = Deno.env.get("LOCAL_TRANSCRIPT_URL") || "https://four-rice-rush.loca.lt"
                  const localResponse = await fetch(`${localUrl}/functions/v1/transcript`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      videoId: trimmedVideoId,
                      lang: normalizedLang,
                    }),
                  })

                  if (!localResponse.ok) {
                    throw new Error(`Local fetch failed with status: ${localResponse.status}`)
                  }

                  transcriptResponse = await localResponse.json()
                } catch (localError) {
                  console.error("Local fetch failed, trying Supadata:", localError)
                  useSupadata = true
                }

                // If local fetch failed, use Supadata
                if (useSupadata) {
                  const supadata = new Supadata({
                    apiKey: Deno.env.get("SUPADATA_API_KEY") || "",
                  })

                  try {
                    transcriptResponse = await supadata.youtube.transcript({
                      videoId: trimmedVideoId,
                      lang: normalizedLang,
                    })
                  } catch (error) {
                    console.error("Supadata API failed:", error)

                    // Check if the error is limit-exceeded
                    const errorMessage = error instanceof Error ? error.message : String(error)
                    if (errorMessage.includes("limit-exceeded") || errorMessage.includes("rate limit")) {
                      return respondWith(
                        {
                          error: "Limit exceeded",
                          message: "API rate limit exceeded. Please try again later.",
                        },
                        429,
                      )
                    }

                    // For other errors, re-throw to be handled by the outer catch block
                    throw error
                  }
                }

                // Convert Supadata response to match our expected format
                // Supadata returns { lang: string, content: Array<{text, offset, duration, lang}> }
                const transcript = (
                  Array.isArray(transcriptResponse?.content)
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

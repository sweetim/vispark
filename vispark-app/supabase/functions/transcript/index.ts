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
  console.log("[TRANSCRIPT] Starting transcript request processing")

  const jsonOutcome: JsonParseOutcome = await (async () => {
    try {
      console.log("[TRANSCRIPT] Parsing JSON from request body")
      const value = await req.json()
      console.log("[TRANSCRIPT] JSON parsing successful", { value })
      return { type: "success", value }
    } catch (error) {
      console.error("[TRANSCRIPT] JSON parsing failed", error)
      return { type: "error" }
    }
  })()

  return match(jsonOutcome)
    .with({ type: "error" }, async () => {
      console.log("[TRANSCRIPT] Responding with error: Invalid JSON")
      return respondWith(
        {
          error: "Invalid JSON",
          message: "Request body must be valid JSON.",
        },
        400,
      )
    })
    .with({ type: "success" }, ({ value }) =>
      match(value)
        .with(
          {
            videoId: P.string,
            lang: P.optional(P.string),
            local: P.optional(P.boolean),
          },
          async ({ videoId, lang, local }: TranscriptRequestPayload) => {
            // Auto-detect local development environment if not explicitly set
            const isLocalDev = local !== undefined ? local : Deno.env.get("DENO_ENV") === "development"
            console.log("[TRANSCRIPT] Processing transcript request", { videoId, lang, local, isLocalDev })

            const trimmedVideoId = videoId.trim()

            if (trimmedVideoId.length === 0) {
              console.log("[TRANSCRIPT] Responding with error: Empty videoId")
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

            console.log("[TRANSCRIPT] Normalized parameters", { trimmedVideoId, normalizedLang, local })

            try {
              // Use youtube-transcript-plus when local is true or in development environment
              if (isLocalDev) {
                console.log("[TRANSCRIPT] Using LOCAL fetch type: youtube-transcript-plus library (local: " + isLocalDev + ")")
                console.log("[TRANSCRIPT] Fetching transcript with youtube-transcript-plus", { trimmedVideoId, normalizedLang, local })
                let transcriptResponse
                try {
                  console.log("[TRANSCRIPT] Attempting to fetch transcript with youtube-transcript-plus")
                  transcriptResponse = await fetchTranscript(
                    trimmedVideoId,
                    {
                      lang: normalizedLang,
                    },
                  )
                  console.log("[TRANSCRIPT] Successfully fetched transcript with youtube-transcript-plus")
                } catch (error) {
                  // Check if the error is about language not being available
                  const errorMessage = error instanceof Error ? error.message : String(error)
                  const languageMatch = errorMessage.match(/Available languages: ([^.]+)/)

                  if (languageMatch) {
                    // Extract the first available language and retry
                    const availableLanguages = languageMatch[1].split(',').map(lang => lang.trim())
                    const fallbackLanguage = availableLanguages[0]

                    console.log(`[TRANSCRIPT] Requested language "${normalizedLang}" not available. Falling back to "${fallbackLanguage}"`)

                    transcriptResponse = await fetchTranscript(
                      trimmedVideoId,
                      {
                        lang: fallbackLanguage,
                      },
                    )
                  } else {
                    // If it's not a language error, re-throw
                    throw error
                  }
                }
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

                console.log("[TRANSCRIPT] Responding with success using local youtube-transcript-plus")
                return respondWith(successResponse, 200)
              } else {
                console.log("[TRANSCRIPT] Using REMOTE fetch type: Supadata first, then YouTube transcript API, then LOCAL_TRANSCRIPT_URL as fallback")
                let transcriptResponse
                let useYoutubeTranscriptApi = false
                let useLocalUrl = false

                // First try Supadata
                try {
                  console.log("[TRANSCRIPT] Using SUPADATA fetch type: Supadata API")
                  const supadata = new Supadata({
                    apiKey: Deno.env.get("SUPADATA_API_KEY") || "",
                  })

                  try {
                    console.log("[TRANSCRIPT] Attempting to fetch transcript with Supadata API")
                    transcriptResponse = await supadata.youtube.transcript({
                      videoId: trimmedVideoId,
                      lang: normalizedLang,
                    })
                    console.log("[TRANSCRIPT] Successfully fetched transcript with Supadata API")
                  } catch (error) {
                    // Check if the error is about language not being available
                    const errorMessage = error instanceof Error ? error.message : String(error)
                    const languageMatch = errorMessage.match(/Available languages: ([^.]+)/)

                    if (languageMatch) {
                      // Extract the first available language and retry
                      const availableLanguages = languageMatch[1].split(',').map(lang => lang.trim())
                      const fallbackLanguage = availableLanguages[0]

                      console.log(`[TRANSCRIPT] Requested language "${normalizedLang}" not available. Falling back to "${fallbackLanguage}"`)

                      transcriptResponse = await supadata.youtube.transcript({
                        videoId: trimmedVideoId,
                        lang: fallbackLanguage,
                      })
                    } else {
                      // If it's not a language error, re-throw
                      throw error
                    }
                  }

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
                  console.log("[TRANSCRIPT] Responding with success using Supadata API")
                  return respondWith(successResponse, 200)
                } catch (supadataError) {
                  console.error("[TRANSCRIPT] Supadata API failed, trying YouTube transcript API:", supadataError)
                  useYoutubeTranscriptApi = true
                }

                // If Supadata failed, try YouTube transcript API
                if (useYoutubeTranscriptApi) {
                  try {
                    console.log("[TRANSCRIPT] Using YOUTUBE TRANSCRIPT API fetch type")
                    const apiToken = Deno.env.get("YOUTUBE_TRANSCRIPT_API_TOKEN") || "6913265591e67df47b5da92a"

                    console.log("[TRANSCRIPT] Attempting to fetch transcript with YouTube transcript API")
                    const youtubeTranscriptResponse = await fetch("https://www.youtube-transcript.io/api/transcripts", {
                      method: "POST",
                      headers: {
                        "Authorization": `Basic ${apiToken}`,
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        ids: [trimmedVideoId],
                      })
                    })

                    if (!youtubeTranscriptResponse.ok) {
                      throw new Error(`YouTube transcript API failed with status: ${youtubeTranscriptResponse.status}`)
                    }

                    const youtubeTranscriptData = await youtubeTranscriptResponse.json()
                    console.log("[TRANSCRIPT] Successfully fetched transcript with YouTube transcript API")

                    // Convert YouTube transcript API response to match our expected format
                    // The API response structure might vary, so we'll need to adapt it
                    const transcript = Array.isArray(youtubeTranscriptData)
                      ? youtubeTranscriptData.map(
                          (segment: any) => ({
                            text: segment.text || "",
                            duration: segment.duration || 0,
                            offset: segment.offset || segment.start || 0,
                            lang: segment.lang || normalizedLang,
                          }),
                        )
                      : []

                    const successResponse: TranscriptSuccessResponse = {
                      videoId: trimmedVideoId,
                      transcript,
                      ...(normalizedLang ? { lang: normalizedLang } : {}),
                    }
                    console.log("[TRANSCRIPT] Responding with success using YouTube transcript API")
                    return respondWith(successResponse, 200)
                  } catch (youtubeApiError) {
                    console.error("[TRANSCRIPT] YouTube transcript API failed, trying local URL:", youtubeApiError)
                    useLocalUrl = true
                  }
                }

                // If both Supadata and YouTube transcript API failed, try local URL
                if (useLocalUrl) {
                  try {
                    const localUrl = Deno.env.get("LOCAL_TRANSCRIPT_URL") || "https://four-rice-rush.loca.lt"
                    console.log("[TRANSCRIPT] Attempting to fetch from local URL:", localUrl)
                    let localResponse

                    try {
                      console.log("[TRANSCRIPT] Making fetch request to local transcript service")
                      localResponse = await fetch(`${localUrl}/functions/v1/transcript`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          videoId: trimmedVideoId,
                          lang: normalizedLang,
                          local: true
                        }),
                      })
                    } catch (fetchError) {
                      // Check if the error is about language not being available
                      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError)
                      const languageMatch = errorMessage.match(/Available languages: ([^.]+)/)

                      if (languageMatch) {
                        // Extract the first available language and retry
                        const availableLanguages = languageMatch[1].split(',').map(lang => lang.trim())
                        const fallbackLanguage = availableLanguages[0]

                        console.log(`[TRANSCRIPT] Requested language "${normalizedLang}" not available. Falling back to "${fallbackLanguage}"`)

                        localResponse = await fetch(`${localUrl}/functions/v1/transcript`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            videoId: trimmedVideoId,
                            lang: fallbackLanguage,
                            local: true
                          }),
                        })
                      } else {
                        // If it's not a language error, re-throw
                        throw fetchError
                      }
                    }

                    if (!localResponse.ok) {
                      console.error(`[TRANSCRIPT] Local fetch failed with status: ${localResponse.status}`)
                      throw new Error(`Local fetch failed with status: ${localResponse.status}`)
                    }

                    console.log("[TRANSCRIPT] Successfully fetched from local URL")
                    transcriptResponse = await localResponse.json()
                    console.log("[TRANSCRIPT] Responding with success using local URL fetch")
                    return respondWith(transcriptResponse, 200)
                  } catch (localError) {
                    console.error("[TRANSCRIPT] Local fetch also failed:", localError)
                  }
                }

                // If we reach here, it means all methods failed
                console.log("[TRANSCRIPT] All fetch methods failed, returning error")
                return respondWith(
                  {
                    error: "Transcript fetch failed",
                    message: "Unable to retrieve transcript using available methods.",
                  },
                  502,
                )
              }
            } catch (error) {
              console.error("[TRANSCRIPT] Failed to fetch transcript:", error)

              const message =
                error instanceof Error
                  ? error.message
                  : "Unable to retrieve transcript for the provided video."

              console.log("[TRANSCRIPT] Responding with error: Transcript fetch failed")
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
        .otherwise(() => {
          console.log("[TRANSCRIPT] Responding with error: Invalid payload")
          return respondWith(
            {
              error: "Invalid payload",
              message:
                "Request body must include videoId as a string and optional lang as a string and optional local as a boolean.",
            },
            400,
          )
        }),
    )
    .exhaustive()
}

Deno.serve(
  (req: Request): Promise<Response> => {
    console.log("[TRANSCRIPT] Received request with method:", req.method)

    return match(req.method)
      .with("OPTIONS", async () => {
        console.log("[TRANSCRIPT] Handling OPTIONS request")
        return new Response(null, { headers: corsHeaders })
      })
      .with("POST", async () => {
        console.log("[TRANSCRIPT] Handling POST request")
        return handlePost(req)
      })
      .otherwise(async () => {
        console.log("[TRANSCRIPT] Responding with error: Method not allowed")
        return respondWith(
          {
            error: "Method Not Allowed",
            message: "Only POST is supported.",
          },
          405,
        )
      })
  }
)

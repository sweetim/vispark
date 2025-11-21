import { match, P } from "ts-pattern";
import { fetchTranscript } from "youtube-transcript-plus";
import { HttpsProxyAgent } from "https-proxy-agent";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const jsonHeaders: Record<string, string> = {
  "Content-Type": "application/json",
};

const buildHeaders = (): HeadersInit => ({
  ...corsHeaders,
  ...jsonHeaders,
});

type TranscriptRequestPayload = {
  videoId: string;
  lang?: string;
};

type TranscriptSegment = {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
};

type TranscriptSuccessResponse = {
  videoId: string;
  transcript: TranscriptSegment[];
  lang?: string;
};

type TranscriptErrorResponse = {
  error: string;
  message: string;
};

type TranscriptResponseBody =
  | TranscriptSuccessResponse
  | TranscriptErrorResponse;

const respondWith = (body: TranscriptResponseBody, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(),
  });

type JsonParseOutcome = { type: "success"; value: unknown } | { type: "error" };

const handlePost = async (req: Request): Promise<Response> => {
  console.log("[TRANSCRIPT] Starting transcript request processing");

  const jsonOutcome: JsonParseOutcome = await (async () => {
    try {
      console.log("[TRANSCRIPT] Parsing JSON from request body");
      const value = await req.json();
      console.log("[TRANSCRIPT] JSON parsing successful", { value });
      return { type: "success", value };
    } catch (error) {
      console.error("[TRANSCRIPT] JSON parsing failed", error);
      return { type: "error" };
    }
  })();

  return match(jsonOutcome)
    .with({ type: "error" }, async () => {
      console.log("[TRANSCRIPT] Responding with error: Invalid JSON");
      return respondWith(
        {
          error: "Invalid JSON",
          message: "Request body must be valid JSON.",
        },
        400,
      );
    })
    .with({ type: "success" }, ({ value }) =>
      match(value)
        .with(
          {
            videoId: P.string,
            lang: P.optional(P.string),
          },
          async ({ videoId, lang }: TranscriptRequestPayload) => {
            console.log("[TRANSCRIPT] Processing transcript request", {
              videoId,
              lang,
            });

            const trimmedVideoId = videoId.trim();

            if (trimmedVideoId.length === 0) {
              console.log("[TRANSCRIPT] Responding with error: Empty videoId");
              return respondWith(
                {
                  error: "Missing fields",
                  message: "The request body must include a non-empty videoId.",
                },
                400,
              );
            }

            const normalizedLang =
              typeof lang === "string" && lang.trim().length > 0
                ? lang.trim()
                : undefined;

            console.log("[TRANSCRIPT] Normalized parameters", {
              trimmedVideoId,
              normalizedLang,
            });

            try {
              console.log(
                "[TRANSCRIPT] Fetching transcript with youtube-transcript-plus",
                { trimmedVideoId, normalizedLang },
              );
              let transcriptResponse;
              try {
                console.log(
                  "[TRANSCRIPT] Attempting to fetch transcript with youtube-transcript-plus",
                );
                const proxyUrl = Deno.env.get("PROXY_URL")!

                transcriptResponse = await fetchTranscript(trimmedVideoId, {
                  lang: normalizedLang,
                  videoFetch: async ({ url, lang, userAgent }) => {
                    return fetch(url, {
                      headers: {
                        ...(lang && { "Accept-Language": lang }),
                        "User-Agent": userAgent,
                      },
                      agent: new HttpsProxyAgent(proxyUrl),
                    });
                  },
                  playerFetch: async (
                    { url, method, body, headers, lang, userAgent },
                  ) => {
                    return fetch(url, {
                      method,
                      headers: {
                        "User-Agent": userAgent,
                        ...(lang && { "Accept-Language": lang }),
                        ...headers,
                      },
                      body,
                      agent: new HttpsProxyAgent(proxyUrl),
                    });
                  },
                  transcriptFetch: async ({ url, lang, userAgent }) => {
                    return fetch(url, {
                      headers: {
                        ...(lang && { "Accept-Language": lang }),
                        "User-Agent": userAgent,
                      },
                      agent: new HttpsProxyAgent(proxyUrl),
                    });
                  },
                });
                console.log(
                  "[TRANSCRIPT] Successfully fetched transcript with youtube-transcript-plus",
                );
              } catch (error) {
                // Check if the error is about language not being available
                const errorMessage = error instanceof Error
                  ? error.message
                  : String(error);
                const languageMatch = errorMessage.match(
                  /Available languages: ([^.]+)/,
                );

                if (languageMatch) {
                  // Extract the first available language and retry
                  const availableLanguages = languageMatch[1].split(",").map((
                    lang,
                  ) => lang.trim());
                  const fallbackLanguage = availableLanguages[0];

                  console.log(
                    `[TRANSCRIPT] Requested language "${normalizedLang}" not available. Falling back to "${fallbackLanguage}"`,
                  );

                  transcriptResponse = await fetchTranscript(trimmedVideoId, {
                    lang: fallbackLanguage,
                    // ...fetchOptions,
                  });
                } else {
                  // If it's not a language error, re-throw
                  throw error;
                }
              }

              // Convert youtube-transcript-plus response to match our expected format
              // youtube-transcript-plus returns Array<{text, duration, offset, lang}>
              const transcript = Array.isArray(transcriptResponse)
                ? transcriptResponse.map(
                  (segment: {
                    text: string;
                    duration: number;
                    offset: number;
                    lang?: string;
                  }) => ({
                    text: segment.text,
                    duration: segment.duration,
                    offset: segment.offset,
                    lang: segment.lang || normalizedLang,
                  }),
                )
                : [];

              const successResponse: TranscriptSuccessResponse = {
                videoId: trimmedVideoId,
                transcript,
                ...(normalizedLang ? { lang: normalizedLang } : {}),
              };

              console.log(
                "[TRANSCRIPT] Responding with success using youtube-transcript-plus",
              );
              return respondWith(successResponse, 200);
            } catch (error) {
              console.error("[TRANSCRIPT] Failed to fetch transcript:", error);

              const message = error instanceof Error
                ? error.message
                : "Unable to retrieve transcript for the provided video.";

              console.log(
                "[TRANSCRIPT] Responding with error: Transcript fetch failed",
              );
              return respondWith(
                {
                  error: "Transcript fetch failed",
                  message,
                },
                502,
              );
            }
          },
        )
        .otherwise(() => {
          console.log("[TRANSCRIPT] Responding with error: Invalid payload");
          return respondWith(
            {
              error: "Invalid payload",
              message:
                "Request body must include videoId as a string and optional lang as a string.",
            },
            400,
          );
        }))
    .exhaustive();
};

Deno.serve(
  (req: Request): Promise<Response> => {
    console.log("[TRANSCRIPT] Received request with method:", req.method);

    return match(req.method)
      .with("OPTIONS", async () => {
        console.log("[TRANSCRIPT] Handling OPTIONS request");
        return new Response(null, { headers: corsHeaders });
      })
      .with("POST", async () => {
        console.log("[TRANSCRIPT] Handling POST request");
        return handlePost(req);
      })
      .otherwise(async () => {
        console.log("[TRANSCRIPT] Responding with error: Method not allowed");
        return respondWith(
          {
            error: "Method Not Allowed",
            message: "Only POST is supported.",
          },
          405,
        );
      });
  },
);

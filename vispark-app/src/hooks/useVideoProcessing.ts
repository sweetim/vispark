import { useParams } from "@tanstack/react-router"
import { useCallback, useEffect } from "react"
import {
  DEV_WARNINGS,
  ERROR_MESSAGES,
  ERROR_STEPS,
  RETRY_CONFIG,
  VIEW_MODES,
} from "@/constants/videoConstants"
import { useRetryWithBackoff } from "@/hooks/useRetryWithBackoff"
import { useVisparksWithMetadata } from "@/hooks/useVisparks"
import {
  fetchSummary,
  fetchSummaryStream,
  fetchTranscript,
  fetchYouTubeVideoDetails,
  formatTranscript,
  normalizeVisparkMetadata,
  saveVispark,
  type VisparkVideoMetadata,
} from "@/services/vispark"
import { useTranscriptLanguageStore } from "@/stores/transcriptLanguageStore"
import { useVideoStore } from "@/stores/videoStore"

type UseVideoProcessingProps = {
  onProcessingComplete?: () => void
  onProcessingError?: (error: string) => void
}

export const useVideoProcessing = ({
  onProcessingComplete,
  onProcessingError,
}: UseVideoProcessingProps = {}) => {
  const { videoId } = useParams({ from: "/app/videos/$videoId" })
  const { visparks: savedVisparks, mutate } = useVisparksWithMetadata(20)
  const { retryWithBackoff } = useRetryWithBackoff()
  const { transcriptLanguage } = useTranscriptLanguageStore()

  const {
    loading,
    transcript,
    summary,
    streamingSummary,
    error,
    step,
    errorStep,
    view,
    userViewPreference,
    videoMetadata,
    resetState,
    setLoading,
    setTranscript,
    setSummary,
    setStreamingSummary,
    setError,
    setStep,
    setView,
    setUserViewPreference,
    setVideoMetadata,
  } = useVideoStore()

  const refreshSavedVisparks = useCallback(async () => {
    await mutate()
  }, [mutate])

  const rawVideoId = videoId ?? ""

  // Find existing vispark outside the effect for use in computed values
  const existingVispark = savedVisparks.find(
    (entry: any) => entry.videoId === rawVideoId,
  )

  useEffect(() => {
    if (rawVideoId.length === 0) {
      return
    }

    let cancelled = false

    const run = async () => {
      // Get the current existing vispark at the time of execution
      const currentExistingVispark = savedVisparks.find(
        (entry: any) => entry.videoId === rawVideoId,
      )

      setLoading(true)
      resetState(currentExistingVispark)
      setStep("gathering")

      const metadataPromise = fetchYouTubeVideoDetails(rawVideoId)

      try {
        // Use local transcript fetching when developing locally
        const isLocalDevelopment = process.env.NODE_ENV !== "production"
        const transcriptResult = await retryWithBackoff(
          () =>
            fetchTranscript(rawVideoId, isLocalDevelopment, transcriptLanguage),
          RETRY_CONFIG.TRANSCRIPT,
        )

        if (cancelled) {
          return
        }

        const segments = transcriptResult.transcript
        setTranscript(formatTranscript(segments))

        let resolvedMetadata: any = currentExistingVispark?.metadata ?? null
        let fallbackMetadata: any = null

        // If we don't have metadata from the database, fetch from YouTube API
        if (!resolvedMetadata) {
          try {
            fallbackMetadata = await retryWithBackoff(
              () => metadataPromise,
              RETRY_CONFIG.METADATA,
            )
          } catch (metadataError) {
            if (
              process.env.NODE_ENV !== "production"
              && metadataError instanceof Error
            ) {
              console.warn(DEV_WARNINGS.METADATA_FAILED, metadataError)
            }
          }
        }

        // Normalize metadata from database if available, otherwise use YouTube API data
        if (currentExistingVispark) {
          const visparkMetadata: VisparkVideoMetadata = {
            videoId: currentExistingVispark.videoId,
            title: currentExistingVispark.metadata?.title,
            channelTitle: currentExistingVispark.metadata?.channelTitle,
            thumbnails: currentExistingVispark.metadata?.thumbnails,
            publishedAt: currentExistingVispark.metadata?.publishedAt,
            duration: currentExistingVispark.metadata?.duration,
            defaultLanguage: currentExistingVispark.metadata?.defaultLanguage,
          }

          resolvedMetadata = normalizeVisparkMetadata(
            visparkMetadata,
            fallbackMetadata,
          )
        } else if (fallbackMetadata) {
          resolvedMetadata = fallbackMetadata
        }

        if (!cancelled && resolvedMetadata) {
          setVideoMetadata(resolvedMetadata)
        }

        if (currentExistingVispark) {
          setStep("complete")
          setLoading(false)
          onProcessingComplete?.()
          return
        }

        setStep("summarizing")

        try {
          // Use streaming for summary generation
          const stream = await retryWithBackoff(
            () => fetchSummaryStream(segments),
            RETRY_CONFIG.SUMMARY,
          )

          if (cancelled) {
            return
          }

          // Process the stream
          const reader = stream.getReader()
          const decoder = new TextDecoder()
          let accumulatedContent = ""

          // Set view to summary when streaming starts
          if (!userViewPreference) {
            setView(VIEW_MODES.SUMMARY)
          }

          try {
            while (true) {
              const { done, value } = await reader.read()

              if (done) break

              const chunk = decoder.decode(value, { stream: true })

              // The OpenAI SDK returns raw JSON chunks, not SSE format
              // Each chunk is a JSON object with OpenAI streaming format
              const lines = chunk.split("\n").filter((line) => line.trim())

              for (const line of lines) {
                try {
                  const parsed = JSON.parse(line)
                  const content = parsed.choices?.[0]?.delta?.content

                  if (content) {
                    accumulatedContent += content
                    // Display the accumulated content as a single item in the streaming summary
                    setStreamingSummary([accumulatedContent])
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                }
              }
            }

            // Try to parse the final accumulated content as JSON to extract bullets
            // If it's not valid JSON, treat the entire content as a single bullet point
            try {
              const finalParsed = JSON.parse(accumulatedContent)
              const bullets = finalParsed.bullets || []

              // Final update with parsed bullets
              setSummary(bullets)
            } catch (e) {
              // If parsing fails, treat the entire content as a single bullet point
              setSummary([accumulatedContent])
            }

            setStreamingSummary([]) // Clear streaming state

            setStep("complete")

            // Get the final bullets for saving
            const finalBullets = summary || []

            try {
              // Extract channel ID from video metadata
              // Only save if we have a valid channel ID
              if (resolvedMetadata?.channelId) {
                await saveVispark(
                  rawVideoId,
                  resolvedMetadata.channelId,
                  finalBullets,
                  resolvedMetadata,
                )
                if (!cancelled) {
                  await refreshSavedVisparks()
                }
              } else {
                // Log warning if we don't have channel ID but don't fail the entire process
                if (process.env.NODE_ENV !== "production") {
                  console.warn(DEV_WARNINGS.MISSING_CHANNEL_ID, rawVideoId)
                }
              }
            } catch (persistError) {
              if (process.env.NODE_ENV !== "production" && persistError) {
                console.warn(DEV_WARNINGS.VISPARK_SAVE_FAILED, persistError)
              }
            }

            onProcessingComplete?.()
          } catch (streamError) {
            // If streaming fails, fall back to non-streaming
            console.warn(
              "Streaming failed, falling back to non-streaming:",
              streamError,
            )

            const summaryResult = await retryWithBackoff(
              () => fetchSummary(segments),
              RETRY_CONFIG.SUMMARY,
            )

            if (cancelled) {
              return
            }

            const fallbackBullets = summaryResult.bullets ?? []
            setSummary(fallbackBullets)

            // Only set view automatically if user hasn't expressed a preference
            if (!userViewPreference) {
              setView(
                fallbackBullets.length > 0
                  ? VIEW_MODES.SUMMARY
                  : VIEW_MODES.TRANSCRIPT,
              )
            }

            setStep("complete")

            try {
              // Extract channel ID from video metadata
              // Only save if we have a valid channel ID
              if (resolvedMetadata?.channelId) {
                await saveVispark(
                  rawVideoId,
                  resolvedMetadata.channelId,
                  fallbackBullets,
                  resolvedMetadata,
                )
                if (!cancelled) {
                  await refreshSavedVisparks()
                }
              } else {
                // Log warning if we don't have channel ID but don't fail the entire process
                if (process.env.NODE_ENV !== "production") {
                  console.warn(DEV_WARNINGS.MISSING_CHANNEL_ID, rawVideoId)
                }
              }
            } catch (persistError) {
              if (process.env.NODE_ENV !== "production" && persistError) {
                console.warn(DEV_WARNINGS.VISPARK_SAVE_FAILED, persistError)
              }
            }

            onProcessingComplete?.()
          }
        } catch (summaryError) {
          if (cancelled) {
            return
          }

          const message =
            summaryError instanceof Error
              ? summaryError.message
              : ERROR_MESSAGES.SUMMARY_FAILED
          setError(message, ERROR_STEPS.SUMMARIZING)
          onProcessingError?.(message)
        }
      } catch (transcriptError) {
        if (cancelled) {
          return
        }

        const message =
          transcriptError instanceof Error
            ? transcriptError.message
            : ERROR_MESSAGES.TRANSCRIPT_FAILED
        setError(message, ERROR_STEPS.GATHERING)
        onProcessingError?.(message)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [rawVideoId, refreshSavedVisparks])

  const isGenerating =
    !existingVispark && (step === "gathering" || step === "summarizing")
  const hasSummary = Boolean(summary && summary.length > 0)
  const hasTranscript = transcript.length > 0
  const showViewToggle = hasSummary || hasTranscript

  return {
    // State
    loading,
    transcript,
    summary,
    streamingSummary,
    error,
    step,
    errorStep,
    view,
    userViewPreference,
    videoMetadata,
    existingVispark,
    rawVideoId,

    // Computed values
    isGenerating,
    hasSummary,
    hasTranscript,
    showViewToggle,

    // Actions
    setView,
    setUserViewPreference,
    refreshSavedVisparks,
  }
}

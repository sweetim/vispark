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
          const summaryResult = await retryWithBackoff(
            () => fetchSummary(segments),
            RETRY_CONFIG.SUMMARY,
          )

          if (cancelled) {
            return
          }

          const bullets = summaryResult.bullets ?? []
          setSummary(bullets)

          // Only set view automatically if user hasn't expressed a preference
          if (!userViewPreference) {
            setView(
              bullets.length > 0 ? VIEW_MODES.SUMMARY : VIEW_MODES.TRANSCRIPT,
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
                bullets,
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

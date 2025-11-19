import { useParams } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"
import useSWR from "swr"
import {
  ERROR_MESSAGES,
  PROCESSING_STEPS,
  RETRY_CONFIG,
  VIEW_MODES,
} from "@/constants/videoConstants"
import {
  fetchVisparkByVideoId,
  fetchYouTubeVideoDetails,
  fetchTranscript,
  formatTranscript,
  type TranscriptResult,
  type VideoMetadata,
  type VisparkRow,
} from "@/services/vispark"

import { useVideoStore, type Step, type ErrorStep, type ViewMode } from "@/stores/videoStore"

type UseVideoProcessingReturn = {
  loading: boolean
  transcript: string
  summary: string | null
  streamingSummary: string
  error: string | null
  step: Step
  errorStep: ErrorStep
  view: ViewMode
  videoMetadata: VideoMetadata | null
  rawVideoId: string
  isGenerating: boolean
  hasSummary: boolean
  hasTranscript: boolean
  showViewToggle: boolean
  setView: (view: ViewMode) => void
  setUserViewPreference: (view: ViewMode) => void
  isSummarySaved: boolean
  isTranscriptLoading: boolean
  videoExistsInVispark: boolean
}

const fetchVideoMetadata = async (videoId: string): Promise<VideoMetadata> => {
  try {
    return await fetchYouTubeVideoDetails(videoId)
  } catch (error) {
    console.error("Failed to fetch video metadata:", error)
    throw error
  }
}

export const useVideoProcessing = (): UseVideoProcessingReturn => {
  const params = useParams({ from: "/app/videos/$videoId" })
  const rawVideoId = params.videoId || ""

  // Global Store State
  const store = useVideoStore()
  const isProcessingCurrentVideo = store.processingVideoId === rawVideoId

  // Local State (for viewing mode or when not processing)
  const [view, setView] = useState<ViewMode>(VIEW_MODES.SUMMARY)

  // Fetch existing data
  const { data: visparkData } = useSWR<VisparkRow | null>(
    rawVideoId ? `vispark?videoId=${rawVideoId}` : null,
    rawVideoId ? () => fetchVisparkByVideoId(rawVideoId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 1,
      errorRetryInterval: 1000,
    },
  )

  const { data: videoMetadata, error: metadataError } = useSWR<VideoMetadata>(
    rawVideoId ? ["video-metadata", rawVideoId] : null,
    () => fetchVideoMetadata(rawVideoId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: RETRY_CONFIG.METADATA.maxRetries,
      errorRetryInterval: RETRY_CONFIG.METADATA.baseDelay,
    },
  )

  // Derived State
  const videoExistsInVispark = Boolean(visparkData?.summaries)

  // Determine effective state (Store vs Local/Fetched)
  const step = isProcessingCurrentVideo ? store.status : (videoExistsInVispark ? PROCESSING_STEPS.COMPLETE : PROCESSING_STEPS.IDLE)
  const error = isProcessingCurrentVideo ? store.error : (metadataError ? ERROR_MESSAGES.UNEXPECTED_ERROR : null)
  const effectiveErrorStep = isProcessingCurrentVideo ? store.errorStep : null



  // We could fetch transcript separately if needed for viewing, but usually it's part of the flow or we'd need another SWR if we want to view it without processing.
  // Wait, the original code fetched transcript via SWR. If we want to view transcript of an existing video, we might need to fetch it.
  // However, the requirement is about background processing.
  // If the video is complete, we usually have the summary. The transcript might not be stored in VisparkRow?
  // Looking at VisparkRow type (inferred), it seems to have summaries.
  // The original code fetched transcript via SWR `fetchVideoTranscript`.
  // If we are in "viewing" mode (complete), we might still want to see the transcript.
  // Let's keep the transcript SWR but only use it if NOT processing.

  // Actually, if we are processing, we use store.transcript.
  // If we are NOT processing, we might want to fetch it if the user wants to see it.
  // But `fetchVideoTranscript` triggers the "gathering" step in the original code?
  // No, `fetchVideoTranscript` just fetches. The original code set step to GATHERING in the fetcher function.

  // Let's re-implement transcript fetching for viewing mode.

  // ... logic continues below ...

  const { data: transcriptData } = useSWR<TranscriptResult>(
      rawVideoId && !isProcessingCurrentVideo && !videoExistsInVispark // Only fetch if not processing and not already complete? Or maybe always if we want to view it?
      // Original logic: fetched if rawVideoId exists.
      // But we don't want to trigger "gathering" step if we are just viewing.
      // Let's fetch it if we are not processing.
        ? ["transcript", rawVideoId, videoMetadata?.defaultLanguage]
        : null,
      () => fetchTranscript({ videoId: rawVideoId, lang: videoMetadata?.defaultLanguage }),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        // We don't set steps here anymore.
      }
  )

  // Effective Transcript
  const effectiveTranscript = isProcessingCurrentVideo ? store.transcript : (transcriptData?.transcript ? formatTranscript(transcriptData.transcript) : "")

  // Effective Summary
  const effectiveSummary = isProcessingCurrentVideo ? store.summary : (visparkData?.summaries || null)
  const effectiveStreamingSummary = isProcessingCurrentVideo ? store.streamingSummary : ""

  const isGenerating = step === PROCESSING_STEPS.GATHERING || step === PROCESSING_STEPS.SUMMARIZING

  // Auto-start processing
  useEffect(() => {
    if (
      videoMetadata &&
      !videoExistsInVispark &&
      !isProcessingCurrentVideo &&
      step === PROCESSING_STEPS.IDLE &&
      !error
    ) {
      store.startProcessing(rawVideoId, videoMetadata)
    }
  }, [videoMetadata, videoExistsInVispark, isProcessingCurrentVideo, step, error, rawVideoId, store])

  // View Preference
  const setUserViewPreference = useCallback((newView: ViewMode) => {
    try {
      localStorage.setItem(`video-view-preference`, newView)
    } catch (e) {
      console.warn("Failed to save view preference:", e)
    }
  }, [])

  useEffect(() => {
    try {
      const savedPreference = localStorage.getItem(`video-view-preference`) as ViewMode | null
      if (savedPreference && (savedPreference === VIEW_MODES.SUMMARY || savedPreference === VIEW_MODES.TRANSCRIPT)) {
        setView(savedPreference)
      }
    } catch (e) {
      console.warn("Failed to load view preference:", e)
    }
  }, [])

  useEffect(() => {
    if (step === PROCESSING_STEPS.SUMMARIZING && view !== VIEW_MODES.SUMMARY) {
      setView(VIEW_MODES.SUMMARY)
    }
  }, [step, view])

  const hasTranscript = Boolean(effectiveTranscript)
  const hasSummary = Boolean(effectiveSummary)
  const showViewToggle = hasTranscript || hasSummary
  const loading = !videoMetadata || (isProcessingCurrentVideo && step === "gathering" && !hasTranscript)
  const isTranscriptLoading = step === "gathering" && !hasTranscript

  return {
    loading,
    transcript: effectiveTranscript,
    summary: effectiveSummary,
    streamingSummary: effectiveStreamingSummary,
    error,
    step,
    errorStep: effectiveErrorStep,
    view,
    videoMetadata: videoMetadata || null,
    rawVideoId,
    isGenerating,
    hasSummary,
    hasTranscript,
    showViewToggle,
    setView,
    setUserViewPreference,
    isSummarySaved: Boolean(visparkData?.summaries), // If it's in DB, it's saved.
    isTranscriptLoading,
    videoExistsInVispark,
  }
}

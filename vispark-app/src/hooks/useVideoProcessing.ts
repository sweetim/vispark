import { useParams } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"
import useSWR from "swr"
import {
  ERROR_MESSAGES,
  ERROR_STEPS,
  PROCESSING_STEPS,
  RETRY_CONFIG,
  VIEW_MODES,
} from "@/constants/videoConstants"
import {
  fetchSummaryStream,
  fetchTranscript,
  fetchVisparkByVideoId,
  fetchYouTubeVideoDetails,
  formatTranscript,
  saveVispark,
  type TranscriptResult,
  type VideoMetadata,
  type VisparkRow,
} from "@/services/vispark"

import { useRetryWithBackoff } from "./useRetryWithBackoff"

type View = "summary" | "transcript"
type Step = "idle" | "gathering" | "summarizing" | "complete" | "error"
type ErrorStep = "gathering" | "summarizing" | null

type UseVideoProcessingReturn = {
  loading: boolean
  transcript: string
  summary: string | null
  streamingSummary: string
  error: string | null
  step: Step
  errorStep: ErrorStep
  view: View
  videoMetadata: VideoMetadata | null
  rawVideoId: string
  isGenerating: boolean
  hasSummary: boolean
  hasTranscript: boolean
  showViewToggle: boolean
  setView: (view: View) => void
  setUserViewPreference: (view: View) => void
  isSummarySaved: boolean
}

const fetchVideoMetadata = async (videoId: string): Promise<VideoMetadata> => {
  try {
    return await fetchYouTubeVideoDetails(videoId)
  } catch (error) {
    console.error("Failed to fetch video metadata:", error)
    throw error
  }
}

const fetchVideoTranscript = async (
  videoId: string,
): Promise<TranscriptResult> => {
  try {
    return await fetchTranscript(videoId, true)
  } catch (error) {
    console.error("Failed to fetch transcript:", error)
    throw error
  }
}

const processSummaryStream = async (
  stream: ReadableStream<Uint8Array>,
  onChunk: (chunk: string) => void,
  onComplete: (summary: string) => void,
  onError: (error: Error) => void,
  onSave?: (summary: string) => Promise<void>,
) => {
  try {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    let summaryText = ""

    while (true) {
      const { done, value } = await reader.read()

      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // Process complete lines
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine) continue

        try {
          // Parse the JSON directly from the line
          const parsed = JSON.parse(trimmedLine)

          // Extract content if available
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            onChunk(content)
            summaryText += content
          }

          // Check if stream is finished
          if (parsed.choices?.[0]?.finish_reason === "stop") {
            onComplete(summaryText)
            // Save the summary to vispark table if save function is provided
            if (onSave) {
              try {
                await onSave(summaryText)
              } catch (saveError) {
                console.error("Failed to save summary:", saveError)
              }
            }
            return
          }
        } catch (e) {
          // Ignore JSON parse errors for streaming
          console.warn("Failed to parse stream line:", trimmedLine, e)
        }
      }
    }
  } catch (error) {
    onError(
      error instanceof Error ? error : new Error("Stream processing failed"),
    )
  }
}

export const useVideoProcessing = (): UseVideoProcessingReturn => {
  // Get video ID from URL params
  const params = useParams({ from: "/app/videos/$videoId" })

  const rawVideoId = params.videoId || ""

  // Check if video exists in vispark table
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

  // State management
  const [view, setView] = useState<View>(VIEW_MODES.SUMMARY)
  const [step, setStep] = useState<Step>(PROCESSING_STEPS.IDLE)
  const [errorStep, setErrorStep] = useState<ErrorStep>(null)
  const [error, setError] = useState<string | null>(null)
  const [streamingSummary, setStreamingSummary] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [transcriptText, setTranscriptText] = useState("")
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummarySaved, setIsSummarySaved] = useState(false)

  const streamAbortControllerRef = useRef<AbortController | null>(null)
  const { retryWithBackoff } = useRetryWithBackoff()

  // Fetch video metadata
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

  // Fetch transcript
  const { data: transcriptData, error: transcriptError } =
    useSWR<TranscriptResult>(
      rawVideoId ? ["transcript", rawVideoId] : null,
      () => {
        setStep(PROCESSING_STEPS.GATHERING)
        return fetchVideoTranscript(rawVideoId)
      },
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        errorRetryCount: RETRY_CONFIG.TRANSCRIPT.maxRetries,
        errorRetryInterval: RETRY_CONFIG.TRANSCRIPT.baseDelay,
        onSuccess: (data) => {
          setTranscriptText(formatTranscript(data.transcript))
          // Don't change step here - let the summary generation handle the transition
        },
      },
    )

  // Reset error state when video ID changes
  useEffect(() => {
    setError(null)
    setErrorStep(null)
    setStep(PROCESSING_STEPS.IDLE)
    setStreamingSummary("")
    setSummary(null)
    setIsGenerating(false)
    setTranscriptText("")
    setIsSummarySaved(false)

    // Cancel any ongoing stream
    if (streamAbortControllerRef.current) {
      streamAbortControllerRef.current.abort()
      streamAbortControllerRef.current = null
    }
  }, [rawVideoId])

  // Update transcript text when transcript data changes
  useEffect(() => {
    if (transcriptData) {
      setTranscriptText(formatTranscript(transcriptData.transcript))
    }
  }, [transcriptData])

  // Handle errors from SWR
  useEffect(() => {
    if (metadataError) {
      setError(ERROR_MESSAGES.UNEXPECTED_ERROR)
      setStep(PROCESSING_STEPS.ERROR)
    }
  }, [metadataError])

  useEffect(() => {
    if (transcriptError) {
      setError(ERROR_MESSAGES.TRANSCRIPT_FAILED)
      setStep(PROCESSING_STEPS.ERROR)
      setErrorStep(ERROR_STEPS.GATHERING)
    }
  }, [transcriptError])

  // Save summary to vispark table
  const saveSummaryToVispark = useCallback(
    async (summaryText: string) => {
      if (!videoMetadata || !rawVideoId) return

      try {
        await saveVispark(
          rawVideoId,
          videoMetadata.channelId,
          summaryText,
          videoMetadata,
        )
        setIsSummarySaved(true)
      } catch (error) {
        console.error("Failed to save summary to vispark:", error)
        throw error
      }
    },
    [videoMetadata, rawVideoId],
  )

  // Generate summary from transcript
  const generateSummary = useCallback(async () => {
    if (!transcriptData || isGenerating) return

    setIsGenerating(true)
    setStep(PROCESSING_STEPS.SUMMARIZING)
    setError(null)
    setErrorStep(null)
    setStreamingSummary("")
    setIsSummarySaved(false)

    streamAbortControllerRef.current = new AbortController()

    try {
      await retryWithBackoff(
        async () => {
          const stream = await fetchSummaryStream(transcriptData.transcript)

          await processSummaryStream(
            stream,
            (chunk) => {
              setStreamingSummary((prev) => prev + chunk)
            },
            (summaryText) => {
              setSummary(summaryText)
              setStep(PROCESSING_STEPS.COMPLETE)
              setIsGenerating(false)
            },
            (streamError) => {
              throw streamError
            },
            saveSummaryToVispark,
          )
        },
        {
          maxRetries: RETRY_CONFIG.SUMMARY.maxRetries,
          baseDelay: RETRY_CONFIG.SUMMARY.baseDelay,
        },
      )
    } catch (summaryError) {
      console.error("Summary generation failed:", summaryError)
      setError(ERROR_MESSAGES.SUMMARY_FAILED)
      setStep(PROCESSING_STEPS.ERROR)
      setErrorStep(ERROR_STEPS.SUMMARIZING)
      setIsGenerating(false)
    } finally {
      streamAbortControllerRef.current = null
    }
  }, [transcriptData, isGenerating, retryWithBackoff, saveSummaryToVispark])

  // Auto-generate summary when transcript is available
  useEffect(() => {
    if (
      transcriptData
      && transcriptText
      && !summary
      && !visparkData?.summaries // Don't generate if we already have a summary in vispark
      && !isGenerating
      && !error
    ) {
      generateSummary()
    }
  }, [
    transcriptData,
    transcriptText,
    summary,
    visparkData?.summaries,
    isGenerating,
    error,
    generateSummary,
  ])

  // User view preference management
  const setUserViewPreference = useCallback((newView: View) => {
    try {
      localStorage.setItem(`video-view-preference`, newView)
    } catch (e) {
      console.warn("Failed to save view preference:", e)
    }
  }, [])

  // Load user view preference on mount
  useEffect(() => {
    try {
      const savedPreference = localStorage.getItem(
        `video-view-preference`,
      ) as View | null
      if (
        savedPreference
        && (savedPreference === VIEW_MODES.SUMMARY
          || savedPreference === VIEW_MODES.TRANSCRIPT)
      ) {
        setView(savedPreference)
      }
    } catch (e) {
      console.warn("Failed to load view preference:", e)
    }
  }, [])

  // Auto-switch to summary view when summarizing starts
  useEffect(() => {
    if (step === PROCESSING_STEPS.SUMMARIZING && view !== VIEW_MODES.SUMMARY) {
      setView(VIEW_MODES.SUMMARY)
    }
  }, [step, view])

  // Computed values
  const hasTranscript = Boolean(transcriptText)
  const hasSummary = Boolean(summary) || Boolean(visparkData?.summaries)
  const showViewToggle = hasTranscript || hasSummary
  const loading = !videoMetadata || (!transcriptData && !transcriptError)

  return {
    loading,
    transcript: transcriptText,
    summary: visparkData?.summaries || summary,
    streamingSummary,
    error,
    step,
    errorStep,
    view,
    videoMetadata: videoMetadata || null,
    rawVideoId,
    isGenerating,
    hasSummary,
    hasTranscript,
    showViewToggle,
    setView,
    setUserViewPreference,
    isSummarySaved,
  }
}

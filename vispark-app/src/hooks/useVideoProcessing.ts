import { useParams, useSearch } from "@tanstack/react-router"
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
  fetchYouTubeVideoDetails,
  formatTranscript,
  type TranscriptResult,
  type VideoMetadata,
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

  // State management
  const [view, setView] = useState<View>(VIEW_MODES.SUMMARY)
  const [step, setStep] = useState<Step>(PROCESSING_STEPS.IDLE)
  const [errorStep, setErrorStep] = useState<ErrorStep>(null)
  const [error, setError] = useState<string | null>(null)
  const [streamingSummary, setStreamingSummary] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [transcriptText, setTranscriptText] = useState("")
  const [summary, setSummary] = useState<string | null>(null)

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
      () => fetchVideoTranscript(rawVideoId),
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        errorRetryCount: RETRY_CONFIG.TRANSCRIPT.maxRetries,
        errorRetryInterval: RETRY_CONFIG.TRANSCRIPT.baseDelay,
        onSuccess: (data) => {
          setTranscriptText(formatTranscript(data.transcript))
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

  // Generate summary from transcript
  const generateSummary = useCallback(async () => {
    if (!transcriptData || isGenerating) return

    setIsGenerating(true)
    setStep(PROCESSING_STEPS.SUMMARIZING)
    setError(null)
    setErrorStep(null)
    setStreamingSummary("")

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
  }, [transcriptData, isGenerating, retryWithBackoff])

  // Auto-generate summary when transcript is available
  useEffect(() => {
    if (
      transcriptData
      && transcriptText
      && !summary
      && !isGenerating
      && !error
    ) {
      generateSummary()
    }
  }, [
    transcriptData,
    transcriptText,
    summary,
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

  // Computed values
  const hasTranscript = Boolean(transcriptText)
  const hasSummary = Boolean(summary)
  const showViewToggle = hasTranscript || hasSummary
  const loading = !videoMetadata || (!transcriptData && !transcriptError)

  return {
    loading,
    transcript: transcriptText,
    summary,
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
  }
}

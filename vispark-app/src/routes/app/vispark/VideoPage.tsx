import { useEffect, useMemo, useState } from "react"
import { Navigate, useOutletContext, useParams } from "react-router"
import ProgressTimeline from "@/components/ProgressTimeline"
import SummaryList from "@/components/SummaryList"
import TranscriptView from "@/components/TranscriptView"
import VideoMetadataCard from "@/components/VideoMetadataCard"
import ViewToggle from "@/components/ViewToggle"
import {
  fetchSummary,
  fetchTranscript,
  fetchYouTubeVideoDetails,
  formatTranscript,
  saveVispark,
} from "@/services/vispark.ts"
import type { VisparkOutletContext } from "./Layout"

const VideoMetadataSkeleton = () => (
  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-lg">
    <div className="absolute inset-0 bg-gray-700 animate-pulse" />
    <div className="absolute bottom-0 left-0 right-0 p-1">
      <div className="inline-block rounded-md bg-black/40 px-3 py-2 backdrop-blur">
        <div className="h-3 w-48 bg-gray-500/60 rounded" />
        <div className="mt-2 h-2 w-32 bg-gray-500/40 rounded" />
      </div>
    </div>
  </div>
)

type Step = "idle" | "gathering" | "summarizing" | "complete" | "error"
type ErrorStep = "gathering" | "summarizing" | null

const VisparkVideoPage = () => {
  const { videoId: rawVideoId } = useParams<{ videoId: string }>()
  const { savedVisparks, refreshSavedVisparks } =
    useOutletContext<VisparkOutletContext>()

  const videoId = (rawVideoId ?? "").trim()

  const existingVispark = useMemo(
    () => savedVisparks.find((entry) => entry.metadata.videoId === videoId),
    [savedVisparks, videoId],
  )

  const [loading, setLoading] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [summary, setSummary] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>("idle")
  const [errorStep, setErrorStep] = useState<ErrorStep>(null)
  const [view, setView] = useState<"summary" | "transcript">("transcript")
  const [videoMetadata, setVideoMetadata] = useState<Awaited<
    ReturnType<typeof fetchYouTubeVideoDetails>
  > | null>(null)

  useEffect(() => {
    if (videoId.length === 0) {
      return
    }

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      setErrorStep(null)
      setTranscript("")
      setSummary(existingVispark?.summaries ?? null)
      setView(
        existingVispark && existingVispark.summaries.length > 0
          ? "summary"
          : "transcript",
      )
      setVideoMetadata(existingVispark?.metadata ?? null)
      setStep("gathering")

      const metadataPromise = fetchYouTubeVideoDetails(videoId)

      try {
        // Use local transcript fetching when developing locally
        const isLocalDevelopment = process.env.NODE_ENV !== "production"
        const transcriptResult = await fetchTranscript(
          videoId,
          isLocalDevelopment,
        )
        if (cancelled) {
          return
        }

        const segments = transcriptResult.transcript
        setTranscript(formatTranscript(segments))

        let resolvedMetadata = existingVispark?.metadata ?? null
        if (!resolvedMetadata) {
          try {
            resolvedMetadata = await metadataPromise
          } catch (metadataError) {
            if (
              process.env.NODE_ENV !== "production"
              && metadataError instanceof Error
            ) {
              console.warn(
                "Failed to fetch YouTube video metadata:",
                metadataError,
              )
            }
          }
        }

        if (!cancelled && resolvedMetadata) {
          setVideoMetadata(resolvedMetadata)
        }

        if (existingVispark) {
          setStep("complete")
          return
        }

        setStep("summarizing")

        try {
          const summaryResult = await fetchSummary(segments)
          if (cancelled) {
            return
          }

          const bullets = summaryResult.bullets ?? []
          setSummary(bullets)
          setView(bullets.length > 0 ? "summary" : "transcript")
          setStep("complete")

          try {
            // Extract channel ID from video metadata
            const videoChannelId = resolvedMetadata?.channelId || ""
            await saveVispark(videoId, videoChannelId, bullets)
            if (!cancelled) {
              await refreshSavedVisparks()
            }
          } catch (persistError) {
            if (process.env.NODE_ENV !== "production" && persistError) {
              console.warn("Failed to save vispark:", persistError)
            }
          }
        } catch (summaryError) {
          if (cancelled) {
            return
          }

          const message =
            summaryError instanceof Error
              ? summaryError.message
              : "An unexpected error occurred while generating the summary."
          setError(message)
          setErrorStep("summarizing")
          setStep("error")
        }
      } catch (transcriptError) {
        if (cancelled) {
          return
        }

        const message =
          transcriptError instanceof Error
            ? transcriptError.message
            : "An unexpected error occurred while fetching the transcript."
        setError(message)
        setErrorStep("gathering")
        setStep("error")
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
  }, [existingVispark, refreshSavedVisparks, videoId])

  const isGenerating =
    !existingVispark && (step === "gathering" || step === "summarizing")
  const hasSummary = Boolean(summary && summary.length > 0)
  const hasTranscript = transcript.length > 0
  const showViewToggle = hasSummary || hasTranscript

  if (videoId.length === 0) {
    return (
      <Navigate
        to="/app/vispark/search"
        replace
      />
    )
  }

  return (
    <div className="w-full max-w-3xl space-y-2">
      <div className="sticky top-0 z-20 space-y-3 py-2 backdrop-blur">
        <div className="w-full">
          {videoMetadata ? (
            <VideoMetadataCard metadata={videoMetadata} />
          ) : (
            <VideoMetadataSkeleton />
          )}
        </div>

        {showViewToggle && (
          <ViewToggle
            view={view}
            hasSummary={hasSummary}
            hasTranscript={hasTranscript}
            onChange={setView}
          />
        )}
      </div>

      <ProgressTimeline
        step={step}
        errorStep={errorStep}
        isSubmitting={isGenerating}
        error={error}
      />

      {error && (
        <div className="text-sm text-red-400 border border-red-400/30 rounded-md px-3 py-2 bg-red-900/20">
          {error}
        </div>
      )}

      {view === "summary" && hasSummary && (
        <SummaryList items={summary ?? []} />
      )}

      {view === "transcript" && hasTranscript && (
        <TranscriptView transcript={transcript} />
      )}

      {!isGenerating && !loading && !hasSummary && !hasTranscript && !error && (
        <div className="text-sm text-gray-400 border border-dashed border-gray-700 rounded-md px-4 py-6 text-center">
          No transcript or summary available for this video yet.
        </div>
      )}
    </div>
  )
}

export default VisparkVideoPage

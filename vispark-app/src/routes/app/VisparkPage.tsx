import { useId, useState } from "react"
import ProgressTimeline from "@/components/ProgressTimeline"
import SummaryList from "@/components/SummaryList"
import TranscriptView from "@/components/TranscriptView"
import ViewToggle from "@/components/ViewToggle"
import {
  fetchSummary,
  fetchTranscript,
  formatTranscript,
} from "@/services/vispark.ts"

const VisparkPage = () => {
  const [videoId, setVideoId] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<string[] | null>(null)
  const [step, setStep] = useState<
    "idle" | "gathering" | "summarizing" | "complete" | "error"
  >("idle")
  const [errorStep, setErrorStep] = useState<
    "gathering" | "summarizing" | null
  >(null)
  const [view, setView] = useState<"summary" | "transcript">("transcript")

  const reactId = useId()
  const inputId = `videoId-${reactId}`

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const trimmedVideoId = videoId.trim()

    if (trimmedVideoId.length === 0) {
      setError("Please enter a video ID before submitting.")
      setTranscript("")
      return
    }

    // reset state
    setLoading(true)
    setError(null)
    setTranscript("")
    setSummary(null)
    setStep("gathering")
    setErrorStep(null)
    setView("transcript")

    try {
      const transcriptResult = await fetchTranscript(trimmedVideoId)
      const segments = transcriptResult.transcript

      setTranscript(formatTranscript(segments))
      setStep("summarizing")

      try {
        const summaryResult = await fetchSummary(segments)
        setSummary(summaryResult.bullets)
        setStep("complete")
        setView("summary")
      } catch (summaryErr) {
        const message =
          summaryErr instanceof Error
            ? summaryErr.message
            : "An unexpected error occurred while generating the summary."
        setError(message)

        setErrorStep("summarizing")
        setStep("error")
      }
    } catch (transcriptErr) {
      const message =
        transcriptErr instanceof Error
          ? transcriptErr.message
          : "An unexpected error occurred while fetching the transcript."
      setError(message)
      // Without VisparkServiceError, default to gathering on transcript failure
      setErrorStep("gathering")
      setStep("error")
    } finally {
      setLoading(false)
    }
  }

  const isSubmitting = step === "gathering" || step === "summarizing"

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gray-900 text-white p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-3xl"
        aria-busy={loading}
      >
        <label
          htmlFor={inputId}
          className="block mb-2 text-sm text-gray-300"
        >
          Enter video ID and press Enter
        </label>
        <div className="flex">
          <input
            id={inputId}
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            placeholder="e.g. dQw4w9WgXcQ"
            className="flex-1 px-3 py-2 rounded-l-md bg-gray-800 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-r-md text-white disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Fetch vispark"
            disabled={loading}
          >
            GO
          </button>
        </div>
      </form>

      {(summary || transcript) && (
        <ViewToggle
          view={view}
          hasSummary={Boolean(summary && summary.length > 0)}
          hasTranscript={Boolean(transcript)}
          onChange={(next) => setView(next)}
        />
      )}

      <div className="w-full max-w-3xl mt-4">
        <ProgressTimeline
          step={step}
          errorStep={errorStep}
          isSubmitting={isSubmitting}
          error={error}
        />

        {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}

        {view === "summary" && summary && summary.length > 0 && (
          <SummaryList items={summary} />
        )}

        {view === "transcript" && transcript && (
          <TranscriptView transcript={transcript} />
        )}
      </div>
    </div>
  )
}

export default VisparkPage

import { useId, useState } from "react"
import { supabase } from "@/config/supabaseClient.ts"

type TranscriptItem = {
  text: string
  offset?: number
  duration?: number
}

type TranscriptServiceResponse =
  | {
      data: {
        videoId: string
        transcript: TranscriptItem[]
        lang?: string
      }
    }
  | {
      error: string
      message: string
    }

type SummaryServiceResponse =
  | {
      data: {
        bullets: string[]
      }
    }
  | {
      error: string
      message: string
    }

const formatTranscript = (segments: TranscriptItem[]): string =>
  segments
    .map(({ text }) => text.trim())
    .filter((segment) => segment.length > 0)
    .join("\n")

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
      // Step 1: Gather transcript
      const response = await fetch(
        "http://127.0.0.1:54321/functions/v1/transcript",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
            Authorization: `Bearer ${
              (await supabase.auth.getSession()).data.session?.access_token
              ?? (import.meta.env.VITE_SUPABASE_ANON_KEY as string)
            }`,
          },
          body: JSON.stringify({
            videoId: trimmedVideoId,
          }),
        },
      )

      const body = (await response
        .json()
        .catch(() => null)) as TranscriptServiceResponse | null

      if (!response.ok) {
        const message =
          body && "message" in body && typeof body.message === "string"
            ? body.message
            : "Failed to fetch transcript. Please try again."
        setError(message)
        setErrorStep("gathering")
        setStep("error")
        return
      }

      if (!body || !("data" in body) || !Array.isArray(body.data.transcript)) {
        setError("Unexpected response format from transcript service.")
        setErrorStep("gathering")
        setStep("error")
        return
      }

      const segments = body.data.transcript
      setTranscript(formatTranscript(segments))
      setStep("summarizing")

      // Step 2: Summarize contents
      try {
        const summaryResponse = await fetch(
          "http://127.0.0.1:54321/functions/v1/summary",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
              Authorization: `Bearer ${
                (await supabase.auth.getSession()).data.session?.access_token
                ?? (import.meta.env.VITE_SUPABASE_ANON_KEY as string)
              }`,
            },
            body: JSON.stringify({
              transcripts: segments,
            }),
          },
        )

        const summaryBody = (await summaryResponse
          .json()
          .catch(() => null)) as SummaryServiceResponse | null

        if (!summaryResponse.ok) {
          const message =
            summaryBody
            && "message" in summaryBody
            && typeof summaryBody.message === "string"
              ? summaryBody.message
              : "Failed to fetch summary. Please try again."
          setError(message)
          setErrorStep("summarizing")
          setStep("error")
        } else if (
          !summaryBody
          || !("data" in summaryBody)
          || !Array.isArray(summaryBody.data.bullets)
        ) {
          setError("Unexpected response format from summary service.")
          setErrorStep("summarizing")
          setStep("error")
        } else {
          setSummary(summaryBody.data.bullets)
          setStep("complete")
          // After summary finishes loading, display summary by default
          setView("summary")
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while generating the summary."
        setError(message)
        setErrorStep("summarizing")
        setStep("error")
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while fetching the transcript."
      setError(message)
      setErrorStep("gathering")
      setStep("error")
    } finally {
      setLoading(false)
    }
  }

  const isGatheringActive = step === "gathering"
  const isGatheringDone = step === "summarizing" || step === "complete"
  const isGatheringError = step === "error" && errorStep === "gathering"
  const isSummarizingActive = step === "summarizing"
  const isSummarizingDone = step === "complete"
  const isSummarizingError = step === "error" && errorStep === "summarizing"
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

      {/* Toggle between Summary and Transcript */}
      {(summary || transcript) && (
        <div className="w-full max-w-3xl mt-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-1 rounded-md p-1 bg-gray-800 border border-gray-700">
            <button
              type="button"
              onClick={() => setView("summary")}
              disabled={!summary || summary.length === 0}
              className={`px-3 py-1 text-sm rounded [&:not(:disabled)]:hover:bg-gray-700 transition ${
                view === "summary"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Summary
            </button>
            <button
              type="button"
              onClick={() => setView("transcript")}
              disabled={!transcript}
              className={`px-3 py-1 text-sm rounded [&:not(:disabled)]:hover:bg-gray-700 transition ${
                view === "transcript"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Transcript
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl mt-4">
        {/* Timeline while submitting or when error occurs */}
        {(isSubmitting || step === "error") && (
          <div
            className="bg-gray-800 border border-gray-700 rounded-md p-4"
            aria-live="polite"
          >
            <div className="text-xs text-gray-400 mb-3">Progress</div>
            <ol className="relative border-l border-gray-700 pl-6">
              {/* Step 1: Gathering transcripts */}
              <li className="mb-6">
                <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 border border-gray-600">
                  {isGatheringError ? (
                    <svg
                      className="h-3.5 w-3.5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2H9v-2zm0-8h2v6H9V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : isGatheringDone ? (
                    <svg
                      className="h-3.5 w-3.5 text-green-400 transition-transform duration-300"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-7.364 7.364a1 1 0 01-1.415 0L3.293 9.736a1 1 0 011.414-1.414l3 3 6.657-6.657a1 1 0 011.343-.372z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : isGatheringActive ? (
                    <svg
                      className="h-3.5 w-3.5 text-indigo-400 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                      ></path>
                    </svg>
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-600"></span>
                  )}
                </span>
                <div
                  className={`ml-2 ${isGatheringActive ? "animate-pulse" : ""}`}
                >
                  <div className="font-medium text-sm">
                    {isGatheringDone
                      ? "Transcripts gathered"
                      : isGatheringError
                        ? "Failed to gather transcripts"
                        : "Gathering transcripts"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {isGatheringError
                      ? (error ?? "Error during transcript fetching.")
                      : "Fetching and cleaning the video transcript"}
                  </div>
                </div>
              </li>

              {/* Step 2: Summarizing contents */}
              <li className="mb-0">
                <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 border border-gray-600">
                  {isSummarizingError ? (
                    <svg
                      className="h-3.5 w-3.5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2H9v-2zm0-8h2v6H9V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : isSummarizingDone ? (
                    <svg
                      className="h-3.5 w-3.5 text-green-400 transition-transform duration-300"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-7.364 7.364a1 1 0 01-1.415 0L3.293 9.736a1 1 0 011.414-1.414l3 3 6.657-6.657a1 1 0 011.343-.372z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : isSummarizingActive ? (
                    <svg
                      className="h-3.5 w-3.5 text-indigo-400 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                      ></path>
                    </svg>
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-600"></span>
                  )}
                </span>
                <div
                  className={`ml-2 ${isSummarizingActive ? "animate-pulse" : ""}`}
                >
                  <div className="font-medium text-sm">
                    {isSummarizingDone
                      ? "Summary generated"
                      : isSummarizingError
                        ? "Failed to summarize contents"
                        : "Summarizing contents"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {isSummarizingError
                      ? (error ?? "Error during summarization.")
                      : "Creating concise bullet-point summary"}
                  </div>
                </div>
              </li>
            </ol>
          </div>
        )}

        {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}

        {/* Content view - after completion default to Summary (handled by view state) */}
        {view === "summary" && summary && summary.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-400 mb-2">Summary</div>
            <ul className="list-disc list-inside text-sm leading-relaxed bg-gray-800 border border-gray-700 rounded-md p-4">
              {summary.map((item) => (
                <li
                  key={item}
                  className="mb-1"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {view === "transcript" && transcript && (
          <div className="mt-3">
            <div className="text-xs text-gray-400 mb-2">Transcript</div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap bg-gray-800 border border-gray-700 rounded-md p-4">
              {transcript}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VisparkPage

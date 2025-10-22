import type { FC } from "react"

type Step = "idle" | "gathering" | "summarizing" | "complete" | "error"
type ErrorStep = "gathering" | "summarizing" | null

type ProgressTimelineProps = {
  step: Step
  errorStep: ErrorStep
  isSubmitting: boolean
  error: string | null
}

const ProgressTimeline: FC<ProgressTimelineProps> = ({
  step,
  errorStep,
  isSubmitting,
  error,
}) => {
  const isGatheringActive = step === "gathering"
  const isGatheringDone = step === "summarizing" || step === "complete"
  const isGatheringError = step === "error" && errorStep === "gathering"
  const isSummarizingActive = step === "summarizing"
  const isSummarizingDone = step === "complete"
  const isSummarizingError = step === "error" && errorStep === "summarizing"

  if (!isSubmitting && step !== "error") {
    return null
  }

  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-md p-4 mb-2"
      aria-live="polite"
    >
      <div className="text-xs text-gray-400 mb-3">Progress</div>
      <ol className="relative border-l border-gray-700 pl-6">
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
          <div className={`ml-2 ${isGatheringActive ? "animate-pulse" : ""}`}>
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
          <div className={`ml-2 ${isSummarizingActive ? "animate-pulse" : ""}`}>
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
  )
}

export default ProgressTimeline

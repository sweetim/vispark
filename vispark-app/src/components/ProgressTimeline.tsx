import type { FC } from "react"
import {
  CircleNotchIcon,
  CheckCircleIcon,
  WarningCircleIcon
} from "@phosphor-icons/react"

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

  if (!isSubmitting && step !== "error" && step !== "gathering") {
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
              <WarningCircleIcon
                size={14}
                className="text-red-400"
                weight="fill"
              />
            ) : isGatheringDone ? (
              <CheckCircleIcon
                size={14}
                className="text-green-400 transition-transform duration-300"
                weight="fill"
              />
            ) : isGatheringActive ? (
              <CircleNotchIcon
                size={14}
                className="text-indigo-400 animate-spin"
              />
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
              <WarningCircleIcon
                size={14}
                className="text-red-400"
                weight="fill"
              />
            ) : isSummarizingDone ? (
              <CheckCircleIcon
                size={14}
                className="text-green-400 transition-transform duration-300"
                weight="fill"
              />
            ) : isSummarizingActive ? (
              <CircleNotchIcon
                size={14}
                className="text-indigo-400 animate-spin"
              />
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

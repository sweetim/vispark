import type { FC } from "react"
import { match } from "ts-pattern"
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
  const shouldRender = match({ step, isSubmitting })
    .with({ step: "error" }, () => true)
    .with({ step: "gathering" }, () => true)
    .with({ isSubmitting: true }, () => true)
    .otherwise(() => false)

  if (!shouldRender) {
    return null
  }

  const gatheringStatus = match({ step, errorStep })
    .with({ step: "error", errorStep: "gathering" }, () => "error" as const)
    .with({ step: "summarizing" }, () => "done" as const)
    .with({ step: "complete" }, () => "done" as const)
    .with({ step: "gathering" }, () => "active" as const)
    .otherwise(() => "idle" as const)

  const summarizingStatus = match({ step, errorStep })
    .with({ step: "error", errorStep: "summarizing" }, () => "error" as const)
    .with({ step: "complete" }, () => "done" as const)
    .with({ step: "summarizing" }, () => "active" as const)
    .otherwise(() => "idle" as const)

  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-md p-4 mb-2"
      aria-live="polite"
    >
      <div className="text-xs text-gray-400 mb-3">Progress</div>
      <ol className="relative border-l border-gray-700 pl-6">
        <li className="mb-6">
          <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 border border-gray-600">
            {match(gatheringStatus)
              .with("error", () => (
                <WarningCircleIcon
                  size={15}
                  className="text-red-400"
                  weight="fill"
                />
              ))
              .with("done", () => (
                <CheckCircleIcon
                  size={15}
                  className="text-green-400 transition-transform duration-300"
                  weight="fill"
                />
              ))
              .with("active", () => (
                <CircleNotchIcon
                  size={15}
                  className="text-indigo-400 animate-spin"
                />
              ))
              .otherwise(() => (
                <span className="h-2.5 w-2.5 rounded-full bg-gray-600"></span>
              ))}
          </span>
          <div className={`ml-2 ${gatheringStatus === "active" ? "animate-pulse" : ""}`}>
            <div className="font-medium text-sm text-white">
              {match(gatheringStatus)
                .with("done", () => "Transcripts gathered")
                .with("error", () => "Failed to gather transcripts")
                .otherwise(() => "Gathering transcripts")}
            </div>
            <div className="text-xs text-gray-400">
              {match(gatheringStatus)
                .with("error", () => error ?? "Error during transcript fetching.")
                .otherwise(() => "Fetching and cleaning the video transcript")}
            </div>
          </div>
        </li>

        <li className="mb-0">
          <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 border border-gray-600">
            {match(summarizingStatus)
              .with("error", () => (
                <WarningCircleIcon
                  size={15}
                  className="text-red-400"
                  weight="fill"
                />
              ))
              .with("done", () => (
                <CheckCircleIcon
                  size={15}
                  className="text-green-400 transition-transform duration-300"
                  weight="fill"
                />
              ))
              .with("active", () => (
                <CircleNotchIcon
                  size={15}
                  className="text-indigo-400 animate-spin"
                />
              ))
              .otherwise(() => (
                <span className="h-2.5 w-2.5 rounded-full bg-gray-600"></span>
              ))}
          </span>
          <div className={`ml-2 ${summarizingStatus === "active" ? "animate-pulse" : ""}`}>
            <div className="font-medium text-sm text-white">
              {match(summarizingStatus)
                .with("done", () => "Summary generated")
                .with("error", () => "Failed to summarize contents")
                .otherwise(() => "Summarizing contents")}
            </div>
            <div className="text-xs text-gray-400">
              {match(summarizingStatus)
                .with("error", () => error ?? "Error during summarization.")
                .otherwise(() => "Creating concise bullet-point summary")}
            </div>
          </div>
        </li>
      </ol>
    </div>
  )
}

export default ProgressTimeline

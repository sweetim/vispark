import type { FC } from "react"
import { useTranslation } from "react-i18next"

type ViewKey = "summary" | "transcript"

type ViewToggleProps = {
  view: ViewKey
  hasSummary: boolean
  hasTranscript: boolean
  isTranscriptLoading?: boolean
  onChange: (view: ViewKey) => void
}

const ViewToggle: FC<ViewToggleProps> = ({
  view,
  hasSummary,
  hasTranscript,
  isTranscriptLoading = false,
  onChange,
}) => {
  const { t } = useTranslation()
  const handleSelect = (nextView: ViewKey, disabled: boolean) => {
    if (disabled) {
      return
    }

    onChange(nextView)
  }

  return (
    <div className="w-full max-w-3xl mt-2 flex items-center justify-between">
      <div className="inline-flex items-center gap-1 rounded-md p-1 bg-gray-800 border border-gray-700">
        <button
          type="button"
          onClick={() => handleSelect("summary", !hasSummary)}
          disabled={!hasSummary}
          className={`px-3 py-1 text-sm rounded not-disabled:hover:bg-gray-700 transition ${
            view === "summary" ? "bg-indigo-600 text-white" : "text-gray-300"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {t("viewToggle.summary")}
        </button>
        <button
          type="button"
          onClick={() => handleSelect("transcript", !hasTranscript)}
          disabled={!hasTranscript}
          className={`px-3 py-1 text-sm rounded not-disabled:hover:bg-gray-700 transition flex items-center gap-2 ${
            view === "transcript" ? "bg-indigo-600 text-white" : "text-gray-300"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {t("viewToggle.transcript")}
          {isTranscriptLoading && (
            <svg
              className="h-3.5 w-3.5 animate-spin"
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
          )}
        </button>
      </div>
    </div>
  )
}

export default ViewToggle

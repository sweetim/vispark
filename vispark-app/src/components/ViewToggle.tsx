import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { CircleNotchIcon } from "@phosphor-icons/react"

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
            <CircleNotchIcon
              size={14}
              className="animate-spin"
            />
          )}
        </button>
      </div>
    </div>
  )
}

export default ViewToggle

import { useTranslation } from "react-i18next"
import SummaryList from "@/components/SummaryList"
import TranscriptView from "@/components/TranscriptView"

type VideoContentProps = {
  view: "summary" | "transcript"
  hasSummary: boolean
  hasTranscript: boolean
  summary: string[] | null
  transcript: string
  isGenerating: boolean
  loading: boolean
  error: string | null
}

const VideoContent = ({
  view,
  hasSummary,
  hasTranscript,
  summary,
  transcript,
  isGenerating,
  loading,
  error,
}: VideoContentProps) => {
  const { t } = useTranslation()

  if (error) {
    return (
      <div className="text-sm text-red-400 border border-red-400/30 rounded-md px-3 py-2 bg-red-900/20">
        {error}
      </div>
    )
  }

  if (view === "summary" && hasSummary) {
    return <SummaryList items={summary ?? []} />
  }

  if (view === "transcript" && hasTranscript) {
    return <TranscriptView transcript={transcript} />
  }

  if (!isGenerating && !loading && !hasSummary && !hasTranscript && !error) {
    return (
      <div className="text-sm text-gray-400 border border-dashed border-gray-700 rounded-md px-4 py-6 text-center">
        {t("videos.noTranscriptOrSummary")}
      </div>
    )
  }

  return null
}

export default VideoContent

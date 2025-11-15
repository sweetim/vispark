import { useTranslation } from "react-i18next"
import TranscriptView from "@/components/TranscriptView"

type VideoContentProps = {
  view: "summary" | "transcript"
  hasSummary: boolean
  hasTranscript: boolean
  summary: string | null
  streamingSummary: string
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
  streamingSummary,
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

  if (view === "summary" && (hasSummary || streamingSummary.length > 0)) {
    // Show streaming summary if available, otherwise show regular summary
    const isStreaming = streamingSummary.length > 0
    const summaryText = isStreaming ? streamingSummary : (summary ?? "")

    return (
      <div className={`text-sm leading-relaxed bg-gray-800 border border-gray-700 rounded-md p-4 ${isStreaming ? 'border-blue-500/30' : ''}`}>
        <div className="whitespace-pre-wrap">
          {summaryText}
        </div>
        {isStreaming && (
          <div className="text-gray-400 animate-pulse mt-2">
            <span className="inline-block w-2 h-4 bg-gray-400 rounded-full mr-2"></span>
            Generating...
          </div>
        )}
      </div>
    )
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

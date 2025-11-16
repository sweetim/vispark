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

  if (view === "summary") {
    // Show streaming summary if available, otherwise show regular summary
    const isStreaming = streamingSummary.length > 0
    const summaryText = isStreaming ? streamingSummary : (summary ?? "")

    if (hasSummary || streamingSummary.length > 0) {
      return (
        <div className={`text-sm leading-relaxed bg-gray-800 border border-gray-700 rounded-md p-4 ${isStreaming ? 'border-blue-500/30' : ''}`}>
          <div className="whitespace-pre-wrap">
            {summaryText}
          </div>
        </div>
      )
    }

    // Show loading state when summary is being generated
    if (isGenerating) {
      return (
        <div className="text-sm leading-relaxed bg-gray-800 border border-blue-500/30 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse flex space-x-1">
              <div className="h-1 w-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-1 w-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-1 w-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-blue-400">{t("videos.generatingSummary")}</span>
          </div>
        </div>
      )
    }

    // Show message when no summary is available yet
    if (hasTranscript && !hasSummary && !isGenerating) {
      return (
        <div className="text-sm text-gray-400 border border-dashed border-gray-700 rounded-md px-4 py-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{t("videos.noSummaryYet")}</span>
            <span className="text-xs text-gray-500">{t("videos.summaryWillBeGenerated")}</span>
          </div>
        </div>
      )
    }
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

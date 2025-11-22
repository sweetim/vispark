import { useTranslation } from "react-i18next"
import { TranscriptView } from "@/components"

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
      <div className="glass-effect text-sm text-red-400 border border-red-400/30 rounded-xl px-4 py-3 bg-red-900/20 backdrop-blur-sm">
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
        <div className={`glass-effect text-sm leading-relaxed bg-white/5 border ${isStreaming ? 'border-blue-500/30 bg-blue-500/5' : 'border-gray-700/50'} rounded-xl p-4 backdrop-blur-sm transition-all duration-300`}>
          <div className="whitespace-pre-wrap">
            {summaryText}
          </div>
        </div>
      )
    }

    // Show loading state when summary is being generated
    if (isGenerating) {
      return (
        <div className="glass-effect text-sm leading-relaxed bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-500/30 rounded-xl p-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-pulse"></div>
          <div className="relative flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative flex space-x-2">
                <div className="h-3 w-3 bg-linear-to-r from-blue-400 to-indigo-400 rounded-full animate-bounce shadow-lg shadow-blue-400/50" style={{ animationDelay: '0ms' }}></div>
                <div className="h-3 w-3 bg-linear-to-r from-indigo-400 to-purple-400 rounded-full animate-bounce shadow-lg shadow-indigo-400/50" style={{ animationDelay: '150ms' }}></div>
                <div className="h-3 w-3 bg-linear-to-r from-purple-400 to-pink-400 rounded-full animate-bounce shadow-lg shadow-purple-400/50" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
            <div className="text-center">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-indigo-300 to-purple-300 font-medium animate-pulse">
                {t("videos.generatingSummary")}
              </span>
            </div>
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
      <div className="glass-effect text-sm text-gray-400 border border-dashed border-gray-700/50 rounded-xl px-4 py-8 text-center backdrop-blur-sm">
        {t("videos.noTranscriptOrSummary")}
      </div>
    )
  }

  return null
}

export default VideoContent

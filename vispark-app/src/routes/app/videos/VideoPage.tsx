import { Navigate, useSearch } from "@tanstack/react-router"
import ProgressTimeline from "@/components/ProgressTimeline"
import VideoContent from "@/components/VideoContent"
import VideoMetadataCard from "@/components/VideoMetadataCard"
import VideoMetadataSkeleton from "@/components/VideoMetadataSkeleton"
import ViewToggle from "@/components/ViewToggle"
import { useVideoProcessing } from "@/hooks/useVideoProcessing"

const VideosVideoPage = () => {
  const search = useSearch({ from: "/app/videos/$videoId" })

  const {
    loading,
    transcript,
    summary,
    streamingSummary,
    error,
    step,
    errorStep,
    view,
    videoMetadata,
    rawVideoId,
    isGenerating,
    hasSummary,
    hasTranscript,
    showViewToggle,
    setView,
    setUserViewPreference,
  } = useVideoProcessing()
  console.log({videoMetadata, transcript, streamingSummary})
  if (rawVideoId.length === 0) {
    return (
      <Navigate
        to="/app/videos"
        replace
        search={{ q: undefined }}
      />
    )
  }

  return (
    <div className="w-full max-w-3xl h-full space-y-2 overflow-y-auto">
      <div className="sticky top-0 z-20 space-y-3 py-2 backdrop-blur">
        <div className="w-full">
          {videoMetadata ? (
            <VideoMetadataCard metadata={{
              channelId: search.channelId,
              channelTitle: search.channelTitle,
              thumbnails: search.thumbnail,
              title: search.title,
              videoId: rawVideoId
            }} />
          ) : (
            <VideoMetadataSkeleton />
          )}
        </div>

        {showViewToggle && (
          <ViewToggle
            view={view}
            hasSummary={hasSummary}
            hasTranscript={hasTranscript}
            onChange={(newView) => {
              setView(newView)
              setUserViewPreference(newView)
            }}
          />
        )}
      </div>

      <ProgressTimeline
        step={step}
        errorStep={errorStep}
        isSubmitting={isGenerating}
        error={error}
      />

      <VideoContent
        view={view}
        hasSummary={hasSummary}
        hasTranscript={hasTranscript}
        summary={summary}
        streamingSummary={streamingSummary}
        transcript={transcript}
        isGenerating={isGenerating}
        loading={loading}
        error={error}
      />
    </div>
  )
}

export default VideosVideoPage

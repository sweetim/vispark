import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { extractYouTubeVideoId } from "@/utils/youtube"
import { updateVisparkCallbackFlag } from "@/services/vispark"
import { SearchForm } from "@/components"
import HistoryList from "./components/HistoryList"
import { useVisparks } from "@/hooks/useVisparks"
import { useVideoStore } from "@/stores/videoStore"

export type VideosSavedItem = {
  id: string
  createdTime: string
  publishedAt: string
  metadata: {
    videoId: string
    title: string
    channelId: string
    channelTitle: string
    thumbnails: string
  }
  summaries: string
  isNewFromCallback: boolean
}

const VideosSearchPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  // For now, we'll get saved visparks directly from the hook
  // TODO: Implement proper context sharing with TanStack Router
  const { visparks, mutate } = useVisparks()
  const { processingVideoId, status, videoMetadata } = useVideoStore()

  // Always fetch the latest visparks when the page loads
  useEffect(() => {
    mutate()
  }, [mutate])
  // Add currently processing video if it's not already in the list
  const shouldAddProcessingVideo = processingVideoId && status !== "idle" && status !== "complete" && videoMetadata && !visparks.some(v => v.video_id === processingVideoId)

  const savedVideos: VideosSavedItem[] = [
    ...visparks.map((item) => ({
      id: item.id,
      createdTime: item.created_at,
      publishedAt: item.video_published_at,
      metadata: {
        channelId: item.video_channel_id,
        title: item.video_title,
        thumbnails: item.video_thumbnails,
        videoId: item.video_id,
        channelTitle: item.video_channel_title
      },
      summaries: item.summaries,
      isNewFromCallback: item.is_new_from_callback,
    })),
    ...(shouldAddProcessingVideo ? [{
      id: `processing-${processingVideoId}`,
      createdTime: new Date().toISOString(),
      publishedAt: videoMetadata.publishedAt || new Date().toISOString(),
      metadata: {
        channelId: videoMetadata.channelId,
        title: videoMetadata.title,
        thumbnails: videoMetadata.thumbnails,
        videoId: processingVideoId,
        channelTitle: videoMetadata.channelTitle
      },
      summaries: "",
      isNewFromCallback: false,
    }] : [])
  ]
  const [videoId, setVideoId] = useState("")

  const handleVideoSelect = async (videoId: string) => {
    // Find the vispark with this video ID
    const vispark = savedVideos.find(v => v.metadata.videoId === videoId)

    // If it's a new video from callback, update the flag
    if (vispark?.isNewFromCallback) {
      try {
        await updateVisparkCallbackFlag(vispark.id, false)
        // Refresh the visparks list to update the UI
        mutate()
      } catch (error) {
        console.error("Failed to update vispark callback flag:", error)
      }
    }

    navigate({
      to: `/app/videos/${videoId}`,
      search: {
        title: vispark?.metadata.title || "",
        channelTitle: vispark?.metadata.channelTitle || "",
        thumbnail: vispark?.metadata.thumbnails || "",
        createdTime: vispark?.publishedAt || vispark?.createdTime || new Date().toISOString(),
        channelId: vispark?.metadata.channelId || "",
      }
    })
  }

  return (
    <div className="w-full max-w-3xl h-full space-y-2 overflow-y-auto">
      <SearchForm
        value={videoId}
        onChange={setVideoId}
        onSubmit={(value) => {
          const trimmedInput = value.trim()
          if (!trimmedInput) {
            return
          }

          // Try to extract video ID from URL or use input directly if it's already an ID
          const extractedVideoId = extractYouTubeVideoId(trimmedInput)
          const finalVideoId = extractedVideoId || trimmedInput

          if (!finalVideoId) {
            return
          }

          // Navigate to video page with just the video ID
          navigate({
            to: `/app/videos/${finalVideoId}`
          })
        }}
        placeholder={t("videos.searchPlaceholder")}
        disabled={false}
      />

      <HistoryList
        items={savedVideos}
        onSelect={handleVideoSelect}
      />
    </div>
  )
}

export default VideosSearchPage

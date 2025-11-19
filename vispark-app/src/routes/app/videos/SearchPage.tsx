import { type FormEvent, useId, useMemo, useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { SparkleIcon } from "@phosphor-icons/react"
import { extractYouTubeVideoId } from "../../../utils/youtube"
import { updateVisparkCallbackFlag } from "@/services/vispark"
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
  const reactId = useId()
  const inputId = useMemo(() => `videos-video-id-${reactId}`, [reactId])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedInput = videoId.trim()
    if (!trimmedInput) {
      return
    }

    // Try to extract video ID from URL or use the input directly if it's already an ID
    const extractedVideoId = extractYouTubeVideoId(trimmedInput)
    const finalVideoId = extractedVideoId || trimmedInput

    if (!finalVideoId) {
      return
    }

    // Navigate to video page with just the video ID
    navigate({
      to: `/app/videos/${finalVideoId}`
    })
  }

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
      <div className="sticky top-0 z-50 bg-gray-900 py-2 backdrop-blur-sm bg-opacity-95 border-b border-gray-800">
        <form
          onSubmit={handleSubmit}
          className="space-y-2"
          aria-label={t("videos.search")}
        >
          <div className="flex">
            <input
              id={inputId}
              value={videoId}
              onChange={(event) => setVideoId(event.target.value)}
              placeholder={t("videos.searchPlaceholder")}
              className="flex-1 px-3 py-2 rounded-l-md bg-gray-800 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-r-md text-white disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={t("videos.search")}
              disabled={!videoId.trim()}
            >
              <SparkleIcon size={20} weight="fill" className="text-white" />
            </button>
          </div>
        </form>
      </div>

      <HistoryList
        items={savedVideos}
        onSelect={handleVideoSelect}
      />
    </div>
  )
}

export default VideosSearchPage

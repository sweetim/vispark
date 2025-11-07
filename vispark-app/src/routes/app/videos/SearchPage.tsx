import { type FormEvent, useId, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { extractYouTubeVideoId } from "../../../utils/youtube"
import { useVisparksWithMetadata } from "@/hooks/useVisparks"
import HistoryList from "./components/HistoryList"

export type VideosSavedItem = {
  id: string
  createdTime: string
  metadata: {
    videoId: string
    title: string
    channelId: string
    channelTitle: string
    thumbnails: {
      default: { url: string }
      medium: { url: string }
      high: { url: string }
    }
  }
  summaries: string[]
}

const VideosSearchPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  // For now, we'll get saved visparks directly from the hook
  // TODO: Implement proper context sharing with TanStack Router
  const { visparks } = useVisparksWithMetadata(20)
  const savedVideos: VideosSavedItem[] = visparks.map((vispark) => ({
    id: vispark.id,
    createdTime: vispark.createdTime,
    metadata: vispark.metadata,
    summaries: vispark.summaries,
  }))
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

    navigate({ to: `/app/videos/${finalVideoId}` })
  }

  return (
    <div className="w-full max-w-3xl h-full space-y-6 overflow-y-auto pb-20">
      <div className="sticky top-0 z-10 bg-gray-900 py-4">
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
              {t("videos.go")}
            </button>
          </div>
        </form>
      </div>

      <HistoryList
        items={savedVideos}
        onSelect={(id) => navigate({ to: `/app/videos/${id}` })}
      />
    </div>
  )
}

export default VideosSearchPage

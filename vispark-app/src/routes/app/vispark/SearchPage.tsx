import { type FormEvent, useId, useMemo, useState } from "react"
import { useNavigate, useOutletContext } from "react-router"
import { extractYouTubeVideoId } from "../../../utils/youtube"
import HistoryList from "./components/HistoryList"
import type { VisparkOutletContext } from "./Layout"

const VisparkSearchPage = () => {
  const navigate = useNavigate()
  const { savedVisparks } = useOutletContext<VisparkOutletContext>()
  const [videoId, setVideoId] = useState("")
  const reactId = useId()
  const inputId = useMemo(() => `vispark-video-id-${reactId}`, [reactId])

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

    navigate(`/app/vispark/search/${finalVideoId}`)
  }

  return (
    <div className="w-full max-w-3xl h-full space-y-6 overflow-y-auto pb-20">
      <div className="sticky top-0 z-10 bg-gray-900 py-4">
        <form
          onSubmit={handleSubmit}
          className="space-y-2"
          aria-label="Search for a video to create a Vispark"
        >
          <div className="flex">
            <input
              id={inputId}
              value={videoId}
              onChange={(event) => setVideoId(event.target.value)}
              placeholder="Video ID or YouTube URL"
              className="flex-1 px-3 py-2 rounded-l-md bg-gray-800 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-r-md text-white disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Search for vispark"
              disabled={!videoId.trim()}
            >
              GO
            </button>
          </div>
        </form>
      </div>

      <HistoryList
        items={savedVisparks}
        onSelect={(id) => navigate(`/app/vispark/search/${id}`)}
      />
    </div>
  )
}

export default VisparkSearchPage

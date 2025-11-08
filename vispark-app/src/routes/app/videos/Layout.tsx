import { Outlet } from "@tanstack/react-router"

export type VideosSavedItem = {
  id: string
  createdTime: string
  publishedAt?: string
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

const VideosLayout = () => {
  return (
    <div className="flex flex-col items-center h-full w-full bg-gray-900 text-white p-2">
      <Outlet />
    </div>
  )
}

export default VideosLayout

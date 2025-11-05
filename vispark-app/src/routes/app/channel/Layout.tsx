import { useCallback, useState } from "react"
import { Outlet } from "react-router"
import type { ChannelMetadata, ChannelVideo } from "@/services/channel.ts"
import {
  getChannelDetails,
  getChannelVideosWithSummaries,
} from "@/services/channel.ts"

export type ChannelSavedItem = {
  id: string
  createdTime: string
  metadata: ChannelMetadata
  videos: ChannelVideo[]
}

export type ChannelOutletContext = {
  channelDetails: ChannelMetadata | null
  channelVideos: ChannelVideo[]
  loading: boolean
  error: string | null
  refreshChannelData: (channelId: string) => Promise<void>
}

const ChannelLayout = () => {
  const [channelDetails, setChannelDetails] = useState<ChannelMetadata | null>(
    null,
  )
  const [channelVideos, setChannelVideos] = useState<ChannelVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshChannelData = useCallback(async (channelId: string) => {
    if (!channelId) return

    setLoading(true)
    setError(null)

    try {
      const [details, videos] = await Promise.all([
        getChannelDetails(channelId),
        getChannelVideosWithSummaries(channelId),
      ])

      setChannelDetails(details)
      setChannelVideos(videos)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while fetching channel data."
      setError(message)
      setChannelDetails(null)
      setChannelVideos([])
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="flex flex-col items-center h-full w-full bg-gray-900 text-white p-2">
      <Outlet
        context={{
          channelDetails,
          channelVideos,
          loading,
          error,
          refreshChannelData,
        }}
      />
    </div>
  )
}

export default ChannelLayout

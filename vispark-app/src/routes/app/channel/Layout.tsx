import { Outlet } from "@tanstack/react-router"
import type { ChannelMetadata, ChannelVideo } from "@/services/channel.ts"

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
  return (
    <div className="flex flex-col items-center h-full w-full bg-gray-900 text-white p-2">
      <Outlet />
    </div>
  )
}

export default ChannelLayout

import { Outlet } from "react-router"
import { useVisparksWithMetadata } from "@/hooks/useVisparks"

export type VisparkSavedItem = {
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

export type VisparkOutletContext = {
  savedVisparks: VisparkSavedItem[]
  refreshSavedVisparks: () => Promise<void>
}

const VisparkLayout = () => {
  const { visparks, mutate } = useVisparksWithMetadata(20)

  const refreshSavedVisparks = async () => {
    await mutate()
  }

  // Transform visparks to match expected format
  const savedVisparks: VisparkSavedItem[] = visparks.map((vispark) => ({
    id: vispark.id,
    createdTime: vispark.createdTime,
    metadata: vispark.metadata,
    summaries: vispark.summaries,
  }))

  return (
    <div className="flex flex-col items-center h-full w-full bg-gray-900 text-white p-2">
      <Outlet
        context={{
          savedVisparks,
          refreshSavedVisparks,
        }}
      />
    </div>
  )
}

export default VisparkLayout

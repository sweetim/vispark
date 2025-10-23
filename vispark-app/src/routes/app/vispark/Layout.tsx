import { useCallback, useEffect, useState } from "react"
import { Outlet } from "react-router"
import type { VideoMetadata } from "@/services/vispark.ts"
import { fetchYouTubeVideoDetails, listVisparks } from "@/services/vispark.ts"

export type VisparkSavedItem = {
  id: string
  createdTime: string
  metadata: VideoMetadata
  summaries: string[]
}

export type VisparkOutletContext = {
  savedVisparks: VisparkSavedItem[]
  refreshSavedVisparks: () => Promise<VisparkSavedItem[]>
}

const VisparkLayout = () => {
  const [savedVisparks, setSavedVisparks] = useState<VisparkSavedItem[]>([])

  const refreshSavedVisparks = useCallback(async () => {
    try {
      const rows = await listVisparks(20)

      if (rows.length === 0) {
        setSavedVisparks([])
        return []
      }

      const hydratedRows = await Promise.all(
        rows.map(async (row) => {
          try {
            const metadata = await fetchYouTubeVideoDetails(row.video_id)
            return {
              id: row.id,
              createdTime: row.created_at,
              summaries: row.summaries,
              metadata,
            } satisfies VisparkSavedItem
          } catch (metadataError) {
            if (process.env.NODE_ENV !== "production" && metadataError) {
              // eslint-disable-next-line no-console
              console.warn(
                "Failed to fetch YouTube video metadata:",
                metadataError,
              )
            }
            return null
          }
        }),
      )

      const filtered = hydratedRows.filter(
        (item): item is VisparkSavedItem => item !== null,
      )

      setSavedVisparks(filtered)
      return filtered
    } catch (error) {
      if (process.env.NODE_ENV !== "production" && error) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load visparks:", error)
      }
      setSavedVisparks([])
      return []
    }
  }, [])

  useEffect(() => {
    void refreshSavedVisparks()
  }, [refreshSavedVisparks])

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-gray-900 text-white p-2">
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

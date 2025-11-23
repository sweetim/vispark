import {VideoMetadataCard} from "@/components"
import type { VideosSavedItem } from "@/hooks/useVisparks"
import { useVideoStore } from "@/stores/videoStore"

type VideosHistoryListProps = {
  items: VideosSavedItem[]
  onSelect: (videoId: string) => void
  emptyMessage?: string
}

const defaultEmptyMessage =
  "You do not have any Videos yet. Search for a video to create one."

const VideosHistoryList = ({
  items,
  onSelect,
  emptyMessage = defaultEmptyMessage,
}: VideosHistoryListProps) => {
  const { processingVideoId, status } = useVideoStore()
  return (
    <section
      aria-label="Recent video history"
      className="space-y-3"
    >
      {items.length === 0 ? (
        <div className="text-sm text-gray-400 border border-dashed border-gray-700 rounded-md px-4 py-6 text-center">
          {emptyMessage}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="relative"
            >
              <VideoMetadataCard
                metadata={item.metadata}
                onClick={() => onSelect(item.metadata.videoId)}
                createdTime={item.publishedAt || item.createdTime}
                isNewFromCallback={item.isNewFromCallback}
                isSummarizing={processingVideoId === item.metadata.videoId && (status === "gathering" || status === "summarizing")}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default VideosHistoryList

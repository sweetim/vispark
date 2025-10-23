import VideoMetadataCard from "@/components/VideoMetadataCard"
import type { VisparkSavedItem } from "../Layout"

type VisparkHistoryListProps = {
  items: VisparkSavedItem[]
  onSelect: (videoId: string) => void
  emptyMessage?: string
}

const defaultEmptyMessage =
  "You do not have any Visparks yet. Search for a video to create one."

const VisparkHistoryList = ({
  items,
  onSelect,
  emptyMessage = defaultEmptyMessage,
}: VisparkHistoryListProps) => {
  return (
    <section
      aria-label="Recent vispark history"
      className="space-y-3"
    >
      {items.length === 0 ? (
        <div className="text-sm text-gray-400 border border-dashed border-gray-700 rounded-md px-4 py-6 text-center">
          {emptyMessage}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="relative"
            >
              <VideoMetadataCard
                metadata={item.metadata}
                onClick={() => onSelect(item.metadata.videoId)}
                createdTime={item.createdTime}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default VisparkHistoryList

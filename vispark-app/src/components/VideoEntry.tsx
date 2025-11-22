import { formatDistanceToNow } from "date-fns"

type ChannelGroupEntry = {
  id: string
  videoId: string
  videoTitle: string
  channelTitle: string
  channelId: string
  createdTime: string
  thumbnailUrl: string
}

type VideoEntryProps = {
  entry: ChannelGroupEntry
  processingVideoId: string | null
  processingStatus: "idle" | "gathering" | "summarizing" | "complete" | "error"
  onSelect: () => void
}

const VideoEntry = ({
  entry,
  processingVideoId,
  processingStatus,
  onSelect,
}: VideoEntryProps) => {
  const isSummarizing = processingStatus === "gathering" || processingStatus === "summarizing"
  const isCurrentlyProcessing = processingVideoId === entry.videoId && isSummarizing

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex items-center gap-3 rounded-lg border border-white/10 bg-gray-900/50 p-3 text-left backdrop-blur transition hover:bg-gray-800/50 hover:border-white/20"
    >
      <div className="relative w-24 shrink-0 overflow-hidden rounded">
        <img
          src={entry.thumbnailUrl}
          alt={entry.videoTitle}
          loading="lazy"
          className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {isCurrentlyProcessing && (
          <div className="absolute inset-0 flex items-center justify-center z-40">
            <div className="rounded-lg bg-black/60 backdrop-blur-md px-3 py-2 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white">
            {entry.videoTitle}
          </p>
        </div>
        <p className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(entry.createdTime), { addSuffix: true })}
        </p>
      </div>
    </button>
  )
}


export default VideoEntry
export type { VideoEntryProps, ChannelGroupEntry }

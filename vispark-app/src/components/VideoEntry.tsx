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
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white text-xs mt-1">Processing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white">
            {entry.videoTitle}
          </p>
          {isCurrentlyProcessing && (
            <div className="inline-flex h-5 items-center rounded-md px-2 backdrop-blur shrink-0 bg-blue-600/80 text-xs font-medium tracking-wide text-white border border-blue-400/30 animate-pulse">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                <span className="text-xs font-medium text-white">
                  SUMMARIZING
                </span>
              </div>
            </div>
          )}
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

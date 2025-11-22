import { useNavigate } from "@tanstack/react-router"
import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react"
import { CountBadge } from "@/components"
import { VideoEntry } from "@/components"

type ChannelGroupEntry = {
  id: string
  videoId: string
  videoTitle: string
  channelTitle: string
  channelId: string
  createdTime: string
  thumbnailUrl: string
}

type ChannelGroupProps = {
  channelTitle: string
  channelId: string
  entries: ChannelGroupEntry[]
  accent: string
  expandedChannels: Set<string>
  onToggleExpansion: (channelId: string) => void
  processingVideoId: string | null
  processingStatus: "idle" | "gathering" | "summarizing" | "complete" | "error"
}

const ChannelGroup = ({
  channelTitle,
  channelId,
  entries,
  accent,
  expandedChannels,
  onToggleExpansion,
  processingVideoId,
  processingStatus,
}: ChannelGroupProps) => {
  const navigate = useNavigate()

  const handleVideoSelect = (videoId: string) => {
    navigate({ to: `/app/videos/${videoId}` })
  }

  return (
    <section>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div
          className={`pointer-events-none absolute -top-1/3 right-[-8%] h-full w-3/5 bg-linear-to-br ${accent} opacity-30 blur-3xl`}
        />
        <div className="relative p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleExpansion(channelId)}
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {expandedChannels.has(channelId) ? (
                  <CaretDownIcon size={20} />
                ) : (
                  <CaretRightIcon size={20} />
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: `/app/channels/${channelId}` })}
                className="text-xl font-semibold text-white hover:text-indigo-300 transition-colors"
              >
                {channelTitle}
              </button>
              {entries.some(entry =>
                entry.videoId === processingVideoId &&
                (processingStatus === "gathering" || processingStatus === "summarizing")
              ) && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </div>
            <CountBadge count={entries.length} />
          </div>

          {expandedChannels.has(channelId) && (
            <div className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <VideoEntry
                  key={entry.id}
                  entry={entry}
                  processingVideoId={processingVideoId}
                  processingStatus={processingStatus}
                  onSelect={() => handleVideoSelect(entry.videoId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ChannelGroup
export type { ChannelGroupProps, ChannelGroupEntry }

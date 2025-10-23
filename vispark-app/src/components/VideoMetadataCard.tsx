import { formatDistanceToNow } from "date-fns"
import type { VideoMetadata } from "@/services/vispark.ts"

type VideoMetadataCardProps = {
  metadata: VideoMetadata
  className?: string
  onClick?: () => void
  isActive?: boolean
  createdTime?: string
}

type ThumbnailShape = {
  url: string
}

type ThumbnailsShape = {
  default?: ThumbnailShape
  medium?: ThumbnailShape
  high?: ThumbnailShape
}

function selectBestThumbnailAddress(thumbnails?: ThumbnailsShape): string {
  return (
    thumbnails?.high?.url
    ?? thumbnails?.medium?.url
    ?? thumbnails?.default?.url
    ?? ""
  )
}

function formatRelativeTime(createdTime?: string): string {
  if (!createdTime) {
    return ""
  }

  try {
    const parsed = new Date(createdTime)
    if (Number.isNaN(parsed.getTime())) {
      return ""
    }

    return formatDistanceToNow(parsed, { addSuffix: true })
  } catch {
    return ""
  }
}

export default function VideoMetadataCard({
  metadata,
  className,
  onClick,
  isActive,
  createdTime,
}: VideoMetadataCardProps) {
  const imageAddress = selectBestThumbnailAddress(metadata.thumbnails)
  const videoAddress = `https://www.youtube.com/watch?v=${metadata.videoId}`
  const baseClasses =
    "relative block aspect-video w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-2 focus:ring-offset-gray-900 transition-transform duration-200 hover:scale-[1.002]"
  const composedClasses = `${baseClasses}${isActive ? " ring-2 ring-indigo-400/70" : ""}${
    className ? ` ${className}` : ""
  }`
  const relativeTimeLabel = formatRelativeTime(createdTime)

  const content = (
    <>
      <img
        src={imageAddress}
        alt={`${metadata.title} — ${metadata.channelTitle}`}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="w-full absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />

      <div className="absolute top-0 left-0 right-0 p-1 flex items-start justify-between gap-2">
        <div
          className={`inline-flex h-7 items-center rounded-md px-3 backdrop-blur max-w-full bg-black/30`}
        >
          <p className="text-xs font-medium text-gray-200">
            {metadata.channelTitle}
          </p>
        </div>
        {relativeTimeLabel && (
          <div
            className={`inline-flex h-7 items-center rounded-md px-3 backdrop-blur shrink-0 bg-black/30 text-xs font-medium tracking-wide text-gray-200 border border-white/10`}
          >
            <p className="text-xs font-medium text-gray-200">
              {relativeTimeLabel}
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-1 flex justify-start">
        <div className="inline-block max-w-full rounded-md bg-black/30 px-3 py-2 backdrop-blur">
          <h2 className="text-sm font-semibold text-white leading-snug text-left truncate">
            {metadata.title}
          </h2>
        </div>
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={composedClasses}
        aria-label={`View vispark summary for ${metadata.title} by ${metadata.channelTitle}`}
        aria-pressed={Boolean(isActive)}
      >
        {content}
      </button>
    )
  }

  return (
    <a
      href={videoAddress}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${metadata.title} — ${metadata.channelTitle} on YouTube`}
      className={composedClasses}
      title="Open on YouTube"
    >
      {content}
    </a>
  )
}

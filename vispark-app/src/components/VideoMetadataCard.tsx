import type { VideoMetadata } from "@/services/vispark.ts"

type Props = {
  metadata: VideoMetadata
  className?: string
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

export default function VideoMetadataCard({ metadata, className }: Props) {
  const imageAddress = selectBestThumbnailAddress(metadata.thumbnails)
  const videoAddress = `https://www.youtube.com/watch?v=${metadata.videoId}`

  return (
    <a
      href={videoAddress}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${metadata.title} — ${metadata.channelTitle} on YouTube`}
      className={`relative block aspect-video w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-2 focus:ring-offset-gray-900 transition-transform duration-200 hover:scale-[1.002] ${className ?? ""}`}
      title="Open on YouTube"
    >
      <img
        src={imageAddress}
        alt={`${metadata.title} — ${metadata.channelTitle}`}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="w-full absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-1">
        <div className="inline-block max-w-full rounded-md bg-black/60 px-3 py-2 backdrop-blur">
          <h2 className="text-sm font-semibold text-white leading-snug">
            {metadata.title}
          </h2>
          <p className="mt-1 text-xs text-gray-300">{metadata.channelTitle}</p>
        </div>
      </div>
    </a>
  )
}

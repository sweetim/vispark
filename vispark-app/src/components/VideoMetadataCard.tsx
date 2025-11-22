import { formatDistanceToNow } from "date-fns"
import { decodeHtmlEntities } from "@/utils"
import { useTranslation } from "react-i18next"
import { SparkleIcon } from "@phosphor-icons/react"

type VideoMetadataCardProps = {
  metadata: {
    videoId: string
    title: string,
    channelId: string,
    channelTitle: string,
    thumbnails: string
  }
  className?: string
  onClick?: () => void
  isActive?: boolean
  createdTime?: string
  isNewFromCallback?: boolean
  isSummarizing?: boolean
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
  isNewFromCallback,
  isSummarizing = false,
}: VideoMetadataCardProps) {
  const { t } = useTranslation()
  const videoAddress = `https://www.youtube.com/watch?v=${metadata.videoId}`
  const baseClasses =
    "relative block aspect-video w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-2 focus:ring-offset-gray-900 transition-transform duration-200 hover:scale-[1.002]"
  const summarizingClasses = isSummarizing ? " animate-gradient-border" : ""
  const composedClasses = `${baseClasses}${isActive ? " ring-2 ring-indigo-400/70" : ""}${summarizingClasses}${
    className ? ` ${className}` : ""
  }`
  const relativeTimeLabel = formatRelativeTime(createdTime)

  const content = (
    <>
      {metadata.thumbnails && (
        <img
          src={metadata.thumbnails}
          alt={`${decodeHtmlEntities(metadata.title)} — ${decodeHtmlEntities(metadata.channelTitle)}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="w-full absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />

      {isNewFromCallback && (
        <div className="absolute inset-0 bg-linear-to-br from-green-400/10 via-transparent to-emerald-400/10 pointer-events-none" />
      )}

      <div className="absolute top-0 left-0 right-0 p-1 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 max-w-full">
          <div
            className={`inline-flex h-7 items-center rounded-md px-3 backdrop-blur max-w-full bg-black/30`}
          >
            <p className="text-xs font-medium text-gray-200">
              {decodeHtmlEntities(metadata.channelTitle)}
            </p>
          </div>
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
            {decodeHtmlEntities(metadata.title)}
          </h2>
        </div>
      </div>

      {isNewFromCallback && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="rounded-lg bg-black/60 backdrop-blur-md px-6 py-3 border border-white/20 shadow-2xl">
            <div className="flex items-center space-x-3">
              <SparkleIcon size={16} weight="fill" className="text-purple-400 animate-pulse" />
              <p className="text-white font-medium text-sm tracking-wide">NEW</p>
            </div>
          </div>
        </div>
      )}

      {isSummarizing && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div className="rounded-lg bg-black/60 backdrop-blur-md px-6 py-3 border border-white/20 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>
              <p className="text-white font-medium text-sm tracking-wide">SUMMARIZING</p>
            </div>
          </div>
        </div>
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={composedClasses}
        aria-label={t("videoMetadata.viewVisparkSummary", {
          title: decodeHtmlEntities(metadata.title),
          channel: decodeHtmlEntities(metadata.channelTitle)
        })}
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
      aria-label={`${decodeHtmlEntities(metadata.title)} — ${decodeHtmlEntities(metadata.channelTitle)} on YouTube`}
      className={composedClasses}
      title={t("videoMetadata.openOnYouTube")}
    >
      {content}
    </a>
  )
}
